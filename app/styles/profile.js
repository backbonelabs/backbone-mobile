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
  $photoIconSize: fixedResponsiveFontSize(40),
  container: {
    height: '100%',
    backgroundColor: 'white',
  },
  profileFieldContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    paddingVertical: applyWidthDifference(12),
    paddingHorizontal: applyWidthDifference(20),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '$grey200',
  },
  profileHeaderIconContainer: {
    backgroundColor: theme.grey200,
    height: applyWidthDifference(70),
    width: applyWidthDifference(70),
    borderRadius: applyWidthDifference(70) / 2,
  },
  profileHeaderIcon: {
    color: theme.grey500,
    backgroundColor: 'transparent',
    padding: applyWidthDifference(15),
  },
  profileHeaderNickname: {
    fontWeight: '900',
    paddingHorizontal: applyWidthDifference(20),
  },
  profileField: Object.assign({
    height: applyWidthDifference(60),
    justifyContent: 'flex-start',
    paddingHorizontal: applyWidthDifference(10),
    borderBottomWidth: 1,
    borderColor: '$grey200',
  }, positioning),
  profileText: {
    color: theme.primaryFontColor,
    fontSize: fixedResponsiveFontSize(16),
  },
  profileFieldIcon: {
    color: theme.blue500,
    width: applyWidthDifference(40),
    textAlign: 'center',
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
    borderColor: '$grey200',
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
