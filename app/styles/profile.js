import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
};

export default EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  profileFieldContainer: {
    flex: 0.55,
  },
  profileFieldTitle: Object.assign({
    flex: 0.39,
  }, positioning),
  profileField: Object.assign({
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  }, positioning),
  profileText: {
    color: '$primaryFontColor',
  },
  profileFieldData: {
    flex: 0.61,
    alignItems: 'flex-end',
  },
  profileFieldInput: {
    fontFamily: '$primaryFont',
    fontSize: 14,
    borderColor: 'transparent',
    textAlign: 'right',
  },
  bottomSpacerContainer: {
    flex: 0.45,
    paddingTop: 20 * relativeDimensions.heightDifference,
  },
});
