import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
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
    SensitiveInfo.getItem('accessToken')
      .then(accessToken => {
        this.setState({ isFetchingAccessToken: false, accessToken });

        if (accessToken) {
          // Verify with API server if access token is valid
          this.props.dispatch(authActions.verifyAccessToken(accessToken));
        }
      })
      .catch(() => {
        this.setState({ isFetchingAccessToken: false });
      });
  }

  getMainBody() {
    if (this.state.accessToken && this.props.auth.isValidAccessToken) {
      return (
        <TouchableOpacity
          style={styles.button}
          onPress={() => { this.props.navigator.push(routes.deviceConnect); }}
        >
          <Text style={styles.connect}>Connect</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => { this.props.navigator.push(routes.login); }}
      >
        <Text style={styles.connect}>Log In</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const activityModal = (
      <ActivityIndicator
        animating
        size="large"
        color={styles._activityIndicator.color}
      />
    );

    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isFetchingAccessToken || this.props.auth.isVerifyingAccessToken ?
            activityModal
            :
            this.getMainBody()
          }
        </View>
        <View style={styles.footer}>
          <Text style={styles.signup}>Don't have an account? Sign-up</Text>
          {this.state.accessToken && this.props.auth.isValidAccessToken &&
            // This conditional block for deleting the access token is for temporary
            // testing purposes only. Remove this entire conditional block after
            // implementing a logout component.
            <TouchableOpacity
              onPress={() => {
                SensitiveInfo.deleteItem('accessToken');
              }}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>Delete access token</Text>
            </TouchableOpacity>
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
