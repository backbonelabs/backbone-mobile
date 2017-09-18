import {
  getNextIncompleteWorkout,
  getNextIncompleteSession,
  getNextIncompleteLevel,
  isTrainingPlanComplete,
} from '../../app/utils/trainingUtils';

describe('trainingUtils', () => {
  describe('getNextIncompleteWorkout', () => {
    test('returns the index of the first incomplete workout in a session', () => {
      expect(getNextIncompleteWorkout([{}, {}, {}])).toBe(0);

      expect(getNextIncompleteWorkout([
        {},
        { isComplete: true },
        {},
      ])).toBe(0);

      expect(getNextIncompleteWorkout([
        {},
        { isComplete: true },
        { isComplete: true },
      ])).toBe(0);

      expect(getNextIncompleteWorkout([
        { isComplete: true },
        {},
        {},
      ])).toBe(1);

      expect(getNextIncompleteWorkout([
        { isComplete: true },
        {},
        { isComplete: true },
      ])).toBe(1);

      expect(getNextIncompleteWorkout([
        { isComplete: true },
        { isComplete: true },
        {},
      ])).toBe(2);
    });

    test('returns -1 if all workouts in a session are complete', () => {
      expect(getNextIncompleteWorkout([
        { isComplete: true },
        { isComplete: true },
        { isComplete: true },
      ])).toBe(-1);
    });

    test('returns -1 if passed undefined or an empty array', () => {
      expect(getNextIncompleteWorkout()).toBe(-1);
      expect(getNextIncompleteWorkout([])).toBe(-1);
    });
  });

  describe('getNextIncompleteSession', () => {
    test('returns the index of the first incomplete session in a level', () => {
      expect(getNextIncompleteSession([
        [{}, {}],
        [{}, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, {}],
        [{}, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, { isComplete: true }],
        [{}, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, {}],
        [{ isComplete: true }, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, {}],
        [{}, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, {}],
        [{ isComplete: true }, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, {}],
        [{}, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, {}],
        [{ isComplete: true }, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, { isComplete: true }],
        [{ isComplete: true }, {}],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, { isComplete: true }],
        [{}, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, { isComplete: true }],
        [{ isComplete: true }, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{}, {}],
        [{ isComplete: true }, { isComplete: true }],
      ])).toBe(0);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, { isComplete: true }],
        [{}, {}],
      ])).toBe(1);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, { isComplete: true }],
        [{ isComplete: true }, {}],
      ])).toBe(1);

      expect(getNextIncompleteSession([
        [{ isComplete: true }, { isComplete: true }],
        [{}, { isComplete: true }],
      ])).toBe(1);
    });

    test('returns -1 if all sessions in a level are complete', () => {
      expect(getNextIncompleteSession([
        [{ isComplete: true }, { isComplete: true }],
        [{ isComplete: true }, { isComplete: true }],
      ])).toBe(-1);
    });

    test('returns -1 if passed undefined or an empty array', () => {
      expect(getNextIncompleteSession()).toBe(-1);
      expect(getNextIncompleteSession([])).toBe(-1);
    });
  });

  describe('getNextIncompleteLevel', () => {
    test('returns the index of the first incomplete level in a training plan', () => {
      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{}, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, {}],
          [{}, {}],
        ],
        [
          [{}, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, { isComplete: true }],
          [{}, {}],
        ],
        [
          [{}, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{ isComplete: true }, {}],
        ],
        [
          [{}, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, { isComplete: true }],
        ],
        [
          [{}, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{ isComplete: true }, {}],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{}, { isComplete: true }],
          [{}, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{}, {}],
          [{ isComplete: true }, {}],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{}, {}],
          [{}, { isComplete: true }],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{}, {}],
        ],
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{}, {}],
          [{ isComplete: true }, { isComplete: true }],
        ],
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, { isComplete: true }],
          [{}, {}],
        ],
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, { isComplete: true }],
          [{}, { isComplete: true }],
        ],
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(0);

      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
        [
          [{}, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(1);

      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
        [
          [{ isComplete: true }, {}],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(1);
    });

    test('returns -1 if all levels in a training plan are complete', () => {
      expect(getNextIncompleteLevel([
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
        [
          [{ isComplete: true }, { isComplete: true }],
          [{ isComplete: true }, { isComplete: true }],
        ],
      ])).toBe(-1);
    });

    test('returns -1 if passed undefined or an empty array', () => {
      expect(getNextIncompleteLevel()).toBe(-1);
      expect(getNextIncompleteLevel([])).toBe(-1);
    });
  });

  describe('isTrainingPlanComplete', () => {
    const testTrainingPlanLevels = [
      [
        [{}, {}, {}],
        [{}, {}, {}],
        [{}, {}, {}],
      ],
      [
        [{}, {}, {}],
        [{}, {}, {}],
        [{}, {}, {}],
      ],
      [
        [{}, {}, {}],
        [{}, {}, {}],
        [{}, {}, {}],
      ],
    ];
    test('returns false when progress doesn\'t have same number of levels', () => {
      expect(isTrainingPlanComplete(testTrainingPlanLevels)).toBe(false);
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [])).toBe(false);
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [[]])).toBe(false);
    });

    test('returns false when progress doesn\'t have same number of trues as there ' +
      'are workouts in the plan', () => {
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true],
        ],
      ])).toBe(false);

      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
        ],
      ])).toBe(false);

      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
      ])).toBe(false);

      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true],
        ],
      ])).toBe(false);
    });

    test('returns true when progress has same number of trues as there ' +
      'are workouts in the plan', () => {
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
      ])).toBe(true);
    });

    test('returns true when progress has a greater number of trues as there ' +
      'are workouts in the plan', () => {
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
      ])).toBe(true);

      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
      ])).toBe(true);
      expect(isTrainingPlanComplete(testTrainingPlanLevels, [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
      ])).toBe(true);
    });
  });
});
