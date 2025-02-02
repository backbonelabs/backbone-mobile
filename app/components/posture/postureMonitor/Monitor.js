import React, { PropTypes } from 'react';
import { View } from 'react-native';
// import { View, TouchableOpacity } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimatedCircularProgress from './AnimatedCircularProgress';
import BodyText from '../../BodyText';
// import SecondaryText from '../../SecondaryText';
import styles from '../../../styles/posture/postureMonitor';
import theme from '../../../styles/theme';
import relativeDimensions from '../../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const Monitor = ({ pointerPosition, slouchPosition, rating }) => (
  <View style={styles.monitorContainer}>
    <AnimatedCircularProgress
      arcSweepAngle={240}
      size={applyWidthDifference(220)}
      width={applyWidthDifference(6)}
      fill={slouchPosition}
      tintColor={theme.primaryColor}
      backgroundColor={theme.infoColor}
      style={styles.animatedProgress}
      tension={100}
    >
      <View style={styles.innerMonitorContainer}>
        <View
          style={[
            styles.pointerContainer,
            { transform: [{ rotate: `${pointerPosition}deg` }] },
          ]}
        >
          <View style={styles.pointer} />
        </View>
        <View style={styles.postureRatingContainer}>
          <BodyText
            style={[
              styles.postureRating,
                { color: rating ? theme.infoColor : theme.primaryColor },
            ]}
          >
            {
                rating ? 'Good' : 'Poor'
              }
          </BodyText>
          {/* Recalibration button, to be added later on */}
          {/* <TouchableOpacity
            onPress={disable ? null : onPress}
            activeOpacity={0.4}
          >
            <MaterialIcons
              name={'refresh'}
              size={22}
              color={disable ? theme.disabledColor : theme.lightBlue500}
              style={styles.refreshIcon}
            />
            <SecondaryText
              style={[
                styles.reCalibrate,
                  { color: disable ? theme.disabledColor : theme.lightBlue500 },
              ]}
            >
                RE-CALIBRATE
            </SecondaryText>
          </TouchableOpacity> */}
        </View>
      </View>
    </AnimatedCircularProgress>
    <View
      style={[
        styles.leftCircle,
          { backgroundColor: slouchPosition === 0 ? theme.infoColor : theme.primaryColor },
      ]}
    />
    <View
      style={[
        styles.rightCircle,
          { backgroundColor: slouchPosition === 100 ? theme.primaryColor : theme.infoColor },
      ]}
    />
  </View>
);

Monitor.propTypes = {
  pointerPosition: PropTypes.number,
  slouchPosition: PropTypes.number,
  onPress: PropTypes.func,
  disable: PropTypes.bool,
  postureRating: PropTypes.string,
  rating: PropTypes.bool,
};

export default Monitor;
