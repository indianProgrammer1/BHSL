// Progressive enhancement: the journal and navigation work without JavaScript.
for (const block of document.querySelectorAll('.code-block')) {
  if (!navigator.clipboard) continue;
  const button = document.createElement('button');
  button.className = 'copy-button';
  button.type = 'button';
  button.textContent = 'Copy code';
  button.setAttribute('aria-label', 'Copy C++ code to clipboard');
  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  block.querySelector('.code-caption').append(button, status);
  let resetTimer;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(block.querySelector('code').textContent);
      button.textContent = 'Copied';
      status.textContent = 'Code copied to clipboard.';
    } catch {
      button.textContent = 'Select code to copy';
      status.textContent = 'Clipboard access is unavailable. Select the code and copy it manually.';
    }
    resetTimer = setTimeout(() => { button.textContent = 'Copy code'; }, 2500);
  });
}
