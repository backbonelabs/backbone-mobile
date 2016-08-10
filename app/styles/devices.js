import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginTop: 50,
  },
  title: {
    fontSize: 42,
    marginBottom: 25,
    color: '#A8A8A8',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  listItem: {
    padding: 10,
    borderWidth: 3,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    borderColor: '$primaryColor',
  },
  listItemText: {
    fontSize: '1rem',
  },
});
