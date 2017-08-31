import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';
import relativeDimensions from '../utils/relativeDimensions';
import theme from '../styles/theme';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
};

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(20),
  container: {
    height: '100%',
    backgroundColor: 'white',
  },
  profileFieldContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
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
    color: theme.primaryFontColor,
    fontWeight: '900',
    paddingHorizontal: applyWidthDifference(20),
  },
  profileField: Object.assign({
    height: applyWidthDifference(60),
    justifyContent: 'flex-start',
    paddingHorizontal: applyWidthDifference(10),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  }, positioning),
  profileText: {
    color: theme.primaryFontColor,
    fontSize: fixedResponsiveFontSize(16),
  },
  profileFieldIcon: {
    color: theme.grey500,
    paddingHorizontal: applyWidthDifference(15),
  },
  profileFieldData: {
    paddingHorizontal: applyWidthDifference(15),
  },
  profileFieldInput: {
    paddingHorizontal: applyWidthDifference(15),
  },
  signOutSpacerContainer: {
    height: applyWidthDifference(20),
    backgroundColor: theme.grey100,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  // Used to overwrite Input module's default styling
  innerContainerStyles: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  pickerContainer: {
    ...Platform.select({
      ios: {
        height: applyWidthDifference(220),
        marginTop: applyWidthDifference(-20),
      },
      android: {
        height: applyWidthDifference(40),
      },
    }),
  },
});
