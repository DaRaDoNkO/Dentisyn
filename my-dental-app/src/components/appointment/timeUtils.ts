/**
 * Time-related utility functions for appointment modal
 */

/**
 * Generate time options for dropdown in 15-minute intervals
 * @param startHour - Starting hour (0-23)
 * @param endHour - Ending hour (0-23)
 * @param interval - Interval in minutes (default: 15)
 * @param is24h - Use 24-hour format (default: true)
 * @returns HTML option elements as string
 */
export function generateTimeOptions(
  startHour: number = 0,
  endHour: number = 23,
  interval: number = 15,
  is24h: boolean = true
): string {
  const options: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break; // Stop at endHour:00

      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      let displayText: string;

      if (is24h) {
        displayText = timeValue;
      } else {
        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        displayText = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
      }

      options.push(`<option value="${timeValue}">${displayText}</option>`);
    }
  }

  return options.join('\n');
}
