// Graph visualization types

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id: string | number;
  type: string;
  from: string;
  to: string;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

// Stakeholder view types
export type StakeholderView = 'consumer' | 'manufacturer' | 'recycler' | 'regulator';

// Risk analysis types
export interface RiskItem {
  type: 'concentration' | 'expiring_cert' | 'single_source' | 'geographic';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedProducts: string[];
}

// Carbon breakdown types
export interface CarbonBreakdown {
  name: string;
  gwp: number;
  percentage: number;
  children?: CarbonBreakdown[];
}

// Neo4j import types
export interface Neo4jNode {
  label: string;
  properties: Record<string, unknown>;
}

export interface Neo4jRelationship {
  type: string;
  from: string;
  to: string;
  properties?: Record<string, unknown>;
}

// EC3 API types
export interface EC3Product {
  id: string;
  name: string;
  manufacturer: {
    name: string;
    country: string;
  };
  plant_or_group: {
    name: string;
    latitude: number;
    longitude: number;
  };
  gwp: number;
  declared_unit: string;
  epd_url: string;
  valid_until: string;
}

// NVL display types (extended for visualization)
export interface NvlNode {
  id: string;
  labels?: string[];
  properties?: Record<string, unknown>;
  color?: string;
  size?: number;
  caption?: string;
}

export interface NvlRelationship {
  id: string;
  from: string;
  to: string;
  type?: string;
  properties?: Record<string, unknown>;
  color?: string;
  width?: number;
  caption?: string;
}

