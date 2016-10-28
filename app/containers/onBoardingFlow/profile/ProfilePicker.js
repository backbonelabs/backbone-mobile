import React from 'react';
import {
  View,
  Text,
  Picker,
  DatePickerIOS,
  TouchableOpacity,
} from 'react-native';
import { uniqueId } from 'lodash';
import styles from '../../../styles/onBoarding/profile';

const PickerItem = Picker.Item;
const { PropTypes } = React;

const populatePickerItems = (type, maxValue, props) => (
  <Picker
    style={styles.profilePickerItems}
    selectedValue={props[type]}
    onValueChange={value => props.updateField(type, value)}
  >
    { [...Array(maxValue).keys()].map(value => {
      const pickerData = `${value + 1}${props[`${type}Metric`]}`;
      return <PickerItem key={`pickerItemKey-${uniqueId()}`} value={pickerData} label={`${value + 1}`} />;
    }) }
  </Picker>
);

const ProfilePicker = (props) => (
  <View style={styles.profilePickerContainer}>
    <View style={styles.profilePickerHeader}>
      <TouchableOpacity
        style={styles.profilePickerHeaderButton}
        onPress={() => (
          // Ensure nothing is passed as parameter
          props.setPickerType()
        )}
      >
        <Text style={{ color: 'white' }}>Save</Text>
      </TouchableOpacity>
    </View>
    { (() => {
      switch (props.pickerType) {
        case 'birthdate':
          return (
            <DatePickerIOS
              style={{ marginTop: 10, marginBottom: -15 }}
              date={props.birthdate || new Date()}
              mode="date"
              onDateChange={date => props.updateField('birthdate', date)}
            />
          );
        case 'height':
          return (
            <View style={styles.profilePicker}>
              { props.heightMetric === 'ft in' ?
                <Picker
                  style={styles.profilePickerItems}
                  selectedValue={props.height}
                  onValueChange={height => props.updateField('height', height)}
                >
                  { [...Array(6).keys()].map(feet => (
                    [...Array(10).keys()].map(inches => {
                      const pickerData = `${feet + 1}ft ${inches + 1}in`;

                      return (
                        <PickerItem
                          key={`heightPickerItemKey-${uniqueId()}`}
                          value={pickerData}
                          label={`${feet + 1}' ${inches + 1}"`}
                        />
                      );
                    })
                  )) }
                </Picker> :
                populatePickerItems('height', 250, props)
              }
              <View style={styles.profilePickerMetric}>
                <Picker
                  selectedValue={props.heightMetric}
                  onValueChange={
                    heightMetric => props.updateField('heightMetric', heightMetric)
                  }
                >
                  { ['ft in', 'cm'].map(value => (
                    <PickerItem key={`heightMetricKey-${uniqueId()}`} value={value} label={value} />
                  )) }
                </Picker>
              </View>
            </View>
          );
        case 'weight':
          return (
            <View style={styles.profilePicker}>
              <View style={styles.profilePickerItems}>
                { populatePickerItems('weight', 1000, props) }
              </View>
              <View style={styles.profilePickerMetric}>
                <Picker
                  selectedValue={props.weightMetric}
                  onValueChange={
                    weightMetric => props.updateField('weightMetric', weightMetric)
                  }
                >
                  { ['lbs', 'kg'].map(value => (
                    <PickerItem
                      key={`weightPickerItemKey-${uniqueId()}`}
                      value={value}
                      label={value}
                    />
                  )) }
                </Picker>
              </View>
            </View>
          );
        default:
          return null;
      }
    })() }
  </View>
);

ProfilePicker.propTypes = {
  height: PropTypes.string,
  weight: PropTypes.string,
  birthdate: PropTypes.object,
  updateField: PropTypes.func,
  pickerType: PropTypes.string,
  setPickerType: PropTypes.func,
  weightMetric: PropTypes.string,
  heightMetric: PropTypes.string,
};

export default ProfilePicker;
