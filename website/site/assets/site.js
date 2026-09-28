(() => {
  'use strict';
  const search = document.querySelector('#paper-search');
  const year = document.querySelector('#paper-year');
  const topic = document.querySelector('#paper-topic');
  const rows = [...document.querySelectorAll('[data-publication]')];
  const count = document.querySelector('#result-count');
  function filter() {
    const query = search.value.toLowerCase().trim();
    let shown = 0;
    rows.forEach(row => {
      const matches = (!query || row.dataset.search.includes(query)) && (!year.value || row.dataset.year === year.value) && (!topic.value || row.dataset.topic === topic.value);
      row.hidden = !matches;
      if (matches) shown++;
    });
    count.textContent = `${shown} of ${rows.length} publications`;
    document.querySelector('#no-results').hidden = shown > 0;
  }
  if (search) {
    document.querySelector('.filters').hidden = false;
    search.addEventListener('input', filter);
    year.addEventListener('change', filter);
    topic.addEventListener('change', filter);
    document.querySelector('#reset-filters').addEventListener('click', () => { search.value = ''; year.value = ''; topic.value = ''; filter(); search.focus(); });
    filter();
  }
  document.querySelectorAll('[data-copy-bib]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const text = button.parentElement.querySelector('pre').textContent;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy BibTeX'; }, 2000);
      } catch {
        button.textContent = 'Select the citation above to copy';
      }
    });
  });
  const printButton = document.querySelector('#print-cv');
  if (printButton) { printButton.hidden = false; printButton.addEventListener('click', () => window.print()); }
})();
