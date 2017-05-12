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
  'howToContainer:last-child': {
    borderBottomWidth: 0,
  },
  textContainer: {
    paddingVertical: applyWidthDifference(10),
    ...absoluteCenter,
  },
  videoLinkContainer: {
    paddingVertical: applyWidthDifference(10),
    ...absoluteCenter,
    width: '100%',
    backgroundColor: '#eee',
  },
});
