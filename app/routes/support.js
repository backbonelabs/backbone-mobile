import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Support from '../containers/Support';
import supportActions from '../actions/support';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';

const SupportSubmit = props => (
  <TouchableOpacity
    onPress={() => props.dispatch(supportActions.createTicket(props.supportMessage))}
  >
    {props.inProgress ?
      <Spinner color="#FFFFFF" /> : <BodyText style={{ color: '#FFFFFF' }}>Send</BodyText>}
  </TouchableOpacity>
);

SupportSubmit.propTypes = {
  dispatch: PropTypes.func,
  inProgress: PropTypes.bool,
  supportMessage: PropTypes.string,
};

const mapStateToProps = (state) => {
  const { support } = state;
  return support;
};

export default {
  name: 'support',
  title: 'Send us a message',
  component: Support,
  showBackButton: true,
  rightComponent: connect(mapStateToProps)(SupportSubmit),
};
