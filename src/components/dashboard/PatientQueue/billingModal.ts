import { appointmentRepository } from '../../../repositories/appointmentRepository';
import i18next from '../../../i18n';
import type { PaymentMethod } from '../../../types/patient';
import { showToast } from '../../../utils/toast';

const PAYMENT_METHODS: { value: PaymentMethod; icon: string; i18nKey: string }[] = [
  { value: 'cash',      icon: 'bi-cash-coin',   i18nKey: 'table.cash' },
  { value: 'card',      icon: 'bi-credit-card',  i18nKey: 'table.card' },
  { value: 'nzok',      icon: 'bi-shield-check', i18nKey: 'table.nzok' },
  { value: 'nzok_cash', icon: 'bi-shield-plus',  i18nKey: 'table.nzokCash' },
  { value: 'nzok_card', icon: 'bi-shield-plus',  i18nKey: 'table.nzokCard' },
];

function renderBillingModal(appointmentId: string): string {
  const appt = appointmentRepository.getById(appointmentId);
  if (!appt) return '';

  const total = appt.totalAmount ?? 80;
  const nzok = appt.nzokAmount ?? 0;
  const patientOwes = total - nzok;

  const methodBtns = PAYMENT_METHODS.map(m => `
    <button type="button"
      class="btn btn-outline-secondary billing-method-btn d-flex align-items-center gap-1"
      data-method="${m.value}">
      <i class="bi ${m.icon}"></i>
      <span data-i18n="${m.i18nKey}"></span>
    </button>
  `).join('');

  return `
  <div class="modal fade" id="billingModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 shadow-lg">
        <div class="modal-header border-bottom-0">
          <h6 class="modal-title fw-semibold" data-i18n="table.billingModalTitle"></h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <div class="fw-semibold">${appt.patientName}</div>
            <div class="text-muted small">${appt.reason}</div>
          </div>

          <!-- Amounts -->
          <div class="border rounded-3 p-3 mb-3">
            <div class="d-flex justify-content-between mb-1">
              <span data-i18n="table.totalAmount"></span>
              <span class="fw-bold">${total.toFixed(2)} лв</span>
            </div>
            <div class="d-flex justify-content-between mb-1 text-success">
              <span data-i18n="table.nzokCovered"></span>
              <span>-${nzok.toFixed(2)} лв</span>
            </div>
            <hr class="my-1">
            <div class="d-flex justify-content-between fw-bold">
              <span data-i18n="table.patientOwes"></span>
              <span id="billing-patient-owes">${patientOwes.toFixed(2)} лв</span>
            </div>
          </div>

          <!-- Editable amounts -->
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small" data-i18n="table.totalAmount"></label>
              <input type="number" class="form-control form-control-sm"
                id="billing-total" value="${total}" min="0" step="0.01">
            </div>
            <div class="col-6">
              <label class="form-label small" data-i18n="table.nzokCovered"></label>
              <input type="number" class="form-control form-control-sm"
                id="billing-nzok" value="${nzok}" min="0" step="0.01">
            </div>
          </div>

          <!-- Payment method -->
          <div class="mb-3">
            <label class="form-label small fw-semibold" data-i18n="table.paymentMethod"></label>
            <div class="d-flex flex-wrap gap-1" id="billing-methods">
              ${methodBtns}
            </div>
          </div>

          <!-- Confirm -->
          <button type="button" class="btn btn-success w-100" id="billingConfirmBtn" disabled>
            <i class="bi bi-check-circle me-1"></i>
            <span data-i18n="table.confirmPayment"></span>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Show the billing modal and wire events.
 */
export function showBillingModal(
  appointmentId: string,
  onDone: () => void
): void {
  let container = document.getElementById('billingModalContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'billingModalContainer';
    document.body.appendChild(container);
  }
  container.innerHTML = renderBillingModal(appointmentId);
  applyI18n(container);

  const modalEl = document.getElementById('billingModal') as HTMLElement;
  if (!modalEl || !window.bootstrap?.Modal) return;
  const bsModal = new window.bootstrap.Modal(modalEl);

  let selectedMethod: PaymentMethod | null = null;

  // Recalculate patient owes when amounts change
  const recalcOwes = (): void => {
    const totalInput = document.getElementById('billing-total') as HTMLInputElement;
    const nzokInput = document.getElementById('billing-nzok') as HTMLInputElement;
    const owesEl = document.getElementById('billing-patient-owes');
    if (!totalInput || !nzokInput || !owesEl) return;
    const t = parseFloat(totalInput.value) || 0;
    const n = parseFloat(nzokInput.value) || 0;
    owesEl.textContent = `${(t - n).toFixed(2)} лв`;
  };

  document.getElementById('billing-total')?.addEventListener('input', recalcOwes);
  document.getElementById('billing-nzok')?.addEventListener('input', recalcOwes);

  // Payment method selection
  document.querySelectorAll('.billing-method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.billing-method-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary');
      selectedMethod = (btn as HTMLElement).dataset.method as PaymentMethod;
      const confirmBtn = document.getElementById('billingConfirmBtn') as HTMLButtonElement;
      if (confirmBtn) confirmBtn.disabled = false;
    });
  });

  // Confirm payment
  document.getElementById('billingConfirmBtn')?.addEventListener('click', () => {
    if (!selectedMethod) return;

    const totalInput = document.getElementById('billing-total') as HTMLInputElement;
    const nzokInput = document.getElementById('billing-nzok') as HTMLInputElement;
    const total = parseFloat(totalInput?.value) || 0;
    const nzokAmt = parseFloat(nzokInput?.value) || 0;

    appointmentRepository.update(appointmentId, {
      status: 'Left',
      paymentStatus: 'paid',
      paymentMethod: selectedMethod,
      totalAmount: total,
      nzokAmount: nzokAmt,
      patientAmount: total - nzokAmt,
    });

    console.info(
      `[AUDIT] PAYMENT_RECORDED | Appointment: ${appointmentId} ` +
      `| Method: ${selectedMethod} | Total: ${total} | NZOK: ${nzokAmt} ` +
      `| Status: Left | Time: ${new Date().toISOString()}`
    );

    showToast({ message: i18next.t('table.paymentRecorded'), type: 'success' });
    bsModal.hide();
  });

  // Cleanup
  modalEl.addEventListener('hidden.bs.modal', () => {
    container?.remove();
    onDone();
  }, { once: true });

  bsModal.show();
}

function applyI18n(el: HTMLElement): void {
  el.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    if (key) node.textContent = i18next.t(key);
  });
}
