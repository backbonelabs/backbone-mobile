import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
};

export default EStyleSheet.create({
  backgroundImage: {
    width: 375 * relativeDimensions.widthDifference,
    height: 667 * relativeDimensions.heightDifference,
  },
  profileFieldContainer: {
    flex: 0.5,
  },
  profileFieldTitle: Object.assign({
    flex: 0.39,
  }, positioning),
  profileField: Object.assign({
    flex: 0.16,
    justifyContent: 'space-between',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  }, positioning),
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
    fontSize: 14,
  },
  bottomSpacerContainer: {
    flex: 0.45,
    paddingTop: 20 * relativeDimensions.heightDifference,
  },
});
