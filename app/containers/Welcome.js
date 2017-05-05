import React, { PropTypes } from 'react';
import {
  View,
  Image,
  Alert,
} from 'react-native';
import {
  LoginManager,
} from 'react-native-fbsdk';
import { connect } from 'react-redux';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import logo from '../images/logo.png';
import styles from '../styles/welcome';
import routes from '../routes';

// Allows user to log into the app using their Facebook account with the following
// read permissions: pubic_profile, user_birthday, and email.
const facebookLogin = (props) => {
  LoginManager.logInWithReadPermissions(['public_profile', 'user_birthday', 'email']).then(
    (result) => {
      if (result.isCancelled) {
        Alert.alert('Login cancelled');
      } else {
        props.navigator.push(routes.login);
      }
    });
};

const Welcome = props => (
  <View style={styles.container}>
    <View style={styles.body}>
      <Image source={logo} />
      <View style={styles.heading}>
        <HeadingText size={1} style={styles._text}>Welcome to Backbone</HeadingText>
      </View>
      <View style={styles.caption}>
        <BodyText style={styles._text}>
          Look and feel stronger with Backbone
        </BodyText>
      </View>
    </View>
    <View style={styles.footer}>
      <View style={styles.CTAContainer}>
        <Button
          primary
          onPress={() => props.navigator.push(routes.login)}
          text="Log In"
        />
        <Button
          onPress={() => props.navigator.push(routes.signup)}
          text="Sign Up"
        />
      </View>
    </View>
    <View style={styles.fbContainer}>
      <Button
        style={styles._fbButton}
        primary
        text="Continue with Facebook"
        onPress={() => { facebookLogin(props); }}
      />
    </View>
  </View>
);

Welcome.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default connect()(Welcome);
