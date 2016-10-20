import React, { Component } from 'react';
import {
  View,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import OnBoardingFlow from './onBoardingFlow';
import styles from '../styles/onboarding';

const { width } = Dimensions.get('window');

export default class OnBoarding extends Component {
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

  loadOnBoardingFlow() {
    const steps = OnBoardingFlow.map((step, i) => (
      step({
        key: i,
        onPress: i === OnBoardingFlow.length - 1 ? this.saveData : this.nextStep,
      })
    ));
    return <Animated.View style={this.getStepStyle()}>{steps}</Animated.View>;
  }

  previousStep() {
    this.setState({
      step: this.state.step - 1,
      valueX: this.state.valueX + width,
    }, this.animationSequence);
  }

  nextStep() {
    console.log('next step');
    this.setState({
      step: this.state.step + 1,
      valueX: this.state.valueX - width,
    }, this.animationSequence);
  }

  saveData() {
    // Do something here
    console.log('saving data');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressCircleView}>
          { OnBoardingFlow.map((value, key) => (
            <View key={key}>
              <Icon
                name={this.state.step > key ? 'check-circle' : 'circle-o'}
                size={40}
                color="red"
              />
            </View>
          )) }
        </View>
        { this.loadOnBoardingFlow() }
      </View>
    );
  }
}
