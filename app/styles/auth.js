import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
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
    width: '100%',
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
      android: {
        elevation: 2,
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    height: applyWidthDifference(50),
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
    paddingTop: applyWidthDifference(15),
  },
  subHeadingText: {
    textAlign: 'center',
    alignItems: 'center',
    paddingVertical: applyWidthDifference(15),
    fontSize: fixedResponsiveFontSize(14),
    width: '85%',
  },
  formContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  inputFieldContainer: {
    marginBottom: applyWidthDifference(15),
  },
  inputsContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fbBtn: {
    width: '85%',
    height: applyWidthDifference(50),
  },
  fbBtnText: {
    fontSize: fixedResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  breakContainer: {
    flexDirection: 'row',
    width: '85%',
    marginBottom: applyWidthDifference(10),
    marginTop: applyWidthDifference(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakLine: {
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
  legalContainer: {
    flexDirection: 'row',
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
    borderRadius: 0,
  },
  CTAResetBtn: {
    alignSelf: 'center',
    marginTop: applyWidthDifference(10),
    width: '85%',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: applyWidthDifference(5),
    textDecorationLine: 'underline',
  },
  cancel: {
    marginTop: applyWidthDifference(25),
    textDecorationLine: 'underline',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: applyWidthDifference(10),
  },
  warning: {
    color: '$primaryColor',
    textAlign: 'center',
    marginLeft: applyWidthDifference(5),
    fontSize: fixedResponsiveFontSize(14),
  },
});
