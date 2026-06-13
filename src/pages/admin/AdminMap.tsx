import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, Loader2, MapPin, Users, UserPlus, HardHat, RefreshCw } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { fetchAllRows } from '@/lib/fetchAllRows';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px; height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "><span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const icons = {
  lead: createIcon('#f97316', '🔥'),
  customer: createIcon('#3b82f6', '🏢'),
  cantiere: createIcon('#10b981', '🏗️'),
};

interface MapPoint {
  id: string;
  type: 'lead' | 'customer' | 'cantiere';
  name: string;
  address: string;
  city: string | null;
  province: string | null;
  region: string | null;
  lat: number;
  lng: number;
  extra?: string;
}

const NOMINATIM_CACHE_KEY = 'kalea_geocode_cache';

const getGeoCache = (): Record<string, { lat: number; lng: number }> => {
  try {
    return JSON.parse(localStorage.getItem(NOMINATIM_CACHE_KEY) || '{}');
  } catch { return {}; }
};

const setGeoCache = (cache: Record<string, { lat: number; lng: number }>) => {
  localStorage.setItem(NOMINATIM_CACHE_KEY, JSON.stringify(cache));
};

const geocodeAddress = async (
  address: string,
  city: string | null,
  province: string | null,
  region: string | null
): Promise<{ lat: number; lng: number } | null> => {
  const parts = [address, city, province, region, 'Italia'].filter(Boolean);
  const query = parts.join(', ');
  if (!query || query === 'Italia') return null;

  const cache = getGeoCache();
  if (cache[query]) return cache[query];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=it`,
      { headers: { 'User-Agent': 'KaleaCRM/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache[query] = result;
      setGeoCache(cache);
      return result;
    }

    // Fallback: try city + province only
    if (city) {
      const fallbackQuery = [city, province, 'Italia'].filter(Boolean).join(', ');
      if (cache[fallbackQuery]) return cache[fallbackQuery];
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1&countrycodes=it`,
        { headers: { 'User-Agent': 'KaleaCRM/1.0' } }
      );
      const data2 = await res2.json();
      if (data2.length > 0) {
        const result = { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
        cache[fallbackQuery] = result;
        setGeoCache(cache);
        return result;
      }
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
};

const FitBounds = ({ points }: { points: MapPoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [points, map]);
  return null;
};

const openGoogleMapsNav = (lat: number, lng: number) => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
};

const AdminMap = () => {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lead' | 'customer' | 'cantiere'>('all');
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });

  const { data: leads } = useQuery({
    queryKey: ['map-leads'],
    queryFn: async () => {
      return fetchAllRows(supabase.from('leads').select('id, name, company_name, address, city, province, region, pipeline_stage'));
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['map-customers'],
    queryFn: async () => {
      return fetchAllRows(supabase.from('customers').select('id, first_name, last_name, company_name, address, city, province, region, customer_type'));
    },
  });

  const { data: cantieri } = useQuery({
    queryKey: ['map-cantieri'],
    queryFn: async () => {
      const { data } = await supabase.from('construction_sites').select('id, title, address, city, province, region, tipologia');
      return data || [];
    },
  });

  useEffect(() => {
    const geocodeAll = async () => {
      if (!leads && !customers && !cantieri) return;
      setLoading(true);

      const items: { id: string; type: MapPoint['type']; name: string; address: string | null; city: string | null; province: string | null; region: string | null; extra?: string }[] = [];

      (leads || []).forEach((l) => {
        items.push({
          id: l.id, type: 'lead',
          name: l.company_name || l.name,
          address: l.address, city: l.city, province: l.province, region: l.region,
          extra: l.pipeline_stage,
        });
      });

      (customers || []).forEach((c) => {
        items.push({
          id: c.id, type: 'customer',
          name: c.company_name || [c.first_name, c.last_name].filter(Boolean).join(' '),
          address: c.address, city: c.city, province: c.province, region: c.region,
          extra: c.customer_type,
        });
      });

      (cantieri || []).forEach((s) => {
        items.push({
          id: s.id, type: 'cantiere',
          name: s.title,
          address: s.address, city: s.city, province: s.province, region: s.region,
          extra: s.tipologia,
        });
      });

      setGeocodeProgress({ done: 0, total: items.length });
      const points: MapPoint[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const coords = await geocodeAddress(item.address || '', item.city, item.province, item.region);
        if (coords) {
          points.push({
            id: item.id,
            type: item.type,
            name: item.name,
            address: item.address || '',
            city: item.city,
            province: item.province,
            region: item.region,
            lat: coords.lat,
            lng: coords.lng,
            extra: item.extra,
          });
        }
        setGeocodeProgress({ done: i + 1, total: items.length });
        // Rate limit Nominatim (1 req/sec) - skip delay if cached
        const cache = getGeoCache();
        const parts = [item.address, item.city, item.province, item.region, 'Italia'].filter(Boolean).join(', ');
        if (!cache[parts]) {
          await new Promise((r) => setTimeout(r, 1100));
        }
      }

      setMapPoints(points);
      setLoading(false);
    };

    geocodeAll();
  }, [leads, customers, cantieri]);

  const filteredPoints = useMemo(() => {
    if (filter === 'all') return mapPoints;
    return mapPoints.filter((p) => p.type === filter);
  }, [mapPoints, filter]);

  const counts = useMemo(() => ({
    all: mapPoints.length,
    lead: mapPoints.filter((p) => p.type === 'lead').length,
    customer: mapPoints.filter((p) => p.type === 'customer').length,
    cantiere: mapPoints.filter((p) => p.type === 'cantiere').length,
  }), [mapPoints]);

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Mappa"]} title="Mappa Territoriale" subtitle="Lead, clienti e cantieri sulla mappa" />


      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-xl"
        >
          <MapPin className="w-4 h-4 mr-1" /> Tutti ({counts.all})
        </Button>
        <Button
          variant={filter === 'lead' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('lead')}
          className="rounded-xl"
        >
          <UserPlus className="w-4 h-4 mr-1 text-orange-500" /> Lead ({counts.lead})
        </Button>
        <Button
          variant={filter === 'customer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('customer')}
          className="rounded-xl"
        >
          <Users className="w-4 h-4 mr-1 text-blue-500" /> Clienti ({counts.customer})
        </Button>
        <Button
          variant={filter === 'cantiere' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('cantiere')}
          className="rounded-xl"
        >
          <HardHat className="w-4 h-4 mr-1 text-emerald-500" /> Cantieri ({counts.cantiere})
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Geocodifica indirizzi...</p>
            <p className="text-xs text-muted-foreground">
              {geocodeProgress.done} / {geocodeProgress.total} elaborati
            </p>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: geocodeProgress.total ? `${(geocodeProgress.done / geocodeProgress.total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: '65vh' }}>
        <MapContainer
          center={[42.5, 12.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredPoints.length > 0 && <FitBounds points={filteredPoints} />}
          {filteredPoints.map((point) => (
            <Marker
              key={`${point.type}-${point.id}`}
              position={[point.lat, point.lng]}
              icon={icons[point.type]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      point.type === 'lead' ? 'destructive' :
                      point.type === 'customer' ? 'default' : 'secondary'
                    }>
                      {point.type === 'lead' ? '🔥 Lead' :
                       point.type === 'customer' ? '🏢 Cliente' : '🏗️ Cantiere'}
                    </Badge>
                    {point.extra && (
                      <span className="text-xs text-gray-500">{point.extra}</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mb-1">{point.name}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {[point.address, point.city, point.province].filter(Boolean).join(', ')}
                  </p>
                  <button
                    onClick={() => openGoogleMapsNav(point.lat, point.lng)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors w-full justify-center"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Naviga con Google Maps
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /> Lead</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> Clienti</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Cantieri</span>
      </div>
    </div>
  );
};

export default AdminMap;
