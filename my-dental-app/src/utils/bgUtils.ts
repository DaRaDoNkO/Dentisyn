/**
 * Bulgarian EGN (Единен Граждански Номер) and LNCh (Личен Номер на Чужденец) validation utilities
 */

export interface EGNValidationResult {
  valid: boolean;
  sex?: 'm' | 'f';
  dob?: Date;
  error?: string;
}

export interface LNChValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate Bulgarian EGN (10-digit national identification number)
 * 
 * Format: YYMMDDRRRC
 * - YY: Year (last 2 digits)
 * - MM: Month (01-12, or 21-32 for 1800s, or 41-52 for 2000s)
 * - DD: Day (01-31)
 * - RRR: Region code
 * - C: Checksum
 * 
 * Algorithm:
 * - Weights: [2, 4, 8, 5, 10, 9, 7, 3, 6]
 * - Checksum = (sum of digit[i] * weight[i]) mod 11
 * - If checksum == 10, it becomes 0
 * - 9th digit (index 8) determines sex: even = female, odd = male
 * 
 * @param egn - The EGN string to validate
 * @returns Validation result with extracted information
 */
export const validateEGN = (egn: string): EGNValidationResult => {
  // Remove whitespace and check if input is a string
  if (typeof egn !== 'string') {
    return { valid: false, error: 'EGN must be a string' };
  }

  const trimmedEGN = egn.trim();

  // Check length
  if (trimmedEGN.length !== 10) {
    return { valid: false, error: 'EGN must be exactly 10 digits' };
  }

  // Check if all characters are digits
  if (!/^\d{10}$/.test(trimmedEGN)) {
    return { valid: false, error: 'EGN must contain only digits' };
  }

  // Convert to array of numbers
  const digits = trimmedEGN.split('').map(Number);

  // Weights for checksum calculation (first 9 digits)
  const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  let checksum = sum % 11;
  if (checksum === 10) {
    checksum = 0;
  }

  // Validate checksum
  if (checksum !== digits[9]) {
    return { valid: false, error: 'Invalid EGN checksum' };
  }

  // Extract date components
  let year = digits[0] * 10 + digits[1];
  let month = digits[2] * 10 + digits[3];
  const day = digits[4] * 10 + digits[5];

  // Determine century based on month encoding
  let century = 1900;
  if (month > 40) {
    // 2000s: months 41-52
    century = 2000;
    month -= 40;
  } else if (month > 20) {
    // 1800s: months 21-32
    century = 1800;
    month -= 20;
  }

  year = century + year;

  // Validate date
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month in EGN' };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: 'Invalid day in EGN' };
  }

  // Create date object and validate it's a real date
  const dob = new Date(year, month - 1, day);
  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) {
    return { valid: false, error: 'Invalid date in EGN' };
  }

  // Check if date is not in the future
  if (dob > new Date()) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }

  // Extract sex from 9th digit (index 8)
  // Even = female, Odd = male
  const sexDigit = digits[8];
  const sex: 'm' | 'f' = sexDigit % 2 === 0 ? 'f' : 'm';

  return {
    valid: true,
    sex,
    dob,
  };
};

/**
 * Validate Bulgarian LNCh (Personal Number for Foreigners - 10 digits)
 * 
 * Format: 10-digit number with checksum
 * 
 * Algorithm:
 * - Weights: [21, 19, 17, 13, 11, 9, 7, 3, 1]
 * - Checksum = (sum of digit[i] * weight[i]) mod 10
 * - Last digit must equal checksum
 * 
 * Note: LNCh does not encode DOB or sex like EGN
 * 
 * @param lnch - The LNCh string to validate
 * @returns Validation result
 */
export const validateLNCh = (lnch: string): LNChValidationResult => {
  // Remove whitespace and check if input is a string
  if (typeof lnch !== 'string') {
    return { valid: false, error: 'LNCh must be a string' };
  }

  const trimmedLNCh = lnch.trim();

  // Check length
  if (trimmedLNCh.length !== 10) {
    return { valid: false, error: 'LNCh must be exactly 10 digits' };
  }

  // Check if all characters are digits
  if (!/^\d{10}$/.test(trimmedLNCh)) {
    return { valid: false, error: 'LNCh must contain only digits' };
  }

  // Convert to array of numbers
  const digits = trimmedLNCh.split('').map(Number);

  // Weights for checksum calculation (first 9 digits)
  const weights = [21, 19, 17, 13, 11, 9, 7, 3, 1];

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  const checksum = sum % 10;

  // Validate checksum
  if (checksum !== digits[9]) {
    return { valid: false, error: 'Invalid LNCh checksum' };
  }

  return { valid: true };
};

/**
 * Detect ID type based on validation
 * @param id - The ID string to detect
 * @returns Type of ID detected: 'egn', 'lnch', 'foreign', or 'invalid'
 */
export const detectIDType = (id: string): 'egn' | 'lnch' | 'foreign' | 'invalid' => {
  if (!id || typeof id !== 'string') {
    return 'invalid';
  }

  const trimmed = id.trim();

  // Check if it contains non-digit characters (passport/foreign ID)
  if (!/^\d+$/.test(trimmed)) {
    return 'foreign';
  }

  // Check if it's not 10 digits
  if (trimmed.length !== 10) {
    return trimmed.length > 0 ? 'foreign' : 'invalid';
  }

  // Try EGN validation first
  const egnResult = validateEGN(trimmed);
  if (egnResult.valid) {
    return 'egn';
  }

  // Try LNCh validation
  const lnchResult = validateLNCh(trimmed);
  if (lnchResult.valid) {
    return 'lnch';
  }

  // 10 digits but invalid checksums
  return 'foreign';
};
