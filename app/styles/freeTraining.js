import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
    height: '81%',
    alignItems: 'center',
  },
  scrollableTabViewContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    height: applyWidthDifference(20),
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
    backgroundColor: '#2196F3',
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
    width: '60%',
    color: 'black',
  },
  icon: {
    color: '#D32F2F',
  },
  preview: {
    height: applyWidthDifference(65),
    width: applyWidthDifference(65),
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  section: {
    backgroundColor: '#90caf9',
  },
  sectionText: {
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
  subView: {
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    height: '85%',
    paddingBottom: applyWidthDifference(40),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  subViewCancel: {
    fontWeight: '900',
    fontSize: 11,
    color: '#424242',
  },
  subViewButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: applyWidthDifference(10),
    backgroundColor: '#E0E0E0',
  },
  subViewSortButton: {
    backgroundColor: '#FFFF',
    width: '93%',
    alignItems: 'center',
    height: applyWidthDifference(40),
    justifyContent: 'center',
    marginVertical: 0.5,
  },
  subViewSortButtonText: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#424242',
  },
  subViewHeaderText: {
    fontSize: 8,
    color: '#757575',
    fontWeight: '900',
    backgroundColor: '#EEEEEE',
    width: '93%',
    paddingVertical: 5,
    justifyContent: 'center',
    textAlign: 'center',
  },
  subViewCancelButton: {
    backgroundColor: '#FFFF',
    width: '93%',
    alignItems: 'center',
    height: applyWidthDifference(40),
    justifyContent: 'center',
  },
  searchBarContainer: {
    height: applyWidthDifference(50),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchBarIconContainer: {
    backgroundColor: '#EEEEEE',
    height: applyWidthDifference(30),
    paddingTop: 5,
    paddingLeft: 8,
    marginTop: 3,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  searchBarTextInput: {
    backgroundColor: '#EEEEEE',
    height: applyWidthDifference(30),
    fontSize: 12,
    paddingLeft: 10,
    marginTop: 10,
    width: '90%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
