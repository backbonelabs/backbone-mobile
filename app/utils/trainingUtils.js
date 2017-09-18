import { Platform } from 'react-native';
import ReactNativeFS from 'react-native-fs';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';

/**
 * Given an array of workouts for a session, returns the index of the first incomplete
 * workout. If all workouts in the session have been completed, then -1 is returned.
 * @param {Object[]} sessionWorkouts Workouts in a session
 * @return {Number} Index of the first incomplete workout in the session, or -1 if none
 */
export const getNextIncompleteWorkout = (sessionWorkouts = []) =>
  sessionWorkouts.findIndex(workout => !workout.isComplete);

/**
 * Given an array of sessions for a level, returns the index of the first incomplete
 * session. If all sessions in the level have been completed, then -1 is returned.
 * @param {Array[]} sessions Sessions in a level
 * @return {Number} Index of the first incomplete session in the level, or -1 if none
 */
export const getNextIncompleteSession = (sessions = []) =>
  sessions.findIndex(session => getNextIncompleteWorkout(session) > -1);

/**
 * Given an array of levels for a training plan, returns the index of the first incomplete
 * level. If all levels in the training plan have been completed, then -1 is returned.
 * @param {Array[][]} levels Levels in a training plan
 * @return {Number} Index of the first incomplete level in the training plan, or -1 if none
 */
export const getNextIncompleteLevel = (levels = []) =>
  levels.findIndex(level => getNextIncompleteSession(level) > -1);

/**
 * Given an array of training plans, progress, currently selected plan, level, session, and step,
 * mark the current workout as complete and return the updated progress array.
 * @param {Array[]} plans Plans list
 * @param {Number} plan Current plan index
 * @param {Number} level Current level index
 * @param {Number} session Current session index
 * @param {Number} step Current step index
 * @param {Object[]} currentProgress Progress for all training plans
 * @return {Object[]} Updated plan progress
 */
export const markSessionStepComplete = (plans, plan, level, session, step, currentProgress) => {
  const progress = cloneDeep(currentProgress);
  if (!progress[plans[plan]._id]) {
    // Progress for the current training plan hasn't been defined in the user profile yet.
    // Set up a new key for the current training plan in the user's trainingPlanProgress
    progress[plans[plan]._id] = [];
  }
  const planProgress = progress[plans[plan]._id];

  // The plan progress array may not always contain the exact number of elements as
  // workouts in the training plan, so we need to fill missing elements up to the
  // current level and session indices with empty arrays.

  // Fill in missing levels
  for (let i = 0; i <= level; i++) {
    if (!planProgress[i]) {
      planProgress[i] = [];
    }
  }

  // Fill in missing sessions in the current level up to the current session
  for (let i = 0; i <= session; i++) {
    if (!planProgress[level][i]) {
      planProgress[level][i] = [];
    }
  }

  // Mark the current workout as complete
  planProgress[level][session][step] = true;
  return progress;
};

/**
 * Determines whether all levels and sessions in a training plan are complete
 * @param {Array} planLevel    Training plan levels
 * @param {Array} planProgress Collection of progress statuses for the training plan
 */
export const isTrainingPlanComplete = (planLevels = [], planProgress = []) => (
  planLevels.every((level, levelIdx) => (
    level.every((session, sessionIdx) => {
      const totalSessionWorkouts = session.length;
      const sessionProgress = get(planProgress, [levelIdx, sessionIdx], []);

      // Returns true if the progress array contains as many true's for the current
      // session as there are number of workouts in the session
      return sessionProgress.length >= totalSessionWorkouts &&
        sessionProgress.every(completed => completed);
    })
  ))
);

/**
 * Return the absolute file path of the gif file in the local storage.
 * In iOS, it would read from the bundle directory, while in Android, it would
 * read in the folder unzipped from the expansion file.
 * @param {String} fileName The file name of the gif file
 * @return {String} The absolute file path of the gif file in the local storage
 */
export const getWorkoutGifFilePath = (fileName) => {
  if (Platform.OS === 'android') {
    return `file://${ReactNativeFS.ExternalDirectoryPath}/gif/${fileName}`;
  }
  return `${ReactNativeFS.MainBundlePath}/Expansion/gif/${fileName}`;
};

/**
 * Return the absolute file path of the thumbnail file in the local storage.
 * In iOS, it would read from the bundle directory, while in Android, it would
 * read in the folder unzipped from the expansion file.
 * @param {String} fileName The file name of the gif file
 * @return {String} The absolute file path of the gif file in the local storage
 */
export const getWorkoutThumbnailFilePath = (fileName) => {
  if (Platform.OS === 'android') {
    return `file://${ReactNativeFS.ExternalDirectoryPath}/thumbnail/${fileName}`;
  }
  return `${ReactNativeFS.MainBundlePath}/Expansion/thumbnail/${fileName}`;
};
