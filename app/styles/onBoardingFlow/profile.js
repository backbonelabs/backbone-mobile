import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  profileField: {
    width: '85%',
    height: applyWidthDifference(50),
    paddingLeft: applyWidthDifference(15),
    marginBottom: applyWidthDifference(15),
    borderColor: '#979797',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 3,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
      },
    }),
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePickerItemsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  profilePickerItems: {
    flex: 0.65,
  },
  profilePickerMetric: {
    flex: 0.35,
  },
  icon: {
    width: applyWidthDifference(20),
    height: applyWidthDifference(20),
    marginRight: applyWidthDifference(10),
  },
});
