import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  list: {
    marginTop: 0,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  listItemText: {
    fontSize: fixedResponsiveFontSize(18),
    color: 'white',
    textAlign: 'center',
  },
});
