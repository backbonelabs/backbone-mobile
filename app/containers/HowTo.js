import React, { Component } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/howTo';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import gradientBackground20 from '../images/gradientBackground20.png';
import onePNG from '../images/howTo/PNG/one.png';
import oneGIF from '../images/howTo/GIF/one.gif';
import twoPNG from '../images/howTo/PNG/two.png';
import twoGIF from '../images/howTo/GIF/two.gif';

const howToContent = [
  {
    PNG: onePNG,
    GIF: oneGIF,
    title: 'Put On/Take Off',
    body: 'How to put on/take off your Backbone',
  },
  {
    PNG: twoPNG,
    GIF: twoGIF,
    title: 'Adjust',
    body: 'How to adjust your Backbone',
  },
];

export default class HowTo extends Component {
  constructor() {
    super();
    this.state = {
      pressedItem: null,
    };
  }

  render() {
    return (
      <Image source={gradientBackground20} style={styles.background}>
        <ScrollView>
          {
            howToContent.map((value, key) => (
              <View key={key} style={styles.howToContainer}>
                <View style={styles.textContainer}>
                  <HeadingText size={2}>{value.title}</HeadingText>
                </View>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={() => (
                    this.setState({ pressedItem: this.state.pressedItem === key ?
                      null
                      :
                        key })
                  )}
                >
                  {
                    this.state.pressedItem === key ?
                      <Image style={styles.gif} source={value.GIF}>
                        <Icon
                          style={styles._stopIconPadding}
                          name="stop"
                          size={styles._stopIcon.height}
                          color={styles._stopIcon.color}
                        />
                      </Image>
                      :
                        <Image style={styles.png} source={value.PNG}>
                          <Icon
                            name="play"
                            size={styles._playIcon.height}
                            color={styles._playIcon.color}
                          />
                        </Image>
                  }
                </TouchableOpacity>
                <View style={styles.textContainer}>
                  <BodyText>{value.body}</BodyText>
                </View>
              </View>
            ))
          }
        </ScrollView>
      </Image>
    );
  }
}
