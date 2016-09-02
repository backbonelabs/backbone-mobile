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
      isValidAccessToken: React.PropTypes.bool,
      isVerifyingAccessToken: React.PropTypes.bool,
    }),
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,

  };

  constructor(props) {
    super(props);
    this.state = {
      isFetchingAccessToken: true,
    };
    this.getMainBody = this.getMainBody.bind(this);
  }

  componentWillMount() {
    // Attempt to find a previously saved access token
    // An access token would have been saved on a successful login
    SensitiveInfo.getItem('accessToken')
      .then(accessToken => {
        this.setState({ isFetchingAccessToken: false, accessToken });

        if (accessToken) {
          // There is a saved access token
          // Verify with API server if access token is valid
          this.props.dispatch(authActions.verifyAccessToken(accessToken));
        }
      })
      .catch(() => {
        this.setState({ isFetchingAccessToken: false });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.auth.isVerifyingAccessToken &&
      !nextProps.auth.isVerifyingAccessToken &&
      !nextProps.auth.errorMessage &&
      !nextProps.auth.isValidAccessToken) {
      // Access token is invalid
      // Delete from local device to prevent unnecessary API calls on subsequent app load
      SensitiveInfo.deleteItem('accessToken');
    }
  }

  getMainBody() {
    if (this.state.accessToken && this.props.auth.isValidAccessToken) {
      return (
        <Button
          onPress={() => { this.props.navigator.push(routes.device.deviceConnect); }}
          text="Connect"
        />
      );
    }
    return (
      <Button
        onPress={() => { this.props.navigator.push(routes.login); }}
        text="Log In"
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isFetchingAccessToken || this.props.auth.isVerifyingAccessToken ?
            <Spinner />
            :
            this.getMainBody()
          }
        </View>
        <View style={styles.footer}>
          {this.state.accessToken && this.props.auth.isValidAccessToken ?
            // This conditional block for deleting the access token is for temporary
            // testing purposes only. Remove this entire conditional block after
            // implementing a logout component.
            <TouchableOpacity
              onPress={() => {
                SensitiveInfo.deleteItem('accessToken');
              }}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>Delete access token</Text>
            </TouchableOpacity> :
            <TouchableHighlight onPress={() => this.props.navigator.push(routes.signup)}>
              <Text style={styles.signup}>Don't have an account? Sign-up</Text>
            </TouchableHighlight>
          }
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Home);
