import React from 'react';
import {
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import styles from '../styles/text';

const { width, height } = Dimensions.get('window');

const myDeviceArea = width * height;

console.log('myDeviceArea', myDeviceArea);

const iPhone6Area = 375 * 667;

const areaDifference = myDeviceArea / iPhone6Area;

console.log('iPhone6Area', iPhone6Area);

const TextTester = () => (
  <ScrollView style={{ flex: 1, marginTop: 25 }}>
    <Text style={{ fontSize: 14 }}>iPhone 6 (default)</Text>
    <Text style={styles.heading1}>iPhone 6 (heading 1 - 24)</Text>
    <Text style={styles.heading2}>iPhone 6 (heading 2 - 20)</Text>
    <Text style={styles.heading3}>iPhone 6 (heading 3 - 18)</Text>
    <Text style={styles.body}>iPhone 6 (body - 16)</Text>
    <Text style={styles.secondary}>iPhone 6 (secondary - 14)</Text>
    <Text>My Device (default)</Text>
    <Text style={{ fontSize: (areaDifference * styles._heading1.fontSize) }}>
      My Device (heading 1 - {(areaDifference * styles._heading1.fontSize)})
    </Text>
    <Text style={{ fontSize: (areaDifference * styles._heading2.fontSize) }}>
      My Device (heading 2 - {(areaDifference * styles._heading2.fontSize)})
    </Text>
    <Text style={{ fontSize: (areaDifference * styles._heading3.fontSize) }}>
      My Device (heading 3 - {(areaDifference * styles._heading3.fontSize)})
    </Text>
    <Text style={{ fontSize: (areaDifference * styles._body.fontSize) }}>
      My Device (body - {(areaDifference * styles._body.fontSize)})
    </Text>
    <Text style={{ fontSize: (areaDifference * styles._secondary.fontSize) }}>
      My Device (secondary - {(areaDifference * styles._secondary.fontSize)})
    </Text>
  </ScrollView>
);

export default TextTester;
