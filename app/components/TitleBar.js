import React, { PropTypes } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeadingText from './HeadingText';
import styles from '../styles/titleBar';

const TitleBar = (props) => {
  const routeStack = props.navigator.getCurrentRoutes();
  const previousRoute = routeStack.length >= 2 ? routeStack[routeStack.length - 2] : null;
  const leftButton = previousRoute && props.currentRoute.showBackButton ? (
    <TouchableOpacity style={styles.leftComponent} onPress={props.navigator.pop}>
      <Icon
        name="keyboard-arrow-left"
        style={styles.buttonIcon}
        size={styles.$leftButtonIconSize}
        color={styles._buttonIcon.color}
      />
    </TouchableOpacity>
  ) : undefined;

  // The route's rightComponent, if present, will be passed the navigator object
  // so it can perform navigation functions
  const RightComponent = props.currentRoute.rightComponent;
  const rightButton = RightComponent ? (
    <View style={styles.rightComponent}>
      <RightComponent navigator={props.navigator} />
    </View>
  ) : undefined;

  // TitleBar will be visible, i.e., extend pass the status bar, only if the route has a title
  const titleBarStyles = props.currentRoute.title ? styles.visibleTitleBar : styles.hiddenTitleBar;

  return (
    <View style={[titleBarStyles, props.currentRoute.styles, props.style]}>
      <View style={styles.sideContainers}>{leftButton}</View>
      <HeadingText size={2} style={styles._title}>{props.currentRoute.title}</HeadingText>
      <View style={styles.sideContainers}>{rightButton}</View>
    </View>
  );
};

TitleBar.propTypes = {
  navigator: PropTypes.object,
  currentRoute: PropTypes.shape({
    title: PropTypes.string,
    showBackButton: PropTypes.bool,
    rightComponent: PropTypes.func,
    styles: PropTypes.object,
  }),
  style: PropTypes.object,
};

TitleBar.defaultProps = {
  currentRoute: {},
};

export default TitleBar;
