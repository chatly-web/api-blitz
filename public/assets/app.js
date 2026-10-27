import { renderApiList, updateApiSelection, renderResults } from './components.js';
const $ = selector => document.querySelector(selector);
const storageKey = 'api-blitz:event-brief:v1';
const fields = ['project-title', 'audience', 'problem', 'success'];
const selected = new Set();
let apis = [];
let busy = false;
let hasRun = false;
let savedSelection = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  fields.forEach(id => { if (typeof saved[id] === 'string') $(`#${id}`).value = saved[id].slice(0, $(`#${id}`).maxLength); });
  if (Array.isArray(saved.selectedApiIds)) savedSelection = saved.selectedApiIds;
} catch { $('#save-note').textContent = 'Browser storage is unavailable. You can still use and export your brief.'; }
function brief() {
  return { ...Object.fromEntries(fields.map(id => [id, $(`#${id}`).value])), selectedApiIds: [...selected] };
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(brief())); }
  catch { $('#save-note').textContent = 'Browser storage is unavailable. Export your brief to keep a copy.'; }
}
function update() {
  $('#selection-count').textContent = `${selected.size} / 3 selected`;
  const ready = selected.size === 3 && $('#problem').value.trim().length > 0;
  $('#run').disabled = busy || !ready;
  $('#run-help').textContent = busy ? 'Running the three selected adapters…' : ready ? 'All adapters currently use mock data. No external API is called.' : 'Choose three APIs and enter a problem to continue.';
  updateApiSelection($('#api-list'), selected, busy);
}
function invalidate() {
  if (hasRun) {
    $('#run-status').textContent = 'The brief or selection changed. Run again to update the results.';
    $('#result-mode').textContent = 'Previous run';
  }
  update(); save();
}
fields.forEach(id => $(`#${id}`).addEventListener('input', invalidate));
async function loadCatalog() {
  $('#retry-catalog').hidden = true;
  try {
    const response = await fetch('/api/catalog', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Catalog failed');
    const payload = await response.json();
    if (!Array.isArray(payload.apis) || payload.apis.length !== 5) throw new Error('Invalid catalog');
    apis = payload.apis;
    savedSelection.filter(id => apis.some(api => api.id === id)).slice(0, 3).forEach(id => selected.add(id));
    renderApiList($('#api-list'), apis, selected, (id, checked) => {
      if (checked && selected.size < 3) selected.add(id); else selected.delete(id);
      invalidate();
    });
    update();
  } catch {
    $('#api-list').textContent = 'Could not load the API slots. Check your connection and retry.';
    $('#retry-catalog').hidden = false;
  }
}
$('#retry-catalog').addEventListener('click', loadCatalog);
$('#solution-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || selected.size !== 3 || !$('#problem').value.trim()) return;
  busy = true; update();
  $('#results').setAttribute('aria-busy', 'true');
  $('#run').textContent = 'Running…';
  $('#run-status').textContent = 'Checking the three selected adapters…';
  fields.forEach(id => { $(`#${id}`).disabled = true; });
  try {
    const response = await fetch('/api/run', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedApiIds: [...selected], input: $('#problem').value.trim() }),
      signal: AbortSignal.timeout(20000),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'The wiring check failed. Try again.');
    renderResults($('#result-content'), payload);
    hasRun = true;
    $('#result-mode').textContent = payload.status === 'success' ? `${payload.mode === 'mock' ? 'Mock' : 'Live'} run complete` : 'Incomplete run';
    $('#run-status').textContent = payload.status === 'success' ? 'Three adapters completed. Inspect the results below.' : payload.message;
  } catch (error) {
    $('#run-status').textContent = error.name === 'TimeoutError' ? 'The check timed out. Please try again.' : error.message === 'Failed to fetch' ? 'Could not reach the server. Check your connection and try again.' : error.message;
    $('#result-mode').textContent = 'Run failed';
  } finally {
    busy = false; fields.forEach(id => { $(`#${id}`).disabled = false; });
    $('#results').setAttribute('aria-busy', 'false');
    $('#run').textContent = 'Run wiring check →';
    update();
  }
});
$('#export-brief').addEventListener('click', () => {
  const payload = { ...brief(), stage: 'pre-event', note: 'All API slots are placeholders. Event rules are pending.' };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'api-blitz-brief.json'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#export-status').textContent = 'Preparation brief downloaded as JSON.';
});
loadCatalog();
