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
  profileFieldContainer: Object.assign({
    flex: 0.5,
  }, border),
  profileFieldTitle: {
    flex: 0.39,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileField: Object.assign({
    flex: 0.16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
  }, border),
  profileText: {
    color: 'black',
  },
  profileFieldInfo: {
    flex: 0.61,
    alignItems: 'flex-end',
  },
  profileFieldInput: {
    borderColor: 'transparent',
    textAlign: 'right',
  },
  bottomSpacerContainer: {
    flex: 0.41,
    paddingTop: 20 * relativeDimensions.heightDifference,
  },
});
