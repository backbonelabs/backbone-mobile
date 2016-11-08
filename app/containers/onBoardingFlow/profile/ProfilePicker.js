import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Picker,
  Platform,
  DatePickerIOS,
  DatePickerAndroid,
  TouchableOpacity,
  Alert,
} from 'react-native';
import constants from '../../../utils/constants';
import styles from '../../../styles/onBoarding/profile';

const {
  height: heightConstants,
  weight: weightConstants,
} = constants;
const PickerItem = Picker.Item;

const metricTypes = {
  HEIGHT: 'height',
  WEIGHT: 'weight',
};

const ProfilePicker = (props) => {
  const { pickerType } = props;
  let defaults;
  if (pickerType === metricTypes.HEIGHT) {
    defaults = heightConstants.defaults;
  } else if (pickerType === metricTypes.WEIGHT) {
    defaults = weightConstants.defaults;
  }
  const currentValue = props[pickerType].value || defaults.value;
  const currentUnit = props[pickerType].unit || defaults.unit;

  let pickerUnitValues;
  let totalValues;
  switch (pickerType) {
    case metricTypes.HEIGHT:
      totalValues = currentUnit === heightConstants.conversionTypes[1] ?
        100 : Math.floor(100 * heightConstants.conversionValue);

      pickerUnitValues = heightConstants.conversionTypes;
      break;

    case metricTypes.WEIGHT:
      totalValues = currentUnit === weightConstants.conversionTypes[1] ?
        500 : Math.floor(500 * heightConstants.conversionValue);

      pickerUnitValues = weightConstants.conversionTypes;
      break;

    default:
      break;
  }

  // Generate picker values for the metric's numeric picker component
  const pickerNumericValues = [];
  for (let i = 1; i <= totalValues; i++) {
    pickerNumericValues.push(i);
  }

  const heightLabel = value => (
    currentUnit === heightConstants.conversionTypes[1] ?
      `${Math.floor(value / 12)}ft ${value % 12}in`
      :
      `${value}cm`
  );

  const heightValueChangeHandler = value => (
    props.updateProfile('height', Object.assign({}, props.height, {
      value,
      label: heightLabel(value),
    }))
  );

  const heightTypeChangeHandler = unit => {
    if (unit !== currentUnit) {
      const { height } = props;
      const equalsInch = unit === heightConstants.conversionTypes[1];
      const centimeterToInch = Math.max(1,
        Math.round(currentValue / heightConstants.conversionValue)
      );
      const inchToCentimeter = Math.round(currentValue * heightConstants.conversionValue);

      props.updateProfile('height', Object.assign({}, height, {
        value: equalsInch ? centimeterToInch : inchToCentimeter,
        unit,
        label: equalsInch ?
          `${Math.floor(centimeterToInch / 12)}ft ${centimeterToInch % 12}in`
          :
          `${inchToCentimeter}cm` })
      );
    }
  };

  const weightLabel = value => (
    currentUnit === weightConstants.conversionTypes[1] ?
      `${value}lb`
      :
      `${(value)}kg`
  );

  const weightValueChangeHandler = value => (
    props.updateProfile('weight', Object.assign({}, props.weight, {
      value,
      label: weightLabel(value),
    }))
  );

  const weightTypeChangeHandler = unit => {
    if (unit !== currentUnit) {
      const { weight } = props;
      const equalsPound = unit === weightConstants.conversionTypes[1];
      const KilogramToPound = Math.round(currentValue / weightConstants.conversionValue);
      const poundToKilogram = Math.ceil(currentValue * weightConstants.conversionValue);

      props.updateProfile('weight', Object.assign({}, weight, {
        value: equalsPound ? KilogramToPound : poundToKilogram,
        unit,
        label: equalsPound ?
          `${KilogramToPound}lb`
          :
          `${poundToKilogram}kg`,
      }));
    }
  };

  const makeProfilePicker = metric => {
    let valueChangeHandler;
    let unitChangeHandler;
    let getLabel;

    switch (metric) {
      case metricTypes.HEIGHT:
        valueChangeHandler = heightValueChangeHandler;
        unitChangeHandler = heightTypeChangeHandler;
        getLabel = heightLabel;
        break;
      case metricTypes.WEIGHT:
        valueChangeHandler = weightValueChangeHandler;
        unitChangeHandler = weightTypeChangeHandler;
        getLabel = weightLabel;
        break;
      default:
        break;
    }

    return (
      <View style={styles.profilePickerItemsContainer}>
        <Picker
          style={styles.profilePickerItems}
          selectedValue={currentValue}
          onValueChange={valueChangeHandler}
        >
          {pickerNumericValues.map((value, key) => (
            <PickerItem
              key={key}
              value={value}
              label={getLabel(value)}
            />
          ))}
        </Picker>
        <Picker
          style={styles.profilePickerMetric}
          selectedValue={currentUnit}
          onValueChange={unitChangeHandler}
        >
          {pickerUnitValues.map((value, key) => (
            <PickerItem key={key} value={value} label={String(value)} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <View style={styles.profilePickerContainer}>
      { Platform.OS === 'android' && props.pickerType !== 'birthdate' ? (
        // If the birthdate field is selected, only show the picker header on iOS
        // because the Android date picker automatically closes after selecting a date
        // so there's no point in showing this header
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
      ) : null}
      { (() => {
        const currentDate = new Date();

        switch (props.pickerType) {
          case 'birthdate':
            // Show the appropriate date component based on OS
            if (Platform.OS === 'ios') {
              // iOS
              return (
                <DatePickerIOS
                  date={props.birthdate || currentDate}
                  maximumDate={currentDate}
                  mode="date"
                  onDateChange={date => props.updateProfile('birthdate', date)}
                />
              );
            }

            // Android
            DatePickerAndroid.open({
              date: props.birthdate || currentDate,
              maxDate: currentDate,
            })
              .then((selection) => {
                const { action, year, month, day } = selection;
                if (action !== DatePickerAndroid.dismissedAction) {
                  const date = new Date(year, month, day);
                  props.updateProfile('birthdate', date, true);
                }
              })
              .catch(() => {
                Alert.alert('Error', 'Unexpected error. Please try again.');
              });
            break;
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
  updateProfile: PropTypes.func,
  pickerType: PropTypes.string,
  setPickerType: PropTypes.func,
};

export default ProfilePicker;
