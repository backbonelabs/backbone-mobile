import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

const relativeImageDimensions = {
  width: 319 * widthDifference,
  height: 239 * heightDifference,
};

export default EStyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  howToContainer: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '$activeBorderColor',
    paddingVertical: 25 * heightDifference,
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
    width: 25 * widthDifference,
  },
  pauseIconPadding: {
    paddingVertical: 5.5 * widthDifference,
    paddingHorizontal: 7.5 * widthDifference,
  },
  textContainer: {
    flex: 0.1,
    paddingTop: 10 * heightDifference,
    ...absoluteCenter,
  },
});
