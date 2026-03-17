const STORE_KEY = 'goldfish_api_key';
const STORE_PROVIDER = 'goldfish_provider';

export function getApiKey() {
  return sessionStorage.getItem(STORE_KEY);
}

export function getProvider() {
  return sessionStorage.getItem(STORE_PROVIDER);
}

export function isLoggedIn() {
  return !!(getApiKey() && getProvider());
}

export function login(provider, apiKey) {
  sessionStorage.setItem(STORE_KEY, apiKey);
  sessionStorage.setItem(STORE_PROVIDER, provider);
}

export function logout() {
  sessionStorage.removeItem(STORE_KEY);
  sessionStorage.removeItem(STORE_PROVIDER);
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = './';
    return false;
  }
  return true;
}

export async function validate(provider, apiKey) {
  if (provider === 'Haiku' || provider === 'Sonnet' || provider === 'Opus') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic ${res.status}: ${body}`);
    }
  } else if (provider === 'OpenAI' || provider === 'OpenAI-Flex') {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI ${res.status}: ${body}`);
    }
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}
