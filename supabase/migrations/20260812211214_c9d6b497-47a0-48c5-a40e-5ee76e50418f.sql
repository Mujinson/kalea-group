INSERT INTO suppliers (name, vat_number, address, country, notes)
SELECT * FROM (VALUES
  ('Woodco s.c.', NULL, 'Via Antonio Detassis - Trento', 'Italia', 'Parquet. IBAN IT32U0830401819000008306747'),
  ('Chimiver Panseri S.p.A.', 'IT02745410163', 'Via Bergamo 1401 - Pontida (BG)', 'Italia', 'Collanti, vernici, attrezzatura. Codice cliente 14850. IBAN IT22G0538752880000042236581'),
  ('Zhou', NULL, NULL, 'Italia', 'Lastre MGO. Pagamenti in contanti - servono le fatture'),
  ('Autocomotti di Comotti Gianpaolo', NULL, NULL, 'Italia', 'Furgone aziendale. Piano rateale 7 rate da 1.000 EUR, RiBa il 30 di ogni mese'),
  ('Studio Fondrieschi D''Albore Associati', NULL, NULL, 'Italia', 'Elaborazione paghe'),
  ('BCC di Brescia', NULL, NULL, 'Italia', 'Banca. Conto IT02H0869254560045000456252')
) AS v(name, vat_number, address, country, notes)
WHERE NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.name = v.name);

INSERT INTO supplier_invoices
  (supplier_id, invoice_number, invoice_date, due_date, subtotal, vat_rate, vat_amount, total, paid_amount, status, is_reverse_charge, category, payment_method, notes)
SELECT s.id, '3629/2026', DATE '2026-07-31', DATE '2026-07-31', 706.91, 22, 155.52, 862.43, 862.43, 'pagata', false, 'Acquisto materiali', 'bonifico',
  'Taglierina DR 330 (416,00) + Adesiver RE MS + Parketkit Noce + Attakko Pro Max. Maggiorazione 5%. Rif. ordine 4991/2026, DDT 4512/2026. NB: la taglierina e'' attrezzatura ammortizzabile, il resto materiale di consumo.'
FROM suppliers s WHERE s.name = 'Chimiver Panseri S.p.A.'
AND NOT EXISTS (SELECT 1 FROM supplier_invoices i WHERE i.invoice_number = '3629/2026');

INSERT INTO supplier_invoices
  (supplier_id, invoice_number, invoice_date, due_date, subtotal, vat_rate, vat_amount, total, paid_amount, status, is_reverse_charge, category, payment_method, notes)
SELECT s.id, '3628/2026', DATE '2026-07-31', DATE '2026-07-31', 13.39, 22, 2.95, 16.34, 16.34, 'pagata', false, 'Materiali di consumo cantiere', 'carta',
  'Parketkit Bianco 3 cartucce. Rif. ordine 836/2026, DDT 4663/2026. Pagata con carta prepagata.'
FROM suppliers s WHERE s.name = 'Chimiver Panseri S.p.A.'
AND NOT EXISTS (SELECT 1 FROM supplier_invoices i WHERE i.invoice_number = '3628/2026');

INSERT INTO supplier_invoices
  (supplier_id, invoice_number, invoice_date, due_date, subtotal, vat_rate, vat_amount, total, paid_amount, status, is_reverse_charge, category, payment_method, notes)
SELECT s.id, 'ORD-12039', DATE '2026-07-13', DATE '2026-07-13', 8638.54, NULL, 0, 8638.54, 8638.54, 'pagata', false, 'Acquisto materiali', 'bonifico',
  'ATTENZIONE: numero fattura e imponibile da correggere, manca il documento. Se e'' al 22% l''imponibile e'' 7.080,77 e l''IVA a credito 1.557,77. Finche'' non lo correggi l''IVA del periodo e'' sbagliata in difetto.'
FROM suppliers s WHERE s.name = 'Woodco s.c.'
AND NOT EXISTS (SELECT 1 FROM supplier_invoices i WHERE i.invoice_number = 'ORD-12039');

INSERT INTO supplier_invoices
  (supplier_id, invoice_number, invoice_date, due_date, subtotal, vat_rate, vat_amount, total, paid_amount, status, is_reverse_charge, category, payment_method, notes)
SELECT s.id, 'DA-EMETTERE-MGO', DATE '2026-08-04', DATE '2026-08-04', 1664.00, NULL, 0, 1664.00, 1664.00, 'pagata', false, 'Acquisto materiali', 'contanti',
  'ATTENZIONE: lastre MGO pagate 1.664 EUR in contanti senza documento a supporto. Recuperare la fattura: senza, il costo non e'' deducibile e l''IVA non e'' detraibile.'
FROM suppliers s WHERE s.name = 'Zhou'
AND NOT EXISTS (SELECT 1 FROM supplier_invoices i WHERE i.invoice_number = 'DA-EMETTERE-MGO');

INSERT INTO fixed_costs
  (description, amount, category, frequency, cost_date, next_due_date, is_paid, person_name, notes)
SELECT * FROM (VALUES
  ('Commercialista', 1000.00, 'consulenze'::fixed_cost_category, 'trimestrale'::cost_frequency, DATE '2026-09-30', DATE '2026-09-30', false, NULL,
   '4.000 EUR/anno oltre IVA 22%. Data di scadenza da confermare.'),
  ('Studio paghe - elaborazione cedolini', 600.00, 'consulenze'::fixed_cost_category, 'semestrale'::cost_frequency, DATE '2026-12-31', DATE '2026-12-31', false, 'Studio Fondrieschi D''Albore Associati',
   '1.200 EUR/anno, circa 100 EUR/mese, oltre IVA 22%. Data da confermare.'),
  ('Assicurazione furgone', 850.00, 'assicurazioni'::fixed_cost_category, 'semestrale'::cost_frequency, DATE '2027-01-31', DATE '2027-01-31', false, NULL,
   '1.700 EUR/anno, esente IVA art.10. Il semestrale di luglio non risulta sul conto BCC: verificare da quale conto e'' uscito.'),
  ('INAIL - premio assicurativo annuale', 1277.65, 'assicurazioni'::fixed_cost_category, 'annuale'::cost_frequency, DATE '2026-08-20', DATE '2026-08-20', false, NULL,
   'Ditta 21665283, sede 13200. Premio ANNUALE, non mensile. Valido con 1 solo dipendente: se assumete cresce.'),
  ('Stipendio netto operaio', 1900.00, 'stipendi'::fixed_cost_category, 'mensile'::cost_frequency, DATE '2026-09-10', DATE '2026-09-10', false, 'Luca Merelli',
   'STIMA. Luglio 2026 e'' stato 1.143 EUR ma su mese parziale (assunto il 13/07, 103 ore). Sostituire col netto di un mese pieno.'),
  ('F24 mensile - IRPEF e INPS su retribuzioni', 1156.00, 'contributi_tasse'::fixed_cost_category, 'mensile'::cost_frequency, DATE '2026-09-16', DATE '2026-09-16', false, NULL,
   'STIMA su mese pieno. Luglio 2026: 210,39 IRPEF + 605,00 INPS = 815,39 su mese parziale.'),
  ('Rate furgone Autocomotti', 1000.00, 'automezzi'::fixed_cost_category, 'mensile'::cost_frequency, DATE '2026-08-30', DATE '2026-08-30', false, 'Autocomotti di Comotti Gianpaolo',
   'RiBa il 30 di ogni mese. 7 rate totali: la n.1 e'' stata addebitata il 31/07/2026, restano 6 rate per 6.000 EUR, ultima a gennaio 2027. NON e'' un costo perpetuo: dopo la rata 7 va chiuso.'),
  ('Telepass', 0.00, 'automezzi'::fixed_cost_category, 'mensile'::cost_frequency, DATE '2026-08-31', DATE '2026-08-31', false, NULL,
   'IMPORTO DA INSERIRE - canone mensile non ancora comunicato.'),
  ('Cassa Edile / CAPE', 0.00, 'contributi_tasse'::fixed_cost_category, 'mensile'::cost_frequency, DATE '2026-08-31', DATE '2026-08-31', false, NULL,
   'IMPORTO DA INSERIRE - versamento mensile non ancora comunicato.')
) AS v(description, amount, category, frequency, cost_date, next_due_date, is_paid, person_name, notes)
WHERE NOT EXISTS (SELECT 1 FROM fixed_costs f WHERE f.description = v.description);