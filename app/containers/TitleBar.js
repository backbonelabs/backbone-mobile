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
import styles from '../styles/titleBar';
import theme from '../styles/theme';

export const LeftProfileComponent = (props) => (
  <TouchableOpacity
    style={styles.leftComponent}
    onPress={() => props.navigator.push(routes.profile)}
  >
    {/* TODO: REPLACE WITH IMAGE COMPONENT OF USER'S PHOTO */}
    <View style={styles.profileIconContainer}>
      <Icon
        style={styles.profileIcon}
        name="person"
      />
    </View>
  </TouchableOpacity>
);

LeftProfileComponent.propTypes = {
  navigator: PropTypes.object,
};

const TitleBar = (props) => {
  const currentRoute = props.currentRoute.name;
  let currentColor = theme.secondaryFontColor;

  if (currentRoute === 'profileSetupOne' ||
    currentRoute === 'profileSetupTwo' ||
    currentRoute === 'deviceSetup' ||
    currentRoute === 'deviceScan' ||
    currentRoute === 'howToVideo'
  ) {
    currentColor = theme.orange500;
  }


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

  // Same as rightComponent but with a default back button
  const leftComponent = props.titleBar.leftComponent ? (
    <props.titleBar.leftComponent navigator={props.navigator} />
  ) : (
    <TouchableOpacity
      onPress={props.disableBackButton ? null : props.navigator.pop}
    >
      <Icon
        name="keyboard-arrow-left"
        style={[
          styles.buttonIcon,
          {
            color: props.disableBackButton ?
              color(currentColor).clearer(0.6).rgbString() : currentColor,
          },
        ]}
        color={currentColor}
      />
    </TouchableOpacity>
  );

  const leftButton = props.titleBar.showLeftComponent && (
    <View style={styles.leftComponent}>
      {leftComponent}
    </View>
  );

  // TitleBar will be visible, i.e., extend pass the status bar, only if the route has a title
  const titleBarStyles = props.titleBar.title ? styles.visibleTitleBar : styles.hiddenTitleBar;
  const titleTextStyles = [
    styles.centerContainer,
    { color: currentColor },
  ];

  return (
    <View style={[titleBarStyles, props.titleBar.styles, props.style]}>
      <View style={styles.sideContainers}>{leftButton}</View>
      <HeadingText size={3} style={titleTextStyles} >{props.titleBar.title}</HeadingText>
      <View style={styles.sideContainers}>{rightButton}</View>
    </View>
  );
};

TitleBar.propTypes = {
  navigator: PropTypes.object,
  disableBackButton: PropTypes.bool,
  style: PropTypes.object,
  currentRoute: PropTypes.object,
  titleBar: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    showRightComponent: PropTypes.bool,
    showLeftComponent: PropTypes.bool,
    rightComponent: PropTypes.func([undefined, PropTypes.node]),
    leftComponent: PropTypes.func([undefined, PropTypes.node]),
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
