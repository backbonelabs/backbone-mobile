import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  $heartIconSize: fixedResponsiveFontSize(25),
  container: {
    alignItems: 'center',
    flex: 1,
  },
  scrollableTabViewContainer: {
    backgroundColor: '$grey100',
  },
  tabBarUnderlineStyle: {
    backgroundColor: '$lightBlue500',
    borderRadius: 4,
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(14),
  },
  listContainer: {
    flex: 1,
  },
  rowContainer: {
    height: applyWidthDifference(80),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: applyWidthDifference(20),
  },
  rowInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    paddingHorizontal: applyWidthDifference(16),
    width: '60%',
    color: 'black',
  },
  heartIcon: {
    color: '$red500',
  },
  footerSpaceBox: {
    height: applyWidthDifference(50),
  },
  workoutPreviewBox: {
    height: applyWidthDifference(65),
    width: applyWidthDifference(65),
    borderRadius: 5,
    backgroundColor: '$grey300',
  },
  section: {
    backgroundColor: '$lightBlue200',
  },
  sectionText: {
    color: '#FFF',
    paddingLeft: applyWidthDifference(20),
    padding: applyWidthDifference(7),
    fontWeight: 'bold',
  },
  bar: {
    alignSelf: 'center',
    width: '95%',
    height: applyWidthDifference(1),
    backgroundColor: '$grey300',
  },
  subView: {
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    paddingBottom: applyWidthDifference(20),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  subViewButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: applyWidthDifference(10),
    backgroundColor: '$grey300',
  },
  subViewButton: {
    backgroundColor: '$grey50',
    width: '93%',
    alignItems: 'center',
    height: applyWidthDifference(40),
    justifyContent: 'center',
  },
  subViewButtonText: {
    fontWeight: 'bold',
  },
  subViewHeaderText: {
    color: '$grey600',
    fontWeight: 'bold',
    backgroundColor: '$grey200',
    width: '93%',
    paddingVertical: applyWidthDifference(7),
    justifyContent: 'center',
    textAlign: 'center',
  },
  searchBar: {
    width: '100%',
  },
});
