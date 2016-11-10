import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

export default EStyleSheet.create({
  backgroundImage: {
    width: 375 * relativeDimensions.widthDifference,
    height: 667 * relativeDimensions.heightDifference,
  },
  spacer: Object.assign({ flex: 0.09 }, border),
  profileFields: Object.assign({
    flex: 0.5,
  }, border),
  field: Object.assign({
    flex: 0.16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  }, border),
  profileText: {
    color: 'black',
  },
  bottomSpacerContainer: {
    flex: 0.41,
    paddingTop: 20,
  },
});
