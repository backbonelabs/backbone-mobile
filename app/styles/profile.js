import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
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
  profileFieldTitle: Object.assign({
    flex: 0.39,
  }, positioning),
  profileField: Object.assign({
    flex: 0.16,
    justifyContent: 'space-between',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
  }, border, positioning),
  profileText: {
    color: 'black',
  },
  profileFieldData: {
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
