import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  defaultTabBar: {
    height: applyWidthDifference(40),
    paddingTop: applyWidthDifference(10),
  },
  tabBarUnderlineStyle: {
    backgroundColor: '#2196F3',
    height: 3,
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  listContainer: {
    height: applyWidthDifference(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 7,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 5,
  },
  listInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    paddingLeft: applyWidthDifference(10),
    color: 'black',
  },
  lockIcon: {
    color: '#bdbdbd',
  },
  videoBox: {
    height: applyWidthDifference(55),
    width: applyWidthDifference(55),
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
});
