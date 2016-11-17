import React, { Component } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import gradientBackground20 from '../images/gradientBackground20.png';
import howToContent from '../images/howTo/';
import styles from '../styles/howTo';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

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
            Object.keys(howToContent.GIF).map((value, key) => {
              const contentKey = key + 1;

              return (
                <View key={key} style={styles.howToContainer}>
                  <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={() => (
                      this.setState({ pressedItem: this.state.pressedItem ? null : contentKey })
                    )}
                  >
                    {
                      this.state.pressedItem === contentKey ?
                        <Image style={styles.gif} source={howToContent.GIF[contentKey]}>
                          <Icon
                            style={styles._pauseIconPadding}
                            name={howToContent.PAUSE}
                            size={styles._pauseIcon.width}
                            color={styles._pauseIcon.color}
                          />
                        </Image>
                        :
                          <Image style={styles.png} source={howToContent.PNG[contentKey]}>
                            <Icon
                              name={howToContent.PLAY}
                              size={styles._playIcon.height}
                              color={styles._playIcon.color}
                            />
                          </Image>
                    }
                  </TouchableOpacity>
                  <View style={styles.textContainer}>
                    <HeadingText size={2}>{howToContent.TEXT[contentKey].title}</HeadingText>
                  </View>
                  <View style={styles.textContainer}>
                    <BodyText>{howToContent.TEXT[contentKey].body}</BodyText>
                  </View>
                </View>
              );
            })
          }
        </ScrollView>
      </Image>
    );
  }
}
