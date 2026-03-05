export function initRejectionReasonsUI(): void {
  const container = document.getElementById('rejectionReasonsChips');
  const addBtn = document.getElementById('addRejectionReasonBtn');
  const input = document.getElementById('newRejectionReasonInput') as HTMLInputElement;
  const dataInput = document.getElementById('rejectionReasonsData') as HTMLInputElement;

  if (!container || !addBtn || !input || !dataInput) return;

  const getReasons = (): string[] => JSON.parse(dataInput.value || '[]');
  const setReasons = (reasons: string[]) => {
    dataInput.value = JSON.stringify(reasons);
  };

  const wireChipRemove = () => {
    container.querySelectorAll('.rejection-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt((chip as HTMLElement).dataset.index || '0', 10);
        const reasons = getReasons();
        reasons.splice(idx, 1);
        setReasons(reasons);
        renderChips(reasons);
      });
    });
  };

  const renderChips = (reasons: string[]) => {
    container.innerHTML = reasons.map((reason, i) => `
      <span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2 rejection-chip"
        style="font-size:0.85rem;cursor:pointer;" data-index="${i}">
        ${reason}
        <i class="bi bi-x-circle ms-1 text-danger"></i>
      </span>
    `).join('');
    wireChipRemove();
  };

  wireChipRemove();

  const addReason = () => {
    const val = input.value.trim();
    if (!val) return;
    const reasons = getReasons();
    if (reasons.includes(val)) return;
    reasons.push(val);
    setReasons(reasons);
    renderChips(reasons);
    input.value = '';
  };

  addBtn.addEventListener('click', addReason);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addReason();
    }
  });
}
