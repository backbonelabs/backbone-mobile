import React, { PropTypes } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import color from 'color';
import HeadingText from '../components/HeadingText';
import settingsIcon from '../images/settings-icon.png';
import routes from '../routes';
import { getColorHexForLevel } from '../utils/levelColors';
import styles from '../styles/titleBar';

const TitleBar = (props) => {
  const level = props.training.selectedLevelIdx;
  const levelColorCode = getColorHexForLevel(level);

  const routeStack = props.navigator.getCurrentRoutes();
  const previousRoute = routeStack.length >= 2 ? routeStack[routeStack.length - 2] : null;
  const leftButton = previousRoute && props.titleBar.showBackButton ? (
    <TouchableOpacity
      style={styles.leftComponent}
      onPress={props.disableBackButton ? null : props.navigator.pop}
    >
      <Icon
        name="keyboard-arrow-left"
        style={[
          styles.buttonIcon,
          {
            color: props.disableBackButton ?
              color(levelColorCode).clearer(0.6).rgbString() : levelColorCode,
          },
        ]}
        size={styles.$backButtonIconSize}
        color={getColorHexForLevel(level)}
      />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.leftComponent}
      onPress={() => props.navigator.push(routes.profile)}
    >
      {/* TODO: REPLACE WITH IMAGE COMPONENT OF USER'S PHOTO */}
      <Icon
        name="person"
        style={styles.profileIcon}
        color="#FFFFFF"
        size={styles.$profileIconSize}
      />
    </TouchableOpacity>
  );

  // The right component will be the settings icon by default, but can be
  // overridden by defining a rightComponent in the route config. The
  // route's rightComponent, if present, will be passed the navigator
  // object so it can perform navigation functions.
  const rightComponent = props.titleBar.rightComponent ? (
    <props.titleBar.rightComponent navigator={props.navigator} />
  ) : (
    <TouchableOpacity
      onPress={() => {
        props.navigator.push(routes.settings);
      }}
    >
      <Image
        name="settingsIcon" // primarily used for aiding testing
        source={settingsIcon}
        style={styles.icon}
      />
    </TouchableOpacity>
  );

  const rightButton = props.titleBar.showRightComponent && (
    <View style={styles.rightComponent}>
      {rightComponent}
    </View>
  );

  // TitleBar will be visible, i.e., extend pass the status bar, only if the route has a title
  const titleBarStyles = props.titleBar.title ? styles.visibleTitleBar : styles.hiddenTitleBar;
  const titleTextStyles = [
    styles._centerContainer,
    { color: getColorHexForLevel(level) },
  ];

  return (
    <View style={[titleBarStyles, props.titleBar.styles, props.style]}>
      <View style={styles.sideContainers}>{leftButton}</View>
      <HeadingText size={2} style={titleTextStyles} >{props.titleBar.title}</HeadingText>
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
    showBackButton: PropTypes.bool,
    showRightComponent: PropTypes.bool,
    rightComponent: PropTypes.func,
    styles: PropTypes.object,
  }).isRequired,
  training: PropTypes.shape({
    selectedLevelIdx: PropTypes.number,
  }).isRequired,
};

const mapStateToProps = (state) => {
  const { app: { titleBar }, training } = state;
  return { titleBar, training };
};

export default connect(mapStateToProps)(TitleBar);
