import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, applyWidthDifference } = relativeDimensions;

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
  secondaryText: {
    fontSize: applyWidthDifference(12),
    marginTop: 5 * heightDifference,
  },
  spinner: {
    paddingVertical: 15 * heightDifference,
  },
  icon: {
    height: 45 * heightDifference,
  },
});
