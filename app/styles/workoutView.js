import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, width } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    // alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  gifContainer: {
    backgroundColor: 'white',
    ...Platform.select({
      // OS-specific drop shadow styling
      ios: {
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gif: {
    width: width * 0.75, // 75% of screen width
    height: width * 0.75 * 0.9, // same aspect ratio as gifs
  },
  videoLink: {
    bottom: applyWidthDifference(10),
    position: 'absolute',
    right: applyWidthDifference(10),
  },
  videoIcon: {
    height: applyWidthDifference(23),
    width: applyWidthDifference(23),
  },
  videoPlayerContainer: {
    width: '100%',
  },
});
