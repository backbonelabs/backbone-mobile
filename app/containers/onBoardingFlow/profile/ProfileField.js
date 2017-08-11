import React, { PropTypes } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import BodyText from '../../../components/BodyText';
import SecondaryText from '../../../components/SecondaryText';
import styles from '../../../styles/onBoardingFlow/profile';

const ProfileField = (props) => {
  const handleOnClick = () => {
    props.setPickerType(props.value.type);
  };

  return (
    <TouchableWithoutFeedback
      onPress={handleOnClick}
    >
      <View style={[styles.profileField, props.styles]}>
        <Image
          style={styles.icon}
          source={props.icon}
        />
        { props.value.label ?
          <BodyText>{ props.value.label }</BodyText>
            :
              <SecondaryText>
                {`${props.value.type.charAt(0).toUpperCase()}${props.value.type.slice(1)}`}
              </SecondaryText>
        }
      </View>
    </TouchableWithoutFeedback>
  );
};

ProfileField.propTypes = {
  value: PropTypes.object,
  styles: PropTypes.object,
  icon: PropTypes.number,
  setPickerType: PropTypes.func,
};

export default ProfileField;
