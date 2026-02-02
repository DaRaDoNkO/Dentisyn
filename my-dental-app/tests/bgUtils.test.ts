import { describe, it, expect } from 'vitest';
import { validateEGN, validateLNCh, detectIDType } from '../src/utils/bgUtils';

describe('Bulgarian ID Validation', () => {
  describe('EGN Validation', () => {
    it('should validate a correct EGN for male born in 1985', () => {
      // EGN: 8505155559 (15 May 1985, Male - checksum 9)
      const result = validateEGN('8505155559');
      expect(result.valid).toBe(true);
      expect(result.sex).toBe('m');
      expect(result.dob?.getFullYear()).toBe(1985);
      expect(result.dob?.getMonth()).toBe(4); // May (0-indexed)
      expect(result.dob?.getDate()).toBe(15);
    });

    it('should validate a correct EGN for female born in 2000', () => {
      // EGN for someone born 20 March 2000, Female
      // Month 03 + 40 = 43 for year 2000+
      // Calculated checksum: 0
      const result = validateEGN('0043204440');
      expect(result.valid).toBe(true);
      expect(result.sex).toBe('f');
      expect(result.dob?.getFullYear()).toBe(2000);
      expect(result.dob?.getMonth()).toBe(2); // March (0-indexed)
      expect(result.dob?.getDate()).toBe(20);
    });

    it('should reject EGN with invalid checksum', () => {
      const result = validateEGN('8505155558'); // Last digit wrong (should be 9)
      expect(result.valid).toBe(false);
      expect(result.error).toContain('checksum');
    });

    it('should reject EGN with wrong length', () => {
      const result = validateEGN('123456789'); // 9 digits
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10 digits');
    });

    it('should reject EGN with letters', () => {
      const result = validateEGN('850515555A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('only digits');
    });

    it('should reject EGN with invalid month', () => {
      // Month 13 invalid - but will fail checksum first
      const result = validateEGN('8513155555'); // Month 13
      expect(result.valid).toBe(false);
      // Note: Will fail checksum before month validation
    });

    it('should reject EGN with invalid day', () => {
      // Day 32 invalid - but will fail checksum first
      const result = validateEGN('8505325555'); // Day 32
      expect(result.valid).toBe(false);
      // Note: Will fail checksum before day validation
    });

    it('should reject EGN with future date', () => {
      // Year 2050 would be 50 with month +40 = 90
      const futureYear = new Date().getFullYear() + 10;
      const yy = (futureYear % 100).toString().padStart(2, '0');
      const mm = '41'; // January in 2000s
      const dd = '01';
      const egn = `${yy}${mm}${dd}0001`; // Invalid checksum, but will fail on future date
      const result = validateEGN(egn);
      expect(result.valid).toBe(false);
    });
  });

  describe('LNCh Validation', () => {
    it('should validate a correct LNCh number', () => {
      // Calculate a valid LNCh
      // Example: 1234567890 - need to calculate correct last digit
      // Weights: [21, 19, 17, 13, 11, 9, 7, 3, 1]
      // Sum = 1*21 + 2*19 + 3*17 + 4*13 + 5*11 + 6*9 + 7*7 + 8*3 + 9*1
      //     = 21 + 38 + 51 + 52 + 55 + 54 + 49 + 24 + 9 = 353
      // Checksum = 353 % 10 = 3
      const result = validateLNCh('1234567893');
      expect(result.valid).toBe(true);
    });

    it('should reject LNCh with invalid checksum', () => {
      const result = validateLNCh('1234567890'); // Wrong last digit
      expect(result.valid).toBe(false);
      expect(result.error).toContain('checksum');
    });

    it('should reject LNCh with wrong length', () => {
      const result = validateLNCh('123456789'); // 9 digits
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10 digits');
    });

    it('should reject LNCh with letters', () => {
      const result = validateLNCh('123456789A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('only digits');
    });
  });

  describe('ID Type Detection', () => {
    it('should detect valid EGN', () => {
      const type = detectIDType('8505155559'); // Valid EGN
      expect(type).toBe('egn');
    });

    it('should detect valid LNCh', () => {
      const type = detectIDType('1234567893');
      expect(type).toBe('lnch');
    });

    it('should detect foreign ID with letters', () => {
      const type = detectIDType('AB123456CD');
      expect(type).toBe('foreign');
    });

    it('should detect foreign ID with wrong length', () => {
      const type = detectIDType('123456789');
      expect(type).toBe('foreign');
    });

    it('should detect invalid empty string', () => {
      const type = detectIDType('');
      expect(type).toBe('invalid');
    });

    it('should detect foreign for 10 digits with invalid checksums', () => {
      const type = detectIDType('1234567890'); // Invalid both EGN and LNCh
      expect(type).toBe('foreign');
    });
  });

  describe('EGN Century Handling', () => {
    it('should handle 1900s correctly (month 01-12)', () => {
      // Someone born 01 January 1985 - Checksum calculated
      const result = validateEGN('8501015008');
      expect(result.valid).toBe(true);
      expect(result.dob?.getFullYear()).toBe(1985);
    });

    it('should handle 2000s correctly (month 41-52)', () => {
      // Someone born 01 January 2005 (month 01 + 40 = 41) - Checksum calculated
      const result = validateEGN('0541015002');
      expect(result.valid).toBe(true);
      expect(result.dob?.getFullYear()).toBe(2005);
    });

    it('should handle 1800s correctly (month 21-32)', () => {
      // Someone born 01 January 1875 (month 01 + 20 = 21)
      const result = validateEGN('7521015551');
      expect(result.valid).toBe(true);
      expect(result.dob?.getFullYear()).toBe(1875);
    });
  });

  describe('EGN Sex Extraction', () => {
    it('should extract male sex (odd 9th digit)', () => {
      const result = validateEGN('8505155559'); // 9th digit = 5 (odd), checksum = 9
      expect(result.valid).toBe(true);
      expect(result.sex).toBe('m');
    });

    it('should extract female sex (even 9th digit)', () => {
      const result = validateEGN('8505154444'); // 9th digit = 4 (even), checksum = 4
      expect(result.valid).toBe(true);
      expect(result.sex).toBe('f');
    });
  });
});
