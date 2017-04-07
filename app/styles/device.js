import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EEE',
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
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
          height: 1 * heightDifference,
          width: applyWidthDifference(2),
        },
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
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
