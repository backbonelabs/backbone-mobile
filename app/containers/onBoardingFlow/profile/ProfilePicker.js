import React, { Component, PropTypes } from 'react';
import {
  View,
  Picker,
  Platform,
  DatePickerIOS,
  DatePickerAndroid,
} from 'react-native';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import constants from '../../../utils/constants';
import styles from '../../../styles/onBoardingFlow/profile';
import theme from '../../../styles/theme';
import appActions from '../../../actions/app';

const isiOS = Platform.OS === 'ios';
const {
  height: heightConstants,
  weight: weightConstants,
} = constants;
const PickerItem = Picker.Item;

const metricTypes = {
  HEIGHT: 'height',
  WEIGHT: 'weight',
};

const generateNumericValues = count => {
  const values = [];
  for (let i = 1; i <= count; i++) {
    values.push(i);
  }
  return values;
};

class ProfilePicker extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    height: PropTypes.object,
    weight: PropTypes.object,
    birthdate: PropTypes.object,
    updateProfile: PropTypes.func,
    pickerType: PropTypes.string,
    setPickerType: PropTypes.func,
    mode: PropTypes.string,
  };

  static defaultProps = {
    mode: 'default',
  }

  constructor() {
    super();
    autobind(this);

    // Generate numeric and unit picker values
    this.pickerNumericValues = {
      height: {
        IN: generateNumericValues(100),
        CM: generateNumericValues(Math.floor(100 * heightConstants.conversionValue)),
      },
      weight: {
        LB: generateNumericValues(500),
        KG: generateNumericValues(Math.ceil(500 * weightConstants.conversionValue)),
      },
    };
    this.pickerUnitValues = {
      height: Object.entries(heightConstants.units).sort((a, b) => {
        // Sort unit values based on their numeric constant values in descending order.
        // This assumes the preferred unit of measure has the lowest value. This is sort
        // of a hack because on a small screen, it is not apparent there are additional
        // picker options when the picker defaults to the first PickerItem. As a result,
        // this will default the imperial UOM (the default) as the second PickerItem so
        // the user sees both the metric and imperial UOMs.
        if (a[1] < b[1]) return 1;
        else if (a[1] === b[1]) return 0;
        return -1;
      }),
      weight: Object.entries(weightConstants.units).sort((a, b) => {
        // Sort unit values based on their numeric constant values in descending order.
        // This assumes the preferred unit of measure has the lowest value. This is sort
        // of a hack because on a small screen, it is not apparent there are additional
        // picker options when the picker defaults to the first PickerItem. As a result,
        // this will default the imperial UOM (the default) as the second PickerItem so
        // the user sees both the metric and imperial UOMs.
        if (a[1] < b[1]) return 1;
        else if (a[1] === b[1]) return 0;
        return -1;
      }),
    };
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
      // Sets the default birthday to 18 years ago.
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 18);
      this.setState({ currentValue: props[pickerType] || defaultDate });
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
    return `${value}${constants.weightUnitIdToLabel[this.state.currentUnit].toLowerCase()}`;
  }

  _valueChangeHandler(value) {
    this.setState(() => ({ currentValue: value }), this._updateProfile);
  }

  _onDateChange(date) {
    const newDate = new Date(date.getTime());
    newDate.setHours(0, 0, 0, 0);
    this.setState({ currentValue: newDate });
    this.props.updateProfile(this.props.pickerType, newDate);
  }

  _heightTypeChangeHandler(unit) {
    const { currentValue, currentUnit } = this.state;
    if (unit !== currentUnit) {
      const equalsInch = unit === heightConstants.units.IN;
      const centimeterToInch = Math.max(1,
        Math.round(currentValue / heightConstants.conversionValue)
      );
      const inchToCentimeter = Math.round(currentValue * heightConstants.conversionValue);

      this.setState(() => ({
        currentValue: equalsInch ? centimeterToInch : inchToCentimeter,
        currentUnit: unit,
      }), this._updateProfile);
    }
  }

  _weightTypeChangeHandler(unit) {
    const { currentValue, currentUnit } = this.state;
    if (unit !== currentUnit) {
      const equalsPound = unit === weightConstants.units.LB;
      const kilogramToPound = Math.round(currentValue / weightConstants.conversionValue);
      const poundToKilogram = Math.ceil(currentValue * weightConstants.conversionValue);

      this.setState(() => ({
        currentValue: equalsPound ? kilogramToPound : poundToKilogram,
        currentUnit: unit,
      }), this._updateProfile);
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

  _updateProfile() {
    return this.props.updateProfile(this.props.pickerType, {
      ...this.props[this.props.pickerType],
      value: this.state.currentValue,
      unit: this.state.currentUnit,
      label: this._getLabel(this.props.pickerType, this.state.currentValue),
    });
  }

  _showPickers() {
    const metric = this.props.pickerType;
    let unitChangeHandler;
    let getLabel;
    let pickerNumericValues = [];

    switch (metric) {
      case metricTypes.HEIGHT: {
        unitChangeHandler = this._heightTypeChangeHandler;
        getLabel = this._heightLabel;
        const unit = constants.heightUnitIdToLabel[this.state.currentUnit];
        pickerNumericValues = this.pickerNumericValues[metric][unit];
        break;
      }
      case metricTypes.WEIGHT: {
        unitChangeHandler = this._weightTypeChangeHandler;
        getLabel = this._weightLabel;
        const unit = constants.weightUnitIdToLabel[this.state.currentUnit];
        pickerNumericValues = this.pickerNumericValues[metric][unit];
        break;
      }
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
          selectedValue={this.state.currentUnit}
          onValueChange={unitChangeHandler}
        >
          {this.pickerUnitValues[metric].map((value) => (
            <PickerItem key={value[1]} value={value[1]} label={value[0].toLowerCase()} />
          ))}
        </Picker>
      </View>
    );
  }

  render() {
    const profilePickerContainer = { flex: 0.5 };

    if (!isiOS) {
      if (this.props.pickerType === 'birthdate') {
        profilePickerContainer.flex = 0;
      } else {
        profilePickerContainer.flex = 0.2;
      }
    }

    return (
      <View style={profilePickerContainer}>
        { (() => {
          const currentDate = new Date();

          switch (this.props.pickerType) {
            case 'birthdate':
              // Show the appropriate date component based on OS
              if (isiOS) {
                // iOS
                return (
                  <DatePickerIOS
                    date={this.state.currentValue}
                    maximumDate={currentDate}
                    mode="date"
                    onDateChange={this._onDateChange}
                  />
                );
              }

              // Android
              DatePickerAndroid.open({
                date: this.state.currentValue,
                maxDate: currentDate,
                mode: this.props.mode,
              })
                .then((selection) => {
                  const { action, year, month, day } = selection;
                  if (action !== DatePickerAndroid.dismissedAction) {
                    const date = new Date(year, month, day);
                    return this.props.updateProfile('birthdate', date);
                  }
                  // presses cancel
                  return this.props.updateProfile('birthdate', null);
                })
                .catch(() => {
                  this.props.dispatch(appActions.showPartialModal({
                    title: {
                      caption: 'Error',
                      color: theme.warningColor,
                    },
                    detail: {
                      caption: 'Unexpected error. Please try again.',
                    },
                    buttons: [
                      {
                        caption: 'OK',
                        onPress: () => {
                          this.props.dispatch(appActions.hidePartialModal());
                        },
                      },
                    ],
                    backButtonHandler: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  }));
                });
              break;
            case 'height':
            case 'weight':
              return this._showPickers();
            default:
              return null;
          }
        })() }
      </View>
    );
  }
}

export default connect()(ProfilePicker);
