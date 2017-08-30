import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, width } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
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
    flex: 2,
  },
  videoPlayer: {
    width: '100%',
  },
});
