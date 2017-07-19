import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  defaultTabBar: {
    backgroundColor: '#FFF',
    height: applyWidthDifference(40),
    paddingTop: applyWidthDifference(10),
    shadowColor: '#bdbdbd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
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
  icon: {
    color: '#bdbdbd',
  },
  preview: {
    height: applyWidthDifference(55),
    width: applyWidthDifference(55),
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
});
