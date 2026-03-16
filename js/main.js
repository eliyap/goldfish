const STORE_KEY = 'goldfish_api_key';
const STORE_PROVIDER = 'goldfish_provider';

const loginForm = document.getElementById('login-form');
const mainEl = document.getElementById('main');
const askForm = document.getElementById('ask-form');
const questionEl = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const answerEl = document.getElementById('answer');
const lockBtn = document.getElementById('lock-btn');
const usernameEl = document.getElementById('username');

// --- Auth ---

function unlock(provider, apiKey) {
  localStorage.setItem(STORE_KEY, apiKey);
  localStorage.setItem(STORE_PROVIDER, provider);
  loginForm.hidden = true;
  mainEl.hidden = false;
  questionEl.focus();
}

function lock() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(STORE_PROVIDER);
  mainEl.hidden = true;
  loginForm.hidden = false;
  answerEl.textContent = '';
}

// Auto-unlock if key already stored
const savedKey = localStorage.getItem(STORE_KEY);
const savedProvider = localStorage.getItem(STORE_PROVIDER);
if (savedKey && savedProvider) {
  unlock(savedProvider, savedKey);
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const provider = usernameEl.value.trim();
  const key = document.getElementById('api-key').value.trim();
  if (key && provider) unlock(provider, key);
});

lockBtn.addEventListener('click', lock);

// --- LLM ---

const PROVIDERS = {
  'Claude': {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    call: anthropicCall,
  },
  'OpenAI': {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    call: openaiCall,
  },
  'OpenAI-Flex': {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    flex: true,
    call: openaiCall,
  },
};

async function anthropicCall(apiKey, model, messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: 1024, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content.map(b => b.text).join('');
}

async function openaiCall(apiKey, model, messages, opts = {}) {
  const body = { model, max_tokens: 1024, messages };
  if (opts.flex) body.service_tier = 'flex';
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

async function ask(question) {
  const apiKey = localStorage.getItem(STORE_KEY);
  const providerName = localStorage.getItem(STORE_PROVIDER);
  if (!apiKey || !providerName) throw new Error('No API key');

  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);

  const messages = [{ role: 'user', content: question }];
  return provider.call(apiKey, provider.model, messages, { flex: provider.flex });
}

// --- UI ---

askForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = questionEl.value.trim();
  if (!q) return;

  askBtn.disabled = true;
  answerEl.textContent = '...';

  try {
    answerEl.textContent = await ask(q);
  } catch (err) {
    answerEl.textContent = 'Error: ' + err.message;
  } finally {
    askBtn.disabled = false;
  }
});
