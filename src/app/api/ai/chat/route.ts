export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { retrieveRelevantProducts } from '@/lib/ai/retriever';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'sk-...') throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: key });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId: _sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Get the latest user message for retrieval
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const query = lastUserMsg?.content ?? '';

    // RAG: retrieve relevant products
    let productContext = '';
    if (query) {
      try {
        const products = await retrieveRelevantProducts(query, 5);
        if (products.length > 0) {
          productContext = '\n\n---\nVerified Product Data (from DPP blockchain):\n' +
            products.map(p =>
              `- ${p.name}: $${p.price} — ${p.description.slice(0, 100)}... (relevance: ${(p.similarity * 100).toFixed(0)}%)`
            ).join('\n');
        }
      } catch {
        // Continue without RAG if embeddings unavailable
      }
    }

    const systemPrompt = `You are a verified product advisor for WellKOC, a Web3 Social Commerce platform.
You help customers find products, answer questions, and facilitate purchases.

Rules:
- Only recommend products with verified Digital Product Passports (DPP)
- Never claim product properties not verified in the DPP data
- If asked about something outside your knowledge, say so honestly
- Keep responses concise and helpful
- When a customer wants to buy, suggest using the "Add to Cart" button
${productContext}`;

    // Stream response
    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // limit context window
      ],
      max_tokens: 800,
      stream: true,
    });

    // Convert to ReadableStream for Vercel AI SDK compatibility
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content ?? '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
