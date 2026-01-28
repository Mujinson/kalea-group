// Data for all Kalēa® color product pages

export interface ColorProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  relatedColors: string[];
  translations: {
    it: ColorTranslation;
    en: ColorTranslation;
    de: ColorTranslation;
    fr: ColorTranslation;
  };
}

export interface ColorTranslation {
  story: string;
  whyChoose: string[];
}

export const colorProducts: ColorProduct[] = [
  {
    id: 'corteccia',
    name: 'Corteccia',
    slug: 'corteccia',
    image: '/src/assets/finish-corteccia.jpg',
    relatedColors: ['aurora', 'sabbia', 'terram', 'silven'],
    translations: {
      it: {
        story: 'Corteccia rappresenta il calore autentico del legno naturale. Le venature ricche e profonde richiamano le essenze tropicali, portando negli ambienti una sensazione di comfort e presenza scenica.',
        whyChoose: [
          'Tonalità calda e avvolgente',
          'Perfetto per chalet, case di campagna e living accoglienti',
          'Aggiunge carattere e profondità all\'ambiente',
          'Ideale con arredi scuri e materiali naturali'
        ]
      },
      en: {
        story: 'Corteccia represents the authentic warmth of natural wood. The rich and deep grains recall tropical essences, bringing a feeling of comfort and scenic presence to spaces.',
        whyChoose: [
          'Warm and enveloping tone',
          'Perfect for chalets, country houses and cozy living rooms',
          'Adds character and depth to the environment',
          'Ideal with dark furniture and natural materials'
        ]
      },
      de: {
        story: 'Corteccia repräsentiert die authentische Wärme von Naturholz. Die reichen und tiefen Maserungen erinnern an tropische Essenzen und bringen ein Gefühl von Komfort und szenischer Präsenz in die Räume.',
        whyChoose: [
          'Warmer und einladender Ton',
          'Perfekt für Chalets, Landhäuser und gemütliche Wohnzimmer',
          'Verleiht dem Ambiente Charakter und Tiefe',
          'Ideal mit dunklen Möbeln und natürlichen Materialien'
        ]
      },
      fr: {
        story: 'Corteccia représente la chaleur authentique du bois naturel. Les veines riches et profondes rappellent les essences tropicales, apportant aux espaces une sensation de confort et de présence scénique.',
        whyChoose: [
          'Tonalité chaude et enveloppante',
          'Parfait pour les chalets, maisons de campagne et salons accueillants',
          'Ajoute du caractère et de la profondeur à l\'environnement',
          'Idéal avec des meubles sombres et des matériaux naturels'
        ]
      }
    }
  },
  {
    id: 'cenere',
    name: 'Cenere',
    slug: 'cenere',
    image: '/src/assets/finish-corteccia.jpg', // Placeholder - using corteccia as fallback
    relatedColors: ['perla', 'silven', 'velora', 'sabbia'],
    translations: {
      it: {
        story: 'Cenere è il colore minimalista per eccellenza. Grigio chiaro e neutro, pensato per chi vuole uno stile moderno, pulito e luminoso. Perfetto per interni contemporanei e ambienti total-white.',
        whyChoose: [
          'Estetica moderna e neutra',
          'Amplia visivamente gli spazi',
          'Ideale per uffici e case dal design nordico'
        ]
      },
      en: {
        story: 'Cenere is the quintessential minimalist color. Light and neutral gray, designed for those who want a modern, clean and bright style. Perfect for contemporary interiors and total-white environments.',
        whyChoose: [
          'Modern and neutral aesthetic',
          'Visually expands spaces',
          'Ideal for offices and Nordic-design homes'
        ]
      },
      de: {
        story: 'Cenere ist die minimalistische Farbe schlechthin. Helles und neutrales Grau, entworfen für diejenigen, die einen modernen, sauberen und hellen Stil wünschen. Perfekt für zeitgenössische Interieurs und Total-White-Umgebungen.',
        whyChoose: [
          'Moderne und neutrale Ästhetik',
          'Erweitert Räume optisch',
          'Ideal für Büros und Häuser im nordischen Design'
        ]
      },
      fr: {
        story: 'Cenere est la couleur minimaliste par excellence. Gris clair et neutre, conçu pour ceux qui veulent un style moderne, propre et lumineux. Parfait pour les intérieurs contemporains et les environnements total-white.',
        whyChoose: [
          'Esthétique moderne et neutre',
          'Agrandit visuellement les espaces',
          'Idéal pour les bureaux et les maisons au design nordique'
        ]
      }
    }
  },
  {
    id: 'sabbia',
    name: 'Sabbia',
    slug: 'sabbia',
    image: '/src/assets/finish-sabbia.jpg',
    relatedColors: ['aurora', 'terram', 'corteccia', 'perla'],
    translations: {
      it: {
        story: 'Sabbia trae ispirazione dalle dune dorate. Un colore delicato ma ricco di sfumature, estremamente versatile, perfetto per ambienti freschi e rilassanti.',
        whyChoose: [
          'Tonalità naturale e luminosa',
          'Perfetto con design mediterraneo',
          'Si abbina a ogni tipologia di arredamento'
        ]
      },
      en: {
        story: 'Sabbia draws inspiration from golden dunes. A delicate color but rich in nuances, extremely versatile, perfect for fresh and relaxing environments.',
        whyChoose: [
          'Natural and luminous tone',
          'Perfect with Mediterranean design',
          'Matches any type of furniture'
        ]
      },
      de: {
        story: 'Sabbia lässt sich von goldenen Dünen inspirieren. Eine zarte Farbe, aber reich an Nuancen, extrem vielseitig, perfekt für frische und entspannende Umgebungen.',
        whyChoose: [
          'Natürlicher und leuchtender Ton',
          'Perfekt mit mediterranem Design',
          'Passt zu jeder Art von Möbeln'
        ]
      },
      fr: {
        story: 'Sabbia s\'inspire des dunes dorées. Une couleur délicate mais riche en nuances, extrêmement polyvalente, parfaite pour des environnements frais et relaxants.',
        whyChoose: [
          'Tonalité naturelle et lumineuse',
          'Parfait avec le design méditerranéen',
          'S\'accorde avec tout type de mobilier'
        ]
      }
    }
  },
  {
    id: 'silven',
    name: 'Silven',
    slug: 'silven',
    image: '/src/assets/finish-silven.jpg',
    relatedColors: ['perla', 'cenere', 'velora', 'sabbia'],
    translations: {
      it: {
        story: 'Silven è il grigio elegante, con venature profonde e sofisticate. Ideale per progetti di interior design moderni, industriali e high-end.',
        whyChoose: [
          'Aspetto premium e professionale',
          'Ideale per hotel, spazi retail e case moderne',
          'Esalta metalli, vetro e arredi di design'
        ]
      },
      en: {
        story: 'Silven is the elegant gray, with deep and sophisticated grains. Ideal for modern, industrial and high-end interior design projects.',
        whyChoose: [
          'Premium and professional look',
          'Ideal for hotels, retail spaces and modern homes',
          'Enhances metals, glass and designer furniture'
        ]
      },
      de: {
        story: 'Silven ist das elegante Grau mit tiefen und raffinierten Maserungen. Ideal für moderne, industrielle und hochwertige Innenarchitekturprojekte.',
        whyChoose: [
          'Premium und professionelles Aussehen',
          'Ideal für Hotels, Einzelhandelsflächen und moderne Häuser',
          'Betont Metalle, Glas und Designermöbel'
        ]
      },
      fr: {
        story: 'Silven est le gris élégant, avec des veines profondes et sophistiquées. Idéal pour les projets de design intérieur modernes, industriels et haut de gamme.',
        whyChoose: [
          'Aspect premium et professionnel',
          'Idéal pour les hôtels, espaces retail et maisons modernes',
          'Met en valeur les métaux, le verre et le mobilier design'
        ]
      }
    }
  },
  {
    id: 'terram',
    name: 'Terram',
    slug: 'terram',
    image: '/src/assets/finish-terram.jpg',
    relatedColors: ['aurora', 'sabbia', 'corteccia', 'perla'],
    translations: {
      it: {
        story: 'Terram è ispirato alle essenze naturali più chiare. Tonalità equilibrata, morbida e vibrante che porta un senso di tranquillità e accoglienza in ogni stanza.',
        whyChoose: [
          'Perfetto per ambienti familiari',
          'Rende gli spazi caldi e luminosi',
          'Ideale con arredi beige, bianchi e legno chiaro'
        ]
      },
      en: {
        story: 'Terram is inspired by the lightest natural essences. A balanced, soft and vibrant tone that brings a sense of tranquility and welcome to every room.',
        whyChoose: [
          'Perfect for family environments',
          'Makes spaces warm and bright',
          'Ideal with beige, white furniture and light wood'
        ]
      },
      de: {
        story: 'Terram ist von den hellsten natürlichen Essenzen inspiriert. Ein ausgewogener, weicher und lebendiger Ton, der ein Gefühl von Ruhe und Willkommen in jeden Raum bringt.',
        whyChoose: [
          'Perfekt für familiäre Umgebungen',
          'Macht Räume warm und hell',
          'Ideal mit beigen, weißen Möbeln und hellem Holz'
        ]
      },
      fr: {
        story: 'Terram s\'inspire des essences naturelles les plus claires. Une tonalité équilibrée, douce et vibrante qui apporte un sentiment de tranquillité et d\'accueil dans chaque pièce.',
        whyChoose: [
          'Parfait pour les environnements familiaux',
          'Rend les espaces chaleureux et lumineux',
          'Idéal avec des meubles beiges, blancs et du bois clair'
        ]
      }
    }
  },
  {
    id: 'perla',
    name: 'Perla',
    slug: 'perla',
    image: '/src/assets/finish-perla.jpg',
    relatedColors: ['silven', 'velora', 'cenere', 'sabbia'],
    translations: {
      it: {
        story: 'Perla è un grigio raffinato, delicato e contemporaneo. Le sue venature sottili creano un movimento elegante e leggero.',
        whyChoose: [
          'Estetica moderna ma non fredda',
          'Perfetto per interni chiari e luminosi',
          'Ottimo per soggiorni, boutique e uffici moderni'
        ]
      },
      en: {
        story: 'Perla is a refined, delicate and contemporary gray. Its subtle grains create an elegant and light movement.',
        whyChoose: [
          'Modern but not cold aesthetic',
          'Perfect for bright and luminous interiors',
          'Great for living rooms, boutiques and modern offices'
        ]
      },
      de: {
        story: 'Perla ist ein raffiniertes, zartes und zeitgenössisches Grau. Seine subtilen Maserungen erzeugen eine elegante und leichte Bewegung.',
        whyChoose: [
          'Modern aber nicht kalte Ästhetik',
          'Perfekt für helle und leuchtende Interieurs',
          'Großartig für Wohnzimmer, Boutiquen und moderne Büros'
        ]
      },
      fr: {
        story: 'Perla est un gris raffiné, délicat et contemporain. Ses veines subtiles créent un mouvement élégant et léger.',
        whyChoose: [
          'Esthétique moderne mais pas froide',
          'Parfait pour les intérieurs clairs et lumineux',
          'Idéal pour les salons, boutiques et bureaux modernes'
        ]
      }
    }
  },
  {
    id: 'velora',
    name: 'Velora',
    slug: 'velora',
    image: '/src/assets/finish-velora.jpg',
    relatedColors: ['perla', 'cenere', 'silven', 'aurora'],
    translations: {
      it: {
        story: 'Velora è una tonalità chiara tendente al beige-grigio. Morbida, luminosa e molto elegante, dà agli ambienti un look internazionale e sofisticato.',
        whyChoose: [
          'Effetto luxury e contemporaneo',
          'Perfetto con arredi in pietra e vetro',
          'Ideale per appartamenti moderni'
        ]
      },
      en: {
        story: 'Velora is a light shade tending towards beige-gray. Soft, bright and very elegant, it gives spaces an international and sophisticated look.',
        whyChoose: [
          'Luxury and contemporary effect',
          'Perfect with stone and glass furniture',
          'Ideal for modern apartments'
        ]
      },
      de: {
        story: 'Velora ist ein heller Farbton, der zu Beige-Grau tendiert. Weich, hell und sehr elegant, verleiht es Räumen einen internationalen und raffinierten Look.',
        whyChoose: [
          'Luxuriöser und zeitgenössischer Effekt',
          'Perfekt mit Stein- und Glasmöbeln',
          'Ideal für moderne Apartments'
        ]
      },
      fr: {
        story: 'Velora est une teinte claire tendant vers le beige-gris. Douce, lumineuse et très élégante, elle donne aux espaces un look international et sophistiqué.',
        whyChoose: [
          'Effet luxe et contemporain',
          'Parfait avec des meubles en pierre et verre',
          'Idéal pour les appartements modernes'
        ]
      }
    }
  },
  {
    id: 'aurora',
    name: 'Aurora',
    slug: 'aurora',
    image: '/src/assets/finish-aurora.jpg',
    relatedColors: ['terram', 'sabbia', 'corteccia', 'velora'],
    translations: {
      it: {
        story: 'Aurora ricorda le essenze scandinave: un legno chiaro, naturale, fresco. Ideale per chi cerca luminosità e stile nordico.',
        whyChoose: [
          'Tonalità chiara e molto moderna',
          'Effetto naturale ma pulito',
          'Perfetto per case minimal, loft e uffici creativi'
        ]
      },
      en: {
        story: 'Aurora recalls Scandinavian essences: a light, natural, fresh wood. Ideal for those seeking brightness and Nordic style.',
        whyChoose: [
          'Light and very modern tone',
          'Natural but clean effect',
          'Perfect for minimal houses, lofts and creative offices'
        ]
      },
      de: {
        story: 'Aurora erinnert an skandinavische Essenzen: ein helles, natürliches, frisches Holz. Ideal für diejenigen, die Helligkeit und nordischen Stil suchen.',
        whyChoose: [
          'Heller und sehr moderner Ton',
          'Natürlicher aber sauberer Effekt',
          'Perfekt für minimalistische Häuser, Lofts und kreative Büros'
        ]
      },
      fr: {
        story: 'Aurora rappelle les essences scandinaves : un bois clair, naturel, frais. Idéal pour ceux qui recherchent la luminosité et le style nordique.',
        whyChoose: [
          'Tonalité claire et très moderne',
          'Effet naturel mais propre',
          'Parfait pour les maisons minimalistes, lofts et bureaux créatifs'
        ]
      }
    }
  }
];

export const getColorBySlug = (slug: string): ColorProduct | undefined => {
  return colorProducts.find(color => color.slug === slug);
};

export const getRelatedColors = (currentSlug: string, relatedSlugs: string[]): ColorProduct[] => {
  return relatedSlugs
    .map(slug => colorProducts.find(color => color.slug === slug))
    .filter((color): color is ColorProduct => color !== undefined);
};
