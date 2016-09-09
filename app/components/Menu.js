import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../styles/menu';
import List from '../containers/List';

const Menu = (props) => {
  const onPressMenu = rowData => props.navigate(rowData);
  const formatMenuRow = rowData => <Text style={styles.listItemText}>{rowData.title}</Text>;

  return (
    <List
      dataBlob={props.menuItems}
      formatRowData={formatMenuRow}
      onPressRow={onPressMenu}
    />
  );
};

Menu.propTypes = {
  menuItems: React.PropTypes.array,
  navigate: React.PropTypes.func,
};

export default Menu;
