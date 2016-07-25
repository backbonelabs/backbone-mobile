import React, { Component } from 'react';
import Main from './Main.react';
import logo from '../images/logo.png';

import {
  View,
  Text,
  Image,
  Animated,
  ListView,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  TouchableHighlight,
} from 'react-native';

const MetaWearAPI = NativeModules.MetaWearAPI;

const styles = StyleSheet.create({
  container: {
    marginTop: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  button: {
    height: 75,
    width: 275,
    marginTop: 150,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#48BBEC',
  },
  buttonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  list: {
    marginTop: -200,
  },
  listItem: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  listItemText: {
    fontSize: 12,
  },
});

class Initiate extends Component {
  constructor() {
    super();

    this.state = {
      devices: false,
      dataSource: null,
      logoAnimValue: 300,
      logoAnim: new Animated.Value(300),
      buttonAnim: new Animated.ValueXY(),
    };

    this.initiateConnect = this.initiateConnect.bind(this);
    this.connectAnimation = this.connectAnimation.bind(this);
    this.buttonEnterAnimation = this.buttonEnterAnimation.bind(this);
    this.renderRowData = this.renderRowData.bind(this);
    this.metaWearCallback = this.metaWearCallback.bind(this);
  }

  componentDidMount() {
    this.buttonEnterAnimation();
  }

  initiateConnect() {
    this.connectAnimation();
    const listenToDevices = new NativeEventEmitter(NativeModules.MetaWearAPI);
    MetaWearAPI.initiateConnection(this.metaWearCallback);
    this.state.buttonAnim.addListener((value) => {
      if (value.y === -225) {
        this.setState({
          devices: true,
        });
      }
    });

    listenToDevices.addListener('Scan', (collection) => {
      const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.setState({
        dataSource: ds.cloneWithRows(collection),
      });
    });
  }

  connectAnimation() {
    const context = this;
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(
      context.state.logoAnim,
      { toValue: 0 }),
    ]).start();

    Animated.sequence([
      Animated.spring(this.state.buttonAnim, {
        tension: 5,
        friction: 2,
        toValue: { x: 0, y: -225 },
      }),
    ]).start();
  }

  buttonEnterAnimation() {
    Animated.sequence([
      Animated.spring(this.state.buttonAnim, {
        tension: 5,
        friction: 2,
        toValue: { x: 0, y: -110 },
      }),
    ]).start();
  }

  metaWearCallback() {
    this.props.navigator.push({
      name: 'main',
      component: Main,
      passProps: { MetaWearAPI },
    });
  }

  connectToMetaWear(id) {
    MetaWearAPI.connectToMetaWear(id, this.metaWearCallback);
  }

  renderRowData(rowData) {
    return (
      <TouchableHighlight onPress={() => { this.connectToMetaWear(rowData.id); }}>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>Name: {rowData.name}</Text>
          <Text style={styles.listItemText}>RSSI: {rowData.RSSI}</Text>
          <Text style={styles.listItemText}>Identifier: {rowData.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const logoDimensions = {
      height: this.state.logoAnim,
      width: this.state.logoAnim,
      marginTop: 300 - this.state.logoAnim,
    };
    return (
      <View style={styles.container}>
        <Animated.Image style={logoDimensions} source={logo} />
        <Animated.View style={{ transform: this.state.buttonAnim.getTranslateTransform() }}>
          <TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
            <Text style={styles.buttonText}>CONNECT</Text>
          </TouchableHighlight>
        </Animated.View>
        {this.state.devices ?
          <ListView
            style={styles.list}
            dataSource={this.state.dataSource}
            renderRow={this.renderRowData}
          /> :
          <View />
        }
      </View>
    );
  }
}

Initiate.propTypes = {
  navigator: React.PropTypes.object,
};

export default Initiate;
