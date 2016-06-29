import React, { Component } from 'react';

import {
  View,
  Text,
  ListView,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  list: {
    marginTop: 0,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  listItemText: {
    fontSize: 24,
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
});

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
