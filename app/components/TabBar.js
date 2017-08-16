import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/tabBar';

class FreeTrainingTabBar extends Component {
  static propTypes = {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    scrollValue: PropTypes.object,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    textStyle: PropTypes.number,
    tabStyle: PropTypes.object,
    renderTab: PropTypes.func,
    underlineStyle: PropTypes.number,
    containerWidth: PropTypes.number,
    style: PropTypes.object,
    toggleSubview: PropTypes.func,
    toggleSearchBar: PropTypes.func,
  }

  constructor() {
    super();
    autobind(this);
  }

  // renderTabOption(name, page) {
  // }
  renderTab(name, page, isTabActive, onPressHandler) {
    const { activeTextColor, inactiveTextColor, textStyle } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <TouchableOpacity
        style={styles.flexOne}
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => {
          if (isTabActive) {
            this.props.toggleSubview();
          }
          this.props.toggleSearchBar();

          // Delay needed for Android to work when tapping on a tab
          if (Platform.OS === 'ios') {
            return onPressHandler(page);
          }
          setTimeout(() => onPressHandler(page), 500);
        }}
      >
        <View style={[styles.tab, this.props.tabStyle]}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>
            {name}
          </Text>
          {isTabActive ?
            <Icon name="arrow-drop-down" size={25} style={styles.icon} /> : null
          }
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };
    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, containerWidth / numberOfTabs],
    });
    return (
      <View
        style={[
          styles.tabs,
          this.props.style]}
      >
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
        <Animated.View style={[tabUnderlineStyle, { left }, this.props.underlineStyle]} />
      </View>
    );
  }
}

export default FreeTrainingTabBar;
