import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contatti = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    tipoUtente: "",
    interessi: [] as string[],
    messaggio: "",
    privacy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacy) {
      toast({
        title: "Errore",
        description: "Devi accettare la privacy policy per inviare il messaggio",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Messaggio inviato!",
      description: "Ti risponderemo il prima possibile.",
    });
    
    // Reset form
    setFormData({
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      tipoUtente: "",
      interessi: [],
      messaggio: "",
      privacy: false,
    });
  };

  const interests = ["StoneCore 10", "EdgeLine", "OneWall", "Partnership"];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interessi: prev.interessi.includes(interest)
        ? prev.interessi.filter(i => i !== interest)
        : [...prev.interessi, interest]
    }));
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Contatti
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Siamo qui per rispondere a tutte le tue domande su Kalēa e i nostri prodotti
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenuto */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 1 }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Invia una richiesta</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Mario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cognome">Cognome *</Label>
                    <Input
                      id="cognome"
                      required
                      value={formData.cognome}
                      onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mario.rossi@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+39 123 456 7890"
                  />
                </div>

                <div>
                  <Label htmlFor="tipoUtente">Tipo utente *</Label>
                  <Select value={formData.tipoUtente} onValueChange={(value) => setFormData({ ...formData, tipoUtente: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architetto">Architetto / Progettista</SelectItem>
                      <SelectItem value="designer">Interior Designer</SelectItem>
                      <SelectItem value="impresa">Impresa edile</SelectItem>
                      <SelectItem value="rivenditore">Rivenditore</SelectItem>
                      <SelectItem value="privato">Privato</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Interessi</Label>
                  <div className="space-y-3">
                    {interests.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={formData.interessi.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <label htmlFor={interest} className="text-sm text-muted-foreground cursor-pointer">
                          {interest}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="messaggio">Messaggio *</Label>
                  <Textarea
                    id="messaggio"
                    required
                    value={formData.messaggio}
                    onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })}
                    placeholder="Scrivi qui il tuo messaggio..."
                    rows={5}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacy}
                    onCheckedChange={(checked) => setFormData({ ...formData, privacy: checked as boolean })}
                  />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    Accetto la privacy policy e autorizzo il trattamento dei miei dati personali *
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Invia richiesta
                </Button>
              </form>
            </motion.div>

            {/* Info Contatti */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Informazioni</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Il nostro team è a tua disposizione per fornirti tutte le informazioni necessarie sui prodotti
                  Kalēa, richiedere campioni, preventivi o per diventare partner.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">Email</h3>
                      <a href="mailto:info@kalea.it" className="text-muted-foreground hover:text-primary transition-colors">
                        info@kalea.it
                      </a>
                      <br />
                      <a href="mailto:tecnico@kalea.it" className="text-muted-foreground hover:text-primary transition-colors">
                        tecnico@kalea.it
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">Telefono</h3>
                      <a href="tel:+390123456789" className="text-muted-foreground hover:text-primary transition-colors">
                        +39 012 345 6789
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Lun-Ven: 9:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">Sede</h3>
                      <p className="text-muted-foreground">Italia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Orari di apertura</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Lunedì - Venerdì</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabato</span>
                    <span className="font-medium">9:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domenica</span>
                    <span className="font-medium">Chiuso</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contatti;
