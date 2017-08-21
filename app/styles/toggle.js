import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $onTintColor: 'rgba(22, 208, 62, 0.4)',
  toggleContainer: {
    flex: 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: applyWidthDifference(15),
    paddingRight: applyWidthDifference(10),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    height: applyWidthDifference(48),
  },
  toggleText: {
    flex: 0.85,
  },
  toggleSwitch: {
    flex: 0.15,
  },
});
