import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Profile from '../containers/Profile';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import theme from '../styles/theme';

const ProfileSave = props => {
  const textColor = props.pendingUser ? '#FFFFFF' : theme.disabledColor;
  const text = <BodyText style={{ color: textColor }}>Save</BodyText>;

  return props.pendingUser ? (
    <TouchableOpacity
      onPress={() => props.dispatch(userActions.updateUser(props.pendingUser))}
    >
      {props.isUpdating ?
        <Spinner color="#FFFFFF" /> : text}
    </TouchableOpacity>
  ) : text;
};

ProfileSave.propTypes = {
  dispatch: PropTypes.func,
  isUpdating: PropTypes.bool,
  pendingUser: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default {
  name: 'profile',
  title: 'Profile',
  component: Profile,
  showBackButton: true,
  rightComponent: connect(mapStateToProps)(ProfileSave),
};
