import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  howToContainer: {
    borderBottomWidth: 1,
    borderColor: '$primaryColor',
    paddingVertical: 15 * heightDifference,
  },
  textContainer: {
    paddingVertical: 10 * heightDifference,
    ...absoluteCenter,
  },
});
