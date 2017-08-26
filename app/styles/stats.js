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
    backgroundColor: '#FAFAFA',
  },
  graphInnerContainer: {
    justifyContent: 'space-around',
  },
  graph: {
    alignSelf: 'center',
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
    color: '#8BC34A',
  },
  poorRating: {
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(12),
    color: '#F44336',
  },
  sessionRatingContainer: {
    flexDirection: 'row',
  },
  tabs: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabBarUnderlineStyle: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: 'bold',
  },
});
