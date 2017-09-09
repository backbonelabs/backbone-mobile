import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  getResponsiveFontSize,
  noScale,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  graphContainer: {
    backgroundColor: '$grey50',
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
    paddingRight: applyWidthDifference(15),
    color: '$green400',
  },
  poorRating: {
    fontWeight: 'bold',
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
    backgroundColor: '$lightBlue500',
  },
  tabBarTextStyle: {
    fontSize: noScale(getResponsiveFontSize(14)),
    fontWeight: 'bold',
  },
});
