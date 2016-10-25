import React from 'react';
import {
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import styles from '../styles/text';

const { width, height } = Dimensions.get('window');

const myDeviceArea = width * height;

const iPhone6Area = 375 * 667;

const areaDifference = myDeviceArea / iPhone6Area;

const FontTester = () => (
  <ScrollView style={{ flex: 1, marginTop: 25 }}>
    <Text style={{ fontSize: 14 }}>iPhone 6 (default)</Text>
    <Text style={[styles.heading1, { marginTop: 10 }]}>iPhone 6 (h1 - 24)</Text>
    <Text style={[styles.heading2, { marginTop: 10 }]}>iPhone 6 (h2 - 20)</Text>
    <Text style={[styles.heading3, { marginTop: 10 }]}>iPhone 6 (h3 - 18)</Text>
    <Text style={[styles.body, { marginTop: 10 }]}>iPhone 6 (body - 16)</Text>
    <Text style={[styles.secondary, { marginTop: 10 }]}>iPhone 6 (secondary - 14)</Text>
    <Text style={{ marginTop: 25 }}>My Device (default)</Text>
    <Text style={{ marginTop: 10, fontSize: (areaDifference * styles._heading1.fontSize) }}>
      My Device (h1 - {(areaDifference * styles._heading1.fontSize)})
    </Text>
    <Text style={{ marginTop: 10, fontSize: (areaDifference * styles._heading2.fontSize) }}>
      My Device (h2 - {(areaDifference * styles._heading2.fontSize)})
    </Text>
    <Text style={{ marginTop: 10, fontSize: (areaDifference * styles._heading3.fontSize) }}>
      My Device (h3 - {(areaDifference * styles._heading3.fontSize)})
    </Text>
    <Text style={{ marginTop: 10, fontSize: (areaDifference * styles._body.fontSize) }}>
      My Device (body - {(areaDifference * styles._body.fontSize)})
    </Text>
    <Text style={{ marginTop: 10, fontSize: (areaDifference * styles._secondary.fontSize) }}>
      My Device (secondary - {(areaDifference * styles._secondary.fontSize)})
    </Text>
  </ScrollView>
);

export default FontTester;
