import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  cardStyle: {
    width: '100%',
    marginVertical: 3 * heightDifference,
    paddingVertical: 20 * heightDifference,
    paddingHorizontal: applyWidthDifference(13),
    borderWidth: applyWidthDifference(1),
    borderRadius: 2,
    borderColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    ...Platform.select({ // OS-specific drop shadow styling
      ios: {
        shadowRadius: 4,
        shadowOpacity: 0.15,
        shadowOffset: {
          height: 0,
          width: 3,
        },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rssi: {
    marginLeft: applyWidthDifference(6),
    width: applyWidthDifference(21),
    height: applyWidthDifference(16),
    resizeMode: 'contain',
  },
  helpContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: applyWidthDifference(30),
    width: applyWidthDifference(300),
  },
  helpItems: {
    paddingTop: applyWidthDifference(20),
  },
  helpSupport: {
    paddingTop: applyWidthDifference(30),
    textAlign: 'center',
  },
  scanning: {
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: fixedResponsiveFontSize(12),
    marginTop: 5 * heightDifference,
  },
  spinner: {
    paddingVertical: 15 * heightDifference,
  },
  icon: {
    height: fixedResponsiveFontSize(45),
  },
});
