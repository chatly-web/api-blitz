'use strict';
const samples = {
  hello: { message: 'Hello from API Blitz!', status: 'ready', next_step: 'Build something great.' },
  project: { name: 'api-blitz', stack: ['HTML', 'CSS', 'JavaScript'], ready_for: ['GitHub', 'Vercel'] },
  ideas: { ideas: ['Build a weather dashboard', 'Explore a public API', 'Create your own API'], start_small: true }
};
const form = document.querySelector('#request-form');
const send = document.querySelector('#send');
const status = document.querySelector('#status');
const output = document.querySelector('#response code');
const copy = document.querySelector('#copy');
let copyTimer;
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  send.disabled = true;
  send.textContent = 'Sending…';
  status.textContent = 'Loading sample…';
  await new Promise(resolve => setTimeout(resolve, 350));
  output.textContent = JSON.stringify(samples[document.querySelector('#endpoint').value], null, 2);
  status.textContent = '200 OK · sample response';
  send.disabled = false;
  send.textContent = 'Send ↗';
  copy.textContent = 'Copy JSON';
});
copy.addEventListener('click', async () => {
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = 'Copied!';
    status.textContent = 'JSON copied to clipboard';
  } catch {
    copy.textContent = 'Select JSON to copy';
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'JSON selected. Press Ctrl+C or Command+C.';
  }
  copyTimer = setTimeout(() => { copy.textContent = 'Copy JSON'; }, 2500);
});
