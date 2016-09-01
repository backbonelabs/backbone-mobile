import React, { Component } from 'react';
import {
  View,
  ListView,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/list';

export default class DeviceList extends Component {
  static propTypes = {
    dataBlob: React.PropTypes.array,
    onPressRow: React.PropTypes.func,
    formatRowData: React.PropTypes.func,
    getRowData: React.PropTypes.func,
  };

  static defaultProps = { dataBlob: [] };

  constructor(props) {
    console.log('hello', props);
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: this.ds.cloneWithRows(this.props.dataBlob) };
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log('next', nextProps);
    this.setState({ dataSource: this.state.dataSource.cloneWithRows(nextProps.dataBlob) });
  }

  renderRow(rowData) {
    return (
      <TouchableOpacity style={styles.rowButton} onPress={() => this.props.onPressRow(rowData)}>
        { this.props.formatRowData(rowData) }
      </TouchableOpacity>
    );
  }

  renderSeparator(sectionId, rowId) {
    return <View key={rowId} style={styles.rowSeparator} />;
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        enableEmptySections
      />
    );
  }
}
