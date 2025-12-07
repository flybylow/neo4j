import type { EC3Product } from '@/types/graph';

const EC3_BASE_URL = 'https://buildingtransparency.org/api';

/**
 * Search for products in the EC3 database
 * @param category - Product category (e.g., 'Concrete', 'Steel', 'Insulation')
 * @param country - Optional country filter (e.g., 'BE' for Belgium)
 */
export async function searchEC3Products(
  category: string,
  country?: string
): Promise<EC3Product[]> {
  const apiKey = process.env.EC3_API_KEY;

  if (!apiKey) {
    console.warn('EC3_API_KEY not set. Using mock data.');
    return getMockProducts(category);
  }

  const params = new URLSearchParams({
    category,
    ...(country && { country }),
  });

  const response = await fetch(`${EC3_BASE_URL}/epds?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`EC3 API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific EPD by ID
 */
export async function getEC3Product(epdId: string): Promise<EC3Product | null> {
  const apiKey = process.env.EC3_API_KEY;

  if (!apiKey) {
    console.warn('EC3_API_KEY not set.');
    return null;
  }

  const response = await fetch(`${EC3_BASE_URL}/epds/${epdId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

/**
 * Mock data for development without EC3 API key
 */
function getMockProducts(category: string): EC3Product[] {
  const mockData: Record<string, EC3Product[]> = {
    Concrete: [
      {
        id: 'ec3-concrete-001',
        name: 'ECOPact Low Carbon Concrete C30/37',
        manufacturer: { name: 'Holcim Belgium', country: 'Belgium' },
        plant_or_group: { name: 'Obourg Plant', latitude: 50.4667, longitude: 3.9667 },
        gwp: 285,
        declared_unit: 'm³',
        epd_url: 'https://example.com/epd/holcim-concrete',
        valid_until: '2029-01-15',
      },
    ],
    Steel: [
      {
        id: 'ec3-steel-001',
        name: 'Recycled Steel Rebar B500B',
        manufacturer: { name: 'ArcelorMittal', country: 'Luxembourg' },
        plant_or_group: { name: 'Gent Steelworks', latitude: 51.0833, longitude: 3.7167 },
        gwp: 0.87,
        declared_unit: 'kg',
        epd_url: 'https://example.com/epd/arcelor-rebar',
        valid_until: '2029-03-01',
      },
    ],
    Insulation: [
      {
        id: 'ec3-insulation-001',
        name: 'Rockwool FlexiBatts',
        manufacturer: { name: 'Rockwool', country: 'Belgium' },
        plant_or_group: { name: 'Roermond Plant', latitude: 51.1917, longitude: 5.9875 },
        gwp: 1.2,
        declared_unit: 'm²',
        epd_url: 'https://example.com/epd/rockwool-flexi',
        valid_until: '2028-06-01',
      },
    ],
    Glass: [
      {
        id: 'ec3-glass-001',
        name: 'AGC Planibel Clearvision',
        manufacturer: { name: 'AGC Glass Europe', country: 'Belgium' },
        plant_or_group: { name: 'Mol Plant', latitude: 51.1833, longitude: 5.1167 },
        gwp: 12.5,
        declared_unit: 'm²',
        epd_url: 'https://example.com/epd/agc-glass',
        valid_until: '2028-09-01',
      },
    ],
    Wood: [
      {
        id: 'ec3-wood-001',
        name: 'CLT Panel 120mm',
        manufacturer: { name: 'Stora Enso', country: 'Finland' },
        plant_or_group: { name: 'Ybbs CLT Plant', latitude: 48.1667, longitude: 15.0833 },
        gwp: -718,
        declared_unit: 'm³',
        epd_url: 'https://example.com/epd/storaenso-clt',
        valid_until: '2028-09-01',
      },
    ],
  };

  return mockData[category] || [];
}

