import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

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
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  tabBarUnderlineStyle: {
    backgroundColor: '#b3e5fc',
    height: 3,
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  listContainer: {
    height: applyWidthDifference(80),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  listInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    paddingLeft: applyWidthDifference(30),
    color: 'black',
  },
  icon: {
    color: 'red',
  },
  preview: {
    height: applyWidthDifference(65),
    width: applyWidthDifference(65),
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  indexContainer: {
    backgroundColor: '#90caf9',
  },
  index: {
    color: '#FFF',
    paddingLeft: 15,
    padding: 7,
    fontSize: 10,
    fontWeight: '900',

  },
  barContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'white',
  },
  bar: {
    width: '95%',
    height: 1,
    backgroundColor: 'lightgrey',
  },
});
