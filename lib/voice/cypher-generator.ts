import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Neo4j schema context for the LLM
const SCHEMA_CONTEXT = `
You are a Neo4j Cypher query expert for a building materials knowledge graph called "Glass Haus".

DATABASE SCHEMA:
- Building (id, name, address, type, completionDate, totalGWP)
- BuildingElement (id, name, category: Foundation|Structure|Envelope|Systems)
- Product (id, name, gtin, gwp, declaredUnit, quantity, epdNumber, recycledContent, category)
- Manufacturer (id, name, did, website, country)
- Plant (id, name, address, latitude, longitude)
- Certification (id, name, type, issuer, validFrom, validUntil)
- Material (id, name, recycledContent, category)
- Location (id, country, region)

RELATIONSHIPS:
- (Building)-[:COMPOSED_OF]->(BuildingElement)
- (BuildingElement)-[:USES_PRODUCT]->(Product)
- (Product)-[:SUPPLIED_BY]->(Manufacturer)
- (Product)-[:MANUFACTURED_AT]->(Plant)
- (Product)-[:HAS_EPD]->(Certification)
- (Product)-[:CERTIFIED_BY]->(Certification)
- (Product)-[:CONTAINS_MATERIAL]->(Material)
- (Plant)-[:LOCATED_IN]->(Location)
- (Manufacturer)-[:LOCATED_IN]->(Location)

IMPORTANT PRODUCT DATA:
- CLT Panel 120mm: gwp = -718 (negative = carbon sequestration, wood stores CO2)
- ECOPact Concrete C30/37: gwp = 285 kg CO2e per m³
- Recycled Steel Rebar B500B: gwp = 0.87 kg CO2e per kg, 95% recycled
- Rockwool FlexiBatts 037: gwp = 1.2 kg CO2e per m²
- AGC Planibel Clearvision (glass): gwp = 12.5 kg CO2e per m²
- Reynaers CS 77 Frames (aluminum): gwp = 18.3 kg CO2e per m
- Daikin VRV IV Heat Pump: gwp = 2450 kg CO2e per unit

The main building ID is: building-001
`;

export interface QueryResult {
  cypher: string;
  intent: string;
  naturalResponse: string;
}

export async function generateCypherFromQuestion(question: string): Promise<QueryResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${SCHEMA_CONTEXT}

USER QUESTION: "${question}"

Respond with a JSON object containing:
1. "cypher": The Cypher query to answer this question (use building-001 as the building ID)
2. "intent": A brief description of what the user wants (2-5 words)
3. "naturalResponse": A template for the response with {{result}} placeholder where the query result will go

Example response format:
{
  "cypher": "MATCH (b:Building {id: 'building-001'})-[:COMPOSED_OF]->(e:BuildingElement)-[:USES_PRODUCT]->(p:Product) RETURN sum(p.gwp * coalesce(p.quantity, 1)) as totalGWP",
  "intent": "total carbon footprint",
  "naturalResponse": "The total carbon footprint of Glass Haus is {{result}} kg CO2 equivalent."
}

If the question cannot be answered with the database, return:
{
  "cypher": null,
  "intent": "unknown",
  "naturalResponse": "I can help you with questions about Glass Haus building materials, carbon footprint, suppliers, and certifications. What would you like to know?"
}

Return ONLY the JSON object, no markdown or explanation.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    return JSON.parse(content.text) as QueryResult;
  } catch {
    return {
      cypher: '',
      intent: 'parse_error',
      naturalResponse: "I didn't quite understand that. Could you rephrase your question about Glass Haus?",
    };
  }
}

export async function formatResponseWithData(
  template: string,
  queryResults: Record<string, unknown>[]
): Promise<string> {
  // If no results, return a helpful message
  if (!queryResults || queryResults.length === 0) {
    return template.replace('{{result}}', 'no data found');
  }

  // For simple single-value results
  if (queryResults.length === 1) {
    const result = queryResults[0];
    const values = Object.values(result);
    
    // Handle Neo4j Integer objects
    const formattedValue = values
      .map((v) => {
        if (typeof v === 'object' && v !== null && 'low' in v) {
          return Number((v as { low: number }).low).toLocaleString();
        }
        if (typeof v === 'number') {
          return v.toLocaleString();
        }
        return String(v);
      })
      .join(', ');

    return template.replace('{{result}}', formattedValue);
  }

  // For multiple results, use Claude to format nicely
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Format this database result into a natural, conversational response. Be concise but informative.

Template: "${template}"
Data: ${JSON.stringify(queryResults, null, 2)}

Return ONLY the formatted response text, nothing else.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return template.replace('{{result}}', JSON.stringify(queryResults));
  }

  return content.text;
}

