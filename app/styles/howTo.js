import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  howToContainer: {
    borderBottomWidth: 1,
    borderColor: '$activeBorderColor',
    paddingVertical: applyWidthDifference(15),
  },
  textContainer: {
    flex: 0.1,
    paddingVertical: applyWidthDifference(10),
    ...absoluteCenter,
  },
});
