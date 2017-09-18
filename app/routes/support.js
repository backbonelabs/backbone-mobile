import React, { PropTypes } from 'react';
import { TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import Support from '../containers/Support';
import supportActions from '../actions/support';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import theme from '../styles/theme';

const SupportSubmit = props => {
  const textColor = props.supportMessage ? theme.blue500 : theme.disabledColor;
  const text = <BodyText style={{ color: textColor }}>Send</BodyText>;

  return props.supportMessage ? (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        return props.dispatch(supportActions.createTicket(props.supportMessage));
      }}
    >
      {props.inProgress ?
        <Spinner
          style={{ alignSelf: 'flex-end' }}
          color={theme.secondaryColor}
          size="small"
        /> : text}
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
  showLeftComponent: true,
  showRightComponent: true,
  rightComponent: connect(mapStateToProps)(SupportSubmit),
};
