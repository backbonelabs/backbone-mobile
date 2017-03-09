import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    textAlign: 'center',
    paddingVertical: applyWidthDifference(25),
  },
  calendarContainer: {
    backgroundColor: 'transparent',
  },
  currentDayCircle: {
    backgroundColor: 'black',
  },
  currentDayText: {
    color: '$primaryColor',
  },
  hasEventCircle: {
    backgroundColor: '$primaryColor',
  },
  hasEventText: {
    color: 'white',
  },
  day: {
    color: '$primaryFontColor',
  },
  weekendDayText: {
    color: '$primaryFontColor',
  },
  controlButtonText: {
    color: '$primaryFontColor',
  },
  title: {
    color: '$primaryFontColor',
  },
  dayHeading: {
    color: '$primaryFontColor',
  },
  weekendHeading: {
    color: '$primaryFontColor',
  },
});
