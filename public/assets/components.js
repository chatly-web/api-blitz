// Small DOM components. Provider data is inserted as text, never executable HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function renderApiList(container, apis, selected, onChange) {
  container.replaceChildren(element('legend', 'sr-only', 'Available event APIs'));
  apis.forEach(api => {
    const label = element('label', 'api-row');
    const checkbox = element('input');
    checkbox.type = 'checkbox'; checkbox.value = api.id; checkbox.checked = selected.has(api.id);
    checkbox.addEventListener('change', () => onChange(api.id, checkbox.checked));
    const copy = element('span', 'api-copy');
    copy.append(element('strong', '', api.name), element('span', '', api.description));
    label.append(checkbox, copy, element('span', 'sample', api.mode === 'mock' ? 'Mock' : 'Live'));
    container.append(label);
  });
}
export function updateApiSelection(container, selected, busy) {
  container.querySelectorAll('input[type=checkbox]').forEach(input => {
    input.checked = selected.has(input.value);
    input.disabled = busy || (selected.size >= 3 && !input.checked);
    input.closest('label').classList.toggle('selected', input.checked);
  });
}
export function renderResults(container, payload) {
  container.replaceChildren();
  const list = element('div', 'result-list');
  payload.results.forEach(result => {
    const row = element('article', 'result-row');
    const heading = element('div', 'section-title');
    heading.append(element('h3', '', result.name), element('span', result.status === 'success' ? 'result-ok' : 'result-error', result.status === 'success' ? `${result.data.mode} · ${result.durationMs} ms` : 'Failed'));
    row.append(heading, element('p', '', result.status === 'success' ? result.data.summary : result.error));
    if (result.status === 'success') {
      const details = element('details');
      const pre = element('pre');
      pre.append(element('code', '', JSON.stringify(result.data.data ?? {}, null, 2)));
      details.append(element('summary', '', 'Inspect response'), pre);
      row.append(details);
    }
    list.append(row);
  });
  container.append(list);
  const combined = element('div', 'combined-view');
  combined.append(element('h3', '', payload.solution?.title ?? 'Combined result unavailable'));
  combined.append(element('p', '', payload.solution?.summary ?? payload.message));
  if (payload.solution) {
    const contributions = element('ul');
    payload.solution.contributions.forEach(item => contributions.append(element('li', '', `${item.apiId}: ${item.summary}`)));
    combined.append(contributions, element('p', 'next-step', payload.solution.nextStep));
  }
  container.append(combined);
}
