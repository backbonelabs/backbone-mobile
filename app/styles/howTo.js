import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  scrollView: {
    alignItems: 'center',
  },
  howToContainer: {
    borderBottomWidth: 1,
    borderColor: '$primaryColor',
    paddingVertical: applyWidthDifference(15),
  },
  textContainer: {
    paddingVertical: applyWidthDifference(10),
    ...absoluteCenter,
  },
  image: {
    width: applyWidthDifference(375),
  },
});
