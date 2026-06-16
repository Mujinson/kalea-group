import { useState, useMemo } from "react";

const COSTO_POSA_INTERNO = 9.00;
const COSTO_TAPPETINO_INTERNO = 1.50;
const MARKUP = 2.00;

const PREZZI_POSA: Record<string, number> = { semplice: 20, media: 27, complessa: 35 };
const PREZZO_TAPPETINO_CLIENTE = 3.00;
const KM_SOGLIA = 50;
const COSTO_KM = 2.00;
const SUPPL_TRASFERTA_POSA: Record<string, number> = { semplice: 3, media: 7, complessa: 10 };

const MARGINE_ALERT = 25;
const MARGINE_BLOCCO = 10;

const T: any = {
  IT: {
    titolo: "PREVENTIVO", validita: "Valido fino al", cliente: "Cliente",
    indirizzo: "Indirizzo", telefono: "Telefono", email: "Email",
    desc: "Descrizione", mq: "mq", prezzo_unit: "Prezzo unit.", totale: "Totale",
    fornitura: "Fornitura materiali", posa: "Posa in opera", tappetino: "Materassino/sottofondo",
    trasporto: "Trasporto materiali", trasferta: "Supplemento trasferta",
    subtotale: "Subtotale imponibile", iva: "IVA 22%", totale_doc: "TOTALE",
    pagamenti: "CONDIZIONI DI PAGAMENTO", acconto: "Acconto", meta_lavori: "A metà lavori", saldo: "Saldo finale",
    note_cliente: "Note", termini: "TERMINI E CONDIZIONI",
    termini_testo: `1. Il presente preventivo ha validità 30 giorni dalla data di emissione.\n2. I lavori avranno inizio previo versamento dell'acconto concordato.\n3. I materiali rimangono di proprietà di Kalēa fino al saldo completo.\n4. Eventuali lavori extra rispetto al preventivo saranno concordati preventivamente.\n5. Kalēa declina ogni responsabilità per danni preesistenti non segnalati prima dei lavori.\n6. Per qualsiasi controversia il foro competente è quello di Brescia.\n7. Il committente dichiara di aver preso visione e accettato le presenti condizioni.`,
    firma_cliente: "Firma Cliente", firma_kalēa: "Per Kalēa", data: "Data",
    luogo: "Luogo e data", accetta: "Il/La sottoscritto/a dichiara di accettare il presente preventivo",
  },
  EN: {
    titolo: "QUOTATION", validita: "Valid until", cliente: "Client",
    indirizzo: "Address", telefono: "Phone", email: "Email",
    desc: "Description", mq: "sqm", prezzo_unit: "Unit price", totale: "Total",
    fornitura: "Materials supply", posa: "Installation", tappetino: "Underlay/membrane",
    trasporto: "Materials transport", trasferta: "Travel supplement",
    subtotale: "Subtotal", iva: "VAT 22%", totale_doc: "TOTAL",
    pagamenti: "PAYMENT TERMS", acconto: "Deposit", meta_lavori: "Mid-works", saldo: "Final balance",
    note_cliente: "Notes", termini: "TERMS & CONDITIONS",
    termini_testo: `1. This quotation is valid for 30 days from the date of issue.\n2. Works will commence upon receipt of the agreed deposit.\n3. Materials remain property of Kalēa until full payment.\n4. Any additional works will be agreed in advance.\n5. Kalēa accepts no responsibility for pre-existing damages not reported before works begin.\n6. Jurisdiction: Brescia, Italy.\n7. The client declares to have read and accepted these terms.`,
    firma_cliente: "Client Signature", firma_kalēa: "For Kalēa", data: "Date",
    luogo: "Place and date", accetta: "The undersigned declares acceptance of this quotation",
  },
  DE: {
    titolo: "KOSTENVORANSCHLAG", validita: "Gültig bis", cliente: "Kunde",
    indirizzo: "Adresse", telefono: "Telefon", email: "E-Mail",
    desc: "Beschreibung", mq: "m²", prezzo_unit: "Einzelpreis", totale: "Gesamt",
    fornitura: "Materiallieferung", posa: "Verlegung", tappetino: "Unterlagsmatte",
    trasporto: "Materialtransport", trasferta: "Reisezuschlag",
    subtotale: "Zwischensumme", iva: "MwSt. 22%", totale_doc: "GESAMT",
    pagamenti: "ZAHLUNGSBEDINGUNGEN", acconto: "Anzahlung", meta_lavori: "Zwischenzahlung", saldo: "Restzahlung",
    note_cliente: "Anmerkungen", termini: "AGB",
    termini_testo: `1. Dieser Kostenvoranschlag gilt 30 Tage ab Ausstellungsdatum.\n2. Die Arbeiten beginnen nach Eingang der vereinbarten Anzahlung.\n3. Materialien bleiben Eigentum von Kalēa bis zur vollständigen Bezahlung.\n4. Zusätzliche Arbeiten werden vorher vereinbart.\n5. Kalēa übernimmt keine Haftung für vorhandene Schäden.\n6. Gerichtsstand: Brescia, Italien.\n7. Der Auftraggeber erklärt, die vorliegenden Bedingungen gelesen und akzeptiert zu haben.`,
    firma_cliente: "Unterschrift Kunde", firma_kalēa: "Für Kalēa", data: "Datum",
    luogo: "Ort und Datum", accetta: "Der/Die Unterzeichnete erklärt die Annahme dieses Angebots",
  },
  FR: {
    titolo: "DEVIS", validita: "Valable jusqu'au", cliente: "Client",
    indirizzo: "Adresse", telefono: "Téléphone", email: "E-mail",
    desc: "Description", mq: "m²", prezzo_unit: "Prix unit.", totale: "Total",
    fornitura: "Fourniture matériaux", posa: "Pose", tappetino: "Sous-couche",
    trasporto: "Transport matériaux", trasferta: "Supplément déplacement",
    subtotale: "Sous-total HT", iva: "TVA 22%", totale_doc: "TOTAL",
    pagamenti: "CONDITIONS DE PAIEMENT", acconto: "Acompte", meta_lavori: "En cours de travaux", saldo: "Solde final",
    note_cliente: "Remarques", termini: "CONDITIONS GÉNÉRALES",
    termini_testo: `1. Ce devis est valable 30 jours à compter de sa date d'émission.\n2. Les travaux débuteront après réception de l'acompte convenu.\n3. Les matériaux restent propriété de Kalēa jusqu'au paiement complet.\n4. Tout travail supplémentaire sera convenu à l'avance.\n5. Kalēa décline toute responsabilité pour les dommages préexistants.\n6. Tribunal compétent : Brescia, Italie.\n7. Le client déclare avoir pris connaissance et accepté ces conditions.`,
    firma_cliente: "Signature Client", firma_kalēa: "Pour Kalēa", data: "Date",
    luogo: "Lieu et date", accetta: "Le/La soussigné(e) déclare accepter le présent devis",
  },
  RO: {
    titolo: "OFERTĂ DE PREȚ", validita: "Valabilă până la", cliente: "Client",
    indirizzo: "Adresă", telefono: "Telefon", email: "Email",
    desc: "Descriere", mq: "mp", prezzo_unit: "Preț unitar", totale: "Total",
    fornitura: "Furnizare materiale", posa: "Montaj", tappetino: "Strat suport",
    trasporto: "Transport materiale", trasferta: "Supliment deplasare",
    subtotale: "Subtotal", iva: "TVA 22%", totale_doc: "TOTAL",
    pagamenti: "CONDIȚII DE PLATĂ", acconto: "Avans", meta_lavori: "La jumătatea lucrărilor", saldo: "Sold final",
    note_cliente: "Observații", termini: "TERMENI ȘI CONDIȚII",
    termini_testo: `1. Această ofertă este valabilă 30 de zile de la data emiterii.\n2. Lucrările vor începe după primirea avansului convenit.\n3. Materialele rămân proprietatea Kalēa până la plata integrală.\n4. Orice lucrări suplimentare vor fi convenite în prealabil.\n5. Kalēa nu este responsabilă pentru daune preexistente.\n6. Instanța competentă: Brescia, Italia.\n7. Clientul declară că a citit și acceptat aceste condiții.`,
    firma_cliente: "Semnătura Client", firma_kalēa: "Pentru Kalēa", data: "Data",
    luogo: "Loc și dată", accetta: "Subsemnatul/a declară că acceptă prezenta ofertă",
  },
};

const PRODOTTI: any[] = [
  { id:"fl-40",       nome:"Flow 40",                         fornitore:"Flow",          categoria:"SPC a secco",    dims:"1524×228×4+1mm",    listino:43.80,  coeff:0.45, tappetino:"mai" },
  { id:"fl-55w",      nome:"Flow 55 Wood",                    fornitore:"Flow",          categoria:"SPC a secco",    dims:"1524×228×4,5+1mm",  listino:49.00,  coeff:0.45, tappetino:"mai" },
  { id:"fl-55c",      nome:"Flow 55 Cement",                  fornitore:"Flow",          categoria:"SPC a secco",    dims:"920×460×5,5+1mm",   listino:52.70,  coeff:0.45, tappetino:"mai" },
  { id:"fl-xl",       nome:"Flow XL",                         fornitore:"Flow",          categoria:"SPC a secco",    dims:"1800×228×5+1mm",    listino:53.00,  coeff:0.45, tappetino:"mai" },
  { id:"fl-spina",    nome:"Flow Spina Ande",                 fornitore:"Flow",          categoria:"SPC a secco",    dims:"640×128×4,5+1mm",   listino:51.20,  coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlw",     nome:"Flow+ XL Wood",                   fornitore:"Flow",          categoria:"SPC a secco",    dims:"1800×228,6×5,5+1mm",listino:54.10,  coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlt",     nome:"Flow+ XL Tile",                   fornitore:"Flow",          categoria:"SPC a secco",    dims:"1200×600×5,5+1mm",  listino:55.30,  coeff:0.45, tappetino:"mai" },
  { id:"fl-pspita",   nome:"Flow+ Spina Italiana",            fornitore:"Flow",          categoria:"SPC a secco",    dims:"640×128×5,5+1mm",   listino:54.40,  coeff:0.45, tappetino:"mai" },
  { id:"fl-pspfr",    nome:"Flow+ Spina Francese",            fornitore:"Flow",          categoria:"SPC a secco",    dims:"625×127×5,5+1mm",   listino:61.80,  coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdw",    nome:"Flow 55 GD Wood",                 fornitore:"Flow",          categoria:"Vinilico colla", dims:"1500×230×2,5mm",    listino:32.10,  coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdc",    nome:"Flow 55 GD Cement",               fornitore:"Flow",          categoria:"Vinilico colla", dims:"914,4×457,2×2,5mm", listino:31.40,  coeff:0.45, tappetino:"mai" },
  { id:"kp-pv120x280",nome:"Kronos Pierre Vive 120×280",      fornitore:"Kronos",        categoria:"Gres Fine",      dims:"120×280 rett.",      listino:132,    coeff:0.36, tappetino:"mai" },
  { id:"kp-pv120x120",nome:"Kronos Pierre Vive 120×120",      fornitore:"Kronos",        categoria:"Gres Fine",      dims:"120×120 rett.",      listino:95,     coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120", nome:"Kronos Pierre Vive 60×120",       fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:87,     coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120g",nome:"Kronos Pierre Vive Grip 60×120",  fornitore:"Kronos",        categoria:"Gres Fine Grip", dims:"60×120 rett.",       listino:90,     coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x60",  nome:"Kronos Pierre Vive 60×60",        fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×60 rett.",        listino:70,     coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x280",nome:"Kronos Materia 120×280",          fornitore:"Kronos",        categoria:"Gres Fine",      dims:"120×280 rett.",      listino:132,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x120",nome:"Kronos Materia 120×120",          fornitore:"Kronos",        categoria:"Gres Fine",      dims:"120×120 rett.",      listino:105,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ma60x120", nome:"Kronos Materia 60×120",           fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:105,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ps60x120", nome:"Kronos Piasentina Stone 60×120",  fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:87,     coeff:0.36, tappetino:"mai" },
  { id:"kp-na60x120", nome:"Kronos Nativa Vena 60×120",       fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:95,     coeff:0.36, tappetino:"mai" },
  { id:"kp-me120x280",nome:"Kronos Metallique 120×280",       fornitore:"Kronos",        categoria:"Gres Fine",      dims:"120×280 rett.",      listino:132,    coeff:0.36, tappetino:"mai" },
  { id:"kp-me60x120", nome:"Kronos Metallique 60×120",        fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:87,     coeff:0.36, tappetino:"mai" },
  { id:"kp-lr150",    nome:"Kronos Le Reverse Chevron",       fornitore:"Kronos",        categoria:"Decorato",       dims:"varie",              listino:150,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ws240",    nome:"Kronos Wood Side Mosaico",        fornitore:"Kronos",        categoria:"Effetto Legno",  dims:"29×120",             listino:240,    coeff:0.36, tappetino:"mai" },
  { id:"kp-out95",    nome:"Kronos Outdoor SKE 2.0 60×120",   fornitore:"Kronos",        categoria:"Outdoor 20mm",   dims:"60×120×2cm",         listino:95,     coeff:0.36, tappetino:"mai" },
  { id:"kp-rk102",    nome:"Kronos Rocks 60×120",             fornitore:"Kronos",        categoria:"Gres Fine",      dims:"60×120 rett.",       listino:102,    coeff:0.36, tappetino:"mai" },
  { id:"ex-skudo",    nome:"Externo SKUDO",                   fornitore:"Externo",       categoria:"WPC Outdoor",    dims:"2000×138×23mm",      listino:94.40,  coeff:0.45, tappetino:"mai" },
  { id:"ex-trad",     nome:"Externo TRADITIONAL",             fornitore:"Externo",       categoria:"WPC Outdoor",    dims:"2000×140×25mm",      listino:79.70,  coeff:0.45, tappetino:"mai" },
  { id:"ba-ocean8v4", nome:"BerryAlloc Ocean 8 V4",           fornitore:"BerryAlloc",    categoria:"Laminato DPL",   dims:"1288×190×8mm",       listino:34.20,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean12v4",nome:"BerryAlloc Ocean 12 V4",          fornitore:"BerryAlloc",    categoria:"Laminato DPL",   dims:"1288×190×12mm",      listino:60.80,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean8xl", nome:"BerryAlloc Ocean 8 XL",           fornitore:"BerryAlloc",    categoria:"Laminato DPL",   dims:"2038×241×8mm",       listino:39.90,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-chateau",  nome:"BerryAlloc Chateau+",             fornitore:"BerryAlloc",    categoria:"Laminato DPL",   dims:"504×84×8mm spina",   listino:57.90,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-cadenza",  nome:"BerryAlloc Cadenza",              fornitore:"BerryAlloc",    categoria:"Laminato DPL",   dims:"1383×214×8mm",       listino:30.70,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-origcomp", nome:"BerryAlloc Original Comfort HPF", fornitore:"BerryAlloc",    categoria:"Laminato HPF",   dims:"1207×198×9+2mm",     listino:69.90,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-grandav",  nome:"BerryAlloc Grand Avenue Comfort", fornitore:"BerryAlloc",    categoria:"Laminato HPF",   dims:"2410×241×10,3+2mm",  listino:73.70,  coeff:0.45, tappetino:"sempre" },
  { id:"ba-parqxl",   nome:"BerryAlloc Parqwood XL",          fornitore:"BerryAlloc",    categoria:"Parquet Legno",  dims:"1190×185×10mm",      listino:75.10,  coeff:0.45, tappetino:"opzionale" },
  { id:"ba-parqherr", nome:"BerryAlloc Parqwood Herringbone", fornitore:"BerryAlloc",    categoria:"Parquet Legno",  dims:"504×84×9,5mm",       listino:111.80, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-zenn55p",  nome:"BerryAlloc Zenn RigidClick 55",   fornitore:"BerryAlloc",    categoria:"Vinilico SPC",   dims:"1219×178×5+1mm",     listino:57.90,  coeff:0.45, tappetino:"mai" },
  { id:"ba-zenn30p",  nome:"BerryAlloc Zenn RigidClick 30",   fornitore:"BerryAlloc",    categoria:"Vinilico SPC",   dims:"1219×178×4+1mm",     listino:43.80,  coeff:0.45, tappetino:"mai" },
  { id:"ba-spirit55", nome:"BerryAlloc Spirit Soul 55",       fornitore:"BerryAlloc",    categoria:"Vinilico SPC",   dims:"1524×228×5+1mm",     listino:61.70,  coeff:0.45, tappetino:"mai" },
  { id:"ba-zenngd55", nome:"BerryAlloc Zenn GD 55",           fornitore:"BerryAlloc",    categoria:"Vinilico colla", dims:"1219×178×2,5mm",     listino:37.80,  coeff:0.45, tappetino:"mai" },
  { id:"pq-drnat",    nome:"Parquet Dream Rovere Naturale",          fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:152.20, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drnatlev", nome:"Parquet Dream Rovere Naturale Levigato", fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:102.70, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drcrema",  nome:"Parquet Dream Rovere Crema",             fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:175.00, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drbianco", nome:"Parquet Dream Rovere Bianco",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:176.80, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-dralpaca", nome:"Parquet Dream Rovere Alpaca",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:182.40, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drolio",   nome:"Parquet Dream Rovere Naturale Oliato",   fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm", listino:157.40, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-nocenat",  nome:"Parquet Dream Noce Naturale",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1000/2200 14mm", listino:218.30, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-nocecamm", nome:"Parquet Dream Noce Cammello",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1000/2200 14mm", listino:250.60, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-olmonat",  nome:"Parquet Dream Olmo Naturale",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"140/200×1000/2200",  listino:229.70, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-castnat",  nome:"Parquet Dream Castagno Naturale",        fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"140/200×1000/2200",  listino:225.90, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-slim120",  nome:"Parquet Slim 120 Rovere Naturale",       fornitore:"Parquet Woodco",categoria:"Parquet Slim",   dims:"120×800/1200 10mm",  listino:114.80, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-slim180",  nome:"Parquet Slim 180 Rovere Naturale",       fornitore:"Parquet Woodco",categoria:"Parquet Slim",   dims:"180×1200/2200 10mm", listino:144.70, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-senselana",nome:"Parquet Sense Rovere Lana",              fornitore:"Parquet Woodco",categoria:"Parquet Sense",  dims:"150×1900mm",         listino:73.80,  coeff:0.45, tappetino:"mai" },
  { id:"pq-grdlimo",  nome:"Parquet Ground Rovere Limo",             fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"180×1800/1900",      listino:93.60,  coeff:0.45, tappetino:"opzionale" },
  { id:"pq-grdlaguna",nome:"Parquet Ground Rovere Laguna",           fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"180×1800/1900",      listino:116.80, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-hernat",   nome:"Parquet Her Rovere Naturale",            fornitore:"Parquet Woodco",categoria:"Parquet Spina",  dims:"90×600 spina ital.", listino:86.10,  coeff:0.45, tappetino:"mai" },
  { id:"pq-starnat",  nome:"Parquet Star Rovere Naturale",           fornitore:"Parquet Woodco",categoria:"Parquet Spina",  dims:"90×510 spina 45°",   listino:98.80,  coeff:0.45, tappetino:"mai" },
  { id:"sg-s45nat",   nome:"Signature Spina 45 Rovere Naturale",     fornitore:"Signature",     categoria:"Parquet Premium",dims:"180×620mm",          listino:223.00, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45crema", nome:"Signature Spina 45 Rovere Crema",        fornitore:"Signature",     categoria:"Parquet Premium",dims:"180×620mm",          listino:242.30, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45bianco",nome:"Signature Spina 45 Rovere Bianco",       fornitore:"Signature",     categoria:"Parquet Premium",dims:"180×620mm",          listino:244.20, coeff:0.45, tappetino:"mai" },
  { id:"sg-escnat",   nome:"Signature Esagono Rovere Naturale",      fornitore:"Signature",     categoria:"Parquet Premium",dims:"200×231mm",          listino:281.10, coeff:0.45, tappetino:"mai" },
  { id:"sg-q1nat",    nome:"Signature Q1 Rovere Naturale",           fornitore:"Signature",     categoria:"Parquet Premium",dims:"600×600mm",          listino:316.40, coeff:0.45, tappetino:"mai" },
  { id:"sg-nocequadr",nome:"Signature Quadrotta Noce Naturale",      fornitore:"Signature",     categoria:"Parquet Premium",dims:"600×600mm",          listino:355.20, coeff:0.45, tappetino:"mai" },
  { id:"sg-arrnat",   nome:"Signature Arrow Rovere Naturale",        fornitore:"Signature",     categoria:"Parquet Premium",dims:"45×450mm",           listino:153.20, coeff:0.45, tappetino:"mai" },
  { id:"sg-recupero", nome:"Signature Rovere di Recupero",           fornitore:"Signature",     categoria:"Parquet Premium",dims:"120/240×800/2500",   listino:315.80, coeff:0.45, tappetino:"mai" },
  { id:"sg-noces45",  nome:"Signature Spina 45 Noce Naturale",       fornitore:"Signature",     categoria:"Parquet Premium",dims:"180×620mm",          listino:305.70, coeff:0.45, tappetino:"mai" },
];

const FORNITORI_LIST = ["Tutti","Flow","Kronos","Externo","BerryAlloc","Parquet Woodco","Signature"];
const FORN_STYLE: Record<string, { bg: string; c: string }> = {
  "Flow":{bg:"#E6F1FB",c:"#0C447C"},"Kronos":{bg:"#FCE4EC",c:"#880E4F"},
  "Externo":{bg:"#E1F5EE",c:"#085041"},"BerryAlloc":{bg:"#FAEEDA",c:"#633806"},
  "Parquet Woodco":{bg:"#FFF3E0",c:"#7B3A10"},"Signature":{bg:"#EEEDFE",c:"#3C3489"},
};

const euro = (n: number) => "€ " + (Math.round(n*100)/100).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct  = (n: number) => n.toFixed(1)+"%";
const today = () => new Date().toLocaleDateString("it-IT");
const addDays = (_d: string, n: number) => { const x=new Date(); x.setDate(x.getDate()+n); return x.toLocaleDateString("it-IT"); };
const nextNum = () => { const n=(parseInt(localStorage.getItem("kal_prev_num")||"0")+1); localStorage.setItem("kal_prev_num",String(n)); return "KAL-"+new Date().getFullYear()+"-"+String(n).padStart(3,"0"); };

function Slider({label,min,max,value,step,onChange,format}: any){
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,color:"#6B6860"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:500}}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:"#1A1A2E",cursor:"pointer"}}/>
    </div>
  );
}

function Btn({active,onClick,children,color}: any){
  return(
    <button onClick={onClick} style={{
      padding:"5px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:500,
      background:active?(color||"#1A1A2E"):"transparent",
      color:active?"#fff":(color||"#6B6860"),
      borderColor:active?(color||"#1A1A2E"):"#E0DDD8",
    }}>{children}</button>
  );
}

export default function SistemaPreventivi() {
  const [step, setStep] = useState(1);

  const [search,      setSearch]      = useState("");
  const [fornFilt,    setFornFilt]    = useState("Tutti");
  const [prodotto,    setProdotto]    = useState<any>(null);
  const [complessita, setComplessita] = useState("media");
  const [mqPrev,      setMqPrev]      = useState(50);
  const [sfrido,      setSfrido]      = useState(10);
  const [incPosa,     setIncPosa]     = useState(true);
  const [incTapp,     setIncTapp]     = useState(true);
  const [kmDist,      setKmDist]      = useState(0);
  const [incTrasporto,setIncTrasporto]= useState(false);
  const [sconto,      setSconto]      = useState(0);
  const [showAll,     setShowAll]     = useState(false);

  const [righeMat, setRigheMat] = useState<any[]>([]);

  const [lingua,    setLingua]    = useState("IT");
  const [numPrev,   setNumPrev]   = useState("");
  const [dataPrev,  setDataPrev]  = useState(today());
  const [cliente,   setCliente]   = useState<any>({nome:"",indirizzo:"",telefono:"",email:"",citta:""});
  const [cantiere,  setCantiere]  = useState("");
  const [noteCliente,setNoteCliente]=useState("");
  const [noteInterne,setNoteInterne]=useState("");
  const [logoUrl,   setLogoUrl]   = useState("");
  const [stato,     setStato]     = useState("bozza");

  const [pagamenti, setPagamenti] = useState<any[]>([
    {label:"Acconto",pct:30,data:"",note:""},
    {label:"A metà lavori",pct:40,data:"",note:""},
    {label:"Saldo finale",pct:30,data:"",note:""},
  ]);

  const t = T[lingua];

  const filtered = useMemo(()=>PRODOTTI.filter(p=>{
    const fs=fornFilt==="Tutti"||p.fornitore===fornFilt;
    const ss=!search||p.nome.toLowerCase().includes(search.toLowerCase())||p.fornitore.toLowerCase().includes(search.toLowerCase())||p.categoria.toLowerCase().includes(search.toLowerCase())||p.dims.toLowerCase().includes(search.toLowerCase());
    return fs&&ss;
  }),[search,fornFilt]);

  const calc = useMemo(()=>{
    if(!prodotto) return null;
    const costoMatMq   = prodotto.listino * prodotto.coeff;
    const prezzoMatMq  = costoMatMq * MARKUP;
    const mqOrd        = mqPrev*(1+sfrido/100);
    const costoMatTot  = mqOrd*costoMatMq;
    const prezzoMatTot = mqOrd*prezzoMatMq;

    const prezzoPosaMq = PREZZI_POSA[complessita];
    const costoPosaTot  = incPosa ? mqPrev*COSTO_POSA_INTERNO : 0;
    const prezzoPosaTot = incPosa ? mqPrev*prezzoPosaMq : 0;

    const tappNeeded   = incTapp && prodotto.tappetino !== "mai";
    const costoTappTot  = tappNeeded ? mqPrev*COSTO_TAPPETINO_INTERNO : 0;
    const prezzoTappTot = tappNeeded ? mqPrev*PREZZO_TAPPETINO_CLIENTE : 0;

    const kmExtra  = Math.max(0, kmDist-KM_SOGLIA);
    const costoTrasporto  = incTrasporto && kmExtra>0 ? kmExtra*COSTO_KM : 0;
    const prezzoTrasporto = incTrasporto && kmExtra>0 ? kmExtra*COSTO_KM*MARKUP : 0;

    const trasfertaAttiva = kmDist > KM_SOGLIA && incPosa;
    const supplTrasfertaMq = trasfertaAttiva ? SUPPL_TRASFERTA_POSA[complessita] : 0;
    const costoTrasfertaTot  = trasfertaAttiva ? mqPrev*supplTrasfertaMq*0.5 : 0;
    const prezzoTrasfertaTot = trasfertaAttiva ? mqPrev*supplTrasfertaMq : 0;

    const costoExtraTot  = righeMat.reduce((s,r)=>s+(r.costoUn||0)*(r.qta||0),0);
    const prezzoExtraTot = righeMat.reduce((s,r)=>s+(r.prezzoUn||0)*(r.qta||0),0);

    const costoTotale    = costoMatTot+costoPosaTot+costoTappTot+costoTrasporto+costoTrasfertaTot+costoExtraTot;
    const prezzoLordoTot = prezzoMatTot+prezzoPosaTot+prezzoTappTot+prezzoTrasporto+prezzoTrasfertaTot+prezzoExtraTot;
    const scontoAmt      = prezzoLordoTot*(sconto/100);
    const prezzoNetto    = prezzoLordoTot-scontoAmt;
    const iva            = prezzoNetto*0.22;
    const totaleIva      = prezzoNetto+iva;

    const margineE   = prezzoNetto-costoTotale;
    const marginePct = prezzoNetto>0 ? (margineE/prezzoNetto)*100 : 0;
    const prezzoMqTot= mqPrev>0 ? prezzoNetto/mqPrev : 0;
    const scontoMax  = prezzoLordoTot>0 ? ((prezzoLordoTot-costoTotale)/prezzoLordoTot)*100 : 0;

    return {
      costoMatMq, prezzoMatMq, mqOrd,
      costoMatTot, prezzoMatTot,
      costoPosaTot, prezzoPosaTot,
      costoTappTot, prezzoTappTot, tappNeeded,
      costoTrasporto, prezzoTrasporto, kmExtra,
      trasfertaAttiva, costoTrasfertaTot, prezzoTrasfertaTot,
      costoExtraTot, prezzoExtraTot,
      costoTotale, prezzoLordoTot, scontoAmt, prezzoNetto,
      iva, totaleIva,
      margineE, marginePct, prezzoMqTot, scontoMax,
    };
  },[prodotto,complessita,mqPrev,sfrido,incPosa,incTapp,kmDist,incTrasporto,sconto,righeMat]);

  const addRiga = () => setRigheMat(r=>[...r,{id:Date.now(),desc:"",qta:1,unita:"mq",costoUn:0,prezzoUn:0}]);
  const updRiga = (id:number,k:string,v:any) => setRigheMat(r=>r.map(x=>x.id===id?{...x,[k]:v}:x));
  const delRiga = (id:number) => setRigheMat(r=>r.filter(x=>x.id!==id));

  const handleLogo = (e: any) => {
    const f=e.target.files[0];
    if(f){const r=new FileReader();r.onload=ev=>setLogoUrl(String(ev.target?.result||""));r.readAsDataURL(f);}
  };

  const generaPDF = () => {
    if(calc && calc.marginePct < MARGINE_BLOCCO){
      alert(`⛔ BLOCCO: Margine ${pct(calc.marginePct)} sotto il ${MARGINE_BLOCCO}%. Non puoi generare il PDF. Rivedi il preventivo.`);
      return;
    }
    window.print();
  };

  const statoColor: any = {bozza:"#9A9890",inviato:"#0C447C",accettato:"#27500A",rifiutato:"#A32D2D"};
  const statoLabel: any = {bozza:"Bozza",inviato:"Inviato",accettato:"Accettato",rifiutato:"Rifiutato"};

  const card: any = {background:"#fff",border:"1px solid #E0DDD8",borderRadius:12,padding:"18px 22px",marginBottom:16};
  const sectionTitle: any = {fontSize:11,fontWeight:500,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14,paddingBottom:8,borderBottom:"1px solid #E0DDD8"};

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",color:"#1A1A1A",maxWidth:1300,margin:"0 auto",padding:"8px 4px"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:400,color:"#1A1A2E",marginBottom:4}}>Sistema Preventivi Kalēa</h1>
          <p style={{fontSize:13,color:"#9A9890"}}>Il tuo porto sicuro — calcola, verifica, genera, traccia</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {["bozza","inviato","accettato","rifiutato"].map(s=>(
            <Btn key={s} active={stato===s} onClick={()=>setStato(s)} color={statoColor[s]}>
              {statoLabel[s]}
            </Btn>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:2,marginBottom:20,background:"#F0EDE8",borderRadius:10,padding:4,width:"fit-content"}}>
        {[["1","Calcolo & Verifica"],["2","Intestazione & Note"],["3","Anteprima & PDF"]].map(([n,l])=>(
          <button key={n} onClick={()=>setStep(Number(n))}
            style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:step===Number(n)?500:400,
              background:step===Number(n)?"#fff":"transparent",
              color:step===Number(n)?"#1A1A2E":"#9A9890",
              boxShadow:step===Number(n)?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
            {n}. {l}
          </button>
        ))}
      </div>

      {step===1 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          <div style={card}>
            <div style={sectionTitle}>Scegli il prodotto — {PRODOTTI.length} articoli</div>

            <div style={{position:"relative",marginBottom:10}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#9A9890"}}>🔍</span>
              <input value={search} onChange={e=>{setSearch(e.target.value);setShowAll(false);}}
                placeholder="Cerca nome, fornitore, categoria, formato..."
                style={{width:"100%",padding:"9px 12px 9px 36px",borderRadius:9,border:"1px solid #E0DDD8",fontSize:13,outline:"none",background:"#F7F6F3",boxSizing:"border-box"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9A9890",fontSize:16}}>×</button>}
            </div>

            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {FORNITORI_LIST.map(f=>{
                const fc=FORN_STYLE[f]||{bg:"",c:""};
                return <button key={f} onClick={()=>{setFornFilt(f);setShowAll(false);}}
                  style={{padding:"3px 11px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:500,
                    background:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.bg):"transparent",
                    color:fornFilt===f?(f==="Tutti"?"#fff":fc.c):"#9A9890",
                    borderColor:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.c):"#E0DDD8"}}>{f}</button>;
              })}
            </div>

            <div style={{maxHeight:420,overflowY:"auto",borderRadius:8,border:"1px solid #E0DDD8"}}>
              {(showAll?filtered:filtered.slice(0,25)).map(p=>{
                const costoMq=p.listino*p.coeff;
                const prezzoMq=costoMq*MARKUP;
                const isSel=prodotto?.id===p.id;
                const fc=FORN_STYLE[p.fornitore]||{bg:"#F0EDE8",c:"#5F5E5A"};
                return(
                  <div key={p.id} onClick={()=>setProdotto(p)}
                    style={{padding:"9px 12px",borderBottom:"0.5px solid #E0DDD8",cursor:"pointer",
                      background:isSel?"#E6F1FB":"transparent",
                      borderLeft:isSel?"3px solid #1A1A2E":"3px solid transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:500,fontSize:13}}>{p.nome}</span>
                      <span style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>{euro(prezzoMq)}<span style={{fontSize:10,color:"#9A9890"}}>/mq</span></span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:"#9A9890"}}>
                      <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontWeight:500,background:fc.bg,color:fc.c,fontSize:10}}>{p.fornitore}</span>
                      <span>{p.categoria}</span><span>· {p.dims}</span>
                      <span style={{marginLeft:"auto",color:"#6B6860"}}>costo {euro(costoMq)}</span>
                    </div>
                  </div>
                );
              })}
              {!showAll && filtered.length>25 &&(
                <div style={{padding:10,textAlign:"center"}}>
                  <button onClick={()=>setShowAll(true)} style={{padding:"5px 16px",borderRadius:8,border:"1px solid #E0DDD8",background:"#F0EDE8",cursor:"pointer",fontSize:12,color:"#6B6860"}}>
                    Mostra tutti i {filtered.length} risultati
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {prodotto && (
              <div style={{...card,borderColor:FORN_STYLE[prodotto.fornitore]?.c||"#E0DDD8",marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:500,marginBottom:2}}>{prodotto.nome}</div>
                    <div style={{fontSize:12,color:"#9A9890"}}>{prodotto.dims} · {prodotto.categoria}</div>
                  </div>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:6,fontWeight:500,background:FORN_STYLE[prodotto.fornitore]?.bg,color:FORN_STYLE[prodotto.fornitore]?.c}}>{prodotto.fornitore}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                  {[
                    {l:"Listino fornitore",v:euro(prodotto.listino)+"/mq",c:"#1A1A1A"},
                    {l:"Tuo costo",v:euro(prodotto.listino*prodotto.coeff)+"/mq",c:"#A32D2D"},
                    {l:"Tuo prezzo mat.",v:euro(prodotto.listino*prodotto.coeff*MARKUP)+"/mq",c:"#27500A"},
                  ].map(k=>(
                    <div key={k.l} style={{background:"#F0EDE8",borderRadius:6,padding:"8px",textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#9A9890",marginBottom:2}}>{k.l}</div>
                      <div style={{fontSize:12,fontWeight:500,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{...card,marginBottom:0}}>
              <div style={sectionTitle}>Parametri cantiere</div>

              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Complessità posa</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[["semplice","Semplice","Ambienti aperti, posa dritta","20€/mq"],["media","Media","Più ambienti, qualche angolo","27€/mq"],["complessa","Complessa","Molti tagli, angoli, disegni","35€/mq"]].map(([k,l,d,p])=>(
                    <div key={k} onClick={()=>setComplessita(k)} style={{
                      padding:"10px 12px",borderRadius:8,cursor:"pointer",border:"1px solid",
                      background:complessita===k?"#1A1A2E":"#F0EDE8",
                      borderColor:complessita===k?"#1A1A2E":"#E0DDD8",
                      color:complessita===k?"#fff":"#1A1A1A"}}>
                      <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:11,opacity:.7}}>{d}</div>
                      <div style={{fontSize:13,fontWeight:600,marginTop:4}}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Slider label="mq da posare" min={5} max={600} value={mqPrev} step={5} onChange={setMqPrev} format={(v:number)=>v+" mq"}/>
              <Slider label="Sfrido / sovrappiù (%)" min={5} max={25} value={sfrido} step={1} onChange={setSfrido} format={(v:number)=>v+"%"}/>
              <Slider label="Sconto al cliente (%)" min={0} max={40} value={sconto} step={1} onChange={setSconto} format={(v:number)=>v+"%"}/>

              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn active={incPosa} onClick={()=>setIncPosa(!incPosa)}>
                  {incPosa?"✓":""} Posa ({PREZZI_POSA[complessita]}€/mq cliente)
                </Btn>
                <Btn active={incTapp} onClick={()=>setIncTapp(!incTapp)}>
                  {incTapp?"✓":""} Tappetino (3€/mq)
                </Btn>
                <Btn active={incTrasporto} onClick={()=>setIncTrasporto(!incTrasporto)}>
                  {incTrasporto?"✓":""} Trasporto (2€/km)
                </Btn>
              </div>

              {incTrasporto && (
                <div style={{marginTop:12}}>
                  <Slider label="Distanza da Desenzano (km)" min={0} max={400} value={kmDist} step={5} onChange={setKmDist} format={(v:number)=>v+" km"}/>
                  {kmDist>KM_SOGLIA && <div style={{fontSize:12,color:"#0C447C",background:"#E6F1FB",padding:"6px 10px",borderRadius:6}}>
                    ℹ Trasferta attiva oltre {KM_SOGLIA}km · {kmDist-KM_SOGLIA} km fatturabili × 2€ = {euro((kmDist-KM_SOGLIA)*2)} trasporto · Supplemento posa +{SUPPL_TRASFERTA_POSA[complessita]}€/mq
                  </div>}
                </div>
              )}
            </div>

            <div style={{...card,marginBottom:0}}>
              <div style={{...sectionTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>Materiali aggiuntivi</span>
                <button onClick={addRiga} style={{padding:"3px 12px",borderRadius:6,border:"1px solid #1A1A2E",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Aggiungi riga</button>
              </div>
              {righeMat.length===0 && <div style={{fontSize:12,color:"#9A9890",textAlign:"center",padding:"10px 0"}}>Battiscopa, profili, colla, rasante, smaltimento...</div>}
              {righeMat.map(r=>(
                <div key={r.id} style={{display:"grid",gridTemplateColumns:"2fr 60px 70px 90px 90px 30px",gap:6,marginBottom:8,alignItems:"center"}}>
                  <input value={r.desc} onChange={e=>updRiga(r.id,"desc",e.target.value)} placeholder="Descrizione"
                    style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                  <input value={r.qta} type="number" onChange={e=>updRiga(r.id,"qta",Number(e.target.value))}
                    style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                  <select value={r.unita} onChange={e=>updRiga(r.id,"unita",e.target.value)}
                    style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none",background:"#fff"}}>
                    {["mq","ml","pz","kg","lt"].map(u=><option key={u}>{u}</option>)}
                  </select>
                  <input value={r.costoUn} type="number" onChange={e=>updRiga(r.id,"costoUn",Number(e.target.value))} placeholder="Costo €"
                    style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                  <input value={r.prezzoUn} type="number" onChange={e=>updRiga(r.id,"prezzoUn",Number(e.target.value))} placeholder="Prezzo €"
                    style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                  <button onClick={()=>delRiga(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D",fontSize:16}}>×</button>
                </div>
              ))}
              {righeMat.length>0 && <div style={{fontSize:11,color:"#9A9890",marginTop:4}}>Costo totale extra: {euro(righeMat.reduce((s,r)=>s+(r.costoUn||0)*(r.qta||0),0))} · Prezzo al cliente: {euro(righeMat.reduce((s,r)=>s+(r.prezzoUn||0)*(r.qta||0),0))}</div>}
            </div>

            {calc && (
              <div style={{...card,marginBottom:0,border:`2px solid ${calc.marginePct>MARGINE_ALERT?"#639922":calc.marginePct>MARGINE_BLOCCO?"#EF9F27":"#E24B4A"}`}}>
                <div style={sectionTitle}>Verifica margine — SEI DENTRO?</div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    {l:"Totale costi tuoi",v:euro(calc.costoTotale),c:"#A32D2D"},
                    {l:"Prezzo al cliente (netto sc.)",v:euro(calc.prezzoNetto),c:"#0C447C"},
                    {l:"Margine lordo €",v:euro(calc.margineE),c:calc.margineE>0?"#27500A":"#A32D2D"},
                    {l:"Prezzo tutto incluso /mq",v:euro(calc.prezzoMqTot)+"/mq",c:"#1A1A2E"},
                  ].map(k=>(
                    <div key={k.l} style={{background:"#F0EDE8",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:11,color:"#9A9890",marginBottom:3}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:600,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Dettaglio costi vs prezzi</div>
                {[
                  {l:`Materiale (${calc.mqOrd.toFixed(1)}mq)`,costo:calc.costoMatTot,prezzo:calc.prezzoMatTot},
                  incPosa&&{l:`Posa ${complessita} (${mqPrev}mq)`,costo:calc.costoPosaTot,prezzo:calc.prezzoPosaTot},
                  calc.tappNeeded&&{l:`Tappetino (${mqPrev}mq)`,costo:calc.costoTappTot,prezzo:calc.prezzoTappTot},
                  calc.trasfertaAttiva&&{l:`Trasferta posa`,costo:calc.costoTrasfertaTot,prezzo:calc.prezzoTrasfertaTot},
                  incTrasporto&&calc.kmExtra>0&&{l:`Trasporto (${calc.kmExtra}km)`,costo:calc.costoTrasporto,prezzo:calc.prezzoTrasporto},
                  righeMat.length>0&&{l:"Materiali extra",costo:calc.costoExtraTot,prezzo:calc.prezzoExtraTot},
                ].filter(Boolean).map((r:any,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,padding:"5px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:12}}>
                    <span style={{color:"#6B6860"}}>{r.l}</span>
                    <span style={{color:"#A32D2D",textAlign:"right"}}>Costo: {euro(r.costo)}</span>
                    <span style={{color:"#27500A",textAlign:"right"}}>Ricavo: {euro(r.prezzo)}</span>
                  </div>
                ))}
                {sconto>0 && <div style={{fontSize:12,color:"#633806",padding:"5px 0",borderBottom:"0.5px solid #E0DDD8"}}>Sconto {sconto}%: − {euro(calc.scontoAmt)}</div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,padding:"8px 0",fontWeight:600,fontSize:13}}>
                  <span>TOTALE</span>
                  <span style={{color:"#A32D2D",textAlign:"right"}}>{euro(calc.costoTotale)}</span>
                  <span style={{color:"#27500A",textAlign:"right"}}>{euro(calc.prezzoNetto)}</span>
                </div>

                <div style={{
                  borderRadius:10,padding:"12px 16px",fontSize:13,lineHeight:1.7,marginTop:8,
                  background:calc.marginePct>MARGINE_ALERT?"#EAF3DE":calc.marginePct>MARGINE_BLOCCO?"#FAEEDA":"#FCEBEB",
                  border:`1px solid ${calc.marginePct>MARGINE_ALERT?"#639922":calc.marginePct>MARGINE_BLOCCO?"#EF9F27":"#E24B4A"}`,
                  color:calc.marginePct>MARGINE_ALERT?"#27500A":calc.marginePct>MARGINE_BLOCCO?"#633806":"#A32D2D",
                }}>
                  {calc.marginePct>MARGINE_ALERT && `✓ OTTIMO — Margine ${pct(calc.marginePct)}. Puoi ancora scontare fino a ${pct(calc.scontoMax-sconto)} in più.`}
                  {calc.marginePct>MARGINE_BLOCCO && calc.marginePct<=MARGINE_ALERT && `⚠ ATTENZIONE — Margine ${pct(calc.marginePct)} sotto il ${MARGINE_ALERT}%. Lavori ma con poco cuscinetto per imprevisti.`}
                  {calc.marginePct<=MARGINE_BLOCCO && `⛔ BLOCCO — Margine ${pct(calc.marginePct)} sotto il ${MARGINE_BLOCCO}%. Il PDF è bloccato. Non accettare questo lavoro così.`}
                </div>

                <button onClick={()=>setStep(2)} style={{
                  width:"100%",marginTop:12,padding:"11px",borderRadius:9,border:"none",cursor:"pointer",
                  fontSize:14,fontWeight:500,
                  background:calc.marginePct>MARGINE_BLOCCO?"#1A1A2E":"#9A9890",
                  color:"#fff",
                }}>
                  {calc.marginePct>MARGINE_BLOCCO ? "Vai a Intestazione & Note →" : "⛔ Sblocca prima il margine"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step===2 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={card}>
              <div style={sectionTitle}>Intestazione Kalēa</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:6}}>Logo aziendale</div>
                <input type="file" accept="image/*" onChange={handleLogo} style={{fontSize:12}}/>
                {logoUrl && <img src={logoUrl} alt="logo" style={{height:40,marginTop:8,display:"block"}}/>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>N° preventivo</div>
                  <input value={numPrev} onChange={e=>setNumPrev(e.target.value)} placeholder="KAL-2026-001"
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={()=>setNumPrev(nextNum())} style={{marginTop:4,fontSize:11,color:"#0C447C",background:"none",border:"none",cursor:"pointer",padding:0}}>Genera automatico</button>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Data</div>
                  <input value={dataPrev} onChange={e=>setDataPrev(e.target.value)}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Descrizione cantiere</div>
                <input value={cantiere} onChange={e=>setCantiere(e.target.value)} placeholder="Es. Appartamento via Roma 12, Brescia"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Lingua documento</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {["IT","EN","DE","FR","RO"].map(l=><Btn key={l} active={lingua===l} onClick={()=>setLingua(l)}>{l}</Btn>)}
              </div>
            </div>

            <div style={card}>
              <div style={sectionTitle}>Dati cliente</div>
              {[["nome","Nome / Ragione sociale"],["indirizzo","Indirizzo"],["citta","Città"],["telefono","Telefono"],["email","Email"]].map(([k,pl])=>(
                <div key={k} style={{marginBottom:8}}>
                  <input value={cliente[k]} onChange={e=>setCliente((c:any)=>({...c,[k]:e.target.value}))} placeholder={pl}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={card}>
              <div style={sectionTitle}>Condizioni di pagamento</div>
              {pagamenti.map((p,i)=>(
                <div key={i} style={{marginBottom:12,padding:"10px 12px",background:"#F0EDE8",borderRadius:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr",gap:8,marginBottom:6}}>
                    <input value={p.label} onChange={e=>{const pg=[...pagamenti];pg[i].label=e.target.value;setPagamenti(pg);}} placeholder="Descrizione"
                      style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                    <div style={{position:"relative"}}>
                      <input value={p.pct} type="number" onChange={e=>{const pg=[...pagamenti];pg[i].pct=Number(e.target.value);setPagamenti(pg);}}
                        style={{width:"100%",padding:"5px 20px 5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                      <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9A9890"}}>%</span>
                    </div>
                    <input value={p.data} onChange={e=>{const pg=[...pagamenti];pg[i].data=e.target.value;setPagamenti(pg);}} placeholder="Data / condizione"
                      style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none"}}/>
                  </div>
                  <input value={p.note} onChange={e=>{const pg=[...pagamenti];pg[i].note=e.target.value;setPagamenti(pg);}} placeholder="Note pagamento (es. solo bonifico)"
                    style={{width:"100%",padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setPagamenti([...pagamenti,{label:"",pct:0,data:"",note:""}])}
                  style={{padding:"5px 12px",borderRadius:6,border:"1px solid #E0DDD8",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Rata</button>
                {pagamenti.length>1&&<button onClick={()=>setPagamenti(pagamenti.slice(0,-1))}
                  style={{padding:"5px 12px",borderRadius:6,border:"1px solid #E0DDD8",background:"transparent",cursor:"pointer",fontSize:12,color:"#A32D2D"}}>− Rimuovi</button>}
              </div>
              <div style={{marginTop:8,fontSize:12,color:pagamenti.reduce((s,p)=>s+p.pct,0)===100?"#27500A":"#A32D2D"}}>
                Totale rate: {pagamenti.reduce((s,p)=>s+p.pct,0)}% {pagamenti.reduce((s,p)=>s+p.pct,0)===100?"✓":"⚠ deve fare 100%"}
              </div>
            </div>

            <div style={card}>
              <div style={sectionTitle}>Note visibili al cliente</div>
              <textarea value={noteCliente} onChange={e=>setNoteCliente(e.target.value)}
                placeholder="Es. Il prezzo include la rimozione del vecchio pavimento..."
                rows={4} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>

            <div style={card}>
              <div style={{...sectionTitle,color:"#A32D2D"}}>Note interne — NON appaiono nel PDF</div>
              <textarea value={noteInterne} onChange={e=>setNoteInterne(e.target.value)}
                placeholder="Es. Cliente vuole sconto, trattare. Attenzione al piano rialzato..."
                rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #FAEEDA",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",background:"#FAEEDA"}}/>
            </div>

            <button onClick={()=>setStep(3)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:"#1A1A2E",color:"#fff"}}>
              Vai ad Anteprima & PDF →
            </button>
          </div>
        </div>
      )}

      {step===3 && calc && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
            <button onClick={generaPDF} style={{padding:"10px 24px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:calc.marginePct>MARGINE_BLOCCO?"#1A1A2E":"#9A9890",color:"#fff"}}>
              {calc.marginePct>MARGINE_BLOCCO?"🖨 Stampa / Salva PDF":"⛔ Margine troppo basso — PDF bloccato"}
            </button>
            {calc.marginePct>MARGINE_BLOCCO && <div style={{fontSize:12,color:"#27500A",background:"#EAF3DE",padding:"6px 12px",borderRadius:6}}>✓ Margine {pct(calc.marginePct)} — OK per la generazione</div>}
            {calc.marginePct<=MARGINE_BLOCCO && <div style={{fontSize:12,color:"#A32D2D",background:"#FCEBEB",padding:"6px 12px",borderRadius:6}}>Torna al calcolo e migliora il margine</div>}
          </div>

          <div id="pdf-preview" style={{background:"#fff",border:"1px solid #E0DDD8",borderRadius:12,padding:"40px 48px",maxWidth:800,margin:"0 auto",boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,paddingBottom:24,borderBottom:"2px solid #1A1A2E"}}>
              <div>
                {logoUrl ? <img src={logoUrl} alt="Kalēa" style={{height:50,marginBottom:8,display:"block"}}/> :
                  <div style={{fontSize:28,fontWeight:300,letterSpacing:".15em",color:"#1A1A2E",marginBottom:4}}>Kal<span style={{color:"#C4A882"}}>ē</span>a</div>}
                <div style={{fontSize:12,color:"#6B6860"}}>Superfici · Pavimentazioni · Posa chiavi in mano</div>
                <div style={{fontSize:12,color:"#6B6860"}}>Desenzano del Garda (BS) · info@kalea.space · kalea.space</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:600,color:"#1A1A2E",letterSpacing:".05em"}}>{t.titolo}</div>
                <div style={{fontSize:13,color:"#6B6860",marginTop:4}}>N° <strong>{numPrev||"KAL-2026-001"}</strong></div>
                <div style={{fontSize:13,color:"#6B6860"}}>{t.data}: <strong>{dataPrev}</strong></div>
                <div style={{fontSize:13,color:"#A32D2D"}}>{t.validita}: <strong>{addDays(dataPrev,30)}</strong></div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:28}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{t.cliente}</div>
                <div style={{fontSize:14,fontWeight:500}}>{cliente.nome||"—"}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.indirizzo}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.citta}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.telefono}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.email}</div>
              </div>
              {cantiere && <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Cantiere / Oggetto</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cantiere}</div>
              </div>}
            </div>

            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:24}}>
              <thead>
                <tr style={{background:"#1A1A2E"}}>
                  {[t.desc,t.mq,t.prezzo_unit,t.totale].map((h:string)=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:h===t.desc?"left":"right",fontSize:11,fontWeight:500,color:"#fff",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{background:"#F7F6F3"}}>
                  <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.fornitura}</td>
                </tr>
                <tr>
                  <td style={{padding:"8px 12px",fontSize:13}}>{prodotto?.nome} — {prodotto?.dims}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.mqOrd.toFixed(1)}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoMatMq)}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoMatTot)}</td>
                </tr>
                {righeMat.filter(r=>r.desc).map(r=>(
                  <tr key={r.id}>
                    <td style={{padding:"8px 12px",fontSize:13}}>{r.desc}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{r.qta} {r.unita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(r.prezzoUn)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(r.prezzoUn*r.qta)}</td>
                  </tr>
                ))}
                {incPosa && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.posa}</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.posa} — complessità {complessita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(PREZZI_POSA[complessita])}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoPosaTot)}</td>
                  </tr>
                </>}
                {calc.tappNeeded && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.tappetino}</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.tappetino}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(PREZZO_TAPPETINO_CLIENTE)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTappTot)}</td>
                  </tr>
                </>}
                {incTrasporto && calc.kmExtra>0 && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.trasporto} ({calc.kmExtra} km)</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.kmExtra}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(COSTO_KM*MARKUP)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasporto)}</td>
                  </tr>
                )}
                {calc.trasfertaAttiva && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.trasferta}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(SUPPL_TRASFERTA_POSA[complessita])}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasfertaTot)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{marginLeft:"auto",width:280}}>
              {[
                {l:t.subtotale,v:euro(calc.prezzoLordoTot)},
                sconto>0&&{l:`Sconto ${sconto}%`,v:`− ${euro(calc.scontoAmt)}`,c:"#633806"},
                sconto>0&&{l:"Imponibile scontato",v:euro(calc.prezzoNetto)},
                {l:t.iva,v:euro(calc.iva)},
              ].filter(Boolean).map((r:any,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:13}}>
                  <span style={{color:"#6B6860"}}>{r.l}</span>
                  <span style={{color:r.c||"#1A1A1A"}}>{r.v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700,fontSize:16,borderTop:"2px solid #1A1A2E",marginTop:4}}>
                <span>{t.totale_doc}</span>
                <span style={{color:"#1A1A2E"}}>{euro(calc.totaleIva)}</span>
              </div>
            </div>

            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1A1A2E",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>{t.pagamenti}</div>
              {pagamenti.map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:13}}>
                  <span>{p.label} {p.data&&`— ${p.data}`} {p.note&&<span style={{color:"#9A9890",fontSize:12}}> ({p.note})</span>}</span>
                  <span style={{fontWeight:600}}>{euro(calc.totaleIva*p.pct/100)} ({p.pct}%)</span>
                </div>
              ))}
            </div>

            {noteCliente && (
              <div style={{marginTop:20,padding:"12px 16px",background:"#F0EDE8",borderRadius:8,fontSize:13,color:"#6B6860",lineHeight:1.7}}>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{t.note_cliente}</div>
                {noteCliente}
              </div>
            )}

            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{t.termini}</div>
              <div style={{fontSize:11,color:"#6B6860",lineHeight:1.8,whiteSpace:"pre-line"}}>{t.termini_testo}</div>
            </div>

            <div style={{marginTop:28,padding:"16px 20px",border:"1px solid #1A1A2E",borderRadius:8}}>
              <div style={{fontSize:12,color:"#6B6860",marginBottom:16}}>{t.accetta}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>{t.firma_cliente}</div>
                </div>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>{t.firma_kalēa}</div>
                </div>
              </div>
              <div style={{marginTop:16,fontSize:12,color:"#6B6860"}}>{t.luogo}: _______________________</div>
            </div>

            <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid #E0DDD8",textAlign:"center",fontSize:11,color:"#9A9890"}}>
              Kalēa · Desenzano del Garda (BS) · info@kalea.space · kalea.space · P.IVA IT_____________
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > * { display: none !important; }
          #pdf-preview { display: block !important; box-shadow: none !important; border: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
