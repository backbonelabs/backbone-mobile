import React, { Component } from 'react';

import {
	TouchableHighlight,
	StyleSheet,
  Text,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    height: 50,
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

class PostureButtonView extends Component {
  render() {
    return (
			<TouchableHighlight style={[styles.button, this.props.colorStyle]} onPress={this.props.onPress}>
        <Text style={styles.buttonText}>
          {this.props.buttonText}
        </Text>
			</TouchableHighlight>
		);
  }
}

PostureButtonView.propTypes = {
  colorStyle: React.PropTypes.object,
  onPress: React.PropTypes.func,
  buttonText: React.PropTypes.string,
};

export default PostureButtonView;
