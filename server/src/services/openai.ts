import OpenAI from 'openai';

let openai: OpenAI;
let callCount = 0;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-5.2';
}

function log(label: string, data: unknown) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`[${timestamp}] ${label}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const id = ++callCount;
  const model = getModel();

  log(`📤 CALL #${id} → ${model} [Responses API]`, {
    instructions: systemPrompt.slice(0, 300) + (systemPrompt.length > 300 ? '...' : ''),
    input: userMessage.slice(0, 300) + (userMessage.length > 300 ? '...' : ''),
  });

  const start = Date.now();
  const response = await getClient().responses.create({
    model,
    instructions: systemPrompt,
    input: userMessage,
    reasoning: {
      effort: 'low'
    },
    // Note: verbosity parameter removed due to TypeScript SDK type limitations
  });

  const content = response.output_text ?? '';
  const ms = Date.now() - start;
  const usage = response.usage;

  log(`📥 RESPONSE #${id} (${ms}ms) tokens: ${usage?.input_tokens}→${usage?.output_tokens}`,
    content.slice(0, 500) + (content.length > 500 ? '...' : '')
  );

  return content;
}

export async function jsonCompletion<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const id = ++callCount;
  const model = getModel();

  // JSON mode requires mentioning 'json' in the input
  const jsonInput = userMessage + '\n\nRespond with valid JSON.';

  log(`📤 CALL #${id} [JSON] → ${model} [Responses API]`, {
    instructions: systemPrompt.slice(0, 300) + (systemPrompt.length > 300 ? '...' : ''),
    input: jsonInput.slice(0, 300) + (jsonInput.length > 300 ? '...' : ''),
  });

  const start = Date.now();
  const response = await getClient().responses.create({
    model,
    instructions: systemPrompt,
    input: jsonInput,
    reasoning: {
      effort: 'low'
    },
    text: {
      // Note: verbosity parameter removed due to TypeScript SDK type limitations
      format: { type: 'json_object' }
    },
  });

  const content = response.output_text ?? '{}';
  const ms = Date.now() - start;
  const usage = response.usage;

  log(`📥 RESPONSE #${id} [JSON] (${ms}ms) tokens: ${usage?.input_tokens}→${usage?.output_tokens}`,
    content.slice(0, 800) + (content.length > 800 ? '...' : '')
  );

  return JSON.parse(content) as T;
}
