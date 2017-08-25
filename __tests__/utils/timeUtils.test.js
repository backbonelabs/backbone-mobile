import {
  secondsToHours,
  secondsToMinutes,
  formattedTimeString,
} from '../../app/utils/timeUtils';

describe('timeUtils', () => {
  describe('secondsToHours', () => {
    test('converts seconds to hours', () => {
      expect(secondsToHours(0)).toBe(0);
      expect(secondsToHours(60)).toBe(60 / 3600);
      expect(secondsToHours(3600)).toBe(3600 / 3600);
      expect(secondsToHours(3700)).toBe(3700 / 3600);
    });
  });

  describe('secondsToMinutes', () => {
    test('converts seconds to minutes', () => {
      expect(secondsToMinutes(0)).toBe(0);
      expect(secondsToMinutes(45)).toBe(45 / 60);
      expect(secondsToMinutes(60)).toBe(60 / 60);
      expect(secondsToMinutes(8000)).toBe(8000 / 60);
    });
  });

  describe('formattedTimeString', () => {
    test('returns the correct string with no abbreviations', () => {
      expect(formattedTimeString(0)).toBe('0 seconds');
      expect(formattedTimeString(1)).toBe('1 second');
      expect(formattedTimeString(2)).toBe('2 seconds');
      expect(formattedTimeString(59)).toBe('59 seconds');
      expect(formattedTimeString(60)).toBe('1 minute');
      expect(formattedTimeString(61)).toBe('1 minute 1 second');
      expect(formattedTimeString(62)).toBe('1 minute 2 seconds');
      expect(formattedTimeString(119)).toBe('1 minute 59 seconds');
      expect(formattedTimeString(120)).toBe('2 minutes');
      expect(formattedTimeString(121)).toBe('2 minutes 1 second');
      expect(formattedTimeString(122)).toBe('2 minutes 2 seconds');
      expect(formattedTimeString(179)).toBe('2 minutes 59 seconds');
      expect(formattedTimeString(3599)).toBe('59 minutes 59 seconds');
      expect(formattedTimeString(3600)).toBe('1 hour');
      expect(formattedTimeString(3601)).toBe('1 hour 1 second');
      expect(formattedTimeString(3602)).toBe('1 hour 2 seconds');
      expect(formattedTimeString(3659)).toBe('1 hour 59 seconds');
      expect(formattedTimeString(3660)).toBe('1 hour 1 minute');
      expect(formattedTimeString(3661)).toBe('1 hour 1 minute 1 second');
      expect(formattedTimeString(3662)).toBe('1 hour 1 minute 2 seconds');
      expect(formattedTimeString(3719)).toBe('1 hour 1 minute 59 seconds');
      expect(formattedTimeString(3720)).toBe('1 hour 2 minutes');
      expect(formattedTimeString(7199)).toBe('1 hour 59 minutes 59 seconds');
      expect(formattedTimeString(7200)).toBe('2 hours');
      expect(formattedTimeString(7201)).toBe('2 hours 1 second');
      expect(formattedTimeString(7202)).toBe('2 hours 2 seconds');
      expect(formattedTimeString(7259)).toBe('2 hours 59 seconds');
      expect(formattedTimeString(7260)).toBe('2 hours 1 minute');
      expect(formattedTimeString(7261)).toBe('2 hours 1 minute 1 second');
      expect(formattedTimeString(7262)).toBe('2 hours 1 minute 2 seconds');
      expect(formattedTimeString(86400)).toBe('24 hours');
      expect(formattedTimeString(86401)).toBe('24 hours 1 second');
      expect(formattedTimeString(86402)).toBe('24 hours 2 seconds');
      expect(formattedTimeString(86459)).toBe('24 hours 59 seconds');
      expect(formattedTimeString(86460)).toBe('24 hours 1 minute');
      expect(formattedTimeString(86461)).toBe('24 hours 1 minute 1 second');
      expect(formattedTimeString(86462)).toBe('24 hours 1 minute 2 seconds');
      expect(formattedTimeString(86519)).toBe('24 hours 1 minute 59 seconds');
      expect(formattedTimeString(86520)).toBe('24 hours 2 minutes');
      expect(formattedTimeString(89999)).toBe('24 hours 59 minutes 59 seconds');
      expect(formattedTimeString(90000)).toBe('25 hours');
    });

    test('returns the correct string with abbreviations', () => {
      expect(formattedTimeString(0, true)).toBe('0 sec');
      expect(formattedTimeString(1, true)).toBe('1 sec');
      expect(formattedTimeString(2, true)).toBe('2 sec');
      expect(formattedTimeString(59, true)).toBe('59 sec');
      expect(formattedTimeString(60, true)).toBe('1 min');
      expect(formattedTimeString(61, true)).toBe('1 min 1 sec');
      expect(formattedTimeString(62, true)).toBe('1 min 2 sec');
      expect(formattedTimeString(119, true)).toBe('1 min 59 sec');
      expect(formattedTimeString(120, true)).toBe('2 min');
      expect(formattedTimeString(121, true)).toBe('2 min 1 sec');
      expect(formattedTimeString(122, true)).toBe('2 min 2 sec');
      expect(formattedTimeString(179, true)).toBe('2 min 59 sec');
      expect(formattedTimeString(3599, true)).toBe('59 min 59 sec');
      expect(formattedTimeString(3600, true)).toBe('1 hr');
      expect(formattedTimeString(3601, true)).toBe('1 hr 1 sec');
      expect(formattedTimeString(3602, true)).toBe('1 hr 2 sec');
      expect(formattedTimeString(3659, true)).toBe('1 hr 59 sec');
      expect(formattedTimeString(3660, true)).toBe('1 hr 1 min');
      expect(formattedTimeString(3661, true)).toBe('1 hr 1 min 1 sec');
      expect(formattedTimeString(3662, true)).toBe('1 hr 1 min 2 sec');
      expect(formattedTimeString(3719, true)).toBe('1 hr 1 min 59 sec');
      expect(formattedTimeString(3720, true)).toBe('1 hr 2 min');
      expect(formattedTimeString(7199, true)).toBe('1 hr 59 min 59 sec');
      expect(formattedTimeString(7200, true)).toBe('2 hr');
      expect(formattedTimeString(7201, true)).toBe('2 hr 1 sec');
      expect(formattedTimeString(7202, true)).toBe('2 hr 2 sec');
      expect(formattedTimeString(7259, true)).toBe('2 hr 59 sec');
      expect(formattedTimeString(7260, true)).toBe('2 hr 1 min');
      expect(formattedTimeString(7261, true)).toBe('2 hr 1 min 1 sec');
      expect(formattedTimeString(7262, true)).toBe('2 hr 1 min 2 sec');
      expect(formattedTimeString(86400, true)).toBe('24 hr');
      expect(formattedTimeString(86401, true)).toBe('24 hr 1 sec');
      expect(formattedTimeString(86402, true)).toBe('24 hr 2 sec');
      expect(formattedTimeString(86459, true)).toBe('24 hr 59 sec');
      expect(formattedTimeString(86460, true)).toBe('24 hr 1 min');
      expect(formattedTimeString(86461, true)).toBe('24 hr 1 min 1 sec');
      expect(formattedTimeString(86462, true)).toBe('24 hr 1 min 2 sec');
      expect(formattedTimeString(86519, true)).toBe('24 hr 1 min 59 sec');
      expect(formattedTimeString(86520, true)).toBe('24 hr 2 min');
      expect(formattedTimeString(89999, true)).toBe('24 hr 59 min 59 sec');
      expect(formattedTimeString(90000, true)).toBe('25 hr');
    });
  });
});
