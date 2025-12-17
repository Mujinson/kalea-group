// Italian regions, provinces, and major cities data

export interface Province {
  code: string;
  name: string;
  cities: string[];
}

export interface Region {
  name: string;
  provinces: Province[];
}

export const ITALIAN_REGIONS: Region[] = [
  {
    name: 'Abruzzo',
    provinces: [
      { code: 'AQ', name: "L'Aquila", cities: ["L'Aquila", 'Avezzano', 'Sulmona', 'Celano'] },
      { code: 'CH', name: 'Chieti', cities: ['Chieti', 'Lanciano', 'Vasto', 'Ortona', 'Francavilla al Mare'] },
      { code: 'PE', name: 'Pescara', cities: ['Pescara', 'Montesilvano', 'Spoltore', 'Città Sant\'Angelo'] },
      { code: 'TE', name: 'Teramo', cities: ['Teramo', 'Giulianova', 'Roseto degli Abruzzi', 'Alba Adriatica'] },
    ]
  },
  {
    name: 'Basilicata',
    provinces: [
      { code: 'MT', name: 'Matera', cities: ['Matera', 'Policoro', 'Pisticci', 'Bernalda'] },
      { code: 'PZ', name: 'Potenza', cities: ['Potenza', 'Melfi', 'Lauria', 'Rionero in Vulture'] },
    ]
  },
  {
    name: 'Calabria',
    provinces: [
      { code: 'CZ', name: 'Catanzaro', cities: ['Catanzaro', 'Lamezia Terme', 'Soverato', 'Sellia Marina'] },
      { code: 'CS', name: 'Cosenza', cities: ['Cosenza', 'Rende', 'Corigliano-Rossano', 'Castrovillari', 'Paola'] },
      { code: 'KR', name: 'Crotone', cities: ['Crotone', 'Isola di Capo Rizzuto', 'Cirò Marina'] },
      { code: 'RC', name: 'Reggio Calabria', cities: ['Reggio Calabria', 'Gioia Tauro', 'Villa San Giovanni', 'Siderno'] },
      { code: 'VV', name: 'Vibo Valentia', cities: ['Vibo Valentia', 'Tropea', 'Serra San Bruno'] },
    ]
  },
  {
    name: 'Campania',
    provinces: [
      { code: 'AV', name: 'Avellino', cities: ['Avellino', 'Ariano Irpino', 'Atripalda', 'Montella'] },
      { code: 'BN', name: 'Benevento', cities: ['Benevento', 'Montesarchio', 'Sant\'Agata de\' Goti', 'Telese Terme'] },
      { code: 'CE', name: 'Caserta', cities: ['Caserta', 'Aversa', 'Mondragone', 'Maddaloni', 'Marcianise'] },
      { code: 'NA', name: 'Napoli', cities: ['Napoli', 'Giugliano in Campania', 'Torre del Greco', 'Pozzuoli', 'Casoria', 'Afragola', 'Portici', 'Ercolano', 'Marano di Napoli', 'Castellammare di Stabia'] },
      { code: 'SA', name: 'Salerno', cities: ['Salerno', 'Battipaglia', 'Cava de\' Tirreni', 'Nocera Inferiore', 'Eboli', 'Scafati', 'Pagani'] },
    ]
  },
  {
    name: 'Emilia-Romagna',
    provinces: [
      { code: 'BO', name: 'Bologna', cities: ['Bologna', 'Imola', 'Casalecchio di Reno', 'San Lazzaro di Savena', 'Castel Maggiore'] },
      { code: 'FC', name: 'Forlì-Cesena', cities: ['Forlì', 'Cesena', 'Cesenatico', 'Savignano sul Rubicone'] },
      { code: 'FE', name: 'Ferrara', cities: ['Ferrara', 'Cento', 'Comacchio', 'Argenta'] },
      { code: 'MO', name: 'Modena', cities: ['Modena', 'Carpi', 'Sassuolo', 'Formigine', 'Castelfranco Emilia', 'Vignola'] },
      { code: 'PC', name: 'Piacenza', cities: ['Piacenza', 'Fiorenzuola d\'Arda', 'Castel San Giovanni'] },
      { code: 'PR', name: 'Parma', cities: ['Parma', 'Fidenza', 'Salsomaggiore Terme', 'Collecchio'] },
      { code: 'RA', name: 'Ravenna', cities: ['Ravenna', 'Faenza', 'Lugo', 'Cervia', 'Bagnacavallo'] },
      { code: 'RE', name: 'Reggio Emilia', cities: ['Reggio Emilia', 'Scandiano', 'Correggio', 'Guastalla', 'Casalgrande'] },
      { code: 'RN', name: 'Rimini', cities: ['Rimini', 'Riccione', 'Santarcangelo di Romagna', 'Bellaria-Igea Marina', 'Cattolica'] },
    ]
  },
  {
    name: 'Friuli-Venezia Giulia',
    provinces: [
      { code: 'GO', name: 'Gorizia', cities: ['Gorizia', 'Monfalcone', 'Grado', 'Ronchi dei Legionari'] },
      { code: 'PN', name: 'Pordenone', cities: ['Pordenone', 'Sacile', 'Cordenons', 'Azzano Decimo'] },
      { code: 'TS', name: 'Trieste', cities: ['Trieste', 'Muggia', 'Duino-Aurisina'] },
      { code: 'UD', name: 'Udine', cities: ['Udine', 'Codroipo', 'Cervignano del Friuli', 'Tavagnacco', 'Latisana'] },
    ]
  },
  {
    name: 'Lazio',
    provinces: [
      { code: 'FR', name: 'Frosinone', cities: ['Frosinone', 'Cassino', 'Alatri', 'Sora', 'Ferentino', 'Anagni'] },
      { code: 'LT', name: 'Latina', cities: ['Latina', 'Aprilia', 'Terracina', 'Fondi', 'Formia', 'Cisterna di Latina', 'Gaeta'] },
      { code: 'RI', name: 'Rieti', cities: ['Rieti', 'Fara in Sabina', 'Cittaducale'] },
      { code: 'RM', name: 'Roma', cities: ['Roma', 'Guidonia Montecelio', 'Fiumicino', 'Tivoli', 'Pomezia', 'Ardea', 'Velletri', 'Civitavecchia', 'Anzio', 'Nettuno', 'Ladispoli', 'Marino', 'Ciampino', 'Albano Laziale', 'Monterotondo'] },
      { code: 'VT', name: 'Viterbo', cities: ['Viterbo', 'Civita Castellana', 'Tarquinia', 'Montalto di Castro'] },
    ]
  },
  {
    name: 'Liguria',
    provinces: [
      { code: 'GE', name: 'Genova', cities: ['Genova', 'Rapallo', 'Chiavari', 'Lavagna', 'Sestri Levante', 'Camogli'] },
      { code: 'IM', name: 'Imperia', cities: ['Imperia', 'Sanremo', 'Ventimiglia', 'Bordighera', 'Taggia'] },
      { code: 'SP', name: 'La Spezia', cities: ['La Spezia', 'Sarzana', 'Lerici', 'Santo Stefano di Magra'] },
      { code: 'SV', name: 'Savona', cities: ['Savona', 'Albenga', 'Varazze', 'Cairo Montenotte', 'Finale Ligure', 'Loano'] },
    ]
  },
  {
    name: 'Lombardia',
    provinces: [
      { code: 'BG', name: 'Bergamo', cities: ['Bergamo', 'Treviglio', 'Seriate', 'Dalmine', 'Romano di Lombardia', 'Caravaggio'] },
      { code: 'BS', name: 'Brescia', cities: ['Brescia', 'Desenzano del Garda', 'Montichiari', 'Lumezzane', 'Rovato', 'Palazzolo sull\'Oglio', 'Ghedi'] },
      { code: 'CO', name: 'Como', cities: ['Como', 'Cantù', 'Mariano Comense', 'Erba', 'Cernobbio'] },
      { code: 'CR', name: 'Cremona', cities: ['Cremona', 'Crema', 'Casalmaggiore', 'Soresina'] },
      { code: 'LC', name: 'Lecco', cities: ['Lecco', 'Merate', 'Calolziocorte', 'Mandello del Lario'] },
      { code: 'LO', name: 'Lodi', cities: ['Lodi', 'Codogno', 'Sant\'Angelo Lodigiano', 'Casalpusterlengo'] },
      { code: 'MB', name: 'Monza e Brianza', cities: ['Monza', 'Desio', 'Seregno', 'Lissone', 'Cesano Maderno', 'Brugherio', 'Limbiate', 'Giussano'] },
      { code: 'MI', name: 'Milano', cities: ['Milano', 'Sesto San Giovanni', 'Cinisello Balsamo', 'Legnano', 'Rho', 'Cologno Monzese', 'Paderno Dugnano', 'Pioltello', 'San Donato Milanese', 'Rozzano', 'Corsico', 'Segrate', 'San Giuliano Milanese', 'Cernusco sul Naviglio', 'Abbiategrasso'] },
      { code: 'MN', name: 'Mantova', cities: ['Mantova', 'Castiglione delle Stiviere', 'Suzzara', 'Viadana'] },
      { code: 'PV', name: 'Pavia', cities: ['Pavia', 'Vigevano', 'Voghera', 'Mortara', 'Stradella'] },
      { code: 'SO', name: 'Sondrio', cities: ['Sondrio', 'Morbegno', 'Tirano', 'Chiavenna'] },
      { code: 'VA', name: 'Varese', cities: ['Varese', 'Busto Arsizio', 'Gallarate', 'Saronno', 'Legnano', 'Tradate', 'Cassano Magnago'] },
    ]
  },
  {
    name: 'Marche',
    provinces: [
      { code: 'AN', name: 'Ancona', cities: ['Ancona', 'Senigallia', 'Jesi', 'Fabriano', 'Osimo', 'Falconara Marittima'] },
      { code: 'AP', name: 'Ascoli Piceno', cities: ['Ascoli Piceno', 'San Benedetto del Tronto', 'Grottammare'] },
      { code: 'FM', name: 'Fermo', cities: ['Fermo', 'Porto Sant\'Elpidio', 'Porto San Giorgio', 'Sant\'Elpidio a Mare'] },
      { code: 'MC', name: 'Macerata', cities: ['Macerata', 'Civitanova Marche', 'Tolentino', 'Recanati', 'Corridonia'] },
      { code: 'PU', name: 'Pesaro e Urbino', cities: ['Pesaro', 'Fano', 'Urbino', 'Fossombrone', 'Gabicce Mare'] },
    ]
  },
  {
    name: 'Molise',
    provinces: [
      { code: 'CB', name: 'Campobasso', cities: ['Campobasso', 'Termoli', 'Bojano', 'Larino'] },
      { code: 'IS', name: 'Isernia', cities: ['Isernia', 'Venafro', 'Agnone'] },
    ]
  },
  {
    name: 'Piemonte',
    provinces: [
      { code: 'AL', name: 'Alessandria', cities: ['Alessandria', 'Casale Monferrato', 'Novi Ligure', 'Tortona', 'Acqui Terme', 'Valenza'] },
      { code: 'AT', name: 'Asti', cities: ['Asti', 'Nizza Monferrato', 'Canelli'] },
      { code: 'BI', name: 'Biella', cities: ['Biella', 'Cossato', 'Vigliano Biellese'] },
      { code: 'CN', name: 'Cuneo', cities: ['Cuneo', 'Alba', 'Bra', 'Fossano', 'Mondovì', 'Savigliano', 'Saluzzo'] },
      { code: 'NO', name: 'Novara', cities: ['Novara', 'Borgomanero', 'Trecate', 'Arona', 'Galliate', 'Oleggio'] },
      { code: 'TO', name: 'Torino', cities: ['Torino', 'Moncalieri', 'Collegno', 'Rivoli', 'Nichelino', 'Settimo Torinese', 'Grugliasco', 'Chieri', 'Pinerolo', 'Venaria Reale', 'Chivasso', 'Carmagnola', 'Ivrea', 'Orbassano', 'San Mauro Torinese'] },
      { code: 'VB', name: 'Verbano-Cusio-Ossola', cities: ['Verbania', 'Domodossola', 'Omegna', 'Gravellona Toce'] },
      { code: 'VC', name: 'Vercelli', cities: ['Vercelli', 'Borgosesia', 'Santhià', 'Gattinara'] },
    ]
  },
  {
    name: 'Puglia',
    provinces: [
      { code: 'BA', name: 'Bari', cities: ['Bari', 'Altamura', 'Molfetta', 'Bitonto', 'Monopoli', 'Corato', 'Barletta', 'Triggiano', 'Mola di Bari', 'Ruvo di Puglia'] },
      { code: 'BT', name: 'Barletta-Andria-Trani', cities: ['Andria', 'Barletta', 'Trani', 'Bisceglie', 'Canosa di Puglia'] },
      { code: 'BR', name: 'Brindisi', cities: ['Brindisi', 'Fasano', 'Francavilla Fontana', 'Ostuni', 'Mesagne', 'San Vito dei Normanni'] },
      { code: 'FG', name: 'Foggia', cities: ['Foggia', 'Cerignola', 'Manfredonia', 'San Severo', 'Lucera', 'San Giovanni Rotondo'] },
      { code: 'LE', name: 'Lecce', cities: ['Lecce', 'Nardò', 'Galatina', 'Gallipoli', 'Copertino', 'Casarano', 'Tricase', 'Maglie'] },
      { code: 'TA', name: 'Taranto', cities: ['Taranto', 'Martina Franca', 'Massafra', 'Grottaglie', 'Manduria', 'Castellaneta', 'Ginosa'] },
    ]
  },
  {
    name: 'Sardegna',
    provinces: [
      { code: 'CA', name: 'Cagliari', cities: ['Cagliari', 'Quartu Sant\'Elena', 'Selargius', 'Assemini', 'Capoterra', 'Monserrato'] },
      { code: 'NU', name: 'Nuoro', cities: ['Nuoro', 'Siniscola', 'Macomer', 'Tortolì', 'Orosei'] },
      { code: 'OR', name: 'Oristano', cities: ['Oristano', 'Terralba', 'Cabras', 'Bosa'] },
      { code: 'SS', name: 'Sassari', cities: ['Sassari', 'Alghero', 'Olbia', 'Porto Torres', 'Tempio Pausania', 'Ozieri', 'Arzachena'] },
      { code: 'SU', name: 'Sud Sardegna', cities: ['Carbonia', 'Iglesias', 'Sant\'Antioco', 'Guspini', 'San Gavino Monreale'] },
    ]
  },
  {
    name: 'Sicilia',
    provinces: [
      { code: 'AG', name: 'Agrigento', cities: ['Agrigento', 'Sciacca', 'Canicattì', 'Licata', 'Favara', 'Porto Empedocle'] },
      { code: 'CL', name: 'Caltanissetta', cities: ['Caltanissetta', 'Gela', 'Niscemi', 'San Cataldo'] },
      { code: 'CT', name: 'Catania', cities: ['Catania', 'Acireale', 'Misterbianco', 'Paternò', 'Giarre', 'Caltagirone', 'Gravina di Catania', 'Mascalucia'] },
      { code: 'EN', name: 'Enna', cities: ['Enna', 'Piazza Armerina', 'Leonforte', 'Nicosia'] },
      { code: 'ME', name: 'Messina', cities: ['Messina', 'Milazzo', 'Barcellona Pozzo di Gotto', 'Patti', 'Taormina', 'Capo d\'Orlando'] },
      { code: 'PA', name: 'Palermo', cities: ['Palermo', 'Bagheria', 'Carini', 'Monreale', 'Partinico', 'Termini Imerese', 'Misilmeri', 'Villabate'] },
      { code: 'RG', name: 'Ragusa', cities: ['Ragusa', 'Vittoria', 'Modica', 'Comiso', 'Pozzallo', 'Scicli', 'Ispica'] },
      { code: 'SR', name: 'Siracusa', cities: ['Siracusa', 'Augusta', 'Avola', 'Noto', 'Lentini', 'Floridia', 'Rosolini'] },
      { code: 'TP', name: 'Trapani', cities: ['Trapani', 'Marsala', 'Mazara del Vallo', 'Alcamo', 'Castelvetrano', 'Erice'] },
    ]
  },
  {
    name: 'Toscana',
    provinces: [
      { code: 'AR', name: 'Arezzo', cities: ['Arezzo', 'Cortona', 'Sansepolcro', 'Montevarchi', 'San Giovanni Valdarno'] },
      { code: 'FI', name: 'Firenze', cities: ['Firenze', 'Empoli', 'Scandicci', 'Sesto Fiorentino', 'Campi Bisenzio', 'Pontassieve', 'Figline e Incisa Valdarno', 'Borgo San Lorenzo', 'Fucecchio'] },
      { code: 'GR', name: 'Grosseto', cities: ['Grosseto', 'Follonica', 'Orbetello', 'Monte Argentario', 'Castiglione della Pescaia'] },
      { code: 'LI', name: 'Livorno', cities: ['Livorno', 'Piombino', 'Rosignano Marittimo', 'Cecina', 'Collesalvetti', 'Portoferraio'] },
      { code: 'LU', name: 'Lucca', cities: ['Lucca', 'Viareggio', 'Capannori', 'Camaiore', 'Pietrasanta', 'Massarosa', 'Forte dei Marmi'] },
      { code: 'MS', name: 'Massa-Carrara', cities: ['Massa', 'Carrara', 'Pontremoli', 'Aulla'] },
      { code: 'PI', name: 'Pisa', cities: ['Pisa', 'San Giuliano Terme', 'Cascina', 'Pontedera', 'San Miniato', 'Ponsacco'] },
      { code: 'PO', name: 'Prato', cities: ['Prato', 'Montemurlo', 'Carmignano', 'Poggio a Caiano'] },
      { code: 'PT', name: 'Pistoia', cities: ['Pistoia', 'Montecatini-Terme', 'Pescia', 'Monsummano Terme', 'Quarrata', 'Agliana'] },
      { code: 'SI', name: 'Siena', cities: ['Siena', 'Poggibonsi', 'Colle di Val d\'Elsa', 'Montepulciano', 'San Gimignano', 'Chianciano Terme'] },
    ]
  },
  {
    name: 'Trentino-Alto Adige',
    provinces: [
      { code: 'BZ', name: 'Bolzano', cities: ['Bolzano', 'Merano', 'Bressanone', 'Laives', 'Brunico', 'Appiano sulla Strada del Vino'] },
      { code: 'TN', name: 'Trento', cities: ['Trento', 'Rovereto', 'Pergine Valsugana', 'Arco', 'Riva del Garda', 'Mori'] },
    ]
  },
  {
    name: 'Umbria',
    provinces: [
      { code: 'PG', name: 'Perugia', cities: ['Perugia', 'Foligno', 'Città di Castello', 'Spoleto', 'Gubbio', 'Assisi', 'Bastia Umbra', 'Corciano'] },
      { code: 'TR', name: 'Terni', cities: ['Terni', 'Orvieto', 'Narni', 'Amelia'] },
    ]
  },
  {
    name: "Valle d'Aosta",
    provinces: [
      { code: 'AO', name: 'Aosta', cities: ['Aosta', 'Saint-Vincent', 'Châtillon', 'Sarre', 'Courmayeur'] },
    ]
  },
  {
    name: 'Veneto',
    provinces: [
      { code: 'BL', name: 'Belluno', cities: ['Belluno', 'Feltre', 'Cortina d\'Ampezzo', 'Sedico'] },
      { code: 'PD', name: 'Padova', cities: ['Padova', 'Abano Terme', 'Albignasego', 'Selvazzano Dentro', 'Cittadella', 'Vigonza', 'Este', 'Monselice'] },
      { code: 'RO', name: 'Rovigo', cities: ['Rovigo', 'Adria', 'Badia Polesine', 'Lendinara'] },
      { code: 'TV', name: 'Treviso', cities: ['Treviso', 'Conegliano', 'Castelfranco Veneto', 'Montebelluna', 'Vittorio Veneto', 'Mogliano Veneto', 'Paese'] },
      { code: 'VE', name: 'Venezia', cities: ['Venezia', 'Chioggia', 'San Donà di Piave', 'Mira', 'Spinea', 'Mirano', 'Jesolo', 'Portogruaro'] },
      { code: 'VI', name: 'Vicenza', cities: ['Vicenza', 'Bassano del Grappa', 'Schio', 'Valdagno', 'Arzignano', 'Thiene', 'Montecchio Maggiore'] },
      { code: 'VR', name: 'Verona', cities: ['Verona', 'Legnago', 'San Giovanni Lupatoto', 'Villafranca di Verona', 'Bussolengo', 'San Bonifacio', 'Negrar'] },
    ]
  },
];

// Helper functions
export const getRegionNames = () => ITALIAN_REGIONS.map(r => r.name);

export const getProvincesForRegion = (regionName: string) => {
  const region = ITALIAN_REGIONS.find(r => r.name === regionName);
  return region?.provinces || [];
};

export const getCitiesForProvince = (regionName: string, provinceCode: string) => {
  const region = ITALIAN_REGIONS.find(r => r.name === regionName);
  const province = region?.provinces.find(p => p.code === provinceCode);
  return province?.cities || [];
};

export const findProvinceByCode = (code: string) => {
  for (const region of ITALIAN_REGIONS) {
    const province = region.provinces.find(p => p.code === code);
    if (province) return { region: region.name, province };
  }
  return null;
};
