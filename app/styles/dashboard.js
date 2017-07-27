import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  polygon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainSessionCard: {
    width: '70%',
    alignSelf: 'center',
  },
  sessionWorkoutRow: {
    flexDirection: 'row',
  },
  workoutBullet: {
    alignSelf: 'center',
    marginRight: applyWidthDifference(8),
  },
});
