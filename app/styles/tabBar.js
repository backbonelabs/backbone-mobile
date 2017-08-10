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
    paddingBottom: 10,
  },
  tabs: {
    height: applyWidthDifference(45),
    flexDirection: 'row',
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
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
