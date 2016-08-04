import React, { Component } from 'react';
import {
  View,
  Text,
  ListView,
} from 'react-native';
import styles from '../styles/menu';

class Menu extends Component {
  constructor() {
    super();

    this.state = {
      dataSource: null,
    };
  }

  componentWillMount() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.setState({
      dataSource: ds.cloneWithRows(this.props.menuItems),
    });
  }

  render() {
    return (
      <ListView
        style={styles.list}
        dataSource={this.state.dataSource}
        renderRow={(rowData) => <View style={styles.listItem}><Text style={styles.listItemText}>{rowData}</Text></View>}
      />
    );
  }
}

Menu.propTypes = {
  menuItems: React.PropTypes.object,
};

export default Menu;
