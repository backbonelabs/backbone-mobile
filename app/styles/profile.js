import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  heightDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
};

export default EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  $iconSize: fixedResponsiveFontSize(20),
  profileFieldContainer: {
    flex: 1,
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: applyWidthDifference(20),
    alignItems: 'center',
    paddingBottom: applyWidthDifference(15),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  profileHeaderUserImage: {
    height: applyWidthDifference(60),
    width: applyWidthDifference(60),
  },
  profileHeaderNickname: {
    fontSize: fixedResponsiveFontSize(28),
    color: 'black',
    fontWeight: '900',
    paddingLeft: applyWidthDifference(20),
  },
  profileField: Object.assign({
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: applyWidthDifference(10),
    paddingVertical: applyWidthDifference(20),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  }, positioning),

  profileText: {
    color: '$primaryFontColor',
  },
  profileFieldIcon: {
    color: 'grey',
    paddingHorizontal: applyWidthDifference(15),
  },
  profileFieldData: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: applyWidthDifference(15),
  },
  profileFieldInput: {
    fontSize: fixedResponsiveFontSize(16),
    height: applyWidthDifference(20),
    width: '90%',
    paddingHorizontal: applyWidthDifference(15),
    paddingBottom: applyWidthDifference(5),
  },
  logoutSpacerContainer: {
    height: applyWidthDifference(20),
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  bottomSpacerContainer: {
    flex: 0.15,
    paddingTop: 20 * heightDifference,
  },
});
