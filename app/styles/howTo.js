import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

const relativeImageDimensions = {
  width: applyWidthDifference(319),
  height: applyWidthDifference(239),
};

export default EStyleSheet.create({
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
    height: fixedResponsiveFontSize(100),
  },
  stopIcon: {
    color: '$primaryColor',
    height: fixedResponsiveFontSize(25),
  },
  stopIconPadding: {
    paddingVertical: 5.5 * heightDifference,
    paddingHorizontal: applyWidthDifference(7.5),
  },
  textContainer: {
    flex: 0.1,
    paddingVertical: 10 * heightDifference,
    ...absoluteCenter,
  },
});
