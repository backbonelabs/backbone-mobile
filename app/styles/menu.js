import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  list: {
    marginTop: 0,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  listItemText: {
    fontSize: applyWidthDifference(18),
    color: 'white',
    textAlign: 'center',
  },
});
