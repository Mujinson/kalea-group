export type Language = 'it' | 'en' | 'de' | 'fr';

export interface Translations {
  [key: string]: string | Translations;
}

export const translations: Record<Language, Translations> = {
  it: {
    nav: {
      home: "Home",
      lines: "Linee",
      technicalArea: "Area Tecnica",
      aboutUs: "Chi Siamo",
      contacts: "Contatti",
      requestQuote: "Richiedi preventivo",
    },
    hero: {
      home: {
        title: "Superfici di nuova generazione in MgO",
        subtitle: "Pavimenti, profili e pannelli sviluppati in Italia per durare e trasformare gli spazi.",
        ctaPrimary: "Scopri le nostre soluzioni",
        ctaSecondary: "Richiedi un preventivo",
      },
      stonecore: {
        title: "Kalēa StoneCore 10",
        subtitle: "Pavimenti in MgO di nuova generazione. Prestazioni professionali, estetica naturale, posa veloce.",
        ctaPrimary: "Richiedi campioni",
        ctaSecondary: "Scarica scheda tecnica",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        subtitle: "Profili e battiscopa in alluminio coordinati. La finitura perfetta per ogni progetto.",
        ctaPrimary: "Richiedi catalogo",
        ctaSecondary: "Scopri StoneCore 10",
      },
      onewall: {
        title: "Kalēa OneWall",
        subtitle: "Pannelli in MgO per pareti e soffitti. L'evoluzione del cartongesso, già finito.",
        ctaPrimary: "Richiedi campioni",
        ctaSecondary: "Scarica catalogo",
      },
    },
    home: {
      linesTitle: "Le linee Kalēa",
      linesSubtitle: "Tre sistemi integrati per dare forma agli spazi del futuro",
      stonecore: {
        title: "Kalēa StoneCore 10",
        description: "Pavimenti in MgO da 10 mm, flottanti, waterproof e ignifughi. Posa veloce, prestazioni professionali, estetica naturale.",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        description: "Profili e battiscopa in alluminio coordinati. Design minimal, resistenza superiore, finitura perfetta per ogni spazio.",
      },
      onewall: {
        title: "Kalēa OneWall",
        description: "Pannelli in MgO per pareti e soffitti, già finiti. Alternativa avanzata al cartongesso, versatile e rapida da installare.",
      },
      mgoTitle: "Perché MgO",
      mgoDescription: "L'ossido di magnesio (MgO) rappresenta il futuro delle costruzioni. Un materiale dalle prestazioni eccezionali che supera i limiti dei sistemi tradizionali.",
      mgoAdvantages: {
        fireproof: "Fireproof - Ignifugo",
        waterproof: "Waterproof - Impermeabile",
        stability: "Stabilità dimensionale",
        antimold: "Anti-muffa",
        acoustic: "Comfort acustico",
        floating: "Posa flottante",
      },
      mgoButton: "Approfondisci",
      applicationsTitle: "Applicazioni",
      applicationsSubtitle: "Kalēa si adatta a ogni contesto, dal residenziale al commerciale",
      applications: {
        residential: {
          title: "Residenziale",
          description: "Abitazioni private di design",
        },
        hospitality: {
          title: "Hospitality",
          description: "Hotel e strutture ricettive",
        },
        retail: {
          title: "Retail",
          description: "Negozi e showroom",
        },
        offices: {
          title: "Uffici",
          description: "Spazi di lavoro contemporanei",
        },
      },
      sustainabilityTitle: "Sostenibilità",
      sustainabilitySubtitle: "Investire in Kalēa significa scegliere il futuro",
      sustainability: {
        impact: {
          title: "Ridotto impatto ambientale",
          description: "Materiali sostenibili e processi ecocompatibili",
        },
        durability: {
          title: "Lunga durata",
          description: "Investimento che dura nel tempo",
        },
        maintenance: {
          title: "Manutenzione minima",
          description: "Risparmio di risorse e tempo",
        },
      },
      ctaTitle: "Vuoi usare Kalēa nei tuoi progetti?",
      ctaSubtitle: "Contattaci per ricevere campioni, documentazione tecnica o un preventivo personalizzato",
      ctaButton1: "Richiedi preventivo",
      ctaButton2: "Diventa partner",
    },
    stonecore: {
      structureTitle: "Struttura multistrato avanzata",
      structureSubtitle: "10 mm totali: 8,5 mm core MgO + 1,5 mm strato di usura decorativo",
      layers: {
        decorative: "Strato decorativo",
        wear: "Strato di usura",
        core: "Core MgO",
        mat: "Tappetino",
      },
      advantagesTitle: "Vantaggi esclusivi",
      advantagesSubtitle: "Prestazioni superiori per ogni esigenza progettuale",
      advantages: {
        waterproof: {
          title: "Waterproof",
          description: "100% impermeabile. Perfetto per bagni, cucine e ambienti umidi senza preoccupazioni.",
        },
        fireproof: {
          title: "Fireproof",
          description: "Ignifugo certificato. Sicurezza massima per spazi residenziali e commerciali.",
        },
        antimold: {
          title: "Anti-muffa",
          description: "Naturalmente resistente a muffe e batteri. Ambiente più sano e salubre.",
        },
        acoustic: {
          title: "Comfort acustico",
          description: "Riduce la trasmissione del rumore. Silenzio e tranquillità in ogni stanza.",
        },
        floating: {
          title: "Posa flottante",
          description: "Installazione rapida senza colla. Pronto all'uso in poche ore.",
        },
        stability: {
          title: "Stabilità dimensionale",
          description: "Non si espande né si contrae. Perfetto per grandi superfici continue.",
        },
      },
      finishesTitle: "Finiture disponibili",
      finishesSubtitle: "Scegli tra le nostre 8 finiture effetto legno in MgO",
      finishes: {
        corteccia: "Corteccia",
        cenere: "Cenere",
        sabbia: "Sabbia",
        silven: "Silven",
        terram: "Terram",
        perla: "Perla",
        velora: "Velora",
        aurora: "Aurora",
      },
      techTitle: "Caratteristiche",
      techPosa: "Posa",
      techMaintenance: "Manutenzione",
      ctaTitle: "Scarica la documentazione completa",
      ctaSubtitle: "Schede tecniche, certificazioni e guide di posa disponibili nell'Area Tecnica",
      ctaButton: "Vai all'Area Tecnica",
    },
    edgeline: {
      advantagesTitle: "Perché scegliere EdgeLine",
      advantagesSubtitle: "La soluzione completa per profili e battiscopa",
      advantages: {
        design: {
          title: "Design minimal",
          description: "Profili eleganti che valorizzano il pavimento senza invadere l'estetica degli spazi.",
        },
        resistance: {
          title: "Resistenza superiore",
          description: "Alluminio di alta qualità che garantisce durata e stabilità nel tempo.",
        },
        versatility: {
          title: "Versatilità",
          description: "Soluzioni per ogni esigenza: terminali, giunzioni, dilatazioni, scalini.",
        },
      },
      productsTitle: "Gamma prodotti",
      productsSubtitle: "Soluzioni tecniche per ogni situazione di posa",
      products: {
        terminal: {
          title: "Profilo terminale",
          description: "Finitura perfetta per terminazioni a vista del pavimento",
        },
        junction: {
          title: "Profilo di giunzione",
          description: "Raccordo tra pavimenti dello stesso livello",
        },
        expansion: {
          title: "Profilo di dilatazione",
          description: "Gestione dei giunti di dilatazione strutturali",
        },
        baseboard: {
          title: "Battiscopa",
          description: "Coordinato con i pavimenti StoneCore 10",
        },
        step: {
          title: "Profilo scalino",
          description: "Protezione e finitura per gradini e dislivelli",
        },
      },
      finishesTitle: "Finiture disponibili",
      finishesSubtitle: "Coordinati con i pavimenti Kalēa StoneCore 10",
      finishes: {
        natural: "Alluminio naturale",
        bronze: "Bronzo satinato",
        black: "Nero opaco",
        silver: "Argento lucido",
      },
      ctaTitle: "Completa il tuo progetto con EdgeLine",
      ctaSubtitle: "Richiedi un preventivo personalizzato o campioni gratuiti",
      ctaButton: "Contattaci",
    },
    onewall: {
      howItWorksTitle: "Come funziona",
      howItWorksSubtitle: "Sistema semplice e veloce per pareti e soffitti perfetti",
      howItWorks: {
        step1: {
          title: "Preparazione",
          description: "Installazione di struttura portante a secco (opzionale per pareti esistenti)",
        },
        step2: {
          title: "Posa pannelli",
          description: "Fissaggio dei pannelli OneWall con viti e tasselli. Taglio e adattamento semplici",
        },
        step3: {
          title: "Finitura",
          description: "Stuccatura giunti e applicazione profili. Pronto all'uso senza ulteriori finiture",
        },
      },
      finishesTitle: "Finiture disponibili",
      finishesSubtitle: "Personalizza pareti e soffitti secondo il tuo stile",
      finishes: {
        wood: {
          title: "Effetto legno",
          description: "Texture naturali per ambienti caldi",
        },
        marble: {
          title: "Effetto marmo",
          description: "Eleganza senza tempo per spazi raffinati",
        },
        concrete: {
          title: "Effetto cemento",
          description: "Stile industriale e contemporaneo",
        },
        wallpaper: {
          title: "Carta da parati",
          description: "Personalizzazione infinita con pattern esclusivi",
        },
        decorative: {
          title: "Finiture decorative",
          description: "Texture tridimensionali per pareti d'accento",
        },
      },
      advantagesTitle: "Vantaggi tecnici",
      advantagesSubtitle: "Prestazioni superiori al cartongesso tradizionale",
      advantages: {
        fast: {
          title: "Posa velocissima",
          description: "Pannelli già finiti pronti all'uso. Installazione 3 volte più rapida del cartongesso tradizionale.",
        },
        resistance: {
          title: "Resistenza superiore",
          description: "Core in MgO che garantisce stabilità, durezza e resistenza agli urti.",
        },
        waterproof: {
          title: "Waterproof",
          description: "Perfetto per ambienti umidi come bagni e cucine senza rischio di degrado.",
        },
        fireproof: {
          title: "Fireproof",
          description: "Ignifugo certificato. Sicurezza massima per pareti e soffitti.",
        },
        aesthetic: {
          title: "Versatilità estetica",
          description: "Disponibile in finiture legno, marmo, cemento, carta da parati e decorative.",
        },
        maintenance: {
          title: "Manutenzione zero",
          description: "Non richiede ritocchi, tinteggiature o trattamenti periodici.",
        },
      },
      applicationsTitle: "Dove usare OneWall",
      applicationsSubtitle: "Soluzioni versatili per ogni esigenza architettonica",
      ctaTitle: "Scopri le possibilità di OneWall",
      ctaSubtitle: "Contattaci per una consulenza personalizzata sul tuo progetto",
      ctaButton: "Richiedi consulenza",
    },
    aboutUs: {
      title: "Chi Siamo",
      intro1: "Kalēa nasce dall'esperienza nel settore delle costruzioni e dalla passione per l'innovazione dei materiali. Sviluppiamo superfici in MgO (ossido di magnesio) che ridefiniscono gli standard di prestazione, estetica e sostenibilità.",
      intro2: "Ogni prodotto della gamma Kalēa è progettato in Italia con l'obiettivo di semplificare la posa, garantire durata nel tempo e offrire soluzioni all'avanguardia per architetti, designer e imprese.",
      historyTitle: "La nostra storia",
      history1: "Il progetto Kalēa nasce dalla volontà di superare i limiti dei materiali tradizionali nel settore dell'edilizia e dell'interior design. L'ossido di magnesio (MgO) si è rivelato la chiave per sviluppare una gamma di prodotti dalle prestazioni eccezionali.",
      history2: "Dopo anni di ricerca e sviluppo, abbiamo creato tre linee integrate: StoneCore 10 per i pavimenti, EdgeLine per profili e battiscopa, e OneWall per pareti e soffitti. Ogni prodotto è pensato per essere semplice da posare, bello da vedere e capace di durare nel tempo.",
      history3: "Oggi Kalēa è sinonimo di innovazione italiana nel campo delle superfici tecniche, scelto da professionisti che cercano qualità, design e affidabilità.",
      valuesTitle: "Cosa ci guida",
      valuesSubtitle: "I valori che ispirano ogni decisione e ogni prodotto Kalēa",
      values: {
        innovation: {
          title: "Innovazione",
          description: "Ricerca continua di materiali e soluzioni all'avanguardia per il settore delle costruzioni.",
        },
        design: {
          title: "Design",
          description: "Estetica minimal e funzionalità si fondono in ogni prodotto che sviluppiamo.",
        },
        collaboration: {
          title: "Collaborazione",
          description: "Lavoriamo a fianco di architetti, interior designer e imprese per realizzare progetti unici.",
        },
        quality: {
          title: "Qualità",
          description: "Standard produttivi elevati e controllo rigoroso in ogni fase, dal design alla consegna.",
        },
      },
      customersTitle: "Per chi lavoriamo",
      customersSubtitle: "I professionisti che scelgono Kalēa per i loro progetti",
      customers: {
        architects: {
          title: "Architetti e progettisti",
          description: "Soluzioni tecniche per progetti residenziali e commerciali",
        },
        designers: {
          title: "Interior designer",
          description: "Materiali premium per spazi dal design curato",
        },
        builders: {
          title: "Imprese edili",
          description: "Prodotti affidabili con posa veloce e certificazioni complete",
        },
        retailers: {
          title: "Rivenditori",
          description: "Partner commerciali per distribuzione e supporto territoriale",
        },
      },
      ctaTitle: "Vuoi collaborare con noi?",
      ctaSubtitle: "Cerchiamo partner, rivenditori e professionisti che condividono la nostra visione",
      ctaButton: "Contattaci",
    },
    contacts: {
      title: "Contatti",
      subtitle: "Siamo qui per rispondere a tutte le tue domande su Kalēa e i nostri prodotti",
      formTitle: "Invia una richiesta",
      firstName: "Nome",
      lastName: "Cognome",
      email: "Email",
      phone: "Telefono",
      userType: "Tipo utente",
      userTypePlaceholder: "Seleziona...",
      userTypes: {
        architect: "Architetto / Progettista",
        designer: "Interior Designer",
        builder: "Impresa edile",
        retailer: "Rivenditore",
        private: "Privato",
        other: "Altro",
      },
      interests: "Interessi",
      interestsList: {
        stonecore: "StoneCore 10",
        edgeline: "EdgeLine",
        onewall: "OneWall",
        partnership: "Partnership",
      },
      message: "Messaggio",
      messagePlaceholder: "Scrivi qui il tuo messaggio...",
      privacy: "Accetto la privacy policy e autorizzo il trattamento dei miei dati personali",
      submit: "Invia richiesta",
      infoTitle: "Informazioni",
      infoText: "Il nostro team è a tua disposizione per fornirti tutte le informazioni necessarie sui prodotti Kalēa, richiedere campioni, preventivi o per diventare partner.",
      emailLabel: "Email",
      phoneLabel: "Telefono",
      phoneHours: "Lun-Ven: 9:00 - 18:00",
      locationLabel: "Sede",
      locationValue: "Italia",
      hoursTitle: "Orari di apertura",
      hoursWeekdays: "Lunedì - Venerdì",
      hoursSaturday: "Sabato",
      hoursSunday: "Domenica",
      hoursClosed: "Chiuso",
      successTitle: "Messaggio inviato!",
      successMessage: "Ti risponderemo il prima possibile.",
      errorTitle: "Errore",
      errorMessage: "Devi accettare la privacy policy per inviare il messaggio",
    },
    technicalArea: {
      title: "Area Tecnica",
      subtitle: "Scarica schede tecniche, certificazioni e guide di posa per tutti i prodotti Kalēa",
      allDocuments: "Tutti i documenti",
      download: "Scarica",
      ctaTitle: "Hai bisogno di supporto tecnico?",
      ctaSubtitle: "Il nostro team è a disposizione per rispondere a tutte le tue domande tecniche",
      ctaButton: "Contatta il supporto tecnico",
    },
    footer: {
      tagline: "Superfici di nuova generazione in MgO. Pavimenti, profili e pannelli sviluppati in Italia per durare e trasformare gli spazi.",
      quickLinks: "Link Rapidi",
      contactsTitle: "Contatti",
      copyright: "Tutti i diritti riservati.",
      privacy: "Privacy Policy",
      terms: "Termini e Condizioni",
    },
  },
  en: {
    nav: {
      home: "Home",
      lines: "Lines",
      technicalArea: "Technical Area",
      aboutUs: "About Us",
      contacts: "Contacts",
      requestQuote: "Request Quote",
    },
    hero: {
      home: {
        title: "New generation MgO surfaces",
        subtitle: "Floors, profiles and panels developed in Italy to last and transform spaces.",
        ctaPrimary: "Discover our solutions",
        ctaSecondary: "Request a quote",
      },
      stonecore: {
        title: "Kalēa StoneCore 10",
        subtitle: "New generation MgO flooring. Professional performance, natural aesthetics, fast installation.",
        ctaPrimary: "Request samples",
        ctaSecondary: "Download datasheet",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        subtitle: "Coordinated aluminum profiles and skirting boards. The perfect finish for every project.",
        ctaPrimary: "Request catalog",
        ctaSecondary: "Discover StoneCore 10",
      },
      onewall: {
        title: "Kalēa OneWall",
        subtitle: "MgO panels for walls and ceilings. The evolution of drywall, already finished.",
        ctaPrimary: "Request samples",
        ctaSecondary: "Download catalog",
      },
    },
    home: {
      linesTitle: "Kalēa lines",
      linesSubtitle: "Three integrated systems to shape the spaces of the future",
      stonecore: {
        title: "Kalēa StoneCore 10",
        description: "10 mm MgO floors, floating, waterproof and fireproof. Fast installation, professional performance, natural aesthetics.",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        description: "Coordinated aluminum profiles and skirting boards. Minimal design, superior resistance, perfect finish for every space.",
      },
      onewall: {
        title: "Kalēa OneWall",
        description: "MgO panels for walls and ceilings, already finished. Advanced alternative to drywall, versatile and quick to install.",
      },
      mgoTitle: "Why MgO",
      mgoDescription: "Magnesium oxide (MgO) represents the future of construction. A material with exceptional performance that surpasses the limits of traditional systems.",
      mgoAdvantages: {
        fireproof: "Fireproof",
        waterproof: "Waterproof",
        stability: "Dimensional stability",
        antimold: "Anti-mold",
        acoustic: "Acoustic comfort",
        floating: "Floating installation",
      },
      mgoButton: "Learn more",
      applicationsTitle: "Applications",
      applicationsSubtitle: "Kalēa adapts to every context, from residential to commercial",
      applications: {
        residential: {
          title: "Residential",
          description: "Private design homes",
        },
        hospitality: {
          title: "Hospitality",
          description: "Hotels and accommodation facilities",
        },
        retail: {
          title: "Retail",
          description: "Shops and showrooms",
        },
        offices: {
          title: "Offices",
          description: "Contemporary workspaces",
        },
      },
      sustainabilityTitle: "Sustainability",
      sustainabilitySubtitle: "Investing in Kalēa means choosing the future",
      sustainability: {
        impact: {
          title: "Reduced environmental impact",
          description: "Sustainable materials and eco-compatible processes",
        },
        durability: {
          title: "Long-lasting",
          description: "Investment that lasts over time",
        },
        maintenance: {
          title: "Minimal maintenance",
          description: "Saving resources and time",
        },
      },
      ctaTitle: "Want to use Kalēa in your projects?",
      ctaSubtitle: "Contact us to receive samples, technical documentation or a personalized quote",
      ctaButton1: "Request quote",
      ctaButton2: "Become partner",
    },
    stonecore: {
      structureTitle: "Advanced multilayer structure",
      structureSubtitle: "10 mm total: 8.5 mm MgO core + 1.5 mm decorative wear layer",
      layers: {
        decorative: "Decorative layer",
        wear: "Wear layer",
        core: "MgO Core",
        mat: "Mat",
      },
      advantagesTitle: "Exclusive advantages",
      advantagesSubtitle: "Superior performance for every design need",
      advantages: {
        waterproof: {
          title: "Waterproof",
          description: "100% waterproof. Perfect for bathrooms, kitchens and humid environments without worries.",
        },
        fireproof: {
          title: "Fireproof",
          description: "Certified fireproof. Maximum safety for residential and commercial spaces.",
        },
        antimold: {
          title: "Anti-mold",
          description: "Naturally resistant to mold and bacteria. Healthier and more wholesome environment.",
        },
        acoustic: {
          title: "Acoustic comfort",
          description: "Reduces noise transmission. Silence and tranquility in every room.",
        },
        floating: {
          title: "Floating installation",
          description: "Fast installation without glue. Ready to use in a few hours.",
        },
        stability: {
          title: "Dimensional stability",
          description: "Does not expand or contract. Perfect for large continuous surfaces.",
        },
      },
      finishesTitle: "Available finishes",
      finishesSubtitle: "Choose from our 8 wood-effect MgO finishes",
      finishes: {
        corteccia: "Corteccia",
        cenere: "Cenere",
        sabbia: "Sabbia",
        silven: "Silven",
        terram: "Terram",
        perla: "Perla",
        velora: "Velora",
        aurora: "Aurora",
      },
      techTitle: "Features",
      techPosa: "Installation",
      techMaintenance: "Maintenance",
      ctaTitle: "Download complete documentation",
      ctaSubtitle: "Datasheets, certifications and installation guides available in the Technical Area",
      ctaButton: "Go to Technical Area",
    },
    edgeline: {
      advantagesTitle: "Why choose EdgeLine",
      advantagesSubtitle: "The complete solution for profiles and skirting boards",
      advantages: {
        design: {
          title: "Minimal design",
          description: "Elegant profiles that enhance the floor without invading the aesthetics of the spaces.",
        },
        resistance: {
          title: "Superior resistance",
          description: "High quality aluminum that guarantees durability and stability over time.",
        },
        versatility: {
          title: "Versatility",
          description: "Solutions for every need: terminals, junctions, expansion joints, steps.",
        },
      },
      productsTitle: "Product range",
      productsSubtitle: "Technical solutions for every installation situation",
      products: {
        terminal: {
          title: "Terminal profile",
          description: "Perfect finish for exposed floor terminations",
        },
        junction: {
          title: "Junction profile",
          description: "Connection between floors at the same level",
        },
        expansion: {
          title: "Expansion profile",
          description: "Management of structural expansion joints",
        },
        baseboard: {
          title: "Skirting board",
          description: "Coordinated with StoneCore 10 floors",
        },
        step: {
          title: "Step profile",
          description: "Protection and finish for steps and level differences",
        },
      },
      finishesTitle: "Available finishes",
      finishesSubtitle: "Coordinated with Kalēa StoneCore 10 floors",
      finishes: {
        natural: "Natural aluminum",
        bronze: "Satin bronze",
        black: "Matte black",
        silver: "Glossy silver",
      },
      ctaTitle: "Complete your project with EdgeLine",
      ctaSubtitle: "Request a personalized quote or free samples",
      ctaButton: "Contact us",
    },
    onewall: {
      howItWorksTitle: "How it works",
      howItWorksSubtitle: "Simple and fast system for perfect walls and ceilings",
      howItWorks: {
        step1: {
          title: "Preparation",
          description: "Installation of dry supporting structure (optional for existing walls)",
        },
        step2: {
          title: "Panel installation",
          description: "Fixing OneWall panels with screws and plugs. Simple cutting and adaptation",
        },
        step3: {
          title: "Finishing",
          description: "Joint filling and profile application. Ready to use without further finishing",
        },
      },
      finishesTitle: "Available finishes",
      finishesSubtitle: "Customize walls and ceilings according to your style",
      finishes: {
        wood: {
          title: "Wood effect",
          description: "Natural textures for warm environments",
        },
        marble: {
          title: "Marble effect",
          description: "Timeless elegance for refined spaces",
        },
        concrete: {
          title: "Concrete effect",
          description: "Industrial and contemporary style",
        },
        wallpaper: {
          title: "Wallpaper",
          description: "Infinite customization with exclusive patterns",
        },
        decorative: {
          title: "Decorative finishes",
          description: "Three-dimensional textures for accent walls",
        },
      },
      advantagesTitle: "Technical advantages",
      advantagesSubtitle: "Superior performance to traditional drywall",
      advantages: {
        fast: {
          title: "Very fast installation",
          description: "Panels already finished ready to use. Installation 3 times faster than traditional drywall.",
        },
        resistance: {
          title: "Superior resistance",
          description: "MgO core that guarantees stability, hardness and impact resistance.",
        },
        waterproof: {
          title: "Waterproof",
          description: "Perfect for humid environments such as bathrooms and kitchens without risk of degradation.",
        },
        fireproof: {
          title: "Fireproof",
          description: "Certified fireproof. Maximum safety for walls and ceilings.",
        },
        aesthetic: {
          title: "Aesthetic versatility",
          description: "Available in wood, marble, concrete, wallpaper and decorative finishes.",
        },
        maintenance: {
          title: "Zero maintenance",
          description: "Does not require touch-ups, painting or periodic treatments.",
        },
      },
      applicationsTitle: "Where to use OneWall",
      applicationsSubtitle: "Versatile solutions for every architectural need",
      ctaTitle: "Discover OneWall possibilities",
      ctaSubtitle: "Contact us for personalized consultation on your project",
      ctaButton: "Request consultation",
    },
    aboutUs: {
      title: "About Us",
      intro1: "Kalēa was born from experience in the construction sector and passion for material innovation. We develop MgO (magnesium oxide) surfaces that redefine standards of performance, aesthetics and sustainability.",
      intro2: "Every product in the Kalēa range is designed in Italy with the goal of simplifying installation, ensuring durability over time and offering cutting-edge solutions for architects, designers and contractors.",
      historyTitle: "Our story",
      history1: "The Kalēa project was born from the desire to overcome the limits of traditional materials in the construction and interior design sector. Magnesium oxide (MgO) proved to be the key to developing a range of products with exceptional performance.",
      history2: "After years of research and development, we created three integrated lines: StoneCore 10 for floors, EdgeLine for profiles and skirting boards, and OneWall for walls and ceilings. Each product is designed to be simple to install, beautiful to look at and capable of lasting over time.",
      history3: "Today Kalēa is synonymous with Italian innovation in the field of technical surfaces, chosen by professionals seeking quality, design and reliability.",
      valuesTitle: "What guides us",
      valuesSubtitle: "The values that inspire every decision and every Kalēa product",
      values: {
        innovation: {
          title: "Innovation",
          description: "Continuous research of cutting-edge materials and solutions for the construction sector.",
        },
        design: {
          title: "Design",
          description: "Minimal aesthetics and functionality merge in every product we develop.",
        },
        collaboration: {
          title: "Collaboration",
          description: "We work alongside architects, interior designers and companies to create unique projects.",
        },
        quality: {
          title: "Quality",
          description: "High production standards and rigorous control at every stage, from design to delivery.",
        },
      },
      customersTitle: "Who we work for",
      customersSubtitle: "The professionals who choose Kalēa for their projects",
      customers: {
        architects: {
          title: "Architects and designers",
          description: "Technical solutions for residential and commercial projects",
        },
        designers: {
          title: "Interior designers",
          description: "Premium materials for carefully designed spaces",
        },
        builders: {
          title: "Construction companies",
          description: "Reliable products with fast installation and complete certifications",
        },
        retailers: {
          title: "Retailers",
          description: "Commercial partners for distribution and territorial support",
        },
      },
      ctaTitle: "Want to collaborate with us?",
      ctaSubtitle: "We are looking for partners, retailers and professionals who share our vision",
      ctaButton: "Contact us",
    },
    contacts: {
      title: "Contacts",
      subtitle: "We are here to answer all your questions about Kalēa and our products",
      formTitle: "Send a request",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      userType: "User type",
      userTypePlaceholder: "Select...",
      userTypes: {
        architect: "Architect / Designer",
        designer: "Interior Designer",
        builder: "Construction Company",
        retailer: "Retailer",
        private: "Private",
        other: "Other",
      },
      interests: "Interests",
      interestsList: {
        stonecore: "StoneCore 10",
        edgeline: "EdgeLine",
        onewall: "OneWall",
        partnership: "Partnership",
      },
      message: "Message",
      messagePlaceholder: "Write your message here...",
      privacy: "I accept the privacy policy and authorize the processing of my personal data",
      submit: "Send request",
      infoTitle: "Information",
      infoText: "Our team is at your disposal to provide you with all the necessary information on Kalēa products, request samples, quotes or to become a partner.",
      emailLabel: "Email",
      phoneLabel: "Phone",
      phoneHours: "Mon-Fri: 9:00 AM - 6:00 PM",
      locationLabel: "Location",
      locationValue: "Italy",
      hoursTitle: "Opening hours",
      hoursWeekdays: "Monday - Friday",
      hoursSaturday: "Saturday",
      hoursSunday: "Sunday",
      hoursClosed: "Closed",
      successTitle: "Message sent!",
      successMessage: "We will reply as soon as possible.",
      errorTitle: "Error",
      errorMessage: "You must accept the privacy policy to send the message",
    },
    technicalArea: {
      title: "Technical Area",
      subtitle: "Download datasheets, certifications and installation guides for all Kalēa products",
      allDocuments: "All documents",
      download: "Download",
      ctaTitle: "Need technical support?",
      ctaSubtitle: "Our team is available to answer all your technical questions",
      ctaButton: "Contact technical support",
    },
    footer: {
      tagline: "New generation MgO surfaces. Floors, profiles and panels developed in Italy to last and transform spaces.",
      quickLinks: "Quick Links",
      contactsTitle: "Contacts",
      copyright: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
    },
  },
  de: {
    nav: {
      home: "Startseite",
      lines: "Linien",
      technicalArea: "Technischer Bereich",
      aboutUs: "Über uns",
      contacts: "Kontakte",
      requestQuote: "Angebot anfordern",
    },
    hero: {
      home: {
        title: "MgO-Oberflächen der neuen Generation",
        subtitle: "Böden, Profile und Paneele, die in Italien entwickelt wurden, um Räume langlebig zu gestalten und zu verwandeln.",
        ctaPrimary: "Entdecken Sie unsere Lösungen",
        ctaSecondary: "Angebot anfordern",
      },
      stonecore: {
        title: "Kalēa StoneCore 10",
        subtitle: "MgO-Bodenbeläge der neuen Generation. Professionelle Leistung, natürliche Ästhetik, schnelle Installation.",
        ctaPrimary: "Muster anfordern",
        ctaSecondary: "Datenblatt herunterladen",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        subtitle: "Aufeinander abgestimmte Aluminiumprofile und Sockelleisten. Die perfekte Verarbeitung für jedes Projekt.",
        ctaPrimary: "Katalog anfordern",
        ctaSecondary: "StoneCore 10 entdecken",
      },
      onewall: {
        title: "Kalēa OneWall",
        subtitle: "MgO-Paneele für Wände und Decken. Die Evolution des Trockenbaus, bereits fertiggestellt.",
        ctaPrimary: "Muster anfordern",
        ctaSecondary: "Katalog herunterladen",
      },
    },
    home: {
      linesTitle: "Kalēa-Linien",
      linesSubtitle: "Drei integrierte Systeme zur Gestaltung der Räume der Zukunft",
      stonecore: {
        title: "Kalēa StoneCore 10",
        description: "10 mm MgO-Böden, schwimmend, wasserdicht und feuerfest. Schnelle Verlegung, professionelle Leistung, natürliche Ästhetik.",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        description: "Aufeinander abgestimmte Aluminiumprofile und Sockelleisten. Minimalistisches Design, überlegene Beständigkeit, perfekte Verarbeitung für jeden Raum.",
      },
      onewall: {
        title: "Kalēa OneWall",
        description: "MgO-Paneele für Wände und Decken, bereits fertiggestellt. Fortschrittliche Alternative zu Trockenbau, vielseitig und schnell zu installieren.",
      },
      mgoTitle: "Warum MgO",
      mgoDescription: "Magnesiumoxid (MgO) steht für die Zukunft des Bauwesens. Ein Material mit außergewöhnlicher Leistung, das die Grenzen traditioneller Systeme überwindet.",
      mgoAdvantages: {
        fireproof: "Feuerfest",
        waterproof: "Wasserdicht",
        stability: "Dimensionale Stabilität",
        antimold: "Anti-Schimmel",
        acoustic: "Akustischer Komfort",
        floating: "Schwimmende Verlegung",
      },
      mgoButton: "Mehr erfahren",
      applicationsTitle: "Anwendungen",
      applicationsSubtitle: "Kalēa passt sich jedem Kontext an, vom Wohnbereich bis zum Gewerbe",
      applications: {
        residential: {
          title: "Wohnbereich",
          description: "Private Designhäuser",
        },
        hospitality: {
          title: "Gastgewerbe",
          description: "Hotels und Beherbergungsbetriebe",
        },
        retail: {
          title: "Einzelhandel",
          description: "Geschäfte und Showrooms",
        },
        offices: {
          title: "Büros",
          description: "Zeitgemäße Arbeitsräume",
        },
      },
      sustainabilityTitle: "Nachhaltigkeit",
      sustainabilitySubtitle: "In Kalēa zu investieren bedeutet, die Zukunft zu wählen",
      sustainability: {
        impact: {
          title: "Reduzierte Umweltbelastung",
          description: "Nachhaltige Materialien und umweltverträgliche Prozesse",
        },
        durability: {
          title: "Langlebigkeit",
          description: "Investition, die über die Zeit Bestand hat",
        },
        maintenance: {
          title: "Minimaler Wartungsaufwand",
          description: "Einsparung von Ressourcen und Zeit",
        },
      },
      ctaTitle: "Möchten Sie Kalēa in Ihren Projekten verwenden?",
      ctaSubtitle: "Kontaktieren Sie uns, um Muster, technische Dokumentation oder ein personalisiertes Angebot zu erhalten",
      ctaButton1: "Angebot anfordern",
      ctaButton2: "Partner werden",
    },
    stonecore: {
      structureTitle: "Fortschrittliche Mehrschichtstruktur",
      structureSubtitle: "10 mm gesamt: 8,5 mm MgO-Kern + 1,5 mm dekorative Verschleißschicht",
      layers: {
        decorative: "Dekorschicht",
        wear: "Verschleißschicht",
        core: "MgO-Kern",
        mat: "Matte",
      },
      advantagesTitle: "Exklusive Vorteile",
      advantagesSubtitle: "Überlegene Leistung für jeden Planungsbedarf",
      advantages: {
        waterproof: {
          title: "Wasserdicht",
          description: "100% wasserdicht. Perfekt für Bäder, Küchen und feuchte Umgebungen ohne Sorgen.",
        },
        fireproof: {
          title: "Feuerfest",
          description: "Zertifiziert feuerfest. Maximale Sicherheit für Wohn- und Gewerbeflächen.",
        },
        antimold: {
          title: "Anti-Schimmel",
          description: "Natürlich resistent gegen Schimmel und Bakterien. Gesündere und heilsamere Umgebung.",
        },
        acoustic: {
          title: "Akustischer Komfort",
          description: "Reduziert die Geräuschübertragung. Stille und Ruhe in jedem Raum.",
        },
        floating: {
          title: "Schwimmende Verlegung",
          description: "Schnelle Installation ohne Klebstoff. In wenigen Stunden einsatzbereit.",
        },
        stability: {
          title: "Dimensionale Stabilität",
          description: "Dehnt sich nicht aus und zieht sich nicht zusammen. Perfekt für große durchgehende Flächen.",
        },
      },
      finishesTitle: "Verfügbare Oberflächen",
      finishesSubtitle: "Wählen Sie aus unseren 8 MgO-Holzeffekt-Oberflächen",
      finishes: {
        corteccia: "Corteccia",
        cenere: "Cenere",
        sabbia: "Sabbia",
        silven: "Silven",
        terram: "Terram",
        perla: "Perla",
        velora: "Velora",
        aurora: "Aurora",
      },
      techTitle: "Eigenschaften",
      techPosa: "Installation",
      techMaintenance: "Wartung",
      ctaTitle: "Vollständige Dokumentation herunterladen",
      ctaSubtitle: "Datenblätter, Zertifizierungen und Installationsanleitungen im Technischen Bereich verfügbar",
      ctaButton: "Zum Technischen Bereich",
    },
    edgeline: {
      advantagesTitle: "Warum EdgeLine wählen",
      advantagesSubtitle: "Die komplette Lösung für Profile und Sockelleisten",
      advantages: {
        design: {
          title: "Minimalistisches Design",
          description: "Elegante Profile, die den Boden aufwerten, ohne die Ästhetik der Räume zu beeinträchtigen.",
        },
        resistance: {
          title: "Überlegene Beständigkeit",
          description: "Hochwertiges Aluminium, das Langlebigkeit und Stabilität im Laufe der Zeit garantiert.",
        },
        versatility: {
          title: "Vielseitigkeit",
          description: "Lösungen für jeden Bedarf: Abschlussprofile, Verbindungen, Dehnfugen, Stufen.",
        },
      },
      productsTitle: "Produktpalette",
      productsSubtitle: "Technische Lösungen für jede Verlegesituation",
      products: {
        terminal: {
          title: "Abschlussprofil",
          description: "Perfekter Abschluss für sichtbare Bodenabschlüsse",
        },
        junction: {
          title: "Verbindungsprofil",
          description: "Verbindung zwischen Böden auf derselben Ebene",
        },
        expansion: {
          title: "Dehnfugenprofil",
          description: "Verwaltung struktureller Dehnfugen",
        },
        baseboard: {
          title: "Sockelleiste",
          description: "Abgestimmt auf StoneCore 10 Böden",
        },
        step: {
          title: "Stufenprofil",
          description: "Schutz und Verarbeitung für Stufen und Höhenunterschiede",
        },
      },
      finishesTitle: "Verfügbare Oberflächen",
      finishesSubtitle: "Abgestimmt auf Kalēa StoneCore 10 Böden",
      finishes: {
        natural: "Naturaluminium",
        bronze: "Satinierte Bronze",
        black: "Mattes Schwarz",
        silver: "Glänzendes Silber",
      },
      ctaTitle: "Vervollständigen Sie Ihr Projekt mit EdgeLine",
      ctaSubtitle: "Fordern Sie ein personalisiertes Angebot oder kostenlose Muster an",
      ctaButton: "Kontaktieren Sie uns",
    },
    onewall: {
      howItWorksTitle: "Wie es funktioniert",
      howItWorksSubtitle: "Einfaches und schnelles System für perfekte Wände und Decken",
      howItWorks: {
        step1: {
          title: "Vorbereitung",
          description: "Installation der Trockenbaustützkonstruktion (optional für bestehende Wände)",
        },
        step2: {
          title: "Paneelinstallation",
          description: "Befestigung der OneWall-Paneele mit Schrauben und Dübeln. Einfaches Schneiden und Anpassen",
        },
        step3: {
          title: "Verarbeitung",
          description: "Fugenverfüllung und Profilanbringung. Ohne weitere Verarbeitung einsatzbereit",
        },
      },
      finishesTitle: "Verfügbare Oberflächen",
      finishesSubtitle: "Passen Sie Wände und Decken nach Ihrem Stil an",
      finishes: {
        wood: {
          title: "Holzeffekt",
          description: "Natürliche Texturen für warme Umgebungen",
        },
        marble: {
          title: "Marmoreffekt",
          description: "Zeitlose Eleganz für raffinierte Räume",
        },
        concrete: {
          title: "Betoneffekt",
          description: "Industrieller und zeitgenössischer Stil",
        },
        wallpaper: {
          title: "Tapete",
          description: "Unendliche Anpassung mit exklusiven Mustern",
        },
        decorative: {
          title: "Dekorative Oberflächen",
          description: "Dreidimensionale Texturen für Akzentwände",
        },
      },
      advantagesTitle: "Technische Vorteile",
      advantagesSubtitle: "Überlegene Leistung gegenüber herkömmlichem Trockenbau",
      advantages: {
        fast: {
          title: "Sehr schnelle Installation",
          description: "Bereits fertige Paneele einsatzbereit. Installation 3-mal schneller als herkömmlicher Trockenbau.",
        },
        resistance: {
          title: "Überlegene Beständigkeit",
          description: "MgO-Kern, der Stabilität, Härte und Stoßfestigkeit garantiert.",
        },
        waterproof: {
          title: "Wasserdicht",
          description: "Perfekt für feuchte Umgebungen wie Bäder und Küchen ohne Degradationsrisiko.",
        },
        fireproof: {
          title: "Feuerfest",
          description: "Zertifiziert feuerfest. Maximale Sicherheit für Wände und Decken.",
        },
        aesthetic: {
          title: "Ästhetische Vielseitigkeit",
          description: "Verfügbar in Holz-, Marmor-, Beton-, Tapeten- und Dekoroberflächen.",
        },
        maintenance: {
          title: "Null Wartung",
          description: "Erfordert keine Nachbesserungen, Anstriche oder regelmäßige Behandlungen.",
        },
      },
      applicationsTitle: "Wo OneWall verwenden",
      applicationsSubtitle: "Vielseitige Lösungen für jeden architektonischen Bedarf",
      ctaTitle: "Entdecken Sie die Möglichkeiten von OneWall",
      ctaSubtitle: "Kontaktieren Sie uns für eine personalisierte Beratung zu Ihrem Projekt",
      ctaButton: "Beratung anfordern",
    },
    aboutUs: {
      title: "Über uns",
      intro1: "Kalēa entstand aus Erfahrung im Bausektor und Leidenschaft für Materialinnovation. Wir entwickeln MgO-Oberflächen (Magnesiumoxid), die Standards für Leistung, Ästhetik und Nachhaltigkeit neu definieren.",
      intro2: "Jedes Produkt der Kalēa-Palette ist in Italien entworfen mit dem Ziel, die Installation zu vereinfachen, Langlebigkeit im Laufe der Zeit zu gewährleisten und fortschrittliche Lösungen für Architekten, Designer und Bauunternehmen anzubieten.",
      historyTitle: "Unsere Geschichte",
      history1: "Das Kalēa-Projekt entstand aus dem Wunsch, die Grenzen traditioneller Materialien im Bau- und Innenarchitektursektor zu überwinden. Magnesiumoxid (MgO) erwies sich als Schlüssel zur Entwicklung einer Produktpalette mit außergewöhnlicher Leistung.",
      history2: "Nach Jahren der Forschung und Entwicklung schufen wir drei integrierte Linien: StoneCore 10 für Böden, EdgeLine für Profile und Sockelleisten und OneWall für Wände und Decken. Jedes Produkt ist so konzipiert, dass es einfach zu installieren, schön anzusehen und langlebig ist.",
      history3: "Heute steht Kalēa für italienische Innovation im Bereich der technischen Oberflächen, gewählt von Fachleuten, die Qualität, Design und Zuverlässigkeit suchen.",
      valuesTitle: "Was uns leitet",
      valuesSubtitle: "Die Werte, die jede Entscheidung und jedes Kalēa-Produkt inspirieren",
      values: {
        innovation: {
          title: "Innovation",
          description: "Kontinuierliche Forschung nach fortschrittlichen Materialien und Lösungen für den Bausektor.",
        },
        design: {
          title: "Design",
          description: "Minimalistische Ästhetik und Funktionalität verschmelzen in jedem von uns entwickelten Produkt.",
        },
        collaboration: {
          title: "Zusammenarbeit",
          description: "Wir arbeiten mit Architekten, Innenarchitekten und Unternehmen zusammen, um einzigartige Projekte zu realisieren.",
        },
        quality: {
          title: "Qualität",
          description: "Hohe Produktionsstandards und strenge Kontrolle in jeder Phase, vom Design bis zur Lieferung.",
        },
      },
      customersTitle: "Für wen wir arbeiten",
      customersSubtitle: "Die Fachleute, die Kalēa für ihre Projekte wählen",
      customers: {
        architects: {
          title: "Architekten und Planer",
          description: "Technische Lösungen für Wohn- und Gewerbeprojekte",
        },
        designers: {
          title: "Innenarchitekten",
          description: "Premium-Materialien für sorgfältig gestaltete Räume",
        },
        builders: {
          title: "Bauunternehmen",
          description: "Zuverlässige Produkte mit schneller Installation und vollständigen Zertifizierungen",
        },
        retailers: {
          title: "Einzelhändler",
          description: "Geschäftspartner für Vertrieb und regionale Unterstützung",
        },
      },
      ctaTitle: "Möchten Sie mit uns zusammenarbeiten?",
      ctaSubtitle: "Wir suchen Partner, Einzelhändler und Fachleute, die unsere Vision teilen",
      ctaButton: "Kontaktieren Sie uns",
    },
    contacts: {
      title: "Kontakte",
      subtitle: "Wir sind hier, um alle Ihre Fragen zu Kalēa und unseren Produkten zu beantworten",
      formTitle: "Anfrage senden",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      userType: "Benutzertyp",
      userTypePlaceholder: "Auswählen...",
      userTypes: {
        architect: "Architekt / Planer",
        designer: "Innenarchitekt",
        builder: "Bauunternehmen",
        retailer: "Einzelhändler",
        private: "Privat",
        other: "Andere",
      },
      interests: "Interessen",
      interestsList: {
        stonecore: "StoneCore 10",
        edgeline: "EdgeLine",
        onewall: "OneWall",
        partnership: "Partnerschaft",
      },
      message: "Nachricht",
      messagePlaceholder: "Schreiben Sie hier Ihre Nachricht...",
      privacy: "Ich akzeptiere die Datenschutzrichtlinie und autorisiere die Verarbeitung meiner persönlichen Daten",
      submit: "Anfrage senden",
      infoTitle: "Informationen",
      infoText: "Unser Team steht Ihnen zur Verfügung, um Ihnen alle notwendigen Informationen über Kalēa-Produkte zu geben, Muster anzufordern, Angebote einzuholen oder Partner zu werden.",
      emailLabel: "E-Mail",
      phoneLabel: "Telefon",
      phoneHours: "Mo-Fr: 9:00 - 18:00",
      locationLabel: "Standort",
      locationValue: "Italien",
      hoursTitle: "Öffnungszeiten",
      hoursWeekdays: "Montag - Freitag",
      hoursSaturday: "Samstag",
      hoursSunday: "Sonntag",
      hoursClosed: "Geschlossen",
      successTitle: "Nachricht gesendet!",
      successMessage: "Wir werden so schnell wie möglich antworten.",
      errorTitle: "Fehler",
      errorMessage: "Sie müssen die Datenschutzrichtlinie akzeptieren, um die Nachricht zu senden",
    },
    technicalArea: {
      title: "Technischer Bereich",
      subtitle: "Laden Sie Datenblätter, Zertifizierungen und Installationsanleitungen für alle Kalēa-Produkte herunter",
      allDocuments: "Alle Dokumente",
      download: "Herunterladen",
      ctaTitle: "Benötigen Sie technische Unterstützung?",
      ctaSubtitle: "Unser Team steht zur Verfügung, um alle Ihre technischen Fragen zu beantworten",
      ctaButton: "Technischen Support kontaktieren",
    },
    footer: {
      tagline: "MgO-Oberflächen der neuen Generation. Böden, Profile und Paneele, die in Italien entwickelt wurden, um Räume langlebig zu gestalten und zu verwandeln.",
      quickLinks: "Schnellzugriff",
      contactsTitle: "Kontakte",
      copyright: "Alle Rechte vorbehalten.",
      privacy: "Datenschutzrichtlinie",
      terms: "Allgemeine Geschäftsbedingungen",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      lines: "Lignes",
      technicalArea: "Espace Technique",
      aboutUs: "Qui sommes-nous",
      contacts: "Contacts",
      requestQuote: "Demander un devis",
    },
    hero: {
      home: {
        title: "Surfaces MgO de nouvelle génération",
        subtitle: "Sols, profilés et panneaux développés en Italie pour durer et transformer les espaces.",
        ctaPrimary: "Découvrez nos solutions",
        ctaSecondary: "Demander un devis",
      },
      stonecore: {
        title: "Kalēa StoneCore 10",
        subtitle: "Revêtements de sol MgO de nouvelle génération. Performance professionnelle, esthétique naturelle, pose rapide.",
        ctaPrimary: "Demander des échantillons",
        ctaSecondary: "Télécharger la fiche technique",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        subtitle: "Profilés et plinthes en aluminium coordonnés. La finition parfaite pour chaque projet.",
        ctaPrimary: "Demander le catalogue",
        ctaSecondary: "Découvrir StoneCore 10",
      },
      onewall: {
        title: "Kalēa OneWall",
        subtitle: "Panneaux MgO pour murs et plafonds. L'évolution de la cloison sèche, déjà finie.",
        ctaPrimary: "Demander des échantillons",
        ctaSecondary: "Télécharger le catalogue",
      },
    },
    home: {
      linesTitle: "Les lignes Kalēa",
      linesSubtitle: "Trois systèmes intégrés pour façonner les espaces du futur",
      stonecore: {
        title: "Kalēa StoneCore 10",
        description: "Sols MgO de 10 mm, flottants, étanches et ignifuges. Pose rapide, performance professionnelle, esthétique naturelle.",
      },
      edgeline: {
        title: "Kalēa EdgeLine",
        description: "Profilés et plinthes en aluminium coordonnés. Design minimal, résistance supérieure, finition parfaite pour chaque espace.",
      },
      onewall: {
        title: "Kalēa OneWall",
        description: "Panneaux MgO pour murs et plafonds, déjà finis. Alternative avancée à la cloison sèche, polyvalente et rapide à installer.",
      },
      mgoTitle: "Pourquoi MgO",
      mgoDescription: "L'oxyde de magnésium (MgO) représente l'avenir de la construction. Un matériau aux performances exceptionnelles qui dépasse les limites des systèmes traditionnels.",
      mgoAdvantages: {
        fireproof: "Ignifuge",
        waterproof: "Étanche",
        stability: "Stabilité dimensionnelle",
        antimold: "Anti-moisissure",
        acoustic: "Confort acoustique",
        floating: "Pose flottante",
      },
      mgoButton: "En savoir plus",
      applicationsTitle: "Applications",
      applicationsSubtitle: "Kalēa s'adapte à tous les contextes, du résidentiel au commercial",
      applications: {
        residential: {
          title: "Résidentiel",
          description: "Maisons privées design",
        },
        hospitality: {
          title: "Hôtellerie",
          description: "Hôtels et établissements d'hébergement",
        },
        retail: {
          title: "Commerce",
          description: "Magasins et showrooms",
        },
        offices: {
          title: "Bureaux",
          description: "Espaces de travail contemporains",
        },
      },
      sustainabilityTitle: "Durabilité",
      sustainabilitySubtitle: "Investir dans Kalēa signifie choisir l'avenir",
      sustainability: {
        impact: {
          title: "Impact environnemental réduit",
          description: "Matériaux durables et processus éco-compatibles",
        },
        durability: {
          title: "Longue durée",
          description: "Investissement qui dure dans le temps",
        },
        maintenance: {
          title: "Entretien minimal",
          description: "Économie de ressources et de temps",
        },
      },
      ctaTitle: "Vous souhaitez utiliser Kalēa dans vos projets ?",
      ctaSubtitle: "Contactez-nous pour recevoir des échantillons, de la documentation technique ou un devis personnalisé",
      ctaButton1: "Demander un devis",
      ctaButton2: "Devenir partenaire",
    },
    stonecore: {
      structureTitle: "Structure multicouche avancée",
      structureSubtitle: "10 mm au total : 8,5 mm noyau MgO + 1,5 mm couche d'usure décorative",
      layers: {
        decorative: "Couche décorative",
        wear: "Couche d'usure",
        core: "Noyau MgO",
        mat: "Tapis",
      },
      advantagesTitle: "Avantages exclusifs",
      advantagesSubtitle: "Performance supérieure pour chaque besoin de conception",
      advantages: {
        waterproof: {
          title: "Étanche",
          description: "100% imperméable. Parfait pour les salles de bains, cuisines et environnements humides sans soucis.",
        },
        fireproof: {
          title: "Ignifuge",
          description: "Certifié ignifuge. Sécurité maximale pour les espaces résidentiels et commerciaux.",
        },
        antimold: {
          title: "Anti-moisissure",
          description: "Naturellement résistant aux moisissures et bactéries. Environnement plus sain et salubre.",
        },
        acoustic: {
          title: "Confort acoustique",
          description: "Réduit la transmission du bruit. Silence et tranquillité dans chaque pièce.",
        },
        floating: {
          title: "Pose flottante",
          description: "Installation rapide sans colle. Prêt à l'emploi en quelques heures.",
        },
        stability: {
          title: "Stabilité dimensionnelle",
          description: "Ne se dilate ni ne se contracte. Parfait pour les grandes surfaces continues.",
        },
      },
      finishesTitle: "Finitions disponibles",
      finishesSubtitle: "Choisissez parmi nos 8 finitions effet bois en MgO",
      finishes: {
        corteccia: "Corteccia",
        cenere: "Cenere",
        sabbia: "Sabbia",
        silven: "Silven",
        terram: "Terram",
        perla: "Perla",
        velora: "Velora",
        aurora: "Aurora",
      },
      techTitle: "Caractéristiques",
      techPosa: "Pose",
      techMaintenance: "Entretien",
      ctaTitle: "Téléchargez la documentation complète",
      ctaSubtitle: "Fiches techniques, certifications et guides de pose disponibles dans l'Espace Technique",
      ctaButton: "Aller à l'Espace Technique",
    },
    edgeline: {
      advantagesTitle: "Pourquoi choisir EdgeLine",
      advantagesSubtitle: "La solution complète pour profilés et plinthes",
      advantages: {
        design: {
          title: "Design minimal",
          description: "Profilés élégants qui valorisent le sol sans envahir l'esthétique des espaces.",
        },
        resistance: {
          title: "Résistance supérieure",
          description: "Aluminium de haute qualité qui garantit durabilité et stabilité dans le temps.",
        },
        versatility: {
          title: "Polyvalence",
          description: "Solutions pour chaque besoin : terminaux, jonctions, dilatations, marches.",
        },
      },
      productsTitle: "Gamme de produits",
      productsSubtitle: "Solutions techniques pour chaque situation de pose",
      products: {
        terminal: {
          title: "Profilé terminal",
          description: "Finition parfaite pour les terminaisons apparentes du sol",
        },
        junction: {
          title: "Profilé de jonction",
          description: "Raccord entre sols du même niveau",
        },
        expansion: {
          title: "Profilé de dilatation",
          description: "Gestion des joints de dilatation structurels",
        },
        baseboard: {
          title: "Plinthe",
          description: "Coordonné avec les sols StoneCore 10",
        },
        step: {
          title: "Profilé de marche",
          description: "Protection et finition pour marches et dénivellations",
        },
      },
      finishesTitle: "Finitions disponibles",
      finishesSubtitle: "Coordonnées avec les sols Kalēa StoneCore 10",
      finishes: {
        natural: "Aluminium naturel",
        bronze: "Bronze satiné",
        black: "Noir mat",
        silver: "Argent brillant",
      },
      ctaTitle: "Complétez votre projet avec EdgeLine",
      ctaSubtitle: "Demandez un devis personnalisé ou des échantillons gratuits",
      ctaButton: "Contactez-nous",
    },
    onewall: {
      howItWorksTitle: "Comment ça marche",
      howItWorksSubtitle: "Système simple et rapide pour des murs et plafonds parfaits",
      howItWorks: {
        step1: {
          title: "Préparation",
          description: "Installation de structure porteuse sèche (optionnel pour murs existants)",
        },
        step2: {
          title: "Pose des panneaux",
          description: "Fixation des panneaux OneWall avec vis et chevilles. Coupe et adaptation simples",
        },
        step3: {
          title: "Finition",
          description: "Rebouchage des joints et application des profilés. Prêt à l'emploi sans autre finition",
        },
      },
      finishesTitle: "Finitions disponibles",
      finishesSubtitle: "Personnalisez murs et plafonds selon votre style",
      finishes: {
        wood: {
          title: "Effet bois",
          description: "Textures naturelles pour environnements chaleureux",
        },
        marble: {
          title: "Effet marbre",
          description: "Élégance intemporelle pour espaces raffinés",
        },
        concrete: {
          title: "Effet béton",
          description: "Style industriel et contemporain",
        },
        wallpaper: {
          title: "Papier peint",
          description: "Personnalisation infinie avec motifs exclusifs",
        },
        decorative: {
          title: "Finitions décoratives",
          description: "Textures tridimensionnelles pour murs d'accent",
        },
      },
      advantagesTitle: "Avantages techniques",
      advantagesSubtitle: "Performance supérieure à la cloison sèche traditionnelle",
      advantages: {
        fast: {
          title: "Pose très rapide",
          description: "Panneaux déjà finis prêts à l'emploi. Installation 3 fois plus rapide que la cloison sèche traditionnelle.",
        },
        resistance: {
          title: "Résistance supérieure",
          description: "Noyau MgO qui garantit stabilité, dureté et résistance aux chocs.",
        },
        waterproof: {
          title: "Étanche",
          description: "Parfait pour environnements humides comme salles de bains et cuisines sans risque de dégradation.",
        },
        fireproof: {
          title: "Ignifuge",
          description: "Certifié ignifuge. Sécurité maximale pour murs et plafonds.",
        },
        aesthetic: {
          title: "Polyvalence esthétique",
          description: "Disponible en finitions bois, marbre, béton, papier peint et décoratives.",
        },
        maintenance: {
          title: "Entretien zéro",
          description: "Ne nécessite pas de retouches, peintures ou traitements périodiques.",
        },
      },
      applicationsTitle: "Où utiliser OneWall",
      applicationsSubtitle: "Solutions polyvalentes pour chaque besoin architectural",
      ctaTitle: "Découvrez les possibilités de OneWall",
      ctaSubtitle: "Contactez-nous pour une consultation personnalisée sur votre projet",
      ctaButton: "Demander consultation",
    },
    aboutUs: {
      title: "Qui sommes-nous",
      intro1: "Kalēa est né de l'expérience dans le secteur de la construction et de la passion pour l'innovation des matériaux. Nous développons des surfaces MgO (oxyde de magnésium) qui redéfinissent les standards de performance, d'esthétique et de durabilité.",
      intro2: "Chaque produit de la gamme Kalēa est conçu en Italie avec l'objectif de simplifier la pose, garantir la durabilité dans le temps et offrir des solutions de pointe pour architectes, designers et entreprises.",
      historyTitle: "Notre histoire",
      history1: "Le projet Kalēa est né de la volonté de dépasser les limites des matériaux traditionnels dans le secteur de la construction et du design d'intérieur. L'oxyde de magnésium (MgO) s'est révélé être la clé pour développer une gamme de produits aux performances exceptionnelles.",
      history2: "Après des années de recherche et développement, nous avons créé trois lignes intégrées : StoneCore 10 pour les sols, EdgeLine pour les profilés et plinthes, et OneWall pour les murs et plafonds. Chaque produit est conçu pour être simple à poser, beau à regarder et capable de durer dans le temps.",
      history3: "Aujourd'hui, Kalēa est synonyme d'innovation italienne dans le domaine des surfaces techniques, choisi par des professionnels qui recherchent qualité, design et fiabilité.",
      valuesTitle: "Ce qui nous guide",
      valuesSubtitle: "Les valeurs qui inspirent chaque décision et chaque produit Kalēa",
      values: {
        innovation: {
          title: "Innovation",
          description: "Recherche continue de matériaux et solutions de pointe pour le secteur de la construction.",
        },
        design: {
          title: "Design",
          description: "Esthétique minimale et fonctionnalité fusionnent dans chaque produit que nous développons.",
        },
        collaboration: {
          title: "Collaboration",
          description: "Nous travaillons aux côtés d'architectes, designers d'intérieur et entreprises pour réaliser des projets uniques.",
        },
        quality: {
          title: "Qualité",
          description: "Standards de production élevés et contrôle rigoureux à chaque étape, de la conception à la livraison.",
        },
      },
      customersTitle: "Pour qui nous travaillons",
      customersSubtitle: "Les professionnels qui choisissent Kalēa pour leurs projets",
      customers: {
        architects: {
          title: "Architectes et concepteurs",
          description: "Solutions techniques pour projets résidentiels et commerciaux",
        },
        designers: {
          title: "Designers d'intérieur",
          description: "Matériaux premium pour espaces soigneusement conçus",
        },
        builders: {
          title: "Entreprises de construction",
          description: "Produits fiables avec pose rapide et certifications complètes",
        },
        retailers: {
          title: "Détaillants",
          description: "Partenaires commerciaux pour distribution et support territorial",
        },
      },
      ctaTitle: "Vous souhaitez collaborer avec nous ?",
      ctaSubtitle: "Nous recherchons des partenaires, détaillants et professionnels qui partagent notre vision",
      ctaButton: "Contactez-nous",
    },
    contacts: {
      title: "Contacts",
      subtitle: "Nous sommes là pour répondre à toutes vos questions sur Kalēa et nos produits",
      formTitle: "Envoyer une demande",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      phone: "Téléphone",
      userType: "Type d'utilisateur",
      userTypePlaceholder: "Sélectionner...",
      userTypes: {
        architect: "Architecte / Concepteur",
        designer: "Designer d'intérieur",
        builder: "Entreprise de construction",
        retailer: "Détaillant",
        private: "Privé",
        other: "Autre",
      },
      interests: "Intérêts",
      interestsList: {
        stonecore: "StoneCore 10",
        edgeline: "EdgeLine",
        onewall: "OneWall",
        partnership: "Partenariat",
      },
      message: "Message",
      messagePlaceholder: "Écrivez votre message ici...",
      privacy: "J'accepte la politique de confidentialité et autorise le traitement de mes données personnelles",
      submit: "Envoyer la demande",
      infoTitle: "Informations",
      infoText: "Notre équipe est à votre disposition pour vous fournir toutes les informations nécessaires sur les produits Kalēa, demander des échantillons, des devis ou pour devenir partenaire.",
      emailLabel: "E-mail",
      phoneLabel: "Téléphone",
      phoneHours: "Lun-Ven : 9h00 - 18h00",
      locationLabel: "Emplacement",
      locationValue: "Italie",
      hoursTitle: "Heures d'ouverture",
      hoursWeekdays: "Lundi - Vendredi",
      hoursSaturday: "Samedi",
      hoursSunday: "Dimanche",
      hoursClosed: "Fermé",
      successTitle: "Message envoyé !",
      successMessage: "Nous vous répondrons dans les plus brefs délais.",
      errorTitle: "Erreur",
      errorMessage: "Vous devez accepter la politique de confidentialité pour envoyer le message",
    },
    technicalArea: {
      title: "Espace Technique",
      subtitle: "Téléchargez fiches techniques, certifications et guides de pose pour tous les produits Kalēa",
      allDocuments: "Tous les documents",
      download: "Télécharger",
      ctaTitle: "Besoin de support technique ?",
      ctaSubtitle: "Notre équipe est disponible pour répondre à toutes vos questions techniques",
      ctaButton: "Contacter le support technique",
    },
    footer: {
      tagline: "Surfaces MgO de nouvelle génération. Sols, profilés et panneaux développés en Italie pour durer et transformer les espaces.",
      quickLinks: "Liens Rapides",
      contactsTitle: "Contacts",
      copyright: "Tous droits réservés.",
      privacy: "Politique de confidentialité",
      terms: "Termes et conditions",
    },
  },
};

// Helper function to get nested translation
export const getTranslation = (translations: Translations, path: string): string => {
  const keys = path.split('.');
  let value: any = translations;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return path; // Return key if translation not found
  }
  
  return typeof value === 'string' ? value : path;
};
