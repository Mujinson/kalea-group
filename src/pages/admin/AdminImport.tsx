import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';

type ImportType = 'sales' | 'inventory' | 'costs';

interface ImportResult {
  success: number;
  errors: string[];
}

const AdminImport = () => {
  const [importType, setImportType] = useState<ImportType>('sales');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Seleziona un file CSV');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === ';') && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Seleziona un file');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        toast.error('Il file deve contenere almeno una riga di dati');
        setImporting(false);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);
      
      let success = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        try {
          if (importType === 'sales') {
            await importSale(headers, row);
          } else if (importType === 'inventory') {
            await importInventory(headers, row);
          } else if (importType === 'costs') {
            await importCost(headers, row);
          }
          success++;
        } catch (err: any) {
          errors.push(`Riga ${i + 2}: ${err.message}`);
        }
      }

      setResult({ success, errors });
      
      if (success > 0) {
        toast.success(`Importati ${success} record`);
      }
      if (errors.length > 0) {
        toast.warning(`${errors.length} errori durante l'import`);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Errore durante l\'import: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const importSale = async (headers: string[], row: string[]) => {
    const getValue = (key: string) => {
      const index = headers.indexOf(key);
      return index >= 0 ? row[index] : '';
    };

    const productType = getValue('prodotto') || getValue('product_type') || 'MgO';
    const quantitySqm = parseFloat(getValue('quantita') || getValue('quantity_sqm') || getValue('mq') || '0');
    const salePrice = parseFloat(getValue('prezzo') || getValue('sale_price') || getValue('price') || '0');
    const channel = getValue('canale') || getValue('channel') || 'B2B';
    const customerName = getValue('cliente') || getValue('customer_name') || null;
    const saleDate = getValue('data') || getValue('sale_date') || new Date().toISOString().split('T')[0];

    if (!quantitySqm || !salePrice) {
      throw new Error('Quantità e prezzo sono obbligatori');
    }

    const { error } = await supabase.from('sales').insert({
      product_type: productType,
      quantity_sqm: quantitySqm,
      sale_price: salePrice,
      channel: channel.toUpperCase(),
      customer_name: customerName,
      sale_date: saleDate,
    });

    if (error) throw error;
  };

  const importInventory = async (headers: string[], row: string[]) => {
    const getValue = (key: string) => {
      const index = headers.indexOf(key);
      return index >= 0 ? row[index] : '';
    };

    const productType = getValue('prodotto') || getValue('product_type') || 'MgO';
    const quantitySqm = parseFloat(getValue('quantita') || getValue('quantity_sqm') || getValue('mq') || '0');
    const purchaseCost = parseFloat(getValue('costo') || getValue('purchase_cost') || getValue('cost') || '0');
    const movementType = (getValue('tipo') || getValue('movement_type') || 'IN').toUpperCase();
    const movementDate = getValue('data') || getValue('movement_date') || new Date().toISOString().split('T')[0];

    if (!quantitySqm || !purchaseCost) {
      throw new Error('Quantità e costo sono obbligatori');
    }

    const { error } = await supabase.from('inventory').insert({
      product_type: productType,
      quantity_sqm: quantitySqm,
      purchase_cost: purchaseCost,
      movement_type: movementType,
      movement_date: movementDate,
    });

    if (error) throw error;
  };

  const importCost = async (headers: string[], row: string[]) => {
    const getValue = (key: string) => {
      const index = headers.indexOf(key);
      return index >= 0 ? row[index] : '';
    };

    const productType = getValue('prodotto') || getValue('product_type') || '';
    const fobCost = parseFloat(getValue('fob') || getValue('fob_cost') || '0');
    const dutyPercentage = parseFloat(getValue('dazi') || getValue('duty_percentage') || '1.7');
    const importLogisticsCost = parseFloat(getValue('logistica') || getValue('import_logistics_cost') || '0.49');

    if (!productType || !fobCost) {
      throw new Error('Prodotto e costo FOB sono obbligatori');
    }

    const { error } = await supabase.from('static_costs').insert({
      product_type: productType,
      fob_cost: fobCost,
      duty_percentage: dutyPercentage,
      import_logistics_cost: importLogisticsCost,
    });

    if (error) throw error;
  };

  const downloadTemplate = (type: ImportType) => {
    let content = '';
    let filename = '';

    switch (type) {
      case 'sales':
        content = 'prodotto,quantita,prezzo,canale,cliente,data\nMgO,100,35,B2B,Cliente Esempio,2024-01-15\nCWC,50,28,B2C,,2024-01-20';
        filename = 'template_vendite.csv';
        break;
      case 'inventory':
        content = 'prodotto,quantita,costo,tipo,data\nMgO,1000,15,IN,2024-01-01\nCWC,500,12,IN,2024-01-01';
        filename = 'template_magazzino.csv';
        break;
      case 'costs':
        content = 'prodotto,fob,dazi,logistica\nMgO,15,1.7,0.49\nCWC,12,1.7,0.49';
        filename = 'template_costi.csv';
        break;
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Strumenti", "Import"]} title="Import Dati" subtitle="Importa dati da file CSV" />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carica File CSV
            </CardTitle>
            <CardDescription>Seleziona il tipo di dati e carica il file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo di Dati</Label>
              <Select value={importType} onValueChange={(v: ImportType) => setImportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendite</SelectItem>
                  <SelectItem value="inventory">Magazzino</SelectItem>
                  <SelectItem value="costs">Costi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileSpreadsheet className="w-4 h-4" />
                  {file.name}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={!file || importing} className="flex-1">
                {importing ? 'Importazione...' : 'Importa'}
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate(importType)}>
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Risultato Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>{result.success} record importati con successo</span>
              </div>
              
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{result.errors.length} errori</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-h-40 overflow-auto">
                    <ul className="text-sm text-orange-800 space-y-1">
                      {result.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Format Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Formato File CSV</CardTitle>
          <CardDescription>Struttura richiesta per ogni tipo di import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendite */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-base">📊 Vendite</h4>
              <p className="text-sm text-muted-foreground">File per importare le vendite registrate</p>
              <div className="space-y-1 text-sm">
                <p className="font-medium mb-1">Colonne richieste:</p>
                <div className="space-y-0.5">
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">prodotto</span> — tipo prodotto (MgO, CWC)</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">quantita</span> — mq venduti</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">prezzo</span> — prezzo €/mq</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">canale</span> — B2B o B2C</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">cliente</span> — nome cliente</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">data</span> — data vendita (YYYY-MM-DD)</p>
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg text-xs font-mono leading-relaxed overflow-x-auto">
                <p className="font-semibold">Esempio:</p>
                <p>prodotto,quantita,prezzo,canale,cliente,data</p>
                <p className="text-muted-foreground">MgO,100,35,B2B,Ristorante Mimmi,2024-01-15</p>
                <p className="text-muted-foreground">CWC,50,28,B2C,,2024-01-20</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => downloadTemplate('sales')}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Scarica Template Vendite
              </Button>
            </div>

            {/* Magazzino */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-base">📦 Magazzino</h4>
              <p className="text-sm text-muted-foreground">File per importare movimenti di magazzino</p>
              <div className="space-y-1 text-sm">
                <p className="font-medium mb-1">Colonne richieste:</p>
                <div className="space-y-0.5">
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">prodotto</span> — tipo prodotto (MgO, CWC)</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">quantita</span> — mq movimentati</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">costo</span> — costo acquisto €/mq</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">tipo</span> — IN (ingresso) o OUT (uscita)</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">data</span> — data movimento (YYYY-MM-DD)</p>
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg text-xs font-mono leading-relaxed overflow-x-auto">
                <p className="font-semibold">Esempio:</p>
                <p>prodotto,quantita,costo,tipo,data</p>
                <p className="text-muted-foreground">MgO,1000,15,IN,2024-01-01</p>
                <p className="text-muted-foreground">CWC,500,12,IN,2024-01-01</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => downloadTemplate('inventory')}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Scarica Template Magazzino
              </Button>
            </div>

            {/* Costi */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-base">💰 Costi</h4>
              <p className="text-sm text-muted-foreground">File per importare i costi statici dei prodotti</p>
              <div className="space-y-1 text-sm">
                <p className="font-medium mb-1">Colonne richieste:</p>
                <div className="space-y-0.5">
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">prodotto</span> — tipo prodotto (MgO, CWC)</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">fob</span> — costo FOB €/mq</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">dazi</span> — % dazi doganali</p>
                  <p><span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs">logistica</span> — costo logistica €/mq</p>
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg text-xs font-mono leading-relaxed overflow-x-auto">
                <p className="font-semibold">Esempio:</p>
                <p>prodotto,fob,dazi,logistica</p>
                <p className="text-muted-foreground">MgO,15,1.7,0.49</p>
                <p className="text-muted-foreground">CWC,12,1.7,0.49</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => downloadTemplate('costs')}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Scarica Template Costi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminImport;
