import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
  container: {
    flex: 1,
    height: null,
    alignItems: 'center',
  },
  cardStyle: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    borderColor: '#ffffff',
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  cardTitleStyle: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardActionStyle: {
    height: '9%',
    flexDirection: 'row',
    borderStyle: 'solid',
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  cardContentStyle: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: 'rgba(0, 0, 0, 0.54)',
  },
  cardActionStyleText: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: 14.5,
  },
});
