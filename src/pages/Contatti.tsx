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
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import heroContatti from "@/assets/hero-contatti.png";

const Contatti = () => {
  const { t } = useTranslation();
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacy) {
      toast({
        title: t('contacts.errorTitle'),
        description: t('contacts.errorMessage'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.nome,
          surname: formData.cognome,
          email: formData.email,
          phone: formData.telefono,
          userType: formData.tipoUtente,
          interests: formData.interessi,
          message: formData.messaggio,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('contacts.successTitle'),
        description: t('contacts.successMessage'),
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
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio del messaggio. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const interests = [
    t('contacts.interestsList.stonecore'), 
    t('contacts.interestsList.edgeline'), 
    t('contacts.interestsList.onewall'), 
    t('contacts.interestsList.partnership')
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interessi: prev.interessi.includes(interest)
        ? prev.interessi.filter(i => i !== interest)
        : [...prev.interessi, interest]
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection
        title={t('contacts.title')}
        subtitle={t('contacts.subtitle')}
        backgroundImage={heroContatti}
        backgroundPosition="center 25%"
        overlayClassName="bg-gradient-to-b from-black/40 via-black/20 to-black/40"
        minHeight="min-h-[50vh]"
      />
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-6">{t('contacts.formTitle')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">{t('contacts.firstName')} *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Mario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cognome">{t('contacts.lastName')} *</Label>
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
                  <Label htmlFor="email">{t('contacts.email')} *</Label>
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
                  <Label htmlFor="telefono">{t('contacts.phone')}</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+39 123 456 7890"
                  />
                </div>

                <div>
                  <Label htmlFor="tipoUtente">{t('contacts.userType')} *</Label>
                  <Select value={formData.tipoUtente} onValueChange={(value) => setFormData({ ...formData, tipoUtente: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('contacts.userTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architetto">{t('contacts.userTypes.architect')}</SelectItem>
                      <SelectItem value="designer">{t('contacts.userTypes.designer')}</SelectItem>
                      <SelectItem value="impresa">{t('contacts.userTypes.builder')}</SelectItem>
                      <SelectItem value="rivenditore">{t('contacts.userTypes.retailer')}</SelectItem>
                      <SelectItem value="privato">{t('contacts.userTypes.private')}</SelectItem>
                      <SelectItem value="altro">{t('contacts.userTypes.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">{t('contacts.interests')}</Label>
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
                  <Label htmlFor="messaggio">{t('contacts.message')} *</Label>
                  <Textarea
                    id="messaggio"
                    required
                    value={formData.messaggio}
                    onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })}
                    placeholder={t('contacts.messagePlaceholder')}
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
                    {t('contacts.privacy')} *
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Invio in corso..." : t('contacts.submit')}
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
                <h2 className="text-3xl font-heading font-bold text-foreground mb-6">{t('contacts.infoTitle')}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {t('contacts.infoText')}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contacts.emailLabel')}</h3>
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
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contacts.phoneLabel')}</h3>
                      <a href="tel:+390123456789" className="text-muted-foreground hover:text-primary transition-colors">
                        +39 012 345 6789
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">{t('contacts.phoneHours')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contacts.locationLabel')}</h3>
                      <p className="text-muted-foreground">{t('contacts.locationValue')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-4">{t('contacts.hoursTitle')}</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('contacts.hoursWeekdays')}</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contacts.hoursSaturday')}</span>
                    <span className="font-medium">9:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contacts.hoursSunday')}</span>
                    <span className="font-medium">{t('contacts.hoursClosed')}</span>
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