import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/postureTutorial';
import PostureButton from './PostureButton';
import routes from '../routes';

const { width } = Dimensions.get('window');
const SPRING_CONFIG = { tension: 2, friction: 3 };

export default class PostureTutorial extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
    calibrate: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      slide: 1,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
    };
  }

  getSceneStyle() {
    return [
      styles.slideContainer,
      { transform: this.state.animatedValues.getTranslateTransform() },
    ];
  }

  animationSequence() {
    Animated.sequence([
      Animated.spring(
        this.state.animatedValues,
        {
          SPRING_CONFIG,
          toValue: { x: this.state.valueX, y: 0 },
        }
      ),
    ]).start();
  }

  selectScene(selection) {
    this.setState({
      slide: selection + 1,
      valueX: -width * selection,
    }, () => this.animationSequence());
  }

  slideshow() {
    return (
      <Animated.View style={this.getSceneStyle()}>
        <View style={styles.slideOne} />
        <View style={styles.slideTwo} />
        <View style={styles.slideThree} />
      </Animated.View>
    );
  }


  slideIndicator(selection) {
    return (
      <View style={styles.slideIndicatorContainer}>
        <TouchableOpacity style={styles.slideIndicatorButton} onPress={() => this.selectScene(0)}>
          <Icon
            name={selection === 1 ? 'circle' : 'circle-o'}
            size={30}
            style={styles.slideIndicator}
            color={styles._slideIndicator.color}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideIndicatorButton} onPress={() => this.selectScene(1)}>
          <Icon
            name={selection === 2 ? 'circle' : 'circle-o'}
            size={30}
            style={styles.slideIndicator}
            color={styles._slideIndicator.color}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideIndicatorButton} onPress={() => this.selectScene(2)}>
          <Icon
            name={selection === 3 ? 'circle' : 'circle-o'}
            size={30}
            style={styles.slideIndicator}
            color={styles._slideIndicator.color}
          />
        </TouchableOpacity>
      </View>
    );
  }

  popSlide() {
    if (this.state.slide > 1) {
      this.setState({
        slide: --this.state.slide,
        valueX: this.state.valueX + width,
      }, () =>
        this.animationSequence()
      );
    }
  }

  pushSlide() {
    if (this.state.slide < 3) {
      this.setState({
        slide: ++this.state.slide,
        valueX: this.state.valueX - width,
      }, () =>
        this.animationSequence()
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        { this.slideshow(this.state.slide) }
        <View style={styles.slideNavigationContainer}>
          <TouchableOpacity style={styles.slideLeftButton} onPress={() => this.popSlide()}>
            <Icon
              name="chevron-left"
              size={25}
              color={styles._slideLeft.color}
              style={styles.slideLeft}
            />
          </TouchableOpacity>
          { this.slideIndicator(this.state.slide) }
          <TouchableOpacity style={styles.slideRightButton} onPress={() => this.pushSlide()}>
            <Icon
              name="chevron-right"
              size={25}
              color={styles._slideRight.color}
              style={styles.slideRight}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.button}>
          <PostureButton
            onPress={() => this.props.navigator.push(routes.postureCalibrate)}
            buttonText={'Start'}
          />
        </View>
      </View>
    );
  }
}
