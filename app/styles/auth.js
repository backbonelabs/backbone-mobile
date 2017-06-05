import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  heightDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  $checkboxColor: '$primaryColor',
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  innerContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  backboneLogo: {
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  heading: {
    backgroundColor: 'white',
    width: '100%',
    ...Platform.select({
      // OS-specific drop shadow styling
      ios: {
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      // android: {
      //   add android styles here
      // },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    justifyContent: 'flex-end',
  },
  currentTab: {
    borderBottomColor: '$secondaryColor',
    borderBottomWidth: 4,
  },
  currentTabText: {
    color: '$secondaryColor',
  },
  headingText: {
    paddingTop: 15 * heightDifference,
  },
  subHeadingText: {
    textAlign: 'center',
    alignItems: 'center',
    paddingVertical: 15 * heightDifference,
    fontSize: fixedResponsiveFontSize(14),
    width: '85%',
  },
  formContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  inputFieldContainer: {
    marginBottom: 15 * heightDifference,
  },
  inputsContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    width: '85%',
  },
  fbBtn: {
    width: '85%',
    borderRadius: 3,
    height: 50 * heightDifference,
  },
  fbBtnText: {
    fontSize: fixedResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  breakContainer: {
    flexDirection: 'row',
    width: '85%',
    marginBottom: 10 * heightDifference,
    marginTop: 10 * heightDifference,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSideBreak: {
    borderTopWidth: 1,
    flex: 1,
    borderTopColor: '#E0E0E0',
  },
  rightSideBreak: {
    borderTopWidth: 1,
    flex: 1,
    borderTopColor: '#E0E0E0',
  },
  textBreak: {
    paddingLeft: 10,
    paddingRight: 10,
    color: '#E0E0E0',
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(12),
  },
  checkBox: {
    marginRight: 10,
  },
  legalInnerContainer: {
    flexDirection: 'row',
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: applyWidthDifference(250),
    height: 20 * heightDifference,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
  CTAContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  CTAButton: {
    width: '100%',
  },
  CTAResetBtn: {
    alignSelf: 'center',
    borderRadius: 3,
    marginTop: 10 * heightDifference,
    width: '85%',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: 5 * heightDifference,
    textDecorationLine: 'underline',
  },
  cancel: {
    marginTop: 25 * heightDifference,
    textDecorationLine: 'underline',
  },
  warning: {
    color: '$primaryColor',
    textAlign: 'center',
    fontSize: fixedResponsiveFontSize(14),
    height: 25 * heightDifference,
  },
});
