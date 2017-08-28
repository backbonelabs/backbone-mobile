import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  graphContainer: {
    flex: 3.5,
    justifyContent: 'flex-end',
    backgroundColor: '$grey50',
  },
  graphInnerContainer: {
    justifyContent: 'space-around',
  },
  noData: {
    alignSelf: 'center',
  },
  heading: {
    alignItems: 'center',
    paddingTop: applyWidthDifference(10),
  },
  goodRating: {
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(12),
    paddingRight: applyWidthDifference(15),
    color: '$green400',
  },
  poorRating: {
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(12),
    color: '$primaryColor',
  },
  sessionRatingContainer: {
    flexDirection: 'row',
  },
  tabs: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabBarUnderlineStyle: {
    borderRadius: 4,
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: 'bold',
  },
});
