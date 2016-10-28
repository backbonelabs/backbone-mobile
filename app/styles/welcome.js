import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  $containerMargin: 22,
  $edgeMargins: '$containerMargin * 2',
  container: {
    flex: 1,
    marginHorizontal: '$containerMargin',
    marginTop: '$statusBarHeight + $containerMargin',
    marginBottom: '$containerMargin',
  },
  body: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: 30,
  },
  caption: {
    marginTop: 26,
  },
  text: {
    textAlign: 'center',
  },
  footer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  CTAContainer: {
    width: '$screenWidth - $edgeMargins',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
