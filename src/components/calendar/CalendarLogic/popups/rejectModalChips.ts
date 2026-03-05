interface ChipColors {
  chipBg: string;
  chipBgActive: string;
  chipBorder: string;
  chipBorderActive: string;
  textColor: string;
}

export function buildChipsContainer(
  reasons: string[],
  chipColors: ChipColors,
  onSelect: (reason: string) => void,
  getCustomInput: () => HTMLTextAreaElement
): HTMLElement {
  const { chipBg, chipBgActive, chipBorder, chipBorderActive, textColor } = chipColors;
  let selectedReason = '';

  const container = document.createElement('div');
  container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;';

  reasons.forEach(reason => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = reason;
    chip.dataset.reason = reason;
    chip.style.cssText = `
      padding: 8px 16px; border-radius: 20px; font-size: 13px;
      border: 1.5px solid ${chipBorder}; background: ${chipBg}; color: ${textColor};
      cursor: pointer; transition: all 0.2s; font-weight: 500; white-space: nowrap;
    `;

    chip.onmouseover = () => {
      if (selectedReason !== reason) {
        chip.style.borderColor = chipBorderActive;
        chip.style.background = chipBgActive;
      }
    };
    chip.onmouseout = () => {
      if (selectedReason !== reason) {
        chip.style.borderColor = chipBorder;
        chip.style.background = chipBg;
      }
    };
    chip.onclick = () => {
      container.querySelectorAll('button').forEach(b => {
        (b as HTMLElement).style.borderColor = chipBorder;
        (b as HTMLElement).style.background = chipBg;
        (b as HTMLElement).style.color = textColor;
      });
      selectedReason = reason;
      chip.style.borderColor = chipBorderActive;
      chip.style.background = chipBorderActive;
      chip.style.color = '#ffffff';
      getCustomInput().value = '';
      onSelect(reason);
    };

    container.appendChild(chip);
  });

  return container;
}
