// ============================================
// Glass Haus - Demo Data Import
// ============================================
// Run this script in Neo4j Browser or Aura Console
// This creates the complete demo building with all relationships

// --- CONSTRAINTS AND INDEXES ---
CREATE CONSTRAINT building_id IF NOT EXISTS FOR (b:Building) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT manufacturer_id IF NOT EXISTS FOR (m:Manufacturer) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT plant_id IF NOT EXISTS FOR (pl:Plant) REQUIRE pl.id IS UNIQUE;
CREATE CONSTRAINT certification_id IF NOT EXISTS FOR (c:Certification) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT element_id IF NOT EXISTS FOR (e:BuildingElement) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT material_id IF NOT EXISTS FOR (m:Material) REQUIRE m.id IS UNIQUE;

CREATE INDEX product_name IF NOT EXISTS FOR (p:Product) ON (p.name);
CREATE INDEX product_gwp IF NOT EXISTS FOR (p:Product) ON (p.gwp);
CREATE INDEX manufacturer_country IF NOT EXISTS FOR (m:Manufacturer) ON (m.country);
CREATE INDEX certification_valid IF NOT EXISTS FOR (c:Certification) ON (c.validUntil);

// --- CREATE BUILDING ---
CREATE (b:Building {
  id: 'building-001',
  name: 'Glass Haus',
  address: 'Graslei 15, 9000 Gent',
  type: 'Office',
  totalGWP: 0,
  completionDate: date('2025-06-01')
});

// --- CREATE BUILDING ELEMENTS ---
CREATE (foundation:BuildingElement {id: 'element-foundation', name: 'Foundation', category: 'Foundation'});
CREATE (structure:BuildingElement {id: 'element-structure', name: 'Structure', category: 'Structure'});
CREATE (envelope:BuildingElement {id: 'element-envelope', name: 'Building Envelope', category: 'Envelope'});
CREATE (systems:BuildingElement {id: 'element-systems', name: 'Building Systems', category: 'Systems'});

// --- CREATE LOCATIONS ---
CREATE (belgium:Location {id: 'loc-be', country: 'Belgium', region: 'Flanders'});
CREATE (luxembourg:Location {id: 'loc-lu', country: 'Luxembourg', region: 'Luxembourg'});
CREATE (finland:Location {id: 'loc-fi', country: 'Finland', region: 'Southern Finland'});
CREATE (austria:Location {id: 'loc-at', country: 'Austria', region: 'Lower Austria'});
CREATE (germany:Location {id: 'loc-de', country: 'Germany', region: 'North Rhine-Westphalia'});

// --- CREATE MANUFACTURERS ---
CREATE (holcim:Manufacturer {
  id: 'mfr-holcim',
  name: 'Holcim Belgium',
  did: 'did:web:holcim.be',
  website: 'https://www.holcim.be',
  country: 'Belgium'
});
CREATE (arcelor:Manufacturer {
  id: 'mfr-arcelor',
  name: 'ArcelorMittal',
  did: 'did:web:arcelormittal.com',
  website: 'https://www.arcelormittal.com',
  country: 'Luxembourg'
});
CREATE (storaenso:Manufacturer {
  id: 'mfr-storaenso',
  name: 'Stora Enso',
  did: 'did:web:storaenso.com',
  website: 'https://www.storaenso.com',
  country: 'Finland'
});
CREATE (rockwool:Manufacturer {
  id: 'mfr-rockwool',
  name: 'Rockwool',
  did: 'did:web:rockwool.com',
  website: 'https://www.rockwool.com',
  country: 'Belgium'
});
CREATE (agc:Manufacturer {
  id: 'mfr-agc',
  name: 'AGC Glass Europe',
  did: 'did:web:agc-glass.eu',
  website: 'https://www.agc-glass.eu',
  country: 'Belgium'
});
CREATE (reynaers:Manufacturer {
  id: 'mfr-reynaers',
  name: 'Reynaers Aluminium',
  did: 'did:web:reynaers.com',
  website: 'https://www.reynaers.com',
  country: 'Belgium'
});
CREATE (daikin:Manufacturer {
  id: 'mfr-daikin',
  name: 'Daikin Europe',
  did: 'did:web:daikin.eu',
  website: 'https://www.daikin.eu',
  country: 'Belgium'
});

// --- CREATE PLANTS ---
CREATE (holcimPlant:Plant {
  id: 'plant-holcim-obourg',
  name: 'Holcim Obourg Plant',
  address: 'Rue de l\'Industrie, Obourg',
  latitude: 50.4667,
  longitude: 3.9667
});
CREATE (arcelorPlant:Plant {
  id: 'plant-arcelor-gent',
  name: 'ArcelorMittal Gent',
  address: 'John Kennedylaan 51, Gent',
  latitude: 51.0833,
  longitude: 3.7167
});
CREATE (storaensoPlant:Plant {
  id: 'plant-storaenso-ybbs',
  name: 'Stora Enso CLT Plant Ybbs',
  address: 'Ybbs an der Donau, Austria',
  latitude: 48.1667,
  longitude: 15.0833
});
CREATE (rockwoolPlant:Plant {
  id: 'plant-rockwool-roermond',
  name: 'Rockwool Roermond',
  address: 'Roermond, Netherlands',
  latitude: 51.1917,
  longitude: 5.9875
});
CREATE (agcPlant:Plant {
  id: 'plant-agc-mol',
  name: 'AGC Mol Plant',
  address: 'Mol, Belgium',
  latitude: 51.1833,
  longitude: 5.1167
});

// --- CREATE PRODUCTS ---
CREATE (concrete:Product {
  id: 'prod-concrete-c30',
  name: 'ECOPact Concrete C30/37',
  gtin: '5412345678901',
  gwp: 285,
  declaredUnit: 'm³',
  quantity: 450,
  epdNumber: 'EPD-HOL-2024-001',
  recycledContent: 15,
  category: 'Concrete'
});
CREATE (rebar:Product {
  id: 'prod-rebar',
  name: 'Recycled Steel Rebar B500B',
  gtin: '5412345678902',
  gwp: 0.87,
  declaredUnit: 'kg',
  quantity: 45000,
  epdNumber: 'EPD-ARC-2024-001',
  recycledContent: 95,
  category: 'Steel'
});
CREATE (clt:Product {
  id: 'prod-clt',
  name: 'CLT Panel 120mm',
  gtin: '5412345678903',
  gwp: -718,
  declaredUnit: 'm³',
  quantity: 280,
  epdNumber: 'EPD-STO-2024-001',
  recycledContent: 0,
  category: 'Wood'
});
CREATE (insulation:Product {
  id: 'prod-insulation',
  name: 'Rockwool FlexiBatts 037',
  gtin: '5412345678904',
  gwp: 1.2,
  declaredUnit: 'm²',
  quantity: 2800,
  epdNumber: 'EPD-ROC-2024-001',
  recycledContent: 25,
  category: 'Insulation'
});
CREATE (glass:Product {
  id: 'prod-glass',
  name: 'AGC Planibel Clearvision',
  gtin: '5412345678905',
  gwp: 12.5,
  declaredUnit: 'm²',
  quantity: 1200,
  epdNumber: 'EPD-AGC-2024-001',
  recycledContent: 30,
  category: 'Glass'
});
CREATE (aluminum:Product {
  id: 'prod-aluminum',
  name: 'Reynaers CS 77 Frames',
  gtin: '5412345678906',
  gwp: 18.3,
  declaredUnit: 'm',
  quantity: 850,
  epdNumber: 'EPD-REY-2024-001',
  recycledContent: 45,
  category: 'Aluminum'
});
CREATE (hvac:Product {
  id: 'prod-hvac',
  name: 'Daikin VRV IV Heat Pump',
  gtin: '5412345678907',
  gwp: 2450,
  declaredUnit: 'unit',
  quantity: 4,
  epdNumber: 'EPD-DAI-2024-001',
  recycledContent: 20,
  category: 'HVAC'
});

// --- CREATE CERTIFICATIONS ---
CREATE (epdHolcim:Certification {
  id: 'cert-epd-holcim',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'IBU',
  validFrom: date('2024-01-15'),
  validUntil: date('2029-01-15')
});
CREATE (epdArcelor:Certification {
  id: 'cert-epd-arcelor',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'IBU',
  validFrom: date('2024-03-01'),
  validUntil: date('2029-03-01')
});
CREATE (epdStoraEnso:Certification {
  id: 'cert-epd-storaenso',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'Institut Bauen und Umwelt',
  validFrom: date('2023-09-01'),
  validUntil: date('2028-09-01')
});
CREATE (fsc:Certification {
  id: 'cert-fsc',
  name: 'FSC Chain of Custody',
  type: 'FSC-COC',
  issuer: 'Forest Stewardship Council',
  validFrom: date('2024-01-01'),
  validUntil: date('2025-03-01')
});
CREATE (epdRockwool:Certification {
  id: 'cert-epd-rockwool',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'IBU',
  validFrom: date('2024-02-01'),
  validUntil: date('2029-02-01')
});
CREATE (epdAgc:Certification {
  id: 'cert-epd-agc',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'IBU',
  validFrom: date('2024-04-01'),
  validUntil: date('2029-04-01')
});
CREATE (epdReynaers:Certification {
  id: 'cert-epd-reynaers',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'IBU',
  validFrom: date('2024-05-01'),
  validUntil: date('2029-05-01')
});
CREATE (epdDaikin:Certification {
  id: 'cert-epd-daikin',
  name: 'Environmental Product Declaration',
  type: 'EPD',
  issuer: 'EPD International',
  validFrom: date('2024-06-01'),
  validUntil: date('2029-06-01')
});

// --- CREATE MATERIALS ---
CREATE (cement:Material {id: 'mat-cement', name: 'Portland Cement', category: 'Binder', recycledContent: 0});
CREATE (aggregate:Material {id: 'mat-aggregate', name: 'Recycled Aggregate', category: 'Aggregate', recycledContent: 30});
CREATE (scrap:Material {id: 'mat-scrap', name: 'Steel Scrap', category: 'Metal', recycledContent: 100});
CREATE (spruce:Material {id: 'mat-spruce', name: 'Spruce Timber', category: 'Wood', recycledContent: 0});
CREATE (basite:Material {id: 'mat-basalt', name: 'Basalt Rock', category: 'Mineral', recycledContent: 0});
CREATE (silica:Material {id: 'mat-silica', name: 'Silica Sand', category: 'Mineral', recycledContent: 0});
CREATE (cullet:Material {id: 'mat-cullet', name: 'Recycled Glass Cullet', category: 'Glass', recycledContent: 100});
CREATE (bauxite:Material {id: 'mat-bauxite', name: 'Bauxite Ore', category: 'Mineral', recycledContent: 0});
CREATE (recycledAluminum:Material {id: 'mat-recycled-alu', name: 'Recycled Aluminum', category: 'Metal', recycledContent: 100});

// --- CREATE RELATIONSHIPS ---

// Building to Elements
MATCH (b:Building {id: 'building-001'})
MATCH (foundation:BuildingElement {id: 'element-foundation'})
MATCH (structure:BuildingElement {id: 'element-structure'})
MATCH (envelope:BuildingElement {id: 'element-envelope'})
MATCH (systems:BuildingElement {id: 'element-systems'})
CREATE (b)-[:COMPOSED_OF {sequence: 1}]->(foundation)
CREATE (b)-[:COMPOSED_OF {sequence: 2}]->(structure)
CREATE (b)-[:COMPOSED_OF {sequence: 3}]->(envelope)
CREATE (b)-[:COMPOSED_OF {sequence: 4}]->(systems);

// Elements to Products
MATCH (foundation:BuildingElement {id: 'element-foundation'})
MATCH (structure:BuildingElement {id: 'element-structure'})
MATCH (envelope:BuildingElement {id: 'element-envelope'})
MATCH (systems:BuildingElement {id: 'element-systems'})
MATCH (concrete:Product {id: 'prod-concrete-c30'})
MATCH (rebar:Product {id: 'prod-rebar'})
MATCH (clt:Product {id: 'prod-clt'})
MATCH (insulation:Product {id: 'prod-insulation'})
MATCH (glass:Product {id: 'prod-glass'})
MATCH (aluminum:Product {id: 'prod-aluminum'})
MATCH (hvac:Product {id: 'prod-hvac'})
CREATE (foundation)-[:USES_PRODUCT {quantity: 450, unit: 'm³'}]->(concrete)
CREATE (foundation)-[:USES_PRODUCT {quantity: 45000, unit: 'kg'}]->(rebar)
CREATE (structure)-[:USES_PRODUCT {quantity: 280, unit: 'm³'}]->(clt)
CREATE (envelope)-[:USES_PRODUCT {quantity: 2800, unit: 'm²'}]->(insulation)
CREATE (envelope)-[:USES_PRODUCT {quantity: 1200, unit: 'm²'}]->(glass)
CREATE (envelope)-[:USES_PRODUCT {quantity: 850, unit: 'm'}]->(aluminum)
CREATE (systems)-[:USES_PRODUCT {quantity: 4, unit: 'units'}]->(hvac);

// Products to Manufacturers
MATCH (concrete:Product {id: 'prod-concrete-c30'})
MATCH (rebar:Product {id: 'prod-rebar'})
MATCH (clt:Product {id: 'prod-clt'})
MATCH (insulation:Product {id: 'prod-insulation'})
MATCH (glass:Product {id: 'prod-glass'})
MATCH (aluminum:Product {id: 'prod-aluminum'})
MATCH (hvac:Product {id: 'prod-hvac'})
MATCH (holcim:Manufacturer {id: 'mfr-holcim'})
MATCH (arcelor:Manufacturer {id: 'mfr-arcelor'})
MATCH (storaenso:Manufacturer {id: 'mfr-storaenso'})
MATCH (rockwool:Manufacturer {id: 'mfr-rockwool'})
MATCH (agc:Manufacturer {id: 'mfr-agc'})
MATCH (reynaers:Manufacturer {id: 'mfr-reynaers'})
MATCH (daikin:Manufacturer {id: 'mfr-daikin'})
CREATE (concrete)-[:SUPPLIED_BY]->(holcim)
CREATE (rebar)-[:SUPPLIED_BY]->(arcelor)
CREATE (clt)-[:SUPPLIED_BY]->(storaenso)
CREATE (insulation)-[:SUPPLIED_BY]->(rockwool)
CREATE (glass)-[:SUPPLIED_BY]->(agc)
CREATE (aluminum)-[:SUPPLIED_BY]->(reynaers)
CREATE (hvac)-[:SUPPLIED_BY]->(daikin);

// Products to Plants
MATCH (concrete:Product {id: 'prod-concrete-c30'})
MATCH (rebar:Product {id: 'prod-rebar'})
MATCH (clt:Product {id: 'prod-clt'})
MATCH (insulation:Product {id: 'prod-insulation'})
MATCH (glass:Product {id: 'prod-glass'})
MATCH (holcimPlant:Plant {id: 'plant-holcim-obourg'})
MATCH (arcelorPlant:Plant {id: 'plant-arcelor-gent'})
MATCH (storaensoPlant:Plant {id: 'plant-storaenso-ybbs'})
MATCH (rockwoolPlant:Plant {id: 'plant-rockwool-roermond'})
MATCH (agcPlant:Plant {id: 'plant-agc-mol'})
CREATE (concrete)-[:MANUFACTURED_AT]->(holcimPlant)
CREATE (rebar)-[:MANUFACTURED_AT]->(arcelorPlant)
CREATE (clt)-[:MANUFACTURED_AT]->(storaensoPlant)
CREATE (insulation)-[:MANUFACTURED_AT]->(rockwoolPlant)
CREATE (glass)-[:MANUFACTURED_AT]->(agcPlant);

// Plants to Locations
MATCH (holcimPlant:Plant {id: 'plant-holcim-obourg'})
MATCH (arcelorPlant:Plant {id: 'plant-arcelor-gent'})
MATCH (storaensoPlant:Plant {id: 'plant-storaenso-ybbs'})
MATCH (rockwoolPlant:Plant {id: 'plant-rockwool-roermond'})
MATCH (agcPlant:Plant {id: 'plant-agc-mol'})
MATCH (belgium:Location {id: 'loc-be'})
MATCH (austria:Location {id: 'loc-at'})
CREATE (holcimPlant)-[:LOCATED_IN]->(belgium)
CREATE (arcelorPlant)-[:LOCATED_IN]->(belgium)
CREATE (storaensoPlant)-[:LOCATED_IN]->(austria)
CREATE (rockwoolPlant)-[:LOCATED_IN]->(belgium)
CREATE (agcPlant)-[:LOCATED_IN]->(belgium);

// Manufacturers to Locations
MATCH (holcim:Manufacturer {id: 'mfr-holcim'})
MATCH (arcelor:Manufacturer {id: 'mfr-arcelor'})
MATCH (storaenso:Manufacturer {id: 'mfr-storaenso'})
MATCH (rockwool:Manufacturer {id: 'mfr-rockwool'})
MATCH (agc:Manufacturer {id: 'mfr-agc'})
MATCH (reynaers:Manufacturer {id: 'mfr-reynaers'})
MATCH (daikin:Manufacturer {id: 'mfr-daikin'})
MATCH (belgium:Location {id: 'loc-be'})
MATCH (luxembourg:Location {id: 'loc-lu'})
MATCH (finland:Location {id: 'loc-fi'})
CREATE (holcim)-[:LOCATED_IN]->(belgium)
CREATE (arcelor)-[:LOCATED_IN]->(luxembourg)
CREATE (storaenso)-[:LOCATED_IN]->(finland)
CREATE (rockwool)-[:LOCATED_IN]->(belgium)
CREATE (agc)-[:LOCATED_IN]->(belgium)
CREATE (reynaers)-[:LOCATED_IN]->(belgium)
CREATE (daikin)-[:LOCATED_IN]->(belgium);

// Products to Certifications
MATCH (concrete:Product {id: 'prod-concrete-c30'})
MATCH (rebar:Product {id: 'prod-rebar'})
MATCH (clt:Product {id: 'prod-clt'})
MATCH (insulation:Product {id: 'prod-insulation'})
MATCH (glass:Product {id: 'prod-glass'})
MATCH (aluminum:Product {id: 'prod-aluminum'})
MATCH (hvac:Product {id: 'prod-hvac'})
MATCH (epdHolcim:Certification {id: 'cert-epd-holcim'})
MATCH (epdArcelor:Certification {id: 'cert-epd-arcelor'})
MATCH (epdStoraEnso:Certification {id: 'cert-epd-storaenso'})
MATCH (fsc:Certification {id: 'cert-fsc'})
MATCH (epdRockwool:Certification {id: 'cert-epd-rockwool'})
MATCH (epdAgc:Certification {id: 'cert-epd-agc'})
MATCH (epdReynaers:Certification {id: 'cert-epd-reynaers'})
MATCH (epdDaikin:Certification {id: 'cert-epd-daikin'})
CREATE (concrete)-[:HAS_EPD]->(epdHolcim)
CREATE (rebar)-[:HAS_EPD]->(epdArcelor)
CREATE (clt)-[:HAS_EPD]->(epdStoraEnso)
CREATE (clt)-[:CERTIFIED_BY]->(fsc)
CREATE (insulation)-[:HAS_EPD]->(epdRockwool)
CREATE (glass)-[:HAS_EPD]->(epdAgc)
CREATE (aluminum)-[:HAS_EPD]->(epdReynaers)
CREATE (hvac)-[:HAS_EPD]->(epdDaikin);

// Products to Materials
MATCH (concrete:Product {id: 'prod-concrete-c30'})
MATCH (rebar:Product {id: 'prod-rebar'})
MATCH (clt:Product {id: 'prod-clt'})
MATCH (insulation:Product {id: 'prod-insulation'})
MATCH (glass:Product {id: 'prod-glass'})
MATCH (aluminum:Product {id: 'prod-aluminum'})
MATCH (cement:Material {id: 'mat-cement'})
MATCH (aggregate:Material {id: 'mat-aggregate'})
MATCH (scrap:Material {id: 'mat-scrap'})
MATCH (spruce:Material {id: 'mat-spruce'})
MATCH (basalt:Material {id: 'mat-basalt'})
MATCH (silica:Material {id: 'mat-silica'})
MATCH (cullet:Material {id: 'mat-cullet'})
MATCH (bauxite:Material {id: 'mat-bauxite'})
MATCH (recycledAluminum:Material {id: 'mat-recycled-alu'})
CREATE (concrete)-[:CONTAINS_MATERIAL {percentage: 12}]->(cement)
CREATE (concrete)-[:CONTAINS_MATERIAL {percentage: 45}]->(aggregate)
CREATE (rebar)-[:CONTAINS_MATERIAL {percentage: 95}]->(scrap)
CREATE (clt)-[:CONTAINS_MATERIAL {percentage: 100}]->(spruce)
CREATE (insulation)-[:CONTAINS_MATERIAL {percentage: 97}]->(basalt)
CREATE (glass)-[:CONTAINS_MATERIAL {percentage: 60}]->(silica)
CREATE (glass)-[:CONTAINS_MATERIAL {percentage: 30}]->(cullet)
CREATE (aluminum)-[:CONTAINS_MATERIAL {percentage: 55}]->(bauxite)
CREATE (aluminum)-[:CONTAINS_MATERIAL {percentage: 45}]->(recycledAluminum);

// --- VERIFY DATA ---
MATCH (n) RETURN labels(n)[0] as Type, count(*) as Count ORDER BY Count DESC;

