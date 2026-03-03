/**
 * NewPatient Form Entry Point
 * Orchestrates all event initialization for patient creation/editing
 */

import { prefillFormWithPatient, setupEditModeUI } from './handlers/editHandler';
import { setupFormSubmission } from './handlers/submissionHandler';
import { setupEgnAutoFill } from './utils/egnAutoFill';
import { setupFamilyDetection } from './utils/familyDetection';

/**
 * Initialize the New Patient form
 * @param editPatientId - Optional patient ID for edit mode
 */
export function initNewPatientForm(editPatientId?: string): void {
  if (editPatientId) {
    prefillFormWithPatient(editPatientId);
    setupEditModeUI(editPatientId);
  }
  
  setupEgnAutoFill();
  setupFormSubmission(editPatientId);
  setupFamilyDetection();
}
