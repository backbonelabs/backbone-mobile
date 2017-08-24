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
