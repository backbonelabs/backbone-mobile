import React, { PropTypes } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeadingText from '../components/HeadingText';
import styles from '../styles/titleBar';

const TitleBar = (props) => {
  const routeStack = props.navigator.getCurrentRoutes();
  const previousRoute = routeStack.length >= 2 ? routeStack[routeStack.length - 2] : null;
  const leftButton = previousRoute && props.titleBar.showBackButton ? (
    <TouchableOpacity
      style={styles.leftComponent}
      onPress={props.disableBackButton ? null : props.navigator.pop}
    >
      <Icon
        name="keyboard-arrow-left"
        style={props.disableBackButton ? styles.buttonIconDisabled : styles.buttonIcon}
        size={styles.$leftButtonIconSize}
        color={styles._buttonIcon.color}
      />
    </TouchableOpacity>
  ) : undefined;

  // The route's rightComponent, if present, will be passed the navigator object
  // so it can perform navigation functions
  const RightComponent = props.titleBar.rightComponent;
  const rightButton = RightComponent ? (
    <View style={styles.rightComponent}>
      <RightComponent navigator={props.navigator} />
    </View>
  ) : undefined;

  // TitleBar will be visible, i.e., extend pass the status bar, only if the route has a title
  const titleBarStyles = props.titleBar.title ? styles.visibleTitleBar : styles.hiddenTitleBar;

  return (
    <View style={[titleBarStyles, props.titleBar.styles, props.style]}>
      <View style={styles.sideContainers}>{leftButton}</View>
      <HeadingText size={2} style={styles._centerContainer}>{props.titleBar.title}</HeadingText>
      <View style={styles.sideContainers}>{rightButton}</View>
    </View>
  );
};

TitleBar.propTypes = {
  navigator: PropTypes.object,
  disableBackButton: PropTypes.bool,
  style: PropTypes.object,
  titleBar: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    component: PropTypes.oneOfType([null, PropTypes.node]),
    showBackButton: PropTypes.bool,
    showNavbar: PropTypes.bool,
    centerComponent: PropTypes.node,
    rightComponent: PropTypes.node,
    styles: PropTypes.object,
  }),
};

TitleBar.defaultProps = {
  currentRoute: {},
};

const mapStateToProps = (state) => {
  const { app: { titleBar } } = state;
  return { titleBar };
};

export default connect(mapStateToProps)(TitleBar);
