import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  mainSessionCard: {
    width: '70%',
    alignSelf: 'center',
  },
  sessionActivityRow: {
    flexDirection: 'row',
  },
  activityBullet: {
    alignSelf: 'center',
    marginRight: applyWidthDifference(8),
  },
});
