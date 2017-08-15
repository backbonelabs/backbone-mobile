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
    borderRadius: 4,
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
    paddingHorizontal: applyWidthDifference(20),
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
    paddingLeft: applyWidthDifference(20),
    padding: applyWidthDifference(7),
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: '900',

  },
  barContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  bar: {
    width: '95%',
    height: applyWidthDifference(1),
    backgroundColor: '#e0e0e0',
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
    fontSize: fixedResponsiveFontSize(12),
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
    fontSize: fixedResponsiveFontSize(13),
    color: '#424242',
  },
  subViewHeaderText: {
    fontSize: fixedResponsiveFontSize(8),
    color: '#757575',
    fontWeight: '900',
    backgroundColor: '#EEEEEE',
    width: '93%',
    paddingVertical: applyWidthDifference(7),
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
    backgroundColor: '#FFFFFF',
  },
  searchBarIconContainer: {
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    height: applyWidthDifference(30),
    paddingHorizontal: applyWidthDifference(12),
  },
  searchBarTextInput: {
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    height: applyWidthDifference(30),
    fontSize: fixedResponsiveFontSize(12),
    width: '80%',
  },
});
