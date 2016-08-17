import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  StatusBar,
  Navigator,
  NativeModules,
  NativeEventEmitter,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import userActions from '../actions/user';
import SensitiveInfo from '../utils/SensitiveInfo';
import Menu from './Menu';
import routes from '../routes';
import styles from '../styles/application';

const BluetoothService = new NativeEventEmitter(NativeModules.BluetoothService);

class Application extends Component {
  static propTypes = {
    accessToken: React.PropTypes.string,
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

    const context = this;

    this.navigationBarRouteMapper = {
      LeftButton() {
      },
      RightButton() {
      },
      Title(route, navigator) {
        let menuButton;

        if (route.showMenu) {
          menuButton = (
            <TouchableHighlight
              style={styles.menuButton}
              onPress={() => {
                context.showMenu(route, navigator);
              }}
            >
              <Icon
                name="bars"
                style={styles.menuIcon}
                size={30}
                color={EStyleSheet.globalVars.$primaryColor}
              />
            </TouchableHighlight>
          );
        }

        return (
          <View style={styles.container}>
            <View style={styles.statusBar} />
            {menuButton}
          </View>
        );
      },
    };

    this.state = {
      drawerIsOpen: false,
      isFetchingAccessToken: true,
    };

    BluetoothService.addListener('CentralStatus', (status) => {
      // placeholder
      console.log('Central status: ', status.state);
    });

    this.configureScene = this.configureScene.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  componentDidMount() {
    // Attempt to retrieve a saved access token
    SensitiveInfo.getItem('accessToken')
      .then(accessToken => {
        // TODO: Verify with API server if access token is valid
        this.props.dispatch(userActions.setAccessToken(accessToken));
      })
      .catch(() => {
        this.setState({ isFetchingAccessToken: false });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      // Found previous access token
      this.setState({ isFetchingAccessToken: false });
    }
  }

  configureScene() {
    return Navigator.SceneConfigs.PushFromRight;
  }

  showMenu() {
    this.setState({ drawerIsOpen: true });
  }

  navigate(route) {
    const routeStack = this.navigator.getCurrentRoutes();
    const currentRoute = routeStack[routeStack.length - 1];
    if (route.name !== currentRoute.name) {
      // Only navigate if the selected route isn't the current route
      this.navigator.push(route);
    }
    if (this.state.drawerIsOpen) {
      this.setState({ drawerIsOpen: false });
    }
  }

  renderScene(route, navigator) {
    const { component: RouteComponent } = route;
    return <RouteComponent navigator={navigator} currentRoute={route} {...route.passProps} />;
  }

  render() {
    return this.state.isFetchingAccessToken ?
      <View style={styles.activityIndicatorView}>
        <ActivityIndicator
          animating
          size="large"
          color={styles._activityIndicator.color}
        />
      </View>
      :
      <Drawer
        type="displace"
        content={<Menu
          menuItems={pick(routes, ['activity', 'posture'])}
          navigate={route => this.navigate(route)}
        />}
        openDrawerOffset={0.3} // right margin when drawer is opened
        open={this.state.drawerIsOpen}
        onClose={() => this.setState({ drawerIsOpen: false })}
        acceptPan={false}
      >
        <Navigator
          ref={ref => {
            this.navigator = ref;
          }}
          navigationBar={<Navigator.NavigationBar routeMapper={this.navigationBarRouteMapper} />}
          configureScene={this.configureScene}
          initialRoute={this.props.accessToken ? routes.home : routes.login}
          renderScene={this.renderScene}
        />
      </Drawer>;
  }
}

const mapStateToProps = state => ({
  accessToken: state.auth.accessToken,
});

export default connect(mapStateToProps)(Application);
