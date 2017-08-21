import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  sliderContainer: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sliderInnerContainer: {
    flex: 1,
  },
  leftIconStyles: {
    paddingRight: applyWidthDifference(5),
    color: '$secondaryFontColor',
  },
  rightIconStyles: {
    paddingLeft: applyWidthDifference(5),
    color: '$secondaryFontColor',
  },
  thumbStyle: {
    backgroundColor: 'white',
  },
  trackStyle: {
    height: applyWidthDifference(6),
    backgroundColor: '$secondaryFontColor',
  },
});
