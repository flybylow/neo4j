import { v4 as uuid } from 'uuid';
import type { EC3Product, Neo4jNode, Neo4jRelationship } from '@/types/graph';

/**
 * Transform EC3 product data into Neo4j nodes and relationships
 */
export function transformEC3ToGraph(ec3Product: EC3Product): {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
} {
  const productId = `product-${uuid()}`;
  const manufacturerId = `manufacturer-${slugify(ec3Product.manufacturer.name)}`;
  const plantId = `plant-${uuid()}`;
  const certificationId = `cert-${uuid()}`;
  const locationId = `location-${slugify(ec3Product.manufacturer.country)}`;

  const nodes: Neo4jNode[] = [
    {
      label: 'Product',
      properties: {
        id: productId,
        name: ec3Product.name,
        gwp: ec3Product.gwp,
        declaredUnit: ec3Product.declared_unit,
        epdNumber: ec3Product.id,
      },
    },
    {
      label: 'Manufacturer',
      properties: {
        id: manufacturerId,
        name: ec3Product.manufacturer.name,
        country: ec3Product.manufacturer.country,
        did: `did:web:${slugify(ec3Product.manufacturer.name)}.example.com`,
      },
    },
    {
      label: 'Plant',
      properties: {
        id: plantId,
        name: ec3Product.plant_or_group.name,
        latitude: ec3Product.plant_or_group.latitude,
        longitude: ec3Product.plant_or_group.longitude,
      },
    },
    {
      label: 'Certification',
      properties: {
        id: certificationId,
        name: 'Environmental Product Declaration',
        type: 'EPD',
        issuer: 'EC3',
        validUntil: ec3Product.valid_until,
      },
    },
    {
      label: 'Location',
      properties: {
        id: locationId,
        country: ec3Product.manufacturer.country,
      },
    },
  ];

  const relationships: Neo4jRelationship[] = [
    { type: 'SUPPLIED_BY', from: productId, to: manufacturerId },
    { type: 'MANUFACTURED_AT', from: productId, to: plantId },
    { type: 'HAS_EPD', from: productId, to: certificationId },
    { type: 'LOCATED_IN', from: plantId, to: locationId },
    { type: 'LOCATED_IN', from: manufacturerId, to: locationId },
  ];

  return { nodes, relationships };
}

/**
 * Transform multiple EC3 products, deduplicating shared entities
 */
export function transformMultipleEC3Products(products: EC3Product[]): {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
} {
  const allNodes: Neo4jNode[] = [];
  const allRelationships: Neo4jRelationship[] = [];
  const seenNodeIds = new Set<string>();

  for (const product of products) {
    const { nodes, relationships } = transformEC3ToGraph(product);

    for (const node of nodes) {
      const nodeId = node.properties.id as string;
      if (!seenNodeIds.has(nodeId)) {
        allNodes.push(node);
        seenNodeIds.add(nodeId);
      }
    }

    allRelationships.push(...relationships);
  }

  return { nodes: allNodes, relationships: allRelationships };
}

/**
 * Generate Cypher MERGE statements for importing nodes
 */
export function generateNodeCypher(node: Neo4jNode): string {
  const propsString = Object.entries(node.properties)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .join(', ');

  return `MERGE (n:${node.label} {id: "${node.properties.id}"}) SET n += {${propsString}}`;
}

/**
 * Generate Cypher MERGE statements for importing relationships
 */
export function generateRelationshipCypher(rel: Neo4jRelationship): string {
  const propsString = rel.properties
    ? ` {${Object.entries(rel.properties)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}: "${value.replace(/"/g, '\\"')}"`;
          }
          return `${key}: ${value}`;
        })
        .join(', ')}}`
    : '';

  return `MATCH (a {id: "${rel.from}"}), (b {id: "${rel.to}"}) MERGE (a)-[:${rel.type}${propsString}]->(b)`;
}

/**
 * Convert text to URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

