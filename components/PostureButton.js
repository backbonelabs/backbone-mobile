import React from 'react';

import {
  TouchableHighlight,
  StyleSheet,
  Text,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    height: 75,
    width: 300,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

const PostureButtonView = (props) => (
  <TouchableHighlight style={[styles.button, props.colorStyle]} onPress={props.onPress}>
    <Text style={styles.buttonText}>
      {props.buttonText}
    </Text>
  </TouchableHighlight>
);

PostureButtonView.propTypes = {
  colorStyle: React.PropTypes.object,
  onPress: React.PropTypes.func,
  buttonText: React.PropTypes.string,
};

export default PostureButtonView;
