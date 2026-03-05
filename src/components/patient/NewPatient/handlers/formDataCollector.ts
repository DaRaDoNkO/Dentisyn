import type { NewPatientFormData } from '../types';
import type { PatientIdType } from '../../../../types/patient';
import { FORM_IDS } from '../constants/formFields';
import { getFieldValue, getCheckboxValue } from '../utils/domHelpers';
import { selectedFamilyGroupId } from '../utils/familyDetection';

export const collectFormData = (): NewPatientFormData => {
  return {
    firstName: getFieldValue(FORM_IDS.firstName),
    middleName: getFieldValue(FORM_IDS.middleName),
    familyName: getFieldValue(FORM_IDS.familyName),
    phone: getFieldValue(FORM_IDS.phone),
    countryCode: getFieldValue(FORM_IDS.countryCode),
    email: getFieldValue(FORM_IDS.email),
    address: getFieldValue(FORM_IDS.address),
    idType: (getFieldValue(FORM_IDS.idType) || 'EGN') as PatientIdType,
    idNumber: getFieldValue(FORM_IDS.idNumber),
    dateOfBirth: getFieldValue(FORM_IDS.dob),
    sex: getFieldValue(FORM_IDS.sex) as 'male' | 'female' | '',
    nzokNumber: getFieldValue(FORM_IDS.nzokNumber),
    rzokOblast: getFieldValue(FORM_IDS.rzokOblast),
    healthRegion: getFieldValue(FORM_IDS.healthRegion),
    unfavorableConditions: getCheckboxValue(FORM_IDS.unfavorable),
    exemptFromFee: getCheckboxValue(FORM_IDS.exemptFee),
    pensioner: getCheckboxValue(FORM_IDS.pensioner),
    familyGroupId: selectedFamilyGroupId
  };
};
