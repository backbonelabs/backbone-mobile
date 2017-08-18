import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  preloadingPlaceholder: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: applyWidthDifference(64),
    height: applyWidthDifference(64),
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playArrow: {
    color: 'white',
  },
  video: {
    backgroundColor: 'black',
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: applyWidthDifference(48),
    marginTop: applyWidthDifference(-48),
    flexDirection: 'row',
    alignItems: 'center',
  },
  playControl: {
    color: 'white',
    padding: 8,
  },
  extraControl: {
    color: 'white',
    padding: 8,
  },
  seekBar: {
    alignItems: 'center',
    height: applyWidthDifference(30),
    flexGrow: 1,
    flexDirection: 'row',
    paddingHorizontal: applyWidthDifference(10),
    marginLeft: applyWidthDifference(-10),
    marginRight: applyWidthDifference(-5),
  },
  seekBarFullWidth: {
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 0,
    marginTop: applyWidthDifference(-3),
    height: applyWidthDifference(3),
  },
  seekBarProgress: {
    height: applyWidthDifference(3),
    backgroundColor: '#F00',
  },
  seekBarKnob: {
    width: applyWidthDifference(20),
    height: applyWidthDifference(20),
    marginHorizontal: applyWidthDifference(-8),
    marginVertical: applyWidthDifference(-10),
    borderRadius: applyWidthDifference(10),
    backgroundColor: '#F00',
    transform: [{ scale: 0.8 }],
    zIndex: 1,
  },
  seekBarBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: applyWidthDifference(3),
  },
  overlayButton: {
    flex: 1,
  },
});
