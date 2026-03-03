/**
 * DOM manipulation helpers - reduces repeated patterns
 */

export const getFieldValue = (id: string): string =>
  (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? '';

export const setFieldValue = (id: string, value: string): void => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.value = value;
};

export const getCheckboxValue = (id: string): boolean =>
  (document.getElementById(id) as HTMLInputElement | null)?.checked ?? false;

export const setCheckboxValue = (id: string, value: boolean): void => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.checked = value;
};

export const setSelectValue = (id: string, value: string): void => {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  if (el) el.value = value;
};

export const getSelectValue = (id: string): string =>
  (document.getElementById(id) as HTMLSelectElement | null)?.value ?? '';

export const hideElement = (id: string): void => {
  document.getElementById(id)?.classList.add('d-none');
};

export const showElement = (id: string): void => {
  document.getElementById(id)?.classList.remove('d-none');
};

export const isElementHidden = (id: string): boolean =>
  document.getElementById(id)?.classList.contains('d-none') ?? false;

export const markFieldInvalid = (id: string): void => {
  document.getElementById(id)?.classList.add('is-invalid');
};

export const markFieldValid = (id: string): void => {
  document.getElementById(id)?.classList.remove('is-invalid');
};

export const clearFieldValidation = (id: string): void => {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('is-invalid', 'is-valid');
  }
};

export const setErrorText = (id: string, text: string): void => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};
