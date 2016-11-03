import React, { PropTypes } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import HeadingText from './HeadingText';
import styles from '../styles/titleBar';

const TitleBar = (props) => {
  const routeStack = props.navigator.getCurrentRoutes();
  const previousRoute = routeStack[routeStack.length - 2];
  const leftButton = props.currentRoute.showBackButton ? (
    <TouchableOpacity style={styles.sideButtons} onPress={props.navigator.pop}>
      <Icon
        name="angle-left"
        style={styles.buttonIcon}
        size={styles.$leftButtonIconSize}
        color={styles._buttonIcon.color}
      />
      <HeadingText size={2} style={styles._sideContainersText}>
        {previousRoute.title}
      </HeadingText>
    </TouchableOpacity>
  ) : undefined;

  // The route's rightComponent, if present, will be passed the navigator object
  // so it can perform navigation functions
  const rightButton = props.currentRoute.rightComponent ? (
    <TouchableOpacity style={styles.sideButtons}>
      <props.currentRoute.rightComponent navigator={props.navigator} />
    </TouchableOpacity>
  ) : undefined;

  // TitleBar will be visible, i.e., extend pass the status bar, only if the route has a title
  const titleBarStyles = props.currentRoute.title ? styles.visibleTitleBar : styles.hiddenTitleBar;

  return (
    <View style={[titleBarStyles, props.style]}>
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
    rightComponent: PropTypes.element,
  }),
  style: PropTypes.object,
};

export default TitleBar;
