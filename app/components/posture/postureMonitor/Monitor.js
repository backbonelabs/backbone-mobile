import React, { PropTypes } from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimatedCircularProgress from './AnimatedCircularProgress';
import BodyText from '../../BodyText';
import SecondaryText from '../../SecondaryText';
import styles from '../../../styles/posture/postureMonitor';
import theme from '../../../styles/theme';
import relativeDimensions from '../../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const Monitor = ({ pointerPosition, slouchPosition, onPress, disable }) => {
  const poorPosture = 210 - slouchPosition;
  return (
    <View style={styles.monitorContainer}>
      <AnimatedCircularProgress
        arcSweepAngle={240}
        size={applyWidthDifference(220)}
        width={applyWidthDifference(6)}
        fill={slouchPosition}
        tintColor={theme.primaryColor}
        backgroundColor={theme.greenColor}
        style={styles.animatedProgress}
      >
        <View style={styles.innerMonitorContainer}>
          <View
            style={[
            { transform: [{ rotate: `${pointerPosition}deg` }] },
              styles.pointerContainer,
            ]}
          >
            <View style={styles.pointer} />
          </View>
          <View style={styles.postureRatingContainer}>
            <BodyText
              style={[
                styles._postureRating,
                { color: (pointerPosition < poorPosture) ? theme.primaryColor : theme.greenColor },
              ]}
            >
              {
                (pointerPosition < poorPosture) ? 'Poor' : 'Good'
              }
            </BodyText>
            <TouchableOpacity
              onPress={disable ? null : onPress}
              activeOpacity={0.4}
            >
              <MaterialIcons
                name={'refresh'}
                size={22}
                color={disable ? theme.disabledColor : theme.lightBlueColor}
                style={styles.refreshIcon}
              />
              <SecondaryText
                style={[
                  styles._reCalibrate,
                  { color: disable ? theme.disabledColor : theme.lightBlueColor },
                ]}
              >
                RE-CALIBRATE
              </SecondaryText>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedCircularProgress>
      <View
        style={[
          styles.leftCircle,
          { backgroundColor: slouchPosition === 0 ? theme.greenColor : theme.primaryColor },
        ]}
      />
      <View
        style={[
          styles.rightCircle,
          { backgroundColor: slouchPosition === 100 ? theme.primaryColor : theme.greenColor },
        ]}
      />
    </View>
  );
};

Monitor.propTypes = {
  pointerPosition: PropTypes.number,
  slouchPosition: PropTypes.number,
  onPress: PropTypes.func,
  disable: PropTypes.bool,
  postureRating: PropTypes.string,
};

export default Monitor;
