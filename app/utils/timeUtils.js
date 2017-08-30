/**
 * Converts seconds to hours
 * @param {Number} seconds
 * @return {Number} Hours
 */
export const secondsToHours = seconds => seconds / 3600;

/**
 * Converts seconds to minutes
 * @param {Number} seconds
 * @return {Number} Minutes
 */
export const secondsToMinutes = seconds => seconds / 60;

/**
 * Add extra zero digits for single digit values
 * @param {Number} value
 * @return {Number} paddedValue
 */
export const zeroPadding = value => `${value > 10 ? '' : '0'}${value}`;

/**
 * Converts number of seconds to a string containing hours (if applicable),
 * minutes (if applicable), and seconds. For example, 122 would return the string,
 * "2 minutes 2 seconds".
 * @param {Number}  seconds
 * @param {Boolean} abbreviated Whether or not to abbreviate the time units, e.g., minute vs. min
 * @return {String}
 */
export const formattedTimeString = (seconds, abbreviated) => {
  let secondsRemaining = seconds;
  const string = [];
  const hours = Math.floor(secondsToHours(secondsRemaining));
  if (hours) {
    string.push(hours, abbreviated ? 'hr' : `hour${hours > 1 ? 's' : ''}`);
    secondsRemaining -= hours * 3600;
  }
  const minutes = Math.floor(secondsToMinutes(secondsRemaining));
  if (minutes) {
    string.push(minutes, abbreviated ? 'min' : `minute${minutes > 1 ? 's' : ''}`);
    secondsRemaining -= minutes * 60;
  }
  if (secondsRemaining || (secondsRemaining === 0 && !hours && !minutes)) {
    string.push(
      secondsRemaining, abbreviated ? 'sec' : `second${secondsRemaining === 1 ? '' : 's'}`
    );
  }
  return string.join(' ');
};
