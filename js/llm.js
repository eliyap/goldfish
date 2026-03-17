import { getApiKey, getProvider } from './auth.js';

const PROVIDERS = {
  'Haiku': {
    model: 'claude-haiku-4-5-20251001',
    call: anthropicCall,
  },
  'Sonnet': {
    model: 'claude-sonnet-4-20250514',
    call: anthropicCall,
  },
  'Opus': {
    model: 'claude-opus-4-20250514',
    call: anthropicCall,
  },
  'OpenAI': {
    model: 'gpt-4o-mini',
    call: openaiCall,
  },
  'OpenAI-Flex': {
    model: 'gpt-4o-mini',
    flex: true,
    call: openaiCall,
  },
};

async function anthropicCall(apiKey, model, messages, opts = {}) {
  const body = { model, max_tokens: 4096, messages };
  if (opts.system) {
    body.system = [{
      type: 'text',
      text: opts.system,
      cache_control: { type: 'ephemeral' },
    }];
  }
  if (opts.tools) body.tools = opts.tools;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

async function openaiCall(apiKey, model, messages, opts = {}) {
  const body = { model, max_tokens: 4096, messages };
  if (opts.flex) body.service_tier = 'flex';
  if (opts.system) messages = [{ role: 'system', content: opts.system }, ...messages];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function chat(messages, { system, tools } = {}) {
  const apiKey = getApiKey();
  const providerName = getProvider();
  if (!apiKey || !providerName) throw new Error('No API key');

  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);

  return provider.call(apiKey, provider.model, messages, { system, tools, flex: provider.flex });
}
