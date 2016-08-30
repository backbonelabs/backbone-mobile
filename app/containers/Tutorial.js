import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/tutorial';

const { width } = Dimensions.get('window');

export default class Tutorial extends Component {
  static propTypes = {
    currentRoute: React.PropTypes.object,
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
    Animated.spring(this.state.animatedValues, {
      tension: 10,
      toValue: {
        x: this.state.valueX,
        y: 0,
      },
    }).start();
  }

  selectStep(selection) {
    this.setState({
      step: selection,
      valueX: -width * selection,
    }, this.animationSequence);
  }

  displayTutorialSteps() {
    const steps = this.props.currentRoute.tutorialSteps.map((step, i) => step({ key: i }));

    return (
      <Animated.View style={this.getStepStyle()}>
        {steps}
      </Animated.View>
    );
  }

  displayStepIndicators(selection) {
    const stepIndicators = this.props.currentRoute.tutorialSteps.map((step, i) => (
      <TouchableOpacity
        key={i}
        style={styles.stepIndicatorButton}
        onPress={() => this.selectStep(i)}
      >
        <Icon
          name={selection === i ? 'circle' : 'circle-o'}
          size={styles._stepIndicator.width}
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
    this.setState({
      step: this.state.step - 1,
      valueX: this.state.valueX + width,
    }, this.animationSequence);
  }

  nextStep() {
    this.setState({
      step: this.state.step + 1,
      valueX: this.state.valueX - width,
    }, this.animationSequence);
  }

  render() {
    return (
      <View style={styles.container}>
        { this.displayTutorialSteps() }
        <View style={styles.stepNavigationContainer}>
          { this.state.step > 0 ?
            <TouchableOpacity style={styles.previousStepButton} onPress={this.previousStep}>
              <Icon
                name="backward"
                size={styles._paginationIcon.width}
                color={styles._paginationIcon.color}
              />
            </TouchableOpacity>
            :
            <View style={styles.previousStepButton} />
          }
          { this.displayStepIndicators(this.state.step) }
          { this.state.step < this.props.currentRoute.tutorialSteps.length - 1 ?
            <TouchableOpacity style={styles.nextStepButton} onPress={this.nextStep}>
              <Icon
                name="forward"
                size={styles._paginationIcon.width}
                color={styles._paginationIcon.color}
              />
            </TouchableOpacity>
            :
            <View style={styles.nextStepButton} />
          }
        </View>
      </View>
    );
  }
}
