# Security

## Architecture

Goldfish is a static site with no server. API keys are entered by the user in the browser and used directly from client-side JavaScript to call LLM provider APIs.

## API key storage

Keys are stored in `sessionStorage`, scoped to the browser tab. They are:

- Cleared when the tab is closed
- Not shared across tabs
- Not written to disk by the browser (unlike `localStorage` or cookies)
- Not sent to any server (the site is static)

The intended flow is for a password manager to fill the key on each visit, so persistent storage is not needed.

## Threat model

**In scope:**
- The site serves no third-party scripts. All JavaScript is first-party.
- API calls go directly from the browser to the provider (Anthropic, OpenAI). No proxy or intermediary.
- The key is never logged, serialized to disk, or transmitted to any endpoint other than the provider API.

**Out of scope / known limitations:**
- A browser extension with access to page JavaScript can read the key from `sessionStorage` or intercept API calls. This is true of any browser-based credential.
- Anyone with physical access to the machine while the tab is open can inspect `sessionStorage` via dev tools.