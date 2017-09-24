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
    backgroundColor: '$grey50',
    flex: 1,
  },
  victoryGraph: {
    flex: 1,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginRight: applyWidthDifference(10),
  },
  noData: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  heading: {
    alignItems: 'center',
    marginTop: applyWidthDifference(20),
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
    width: '90%',
    marginTop: applyWidthDifference(10),
    alignItems: 'flex-start',
  },
  tabs: {
    height: applyWidthDifference(60),
  },
  tabBarUnderlineStyle: {
    borderRadius: 4,
    backgroundColor: '$lightBlue500',
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: 'bold',
  },
});
