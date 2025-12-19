import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react";

interface ProductImage {
  id: string;
  product_slug: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

const PRODUCTS = [
  { slug: "aurora", name: "Aurora" },
  { slug: "corteccia", name: "Corteccia" },
  { slug: "sabbia", name: "Sabbia" },
  { slug: "terram", name: "Terram" },
  { slug: "velora", name: "Velora" },
  { slug: "perla", name: "Perla" },
  { slug: "silven", name: "Silven" },
  { slug: "cenere", name: "Cenere" },
];

const AdminProductImages = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCTS[0].slug);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ProductImage | null>(null);

  // Fetch images for selected product
  const { data: images, isLoading } = useQuery({
    queryKey: ["product-images", selectedProduct],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_slug", selectedProduct)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as ProductImage[];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedProduct}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      
      // Get max display_order
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("display_order")
        .eq("product_slug", selectedProduct)
        .order("display_order", { ascending: false })
        .limit(1);
      
      const maxOrder = existingImages?.[0]?.display_order ?? -1;
      
      // Insert into database
      const { error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_slug: selectedProduct,
          image_url: publicUrl,
          alt_text: `${selectedProduct} - Kalēa StoneCore 10`,
          display_order: maxOrder + 1,
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-images", selectedProduct] });
      toast.success("Immagine caricata con successo");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Errore nel caricamento dell'immagine");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (image: ProductImage) => {
      // Extract file path from URL
      const urlParts = image.image_url.split("/product-images/");
      const filePath = urlParts[1];
      
      if (filePath) {
        // Delete from storage
        await supabase.storage
          .from("product-images")
          .remove([filePath]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-images", selectedProduct] });
      toast.success("Immagine eliminata");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Errore nell'eliminazione");
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedImages: ProductImage[]) => {
      const updates = reorderedImages.map((img, index) => 
        supabase
          .from("product_images")
          .update({ display_order: index })
          .eq("id", img.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-images", selectedProduct] });
      toast.success("Ordine aggiornato");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Errore nel riordino");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      await uploadMutation.mutateAsync(file);
    }
    
    setIsUploading(false);
    e.target.value = "";
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, image: ProductImage) => {
    setDraggedItem(image);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetImage: ProductImage) => {
    e.preventDefault();
    
    if (!draggedItem || !images || draggedItem.id === targetImage.id) {
      setDraggedItem(null);
      return;
    }
    
    const newImages = [...images];
    const draggedIndex = newImages.findIndex(img => img.id === draggedItem.id);
    const targetIndex = newImages.findIndex(img => img.id === targetImage.id);
    
    // Swap positions
    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    
    // Update order
    reorderMutation.mutate(newImages);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestione Immagini Prodotti</h1>
        <p className="text-muted-foreground">
          Carica, elimina e riordina le immagini per ogni prodotto. Le immagini verranno adattate automaticamente alla gallery.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Seleziona Prodotto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Seleziona prodotto" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTS.map((product) => (
                <SelectItem key={product.slug} value={product.slug}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Immagini di {PRODUCTS.find(p => p.slug === selectedProduct)?.name}</span>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Carica Immagini
              </div>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </Label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Trascina le immagini per riordinarle. L'ordine verrà salvato automaticamente.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, image)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, image)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-move ${
                      draggedItem?.id === image.id 
                        ? "border-primary opacity-50" 
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <div className="aspect-[4/3]">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `Immagine ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <div className="absolute top-2 left-2 bg-white/90 rounded-md px-2 py-1 text-xs font-medium text-foreground">
                        #{index + 1}
                      </div>
                      <GripVertical className="text-white h-6 w-6" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(image)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna immagine caricata per questo prodotto</p>
              <p className="text-sm">Clicca su "Carica Immagini" per aggiungerne</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImages;