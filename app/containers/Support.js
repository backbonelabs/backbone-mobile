import React, { Component, PropTypes } from 'react';
import {
  Alert,
  TextInput,
} from 'react-native';
import { connect } from 'react-redux';
import supportActions from '../actions/support';

class Support extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.inProgress && !nextProps.inProgress) {
      if (nextProps.errorMessage) {
        Alert.alert('Error', nextProps.errorMessage);
      } else {
        Alert.alert('success');
      }
    }
  }

  render() {
    return (
      <TextInput
        style={{ flex: 1, fontSize: 16 }}
        placeholder="Message here"
        multiline
        onChangeText={text => this.props.dispatch(supportActions.updateMessage(text))}
      />
    );
  }
}

const mapStateToProps = (state) => {
  const { support } = state;
  return support;
};

export default connect(mapStateToProps)(Support);
