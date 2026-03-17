import { isLoggedIn, logout, requireAuth } from './auth.js';

export function shell({ title, auth = true }) {
  // Set document title
  document.title = title ? `${title} - Goldfish` : 'Goldfish';

  // Build header
  const header = document.createElement('header');
  const h1 = document.createElement('h1');

  if (title) {
    const a = document.createElement('a');
    a.href = './';
    a.textContent = 'Goldfish';
    h1.append(a, ' / ' + title);
  } else {
    h1.textContent = 'Goldfish';
  }

  header.append(h1);

  if (isLoggedIn()) {
    const btn = document.createElement('button');
    btn.id = 'logout-btn';
    btn.textContent = 'Logout';
    btn.addEventListener('click', () => {
      logout();
      window.location.href = './';
    });
    header.append(btn);
  }

  // Insert header at start of #app
  const app = document.getElementById('app');
  app.prepend(header);

  // Auth gate for sub-pages
  if (auth && !isLoggedIn()) {
    requireAuth();
    return false;
  }

  return true;
}
