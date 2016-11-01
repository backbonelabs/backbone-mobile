import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Picker,
  DatePickerIOS,
  TouchableOpacity,
} from 'react-native';
import { uniqueId } from 'lodash';
import constants from '../../../utils/constants';
import styles from '../../../styles/onBoarding/profile';

const {
  height: heightConstant,
  weight: weightConstant,
} = constants;
const PickerItem = Picker.Item;


const ProfilePicker = (props) => {
  const heightLabel = value => (
    props.height.type === 'ft in' ?
      `${Math.floor(value / 12)}' ${value % 12}"`
      :
      `${value * heightConstant.cmConversion}`
  );

  const heightValueChangeHandler = value => (
    props.updateField('height', Object.assign({}, props.height, {
      value,
      label: props.height.type === 'ft in' ?
        `${Math.floor(value / 12)}ft ${value % 12}in`
        :
        `${value * heightConstant.cmConversion}${props.height.type}` }),
    )
  );

  const heightTypeChangeHandler = type => (
    props.updateField('height', Object.assign({}, props.height, {
      type,
      label: type === 'ft in' ?
        `${Math.floor(props.height.value / 12)}' ${props.height.value % 12}"`
        :
        `${props.height.value * heightConstant.cmConversion}${type}` })
    )
  );

  const weightLabel = value => (
    props.weight.type === 'lbs' ?
      `${value}`
      :
      `${(value * weightConstant.kgConversion).toFixed(1)}`
  );

  const weightValueChangeHandler = value => {
    props.updateField('weight', Object.assign({}, props.weight, {
      value,
      label: props.weight.type === 'lbs' ?
        `${value}${props.weight.type}`
        :
        `${value * weightConstant.kgConversion}${props.weight.type}` })
    );
  };

  const weightTypeChangeHandler = type => {
    props.updateField('weight', Object.assign({}, props.weight, {
      type,
      label: type === 'lbs' ?
        `${props.weight.value}${type}`
        :
        `${(props.weight.value * weightConstant.kgConversion).toFixed(1)}${type}` })
    );
  };

  const makeProfilePicker = metric => {
    const metricEnum = {
      weight: 0,
      height: 1,
    };

    return (
      <View style={styles.profilePicker}>
        <Picker
          style={styles.profilePickerItems}
          selectedValue={props[metric].value}
          onValueChange={metricEnum[metric] ? heightValueChangeHandler : weightValueChangeHandler}
        >
          { (metricEnum[metric] ? heightConstant.pickerItems : weightConstant.pickerItems)
              .map(value => {
                const label = metricEnum[metric] ? heightLabel(value) : weightLabel(value);

                return (value !== 0) && (
                  <PickerItem
                    key={`${metric}PickerItemKey-${uniqueId()}`}
                    value={value}
                    label={label}
                  />
                );
              })
          }
        </Picker>
        <Picker
          style={styles.profilePickerMetric}
          selectedValue={props[metric].type}
          onValueChange={metricEnum[metric] ? heightTypeChangeHandler : weightTypeChangeHandler}
        >
          { (metricEnum[metric] ? heightConstant.conversionTypes : weightConstant.conversionTypes)
              .map(value => (
                <PickerItem key={`${metric}MetricKey-${uniqueId()}`} value={value} label={value} />
              )
          ) }
        </Picker>
      </View>
    );
  };

  return (
    <View style={styles.profilePickerContainer}>
      <View style={styles.profilePickerHeader}>
        <TouchableOpacity
          style={styles.profilePickerHeaderButton}
          onPress={() => (
            // Ensure nothing is passed as parameter
            props.setPickerType()
          )}
        >
          <Text style={styles.profilePickerHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>
      { (() => {
        switch (props.pickerType) {
          case 'birthdate':
            return (
              <DatePickerIOS
                style={styles.datePicker}
                date={props.birthdate || new Date()}
                mode="date"
                onDateChange={date => props.updateField('birthdate', date)}
              />
            );
          case 'height':
            return makeProfilePicker('height');
          case 'weight':
            return makeProfilePicker('weight');
          default:
            return null;
        }
      })() }
    </View>
  );
};

ProfilePicker.propTypes = {
  height: PropTypes.object,
  weight: PropTypes.object,
  birthdate: PropTypes.object,
  updateField: PropTypes.func,
  pickerType: PropTypes.string,
  setPickerType: PropTypes.func,
};

export default ProfilePicker;
