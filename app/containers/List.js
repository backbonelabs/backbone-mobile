import React, { PropTypes, Component } from 'react';
import {
  ListView,
  TouchableOpacity,
} from 'react-native';
import autobind from 'autobind-decorator';

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
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: this.state.dataSource.cloneWithRows(nextProps.dataBlob) });
  }

  @autobind
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
        style={this.props.onPressRow ? {} : { opacity: 0.25 }}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        enableEmptySections
      />
    );
  }
}
