import React, { PropTypes } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/tabBar';
import BodyText from '../components/BodyText';

const renderTab = (name, page, isTabActive, onPressHandler, props) => {
  const { activeTextColor, inactiveTextColor, textStyle, removeDropDown } = props;
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
        if (isTabActive && props.toggleSubview) {
          props.toggleSubview();
        }

        return onPressHandler(page);
      }}
    >
      <View style={[styles.tab, props.tabStyle]}>
        <BodyText style={{ color: textColor, fontWeight, ...textStyle }}>
          {name}
        </BodyText>
        {isTabActive && !removeDropDown ?
          <Icon name="arrow-drop-down" size={styles.$arrowIconSize} style={styles.icon} /> : null
          }
      </View>
    </TouchableOpacity>
    );
};

const TabBar = (props) => {
  const containerWidth = props.containerWidth;
  const numberOfTabs = props.tabs.length;
  const left = props.scrollValue.interpolate({
    inputRange: [0, 1], outputRange: [0, containerWidth / numberOfTabs],
  });
  return (
    <View
      style={[
        styles.tabs,
        props.style]}
    >
      {props.tabs.map((name, page) => {
        const isTabActive = props.activeTab === page;
        return renderTab(name, page, isTabActive, props.goToPage, props);
      })}
      <Animated.View
        style={[
          styles.tabUnderlineStyle,
          {
            left,
            width: containerWidth / numberOfTabs,
          },
          props.underlineStyle]
        }
      />
    </View>
    );
};

renderTab.propTypes = {
  toggleSubview: PropTypes.func,
  toggleSearchBar: PropTypes.func,
  activeTextColor: PropTypes.string,
  inactiveTextColor: PropTypes.string,
  removeDropDown: PropTypes.string,
  textStyle: PropTypes.number,
  tabStyle: PropTypes.object,
};

TabBar.propTypes = {
  goToPage: PropTypes.func,
  activeTab: PropTypes.number,
  tabs: PropTypes.array,
  scrollValue: PropTypes.object,
  backgroundColor: PropTypes.string,
  renderTab: PropTypes.func,
  underlineStyle: PropTypes.number,
  containerWidth: PropTypes.number,
  style: PropTypes.object,
};

export default TabBar;
