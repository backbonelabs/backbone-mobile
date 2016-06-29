import React, { Component } from 'react';

import {
  Text,
  ListView,
} from 'react-native';

// const styles = StyleSheet.create({

// });

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
        dataSource={this.state.dataSource}
        renderRow={(rowData) => <Text>{rowData}</Text>}
      />
    );
  }
}

Menu.propTypes = {
  menuItems: React.PropTypes.object,
};

export default Menu;
