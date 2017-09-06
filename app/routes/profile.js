import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Profile from '../containers/Profile';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import theme from '../styles/theme';
import Mixpanel from '../utils/Mixpanel';

const ProfileSave = props => {
  const isPendingSave = props.pendingUser && !props.pendingUser.invalidData;
  const textColor = isPendingSave ? '#FFFFFF' : theme.disabledColor;
  const text = <BodyText style={{ color: textColor }}>Save</BodyText>;

  return isPendingSave ? (
    <TouchableOpacity
      onPress={() => {
        Mixpanel.track('updateUserProfile');
        props.dispatch(userActions.updateUser(props.pendingUser));
      }}
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
  showLeftComponent: true,
  rightComponent: connect(mapStateToProps)(ProfileSave),
};
