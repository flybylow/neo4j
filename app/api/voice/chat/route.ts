import { NextRequest, NextResponse } from 'next/server';
import { generateCypherFromQuestion, formatResponseWithData } from '@/lib/voice/cypher-generator';
import { runQuery } from '@/lib/neo4j';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Voice chat received:', message);

    // Step 1: Generate Cypher query from natural language
    const queryResult = await generateCypherFromQuestion(message);
    console.log('Generated query:', queryResult);

    // Step 2: Execute the query if we have one
    let dbResults: Record<string, unknown>[] = [];
    if (queryResult.cypher) {
      try {
        dbResults = await runQuery<Record<string, unknown>>(queryResult.cypher);
        console.log('Query results:', dbResults);
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with empty results - the response will handle it
      }
    }

    // Step 3: Format the response with the data
    const response = await formatResponseWithData(
      queryResult.naturalResponse,
      dbResults
    );

    return NextResponse.json({
      response,
      intent: queryResult.intent,
      cypher: queryResult.cypher,
      resultCount: dbResults.length,
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process voice chat',
        response: "I'm having trouble processing that request. Please try again.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

