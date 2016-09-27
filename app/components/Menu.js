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

const { PropTypes } = React;

Menu.propTypes = {
  menuItems: PropTypes.array,
  navigate: PropTypes.func,
};

export default Menu;
