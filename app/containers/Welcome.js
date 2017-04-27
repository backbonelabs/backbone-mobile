import React, { PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import { LoginButton } from 'react-native-fbsdk';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import logo from '../images/logo.png';
import styles from '../styles/welcome';
import routes from '../routes';

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
      <LoginButton />
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
  </View>
);

Welcome.propTypes = {
  navigator: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default connect()(Welcome);
