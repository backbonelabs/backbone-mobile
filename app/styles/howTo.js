import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

const relativeImageDimensions = {
  width: 319 * widthDifference,
  height: 239 * widthDifference,
};

export default EStyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: null,
  },
  howToContainer: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '$activeBorderColor',
    paddingVertical: 5 * heightDifference,
  },
  buttonContainer: {
    flex: 0.8,
    ...absoluteCenter,
  },
  gif: {
    ...relativeImageDimensions,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  png: {
    ...relativeImageDimensions,
    ...absoluteCenter,
  },
  playIcon: {
    color: '$primaryColor',
    height: 100 * heightDifference,
  },
  pauseIcon: {
    color: '$primaryColor',
    height: 25 * heightDifference,
  },
  pauseIconPadding: {
    paddingVertical: 5.5 * heightDifference,
    paddingHorizontal: 7.5 * widthDifference,
  },
  textContainer: {
    flex: 0.1,
    paddingVertical: 10 * heightDifference,
    ...absoluteCenter,
  },
});
