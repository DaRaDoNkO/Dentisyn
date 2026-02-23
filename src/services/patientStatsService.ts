import { patientRepository } from '../repositories/patientRepository';
import { appointmentRepository } from '../repositories/appointmentRepository';
import type { DelayRecord, PunctualityScore } from '../types/patient';

/**
 * Calculate punctuality score from delay history.
 * - ≥3 delays (>5min) in last 10 appointments → 'delayed'
 * - any no-show or late-cancel → 'unreliable'
 * - else → 'punctual'
 */
export function calculatePunctuality(
  history: DelayRecord[],
  patientId?: string
): PunctualityScore {
  // Check for no-shows / late cancels
  if (patientId) {
    const appointments = appointmentRepository.getAll()
      .filter(a => a.patientId === patientId);
    const hasNoShow = appointments.some(a => a.status === 'NoShow');
    const hasLateCancelWithin24h = appointments.some(
      a => a.status === 'Cancelled' && a.cancelledWithin24h
    );
    if (hasNoShow || hasLateCancelWithin24h) return 'unreliable';
  }

  if (history.length === 0) return 'punctual';

  const recent = history.slice(-10);
  const delayCount = recent.filter(r => r.delayMinutes > 5).length;
  if (delayCount >= 5) return 'unreliable';
  if (delayCount >= 3) return 'delayed';
  return 'punctual';
}

/**
 * Get the punctuality icon for display.
 * ✅ punctual, ⏱ delayed (orange), ⚠️ unreliable
 */
export function getPunctualityIcon(patientId: string): string {
  const patient = patientRepository.getById(patientId);
  if (!patient) return '';

  const score = patient.punctualityScore
    ?? calculatePunctuality(patient.delayHistory ?? [], patientId);

  switch (score) {
    case 'unreliable':
      return '<span class="text-danger" title="Unreliable">⚠️</span>';
    case 'delayed':
      return '<span class="text-warning" title="Often delayed">⏱</span>';
    case 'punctual':
    default:
      return '<span class="text-success" title="Punctual">✅</span>';
  }
}

/**
 * Recalculate and persist the punctuality score for a patient.
 */
export function refreshPunctualityScore(patientId: string): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const score = calculatePunctuality(
    patient.delayHistory ?? [],
    patientId
  );

  if (score !== patient.punctualityScore) {
    patientRepository.update(patientId, { punctualityScore: score });
    console.info(
      `[AUDIT] PUNCTUALITY_UPDATED | Patient: ${patientId} ` +
      `| Score: ${score} | Time: ${new Date().toISOString()}`
    );
  }
}
