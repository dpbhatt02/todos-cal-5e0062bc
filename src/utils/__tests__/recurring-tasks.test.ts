import { describe, it, expect } from 'vitest';
import { convertTo24HourFormat } from '../recurring-tasks';

describe('convertTo24HourFormat', () => {
  it('converts 1:30PM to 13:30', () => {
    expect(convertTo24HourFormat('1:30PM')).toBe('13:30');
  });

  it('returns 24h time unchanged', () => {
    expect(convertTo24HourFormat('14:00')).toBe('14:00');
  });

  it('handles shorthand pm', () => {
    expect(convertTo24HourFormat('9pm')).toBe('21:00');
  });

  it('pads single digit minutes', () => {
    expect(convertTo24HourFormat('1:5PM')).toBe('13:05');
  });

  it('returns default for invalid time', () => {
    expect(convertTo24HourFormat('invalid')).toBe('09:00');
  });
});
