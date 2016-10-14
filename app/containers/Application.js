import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  StatusBar,
  Navigator,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Drawer from 'react-native-drawer';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clone } from 'lodash';
import appActions from '../actions/app';
import Menu from '../components/Menu';
import routes from '../routes';
import styles from '../styles/application';
import constants from '../utils/constants';

const { bluetoothStates } = constants;

const {
  BluetoothService: Bluetooth,
  Environment,
} = NativeModules;

const BluetoothService = new NativeEventEmitter(Bluetooth);

const BaseConfig = Navigator.SceneConfigs.FloatFromRight;
const CustomSceneConfig = Object.assign({}, BaseConfig, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1,
  // Use our custom gesture defined above
  gestures: false,
});

class Application extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();

    this.navigationBarRouteMapper = {
      LeftButton: (route, navigator) => {
        let onPressHandler;
        let iconName;

        if (route.showMenu || route.showBackButton) {
          onPressHandler = route.showMenu ? () => this.showMenu(route, navigator) : navigator.pop;
          iconName = route.showMenu ? 'bars' : 'angle-left';

          return (
            <TouchableOpacity style={styles.leftButton} onPress={onPressHandler}>
              <Icon
                name={iconName}
                style={styles.leftButtonIcon}
                size={EStyleSheet.globalVars.$iconSize}
                color={styles._leftButtonIcon.color}
              />
            </TouchableOpacity>
          );
        }
      },
      RightButton: (route, navigator) => route.rightButton && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={() => route.rightButton.onPress(navigator)}
        >
          <Icon
            name={route.rightButton.iconName}
            size={EStyleSheet.globalVars.$iconSize}
            color={EStyleSheet.globalVars.$primaryColor}
          />
        </TouchableOpacity>
      ),
      Title: route => route.title && <Text style={styles.titleText}>{route.title}</Text>,
    };

    this.state = {
      drawerIsOpen: false,
      selectedTabBar: 0,
    };

    this.configureScene = this.configureScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.navigate = this.navigate.bind(this);
    this.navigator = null;
  }

  componentWillMount() {
    this.props.dispatch(appActions.setConfig(Environment));

    Bluetooth.getState((error, state) => {
      if (!error) {
        this.props.dispatch({
          type: 'UPDATE_BLUETOOTH_STATE',
          payload: state,
        });
      } else {
        Alert.alert('Error', error);
      }
    });
    // For Android only, check if Bluetooth is enabled.
    // If not, display prompt for user to enable Bluetooth.
    // This cannot be done on the BluetoothService module side
    // compared to iOS.
    if (Platform.OS === 'android') {
      Bluetooth.getIsEnabled()
        .then(isEnabled => !isEnabled && Bluetooth.enable());
    }

    const handler = ({ state }) => {
      this.props.dispatch({
        type: 'UPDATE_BLUETOOTH_STATE',
        payload: state,
      });

      if (state === bluetoothStates.OFF) {
        Alert.alert('Error', 'Bluetooth is off');
      }
    };

    if (Platform.OS === 'ios') {
      this.bluetoothListener = BluetoothService.addListener('BluetoothState', handler);
    } else {
      this.bluetoothListener = DeviceEventEmitter.addListener('BluetoothState', handler);
    }
  }

  componentWillUnmount() {
    if (this.bluetoothListener) {
      this.bluetoothListener.remove();
    }
  }

  configureScene() {
    return CustomSceneConfig;
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
    const tabBarRoutes = [
      {
        name: 'Dashboard',
        routeName: 'postureDashboard',
        iconName: 'circle-o',
      },
      {
        name: 'Session',
        routeName: 'postureDashboard',
        iconName: 'circle-o',
      },
      {
        name: 'Settings',
        routeName: 'settings',
        iconName: 'circle-o',
      },
    ];


    // Alter the push method on the navigator object to include a timestamp for
    // each route in the route stack so that each route in the stack is unique.
    // This prevents React errors when a route is in the stack multiple times.
    if (!this.navigator) {
      this.navigator = clone(navigator);
      this.navigator._push = this.navigator.push; // the original push method
      this.navigator.push = function push(routeObj) {
        return this._push({ ...routeObj, key: Date.now() });
      };
    }

    const TabBar = (
      <View style={styles.tabBar}>
        {
          tabBarRoutes.map((value, key) => {
            const tabBarItemColor = this.state.selectedTabBar === key ?
            styles._activeTabBarItem.color : styles._inactiveTabBarItem.color;

            return (
              <TouchableOpacity
                key={key}
                style={styles.tabBarItem}
                onPress={() => {
                  this.setState({
                    selectedTabBar: key,
                  }, this.navigator.replace(routes[value.routeName]));
                }}
              >
                <Icon
                  name="circle"
                  size={30}
                  color={tabBarItemColor}
                />
                <Text style={{ color: tabBarItemColor }}>{ value.name }</Text>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );

    return (
      <View style={{ flex: 1 }}>
        <StatusBar />
        <RouteComponent navigator={this.navigator} currentRoute={route} {...route.passProps} />
        { route.showTabBar && TabBar }
      </View>
    );
  }

  render() {
    return (
      <Drawer
        type="displace"
        content={<Menu
          menuItems={[
            routes.activity.activityDashboard,
            routes.postureDashboard,
            routes.profile,
            routes.settings,
          ]}
          navigate={route => this.navigate(route)}
        />}
        openDrawerOffset={0.3} // right margin when drawer is opened
        open={this.state.drawerIsOpen}
        onClose={() => this.setState({ drawerIsOpen: false })}
        acceptPan={false}
      >
        <Navigator
          navigationBar={<Navigator.NavigationBar routeMapper={this.navigationBarRouteMapper} />}
          configureScene={this.configureScene}
          initialRoute={routes.home}
          renderScene={this.renderScene}
        />
      </Drawer>
    );
  }
}

export default connect()(Application);
