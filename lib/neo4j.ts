import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

/**
 * Get or create the Neo4j driver singleton
 */
export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error(
        'Missing Neo4j environment variables. Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD.'
      );
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

/**
 * Run a Cypher query and return typed results
 */
export async function runQuery<T>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session: Session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

/**
 * Run a Cypher query and return the first result or null
 */
export async function runQuerySingle<T>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const results = await runQuery<T>(cypher, params);
  return results[0] || null;
}

/**
 * Close the Neo4j driver connection
 * Call this on app shutdown
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Verify connection to Neo4j
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const session = getDriver().session();
    await session.run('RETURN 1');
    await session.close();
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
}

