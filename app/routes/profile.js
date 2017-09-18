import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Profile from '../containers/Profile';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import theme from '../styles/theme';
import Mixpanel from '../utils/Mixpanel';
import styles from '../styles/profile';

const ProfileSave = props => {
  const isPendingSave = props.pendingUser && !props.pendingUser.invalidData;
  const profileTextColor = isPendingSave ? theme.lightBlue500 : theme.disabledColor;
  const text = <BodyText style={[styles.profileSave, { color: profileTextColor }]}>Save</BodyText>;

  return isPendingSave ? (
    <TouchableOpacity
      onPress={() => {
        Mixpanel.track('updateUserProfile');
        props.dispatch(userActions.updateUser(props.pendingUser));
      }}
    >
      {props.isUpdating ?
        <Spinner style={styles.profileSaveSpinner} color={theme.orange500} size="small" /> : text}
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
  showRightComponent: true,
  showLeftComponent: true,
  rightComponent: connect(mapStateToProps)(ProfileSave),
};
