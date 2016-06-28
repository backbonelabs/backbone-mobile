import React from 'react';

import {
  Component,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';

const Button = require('./Button.ios');

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 50,
  },
  tabs: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderRightColor: 'white',
    borderLeftColor: 'white',
    borderBottomColor: 'white',
  },
});


class CustomTabBar extends Component {

  renderTabOption(name, page) {
    const isTabActive = this.props.activeTab === page;
    const activeTextColor = this.props.activeTextColor || 'navy';
    const inactiveTextColor = this.props.inactiveTextColor || 'black';
    const textStyle = this.props.textStyle || {};

    return <Button
      key={name}
      accessible
      accessibilityLabel={name}
      accessibilityTraits="button"
      onPress={ () => this.props.goToPage(page) }
    >
      <View style={styles.tab}>
        <Text style={
          [
            { color: isTabActive ? activeTextColor : inactiveTextColor,
              fontWeight: isTabActive ? 'bold' : 'normal',
              fontSize: isTabActive ? 30 : 22,
            },
            textStyle,
          ]}
        >
          {name}
        </Text>
      </View>
    </Button>;
  }

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: this.props.underlineColor || 'navy',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, containerWidth / numberOfTabs],
    });

    return (
      <View style={
        [styles.tabs,
          { backgroundColor: this.props.backgroundColor || null },
        this.props.style,
        ] }
      >
        {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        <Animated.View style={[tabUnderlineStyle, { left }]} />
      </View>
    );
  }
}

CustomTabBar.propTypes = {
  containerWidth: React.PropTypes.number,
  scrollValue: React.PropTypes.object,
  goToPage: React.PropTypes.func,
  activeTab: React.PropTypes.number,
  tabs: React.PropTypes.array,
  style: React.PropTypes.object,
  textStyle: React.PropTypes.object,
  underlineColor: React.PropTypes.string,
  backgroundColor: React.PropTypes.string,
  activeTextColor: React.PropTypes.string,
  inactiveTextColor: React.PropTypes.string,
};

module.exports = CustomTabBar;
