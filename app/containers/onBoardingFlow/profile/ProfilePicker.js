import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Picker,
  Platform,
  DatePickerIOS,
  TouchableOpacity,
} from 'react-native';
import constants from '../../../utils/constants';
import styles from '../../../styles/onBoarding/profile';

const {
  height: heightConstant,
  weight: weightConstant,
} = constants;
const PickerItem = Picker.Item;


const ProfilePicker = (props) => {
  const heightValues = [...Array(props.height.type === 'in' ?
    100
    :
    Math.floor(100 * constants.height.conversionValue)
  ).keys()];

  const heightLabel = value => (
    props.height.type === 'in' ?
      `${Math.floor(value / 12)}ft ${value % 12}in`
      :
      `${value}cm`
  );

  const heightValueChangeHandler = value => (
    props.updateField('height', Object.assign({}, props.height, {
      value,
      label: heightLabel(value),
    }))
  );

  const heightTypeChangeHandler = type => {
    if (type !== props.height.type) {
      const { height } = props;
      const equalsInch = type === 'in';
      const centimeterToInch = Math.round(height.value / constants.height.conversionValue);
      const inchToCentimeter = Math.round(height.value * constants.height.conversionValue);

      props.updateField('height', Object.assign({}, height, {
        value: equalsInch ? centimeterToInch : inchToCentimeter,
        type,
        label: equalsInch ?
          `${Math.floor(centimeterToInch / 12)}ft ${centimeterToInch % 12}in`
          :
          `${inchToCentimeter}cm` })
      );
    }
  };

  const weightValues = [...Array(props.weight.type === 'lb' ?
    500
    :
    Math.floor(500 * constants.weight.conversionValue)
  ).keys()];

  const weightLabel = value => (
    props.weight.type === 'lb' ?
      `${value}lb`
      :
      `${(value)}kg`
  );

  const weightValueChangeHandler = value => {
    const { weight } = props;

    props.updateField('weight', Object.assign({}, weight, {
      value,
      label: weightLabel(value),
    }));
  };

  const weightTypeChangeHandler = type => {
    if (type !== props.weight.type) {
      const { weight } = props;
      const equalsPound = type === 'lb';
      const KilogramToPound = Math.ceil(weight.value / constants.weight.conversionValue);
      const poundToKilogram = Math.ceil(weight.value * constants.weight.conversionValue);

      props.updateField('weight', Object.assign({}, weight, {
        value: equalsPound ? KilogramToPound : poundToKilogram,
        type,
        label: equalsPound ?
          `${KilogramToPound}lb`
          :
          `${poundToKilogram}kg`,
      }));
    }
  };

  const makeProfilePicker = metric => {
    const metricEnum = {
      weight: 0,
      height: 1,
    };

    return (
      <View style={styles.profilePickerItemsContainer}>
        <Picker
          style={styles.profilePickerItems}
          selectedValue={props[metric].value}
          onValueChange={metricEnum[metric] ? heightValueChangeHandler : weightValueChangeHandler}
        >
          { (metricEnum[metric] ? heightValues : weightValues)
              .map((value, key) => {
                const newValue = value + 1;
                const label = metricEnum[metric] ? heightLabel(newValue) : weightLabel(newValue);

                return (
                  <PickerItem
                    key={key}
                    value={newValue}
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
              .map((value, key) => (
                <PickerItem key={key} value={value} label={value} />
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
            // Ensure nothing is passed in
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
              Platform.OS === 'ios' &&
              <DatePickerIOS
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
