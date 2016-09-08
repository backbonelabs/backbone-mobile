import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import logo from '../images/logo.png';
import bg from '../images/bg.jpg';
import styles from '../styles/home';
import routes from '../routes';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';

class Home extends Component {
  static propTypes = {
    auth: React.PropTypes.shape({
      accessToken: React.PropTypes.string,
      isFetchingAccessToken: React.PropTypes.bool,
    }),
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      isInitializing: true,
    };
    this.getMainBody = this.getMainBody.bind(this);
  }

  componentWillMount() {
    // This is the initialization process where we check if there
    // is a stored access token. An access token would have been saved
    // on a previously successful login.
    SensitiveInfo.getItem('accessToken')
      .then(accessToken => {
        if (accessToken) {
          // There is a saved access token
          // Attempt to log in using the access token
          this.props.dispatch(authActions.login({ accessToken }));
        }
      })
      .then(() => {
        this.setState({ isInitializing: false });
      })
      .catch(() => {
        this.setState({ isInitializing: false });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.auth.isFetchingAccessToken && !nextProps.auth.isFetchingAccessToken) {
      // Finished login attempt
      if (nextProps.auth.errorMessage) {
        // Access token is invalid
        // Delete from local device to prevent unnecessary API calls on subsequent app load
        SensitiveInfo.deleteItem('accessToken');
      } else {
        // Successful login, save new access token
        SensitiveInfo.setItem('accessToken', nextProps.auth.accessToken);
      }
    }
  }

  getMainBody() {
    if (this.props.auth.accessToken) {
      return (
        <Button
          onPress={() => this.props.navigator.push(routes.device.deviceConnect)}
          text="Connect"
        />
      );
    }
    return (
      <Button
        onPress={() => this.props.navigator.push(routes.login)}
        text="Log In"
      />
    );
  }

  render() {
    const footerButton = this.props.auth.accessToken ?
    { text: 'Delete access token',
      onPress: () => SensitiveInfo.deleteItem('accessToken'),
    } :
    { text: 'Don\'t have an account? Sign up',
      onPress: () => this.props.navigator.push(routes.signup),
    };

    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isInitializing || this.props.auth.isFetchingAccessToken ?
            <Spinner />
            :
            this.getMainBody()
          }
        </View>
        <TouchableHighlight style={styles.footer} onPress={() => footerButton.onPress()}>
          <Text style={styles.footerText}>{footerButton.text}</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Home);
