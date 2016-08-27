import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../../styles/posture/postureTutorial';
import tutorialSteps from './tutorialSteps';

const { width } = Dimensions.get('window');
const SPRING_CONFIG = { tension: 2, friction: 3 };

export default class PostureTutorial extends Component {
  static propTypes = {
    calibrate: React.PropTypes.func,
  }

  constructor() {
    super();
    this.state = {
      step: 0,
      valueX: 0,
      animatedValues: new Animated.ValueXY(),
    };

    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
  }

  getStepStyle() {
    return [
      styles.stepContainer,
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

  selectStep(selection) {
    this.setState({
      step: selection,
      valueX: -width * selection,
    }, this.animationSequence());
  }

  steps() {
    const steps = tutorialSteps.map((step, i) => step({ key: i }));

    return (
      <Animated.View style={this.getStepStyle()}>
        {steps}
      </Animated.View>
    );
  }

  stepIndicator(selection) {
    const stepIndicators = tutorialSteps.map((step, i) => (
      <TouchableOpacity
        key={i}
        style={styles.stepIndicatorButton}
        onPress={() => this.selectStep(i)}
      >
        <Icon
          name={selection === i ? 'circle' : 'circle-o'}
          size={30}
          style={styles.stepIndicator}
          color={styles._stepIndicator.color}
        />
      </TouchableOpacity>
    ));

    return (
      <View style={styles.stepIndicatorContainer}>
        {stepIndicators}
      </View>
    );
  }

  previousStep() {
    if (this.state.step > 0) {
      this.setState({
        step: this.state.step - 1,
        valueX: this.state.valueX + width,
      }, this.animationSequence());
    }
  }

  nextStep() {
    if (tutorialSteps.length - 1) {
      this.setState({
        step: this.state.step + 1,
        valueX: this.state.valueX - width,
      }, this.animationSequence());
    }
  }

  render() {
    return (
      <View style={styles.container}>
        { this.steps() }
        <View style={styles.stepNavigationContainer}>
          <TouchableOpacity
            style={[styles.paginationIcon, { alignItems: 'flex-start' }]}
            onPress={this.previousStep}
          >
            <Icon
              name="chevron-left"
              size={25}
              color={styles._previousStep.color}
              style={styles.previousStep}
            />
          </TouchableOpacity>
          { this.stepIndicator(this.state.step) }
          <TouchableOpacity
            style={[styles.paginationIcon, { alignItems: 'flex-end' }]}
            onPress={this.nextStep}
          >
            <Icon
              name="chevron-right"
              size={25}
              color={styles._nextStep.color}
              style={styles.nextStep}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
