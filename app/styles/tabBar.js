import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: applyWidthDifference(10),
  },
  tabs: {
    backgroundColor: '#FFFFFF',
    height: applyWidthDifference(45),
    flexDirection: 'row',
    paddingTop: applyWidthDifference(5),
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  text: {
    fontSize: fixedResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  flexOne: {
    flex: 1,
  },
  icon: {
    color: 'grey',
  },
});
