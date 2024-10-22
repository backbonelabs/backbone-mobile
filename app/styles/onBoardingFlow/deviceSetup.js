import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grey100',
    alignItems: 'center',
  },
  stepBar: {
    marginBottom: applyWidthDifference(30),
    marginTop: applyWidthDifference(20),
  },
  deviceScan_header: {
    marginTop: applyWidthDifference(25),
    fontWeight: 'bold',
  },
  deviceSetup_header: {
    fontWeight: 'bold',
  },
  innerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
  },
  deviceContainer: {
    width: '85%',
    height: applyWidthDifference(300),
    backgroundColor: 'white',
    borderRadius: 3,
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
  deviceRow: {
    flexDirection: 'row',
    marginTop: applyWidthDifference(20),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: applyWidthDifference(15),
  },
  devicesNotFound: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: applyWidthDifference(300),
  },
  devicesNotFoundIcon: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(10),
  },
  receptionIcon: {
    width: applyWidthDifference(20),
    height: applyWidthDifference(20),
    resizeMode: 'contain',
  },
  deviceNotFoundText: {
    textAlign: 'center',
  },
  deviceNotFoundErrorText: {
    marginTop: applyWidthDifference(10),
    color: '$primaryColor',
  },
  image: {
    width: applyWidthDifference(250),
    resizeMode: 'contain',
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
  },
  CTAContainer: {
    marginBottom: applyWidthDifference(15),
  },
  CTAButton: {
    width: '85%',
    alignSelf: 'center',
  },
  skip: {
    textDecorationLine: 'underline',
  },
  howToContainer: {
    flex: 1,
    backgroundColor: '$grey100',
  },
  howToInnerContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  howToVideo: {
    width: '85%',
    marginVertical: applyWidthDifference(20),
    alignSelf: 'center',
  },
  howToHeader: {
    textAlign: 'center',
  },
});
