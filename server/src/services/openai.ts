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
  return process.env.OPENAI_MODEL || 'gpt-4o';
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

  log(`📤 CALL #${id} → ${model}`, {
    system: systemPrompt.slice(0, 300) + (systemPrompt.length > 300 ? '...' : ''),
    user: userMessage.slice(0, 300) + (userMessage.length > 300 ? '...' : ''),
  });

  const start = Date.now();
  const response = await getClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content ?? '';
  const ms = Date.now() - start;
  const usage = response.usage;

  log(`📥 RESPONSE #${id} (${ms}ms) tokens: ${usage?.prompt_tokens}→${usage?.completion_tokens}`,
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

  log(`📤 CALL #${id} [JSON] → ${model}`, {
    system: systemPrompt.slice(0, 300) + (systemPrompt.length > 300 ? '...' : ''),
    user: userMessage.slice(0, 300) + (userMessage.length > 300 ? '...' : ''),
  });

  const start = Date.now();
  const response = await getClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  const ms = Date.now() - start;
  const usage = response.usage;

  log(`📥 RESPONSE #${id} [JSON] (${ms}ms) tokens: ${usage?.prompt_tokens}→${usage?.completion_tokens}`,
    content.slice(0, 800) + (content.length > 800 ? '...' : '')
  );

  return JSON.parse(content) as T;
}
