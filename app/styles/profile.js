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
    // Can be removed after adding the photo feature
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: fixedResponsiveFontSize(16),
  },
  signOutSpacerContainer: {
    height: applyWidthDifference(30),
    backgroundColor: theme.grey100,
    borderBottomWidth: 1,
    borderColor: '$grey200',
  },
  resendEmailContainer: {
    alignItems: 'center',
    paddingVertical: applyWidthDifference(15),
    borderBottomWidth: 1,
    borderColor: '$grey200',
  },
  resendEmailText: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(15),
    width: '85%',
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
