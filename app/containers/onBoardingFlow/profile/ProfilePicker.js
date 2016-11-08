import React, { Component, PropTypes } from 'react';
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

export default class ProfilePicker extends Component {
  static propTypes = {
    height: PropTypes.object,
    weight: PropTypes.object,
    birthdate: PropTypes.object,
    updateProfile: PropTypes.func,
    pickerType: PropTypes.string,
    setPickerType: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.pickerNumericValues = [];
    this.pickerUnitValues = [];
    this._setValues = this._setValues.bind(this);
    this._heightLabel = this._heightLabel.bind(this);
    this._weightLabel = this._weightLabel.bind(this);
    this._valueChangeHandler = this._valueChangeHandler.bind(this);
    this._heightTypeChangeHandler = this._heightTypeChangeHandler.bind(this);
    this._weightTypeChangeHandler = this._weightTypeChangeHandler.bind(this);
    this._makeProfilePicker = this._makeProfilePicker.bind(this);
  }

  componentWillMount() {
    this._setValues(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.pickerType !== nextProps.pickerType) {
      this._setValues(nextProps);
    }
  }

  _setValues(props) {
    const { pickerType } = props;
    if (pickerType === 'birthdate') {
      this.setState({ currentValue: props[pickerType] || new Date() });
    } else {
      let defaults;
      switch (pickerType) {
        case metricTypes.HEIGHT:
          defaults = heightConstants.defaults;
          break;
        case metricTypes.WEIGHT:
          defaults = weightConstants.defaults;
          break;
        default:
          defaults = {};
      }
      this.setState({
        currentValue: props[pickerType].value || defaults.value,
        currentUnit: props[pickerType].unit || defaults.unit,
      });
    }
  }

  _heightLabel(value) {
    return this.state.currentUnit === heightConstants.units.IN ?
      `${Math.floor(value / 12)}ft ${value % 12}in` : `${value}cm`;
  }

  _weightLabel(value) {
    return this.state.currentUnit === weightConstants.units.LB ?
      `${value}lb` : `${(value)}kg`;
  }

  _valueChangeHandler(value) {
    this.setState({ currentValue: value });
  }

  _heightTypeChangeHandler(unit) {
    const { currentValue, currentUnit } = this.state;
    if (unit !== currentUnit) {
      const equalsInch = unit === heightConstants.units.IN;
      const centimeterToInch = Math.max(1,
        Math.round(currentValue / heightConstants.conversionValue)
      );
      const inchToCentimeter = Math.round(currentValue * heightConstants.conversionValue);

      this.setState({
        currentValue: equalsInch ? centimeterToInch : inchToCentimeter,
        currentUnit: unit,
      });
    }
  }

  _weightTypeChangeHandler(unit) {
    const { currentValue, currentUnit } = this.state;
    if (unit !== currentUnit) {
      const equalsPound = unit === weightConstants.units.LB;
      const KilogramToPound = Math.round(currentValue / weightConstants.conversionValue);
      const poundToKilogram = Math.ceil(currentValue * weightConstants.conversionValue);

      this.setState({
        currentValue: equalsPound ? KilogramToPound : poundToKilogram,
        currentUnit: unit,
      });
    }
  }

  _getLabel(metric, value) {
    switch (metric) {
      case metricTypes.HEIGHT:
        return this._heightLabel(value);
      case metricTypes.WEIGHT:
        return this._weightLabel(value);
      default:
        return;
    }
  }

  _makeProfilePicker(metric) {
    let unitChangeHandler;
    let getLabel;

    switch (metric) {
      case metricTypes.HEIGHT:
        unitChangeHandler = this._heightTypeChangeHandler;
        getLabel = this._heightLabel;
        break;
      case metricTypes.WEIGHT:
        unitChangeHandler = this._weightTypeChangeHandler;
        getLabel = this._weightLabel;
        break;
      default:
        break;
    }

    return (
      <View style={styles.profilePickerItemsContainer}>
        <Picker
          style={styles.profilePickerItems}
          selectedValue={this.state.currentValue}
          onValueChange={this._valueChangeHandler}
        >
          {this.pickerNumericValues.map((value, key) => (
            <PickerItem
              key={key}
              value={value}
              label={getLabel(value)}
            />
          ))}
        </Picker>
        <Picker
          style={styles.profilePickerMetric}
          selectedValue={this.state.currentUnit}
          onValueChange={unitChangeHandler}
        >
          {this.pickerUnitValues.map((value, key) => (
            <PickerItem key={key} value={value} label={String(value)} />
          ))}
        </Picker>
      </View>
    );
  }

  render() {
    // Determine how many numeric value PickerItems to generate
    // and generate the unit value PickerItems
    let totalValues;
    switch (this.props.pickerType) {
      case metricTypes.HEIGHT:
        totalValues = this.state.currentUnit === heightConstants.units.IN ?
          100 : Math.floor(100 * heightConstants.conversionValue);

        this.pickerUnitValues = Object.values(heightConstants.units);
        break;

      case metricTypes.WEIGHT:
        totalValues = this.state.currentUnit === weightConstants.units.LB ?
          500 : Math.floor(500 * heightConstants.conversionValue);

        this.pickerUnitValues = Object.values(weightConstants.units);
        break;

      default:
        break;
    }

    // Generate picker values for the metric's numeric picker component
    this.pickerNumericValues = [];
    for (let i = 1; i <= totalValues; i++) {
      this.pickerNumericValues.push(i);
    }

    return (
      <View style={styles.profilePickerContainer}>
        { Platform.OS === 'android' && this.props.pickerType === 'birthdate' ? null : (
          // If the birthdate field is selected, only show the picker header on iOS
          // because the Android date picker is a modal that automatically closes after
          // selecting a date, so upon close, it would update the profile and there would
          // be no point in showing this save header bar
          <View style={styles.profilePickerHeader}>
            <TouchableOpacity
              style={styles.profilePickerHeaderButton}
              onPress={() => {
                const { pickerType } = this.props;
                if (pickerType === 'birthdate') {
                  this.props.updateProfile(pickerType, this.state.currentValue);
                } else {
                  this.props.updateProfile(this.props.pickerType, {
                    ...this.props[this.props.pickerType],
                    value: this.state.currentValue,
                    unit: this.state.currentUnit,
                    label: this._getLabel(this.props.pickerType, this.state.currentValue),
                  });
                }
                // This will unmount the current ProfilePicker instance
                this.props.setPickerType();
              }}
            >
              <Text style={styles.profilePickerHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
        { (() => {
          const currentDate = new Date();

          switch (this.props.pickerType) {
            case 'birthdate':
              // Show the appropriate date component based on OS
              if (Platform.OS === 'ios') {
                // iOS
                return (
                  <DatePickerIOS
                    date={this.state.currentValue}
                    maximumDate={currentDate}
                    mode="date"
                    onDateChange={date => this.setState({ currentValue: date })}
                  />
                );
              }

              // Android
              DatePickerAndroid.open({
                date: this.state.currentValue,
                maxDate: currentDate,
              })
                .then((selection) => {
                  const { action, year, month, day } = selection;
                  if (action !== DatePickerAndroid.dismissedAction) {
                    const date = new Date(year, month, day);
                    this.props.updateProfile('birthdate', date, true);
                  }
                })
                .catch(() => {
                  Alert.alert('Error', 'Unexpected error. Please try again.');
                });
              break;
            case 'height':
              return this._makeProfilePicker('height');
            case 'weight':
              return this._makeProfilePicker('weight');
            default:
              return null;
          }
        })() }
      </View>
    );
  }
}
