export function initAppointmentReasonsUI(): void {
  const container = document.getElementById('appointmentReasonsChips');
  const addBtn = document.getElementById('addAppointmentReasonBtn');
  const input = document.getElementById('newAppointmentReasonInput') as HTMLInputElement;
  const dataInput = document.getElementById('appointmentReasonsData') as HTMLInputElement;

  if (!container || !addBtn || !input || !dataInput) return;

  const getReasons = (): string[] => JSON.parse(dataInput.value || '[]');
  const setReasons = (reasons: string[]) => {
    dataInput.value = JSON.stringify(reasons);
  };

  const wireChipRemove = () => {
    container.querySelectorAll('.appointment-reason-chip').forEach(chip => {
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
      <span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2 appointment-reason-chip"
        style="font-size:0.85rem;cursor:pointer;" data-index="${i}">
        ${reason}
        <i class="bi bi-x-circle ms-1 text-danger"></i>
      </span>
    `).join('');
    wireChipRemove();
    
    // Dispatch input event to notify change tracker
    dataInput.dispatchEvent(new Event('change', { bubbles: true }));
  };

  addBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val) {
      const reasons = getReasons();
      if (!reasons.includes(val)) {
        reasons.push(val);
        setReasons(reasons);
        renderChips(reasons);
      }
      input.value = '';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBtn.click();
    }
  });

  // Initial event bindings
  wireChipRemove();
}