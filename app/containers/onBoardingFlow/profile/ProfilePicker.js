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

const populatePickerItems = (type, maxNumber, props) => (
  <Picker selectedValue={props[type]} onValueChange={height => props.updateField(type, height)}>
    { [...Array(maxNumber).keys()].map(value => {
      const pickerData = `${value + 1}`;
      return <PickerItem key={uniqueId()} value={pickerData} label={pickerData} />;
    }) }
  </Picker>
);

const ProfilePicker = (props) => (
  <View style={{ flex: 0.4, justifyContent: 'flex-end' }}>
    <View style={styles.pickerToggleHeader}>
      <View>
        <TouchableOpacity style={styles.informationPickerHeader} onPress={props.clearPickerType}>
          <Text style={{ color: 'white' }}>Save</Text>
        </TouchableOpacity>
        { (() => {
          console.log('pickerType', props.pickerType);
          switch (props.pickerType) {
            case 'birthdate':
              return (
                <DatePickerIOS
                  style={{ marginBottom: -15 }}
                  date={props.birthdate}
                  mode="date"
                  onDateChange={date => props.updateField('birthdate', date)}
                />
              );
            case 'height':
              return (
                <View style={{ marginBottom: -15, flexDirection: 'row' }}>
                  <View style={{ flex: 0.65 }}>
                    { props.heightMetric === 'ft in' ?
                      <Picker
                        selectedValue={props.height}
                        onValueChange={height => props.updateField('height', height)}
                      >
                        { [...Array(6).keys()].map(feet => (
                          [...Array(10).keys()].map(inches => {
                            const pickerData = `${feet + 1}' ${inches + 1}"`;

                            return (
                              <PickerItem
                                key={pickerData}
                                value={pickerData}
                                label={pickerData}
                              />
                            );
                          })
                        )) }
                      </Picker> :
                      populatePickerItems('height', 250, props)
                    }
                  </View>
                  <View style={{ flex: 0.35 }}>
                    <Picker
                      selectedValue={props.heightMetric}
                      onValueChange={
                        heightMetric => props.updateField('heightMetric', heightMetric)
                      }
                    >
                      { ['ft in', 'cm'].map(value => (
                        <PickerItem key={uniqueId()} value={value} label={value} />
                      )) }
                    </Picker>
                  </View>
                </View>
              );
            case 'weight':
              return (
                <View style={{ marginBottom: -15, flexDirection: 'row' }}>
                  <View style={{ flex: 0.65 }}>{ populatePickerItems('weight', 1000, props) }</View>
                  <View style={{ flex: 0.35 }}>
                    <Picker
                      selectedValue={props.weightMetric}
                      onValueChange={
                        weightMetric => props.updateField('weightMetric', weightMetric)
                      }
                    >
                      { ['lbs', 'kg'].map(value => (
                        <PickerItem key={uniqueId()} value={value} label={value} />
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
    </View>
  </View>
);

ProfilePicker.propTypes = {
  height: PropTypes.string,
  weight: PropTypes.string,
  birthdate: PropTypes.object,
  updateField: PropTypes.func,
  pickerType: PropTypes.string,
  clearPickerType: PropTypes.func,
  weightMetric: PropTypes.string,
  heightMetric: PropTypes.string,
};

export default ProfilePicker;
