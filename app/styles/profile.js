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
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  profileFieldContainer: {
    flex: 1,
    width: '100%',
    height: '10%',
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
    width: '80%',
    paddingHorizontal: applyWidthDifference(15),
    paddingBottom: applyWidthDifference(5),
    borderWidth: 0,
  },
  signOutSpacerContainer: {
    height: applyWidthDifference(20),
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  innerContainerStyles: {
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 0,
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
});
