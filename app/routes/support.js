import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Support from '../containers/Support';
import supportActions from '../actions/support';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import theme from '../styles/theme';

const SupportSubmit = props => {
  const textColor = props.supportMessage ? '#FFFFFF' : theme.disabledColor;
  const text = <BodyText style={{ color: textColor }}>Send</BodyText>;

  return props.supportMessage ? (
    <TouchableOpacity
      onPress={() => props.dispatch(supportActions.createTicket(props.supportMessage))}
    >
      {props.inProgress ?
        <Spinner color="#FFFFFF" /> : text}
    </TouchableOpacity>
  ) : text;
};

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
  title: 'Talk to us',
  component: Support,
  showBackButton: true,
  rightComponent: connect(mapStateToProps)(SupportSubmit),
};
