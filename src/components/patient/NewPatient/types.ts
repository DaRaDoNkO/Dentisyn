import type { PatientIdType } from '../../../types/patient';

export interface NewPatientFormData {
  firstName: string;
  middleName: string;
  familyName: string;
  phone: string;
  countryCode: string;
  email: string;
  address: string;
  idType: PatientIdType;
  idNumber: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | '';
  nzokNumber: string;
  rzokOblast: string;
  healthRegion: string;
  unfavorableConditions: boolean;
  exemptFromFee: boolean;
  pensioner: boolean;
  familyGroupId: string;
}

export interface FormValidationErrors {
  firstName?: string;
  familyName?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  dateOfBirth?: string;
  duplicate?: string;
}

export interface FamilySuggestion {
  patientId: string;
  name: string;
  phone: string;
  reason: 'sameFamilyName' | 'samePhone';
}
