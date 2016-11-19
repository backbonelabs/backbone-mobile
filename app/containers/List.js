import React, { PropTypes, Component } from 'react';
import {
  ListView,
  TouchableOpacity,
} from 'react-native';

export default class List extends Component {
  static propTypes = {
    dataBlob: PropTypes.array.isRequired,
    formatRowData: PropTypes.func.isRequired,
    onPressRow: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: this.ds.cloneWithRows(this.props.dataBlob) };
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: this.state.dataSource.cloneWithRows(nextProps.dataBlob) });
  }

  renderRow(rowData) {
    return (
      <TouchableOpacity
        onPress={() => this.props.onPressRow && this.props.onPressRow(rowData)}
      >
        { this.props.formatRowData(rowData) }
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        enableEmptySections
      />
    );
  }
}
