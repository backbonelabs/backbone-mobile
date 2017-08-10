import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  $settingsIconSize: fixedResponsiveFontSize(25),
  container: {
    alignItems: 'center',
    flex: 1,
  },
  scrollableTabViewContainer: {
    backgroundColor: '#f5f5f5',
  },
  tabBarUnderlineStyle: {
    backgroundColor: '#2196F3',
    height: 4,
    borderRadius: 5,
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
  heartIcon: {
    color: '#D32F2F',
    marginRight: applyWidthDifference(5),
  },
  footerSpaceBox: {
    height: applyWidthDifference(50),
  },
  workoutPreviewBox: {
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
    fontSize: 12,
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
    marginTop: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarIconContainer: {
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    height: applyWidthDifference(30),
    paddingHorizontal: 10,
  },
  searchBarTextInput: {
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    height: applyWidthDifference(30),
    fontSize: 14,
    width: '80%',
  },
});
