/**
 * Form field ID mappings and constants
 */

export const FORM_IDS = {
  form: 'newPatientForm',
  firstName: 'npFirstName',
  middleName: 'npMiddleName',
  familyName: 'npFamilyName',
  phone: 'npPhone',
  countryCode: 'npCountryCode',
  email: 'npEmail',
  address: 'npAddress',
  idType: 'npIdType',
  idNumber: 'npIdNumber',
  dob: 'npDob',
  dobAutoFill: 'npDobAutoFill',
  sex: 'npSex',
  sexAutoFill: 'npSexAutoFill',
  nzokNumber: 'npNzokNumber',
  rzokOblast: 'npRzokOblast',
  healthRegion: 'npHealthRegion',
  unfavorable: 'npUnfavorable',
  exemptFee: 'npExemptFee',
  pensioner: 'npPensioner',
  createBtn: 'createPatientBtn',
  familyLinkArea: 'familyLinkArea',
  validationSummary: 'formValidationSummary'
} as const;

export const FIELD_MAP: Record<string, string> = {
  firstName: FORM_IDS.firstName,
  familyName: FORM_IDS.familyName,
  phone: FORM_IDS.phone,
  email: FORM_IDS.email,
  idNumber: FORM_IDS.idNumber
};

export const DEFAULT_TIME = '09:00';
export const FAMILY_DEBOUNCE_MS = 500;
export const EGN_LENGTH = 10;
export const LNCH_LENGTH = 10;
