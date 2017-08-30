import React, { PropTypes } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Profile from '../containers/Profile';
import BodyText from '../components/BodyText';
import Spinner from '../components/Spinner';
import userActions from '../actions/user';
import theme from '../styles/theme';
import Mixpanel from '../utils/Mixpanel';
import { getColorHexForLevel } from '../utils/levelColors';

const ProfileSave = props => {
  console.log('selectedLevelIdx', props.training.selectedLevelIdx);

  const level = props.training.selectedLevelIdx;
  const profileLevelColorCode = getColorHexForLevel(level);

  const { user } = props;

  const isPendingSave = user.pendingUser && !user.pendingUser.invalidData;
  const profileTextColor = isPendingSave ? profileLevelColorCode : theme.disabledColor;
  const text = <BodyText style={{ color: profileTextColor }}>Save</BodyText>;

  return isPendingSave ? (
    <TouchableOpacity
      onPress={() => {
        Mixpanel.track('updateUserProfile');
        props.dispatch(userActions.updateUser(user.pendingUser));
      }}
    >
      {user.isUpdating ?
        <Spinner color="#FFFFFF" /> : text}
    </TouchableOpacity>
  ) : text;
};

ProfileSave.propTypes = {
  dispatch: PropTypes.func,
  user: PropTypes.shape({
    isUpdating: PropTypes.bool,
    pendingUser: PropTypes.object,
  }).isRequired,
  training: PropTypes.shape({
    selectedLevelIdx: PropTypes.number,
  }).isRequired,
};

const mapStateToProps = (state) => {
  const { training, user, dispatch } = state;
  return { training, user, dispatch };
};

export default {
  name: 'profile',
  title: 'Profile',
  component: Profile,
  showBackButton: true,
  showRightComponent: true,
  rightComponent: connect(mapStateToProps)(ProfileSave),
};
