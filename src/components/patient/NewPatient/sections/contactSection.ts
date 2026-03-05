import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

export function renderContactSection(): string {
  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-telephone me-2"></i>
      <span data-i18n="patient.contactInfo">${t('patient.contactInfo', 'Contact Information')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <label for="npCountryCode" class="form-label">
          <span data-i18n="patient.countryCode">${t('patient.countryCode', 'Code')}</span>
        </label>
        <select class="form-select" id="npCountryCode">
          <option value="+359">+359</option>
          <option value="+49">+49</option>
          <option value="+44">+44</option>
          <option value="+1">+1</option>
          <option value="+33">+33</option>
          <option value="+39">+39</option>
          <option value="+34">+34</option>
        </select>
      </div>
      <div class="col-md-4">
        <label for="npPhone" class="form-label">
          <span data-i18n="patient.phone">${t('patient.phone', 'Phone')}</span>
          <span class="text-danger">*</span>
        </label>
        <input type="tel" class="form-control" id="npPhone" required placeholder="888 123 456">
        <div class="invalid-feedback" data-i18n="patient.invalidPhone">${t('patient.invalidPhone', 'Invalid phone number')}</div>
      </div>
      <div class="col-md-6">
        <label for="npEmail" class="form-label">
          <span data-i18n="patient.email">${t('patient.email', 'Email')}</span>
        </label>
        <input type="email" class="form-control" id="npEmail">
        <div class="invalid-feedback" data-i18n="patient.invalidEmail">${t('patient.invalidEmail', 'Invalid email address')}</div>
      </div>
      <div class="col-12">
        <label for="npAddress" class="form-label">
          <span data-i18n="patient.address">${t('patient.address', 'Address')}</span>
        </label>
        <input type="text" class="form-control" id="npAddress">
      </div>
    </div>
  `;
}
