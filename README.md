# Glass Haus - Construction DPP Demo

Interactive knowledge graph visualization for construction Digital Product Passports. Explore building materials, supply chains, and environmental impact using Neo4j and real EPD data.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

## Features

- 🏢 **Interactive Graph Visualization** - Explore building materials and supply chains using Neo4j NVL
- 👥 **Multi-Stakeholder Views** - Consumer, Manufacturer, Recycler, and Regulator perspectives
- 🌱 **Carbon Analysis** - Track embodied carbon (GWP) across building elements
- 🛡️ **Risk Intelligence** - Supply chain risk analysis and alerts
- 📋 **EPD Integration** - Real Environmental Product Declaration data

## Getting Started

### Prerequisites

- Node.js 18+
- Neo4j AuraDB instance (free tier available)

### 1. Clone and Install

```bash
cd /Users/warddem/dev/neo4j
npm install
```

### 2. Configure Environment

Create a `.env.local` file with your Neo4j credentials:

```env
# Neo4j AuraDB Connection
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password-here

# EC3 API Key (optional - for fetching real EPD data)
EC3_API_KEY=
```

### 3. Load Demo Data

Open your Neo4j Aura Console or Neo4j Browser and run the Cypher script:

```bash
# The demo data script is located at:
scripts/demo-data.cypher
```

Copy and paste the entire script into Neo4j Browser and execute it.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
neo4j/
├── app/
│   ├── api/graph/           # API routes for Neo4j queries
│   │   ├── building/[id]/   # Get building graph
│   │   ├── carbon/[id]/     # Carbon analysis
│   │   ├── risks/[id]/      # Risk analysis
│   │   └── expand/[id]/     # Node expansion
│   ├── building/[id]/       # Building explorer page
│   └── page.tsx             # Landing page
├── components/
│   ├── graph/               # Graph visualization components
│   │   ├── BaseGraph.tsx    # NVL wrapper
│   │   ├── BuildingExplorer.tsx
│   │   ├── CarbonTreemap.tsx
│   │   └── SupplyChainRisk.tsx
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── neo4j.ts             # Neo4j driver
│   ├── ec3-client.ts        # EC3 API client
│   └── transform-epd.ts     # Data transformation
├── types/
│   └── graph.ts             # TypeScript types
└── scripts/
    └── demo-data.cypher     # Demo data import script
```

## Neo4j Schema

### Node Types

| Label | Description |
|-------|-------------|
| `Building` | Top-level building container |
| `BuildingElement` | Foundation, Structure, Envelope, Systems |
| `Product` | Construction materials with EPD data |
| `Manufacturer` | Companies producing products |
| `Plant` | Manufacturing facilities |
| `Certification` | EPD, FSC, and other certifications |
| `Material` | Raw material composition |
| `Location` | Geographic locations |

### Relationship Types

| Relationship | Description |
|--------------|-------------|
| `COMPOSED_OF` | Building → BuildingElement |
| `USES_PRODUCT` | BuildingElement → Product |
| `SUPPLIED_BY` | Product → Manufacturer |
| `MANUFACTURED_AT` | Product → Plant |
| `HAS_EPD` | Product → Certification |
| `CERTIFIED_BY` | Product → Certification |
| `CONTAINS_MATERIAL` | Product → Material |
| `LOCATED_IN` | Plant/Manufacturer → Location |

## API Endpoints

### GET `/api/graph/building/[id]`

Fetch building knowledge graph.

**Query Parameters:**
- `depth` (default: 2) - Relationship traversal depth
- `view` (consumer | manufacturer | recycler | regulator) - Stakeholder view filter

### GET `/api/graph/carbon/[id]`

Get carbon breakdown by building element category.

### GET `/api/graph/risks/[id]`

Get supply chain risk analysis.

### GET `/api/graph/expand/[id]`

Expand a node to show connected nodes (for click-to-expand).

## Data Sources

- **EC3** - Building Transparency's Embodied Carbon in Construction Calculator
- **ÖKOBAUDAT** - German federal EPD database
- **IBU EPD** - European EPD data

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Neo4j AuraDB** - Cloud graph database
- **NVL** - Neo4j Visualization Library for React
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - UI components

## License

MIT
