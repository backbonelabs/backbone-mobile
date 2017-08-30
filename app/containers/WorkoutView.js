import React, { Component, PropTypes } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import PostureIntro from '../components/posture/PostureIntro';
import Spinner from '../components/Spinner';
import VideoPlayer from '../components/VideoPlayer';
import videoIconBlue from '../images/video-icon-blue.png';
import videoIconGreen from '../images/video-icon-green.png';
import videoIconOrange from '../images/video-icon-orange.png';
import videoIconPurple from '../images/video-icon-purple.png';
import videoIconRed from '../images/video-icon-red.png';
import { getColorHexForLevel, getColorNameForLevel } from '../utils/levelColors';
import styles from '../styles/workoutView';
import constants from '../utils/constants';

const { workoutTypes } = constants;

const videoIcon = {
  purple: videoIconPurple,
  blue: videoIconBlue,
  green: videoIconGreen,
  orange: videoIconOrange,
  red: videoIconRed,
};

class WorkoutView extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    onPostureProceed: PropTypes.func,
    training: PropTypes.shape({
      selectedLevelIdx: PropTypes.number,
    }).isRequired,
    workout: PropTypes.shape({
      gifUrl: PropTypes.string,
      type: PropTypes.number,
    }),
  }

  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      isFetchingImage: false,
    };
  }

  componentDidMount() {
    const gifUrl = this.props.workout.gifUrl;
    if (gifUrl) {
      // GIF URL exists, prefetch GIF
      this._prefetchGif(gifUrl);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.workout.gifUrl !== nextProps.workout.gifUrl && nextProps.workout.gifUrl) {
      // Workout changed, fetch new workout GIF
      this._prefetchGif(nextProps.workout.gifUrl);
    }
  }

  /**
   * Prefetch an image
   * @param {String} url Image URL
   */
  _prefetchGif(url) {
    this.setState({ isFetchingImage: true }, () => {
      Image.prefetch(url)
        .then(() => {
          this.setState({ isFetchingImage: false });
        })
        .catch(() => {
          // Suppress errors
          this.setState({ isFetchingImage: false });
        });
    });
  }

  render() {
    const workout = this.props.workout;
    const selectedLevelIdx = this.props.training.selectedLevelIdx;
    const levelColorHex = getColorHexForLevel(selectedLevelIdx);
    const levelColorName = getColorNameForLevel(selectedLevelIdx);

    // If the workout is a posture session, display PostureIntro. Otherwise, display workout media
    const isPostureSession = workout.type === workoutTypes.POSTURE;
    let content;
    const postureIntroProps = {};

    if (this.props.onPostureProceed) {
      postureIntroProps.onProceed = this.props.onPostureProceed;
    }

    if (isPostureSession) {
      content = (
        <PostureIntro
          duration={workout.duration}
          navigator={this.props.navigator}
          {...postureIntroProps}
        />
      );
    } else if (workout.gifUrl) {
      content = (
        <Image source={{ uri: workout.gifUrl }} style={styles.gif}>
          <TouchableOpacity
            style={styles.videoLink}
            onPress={() => { /* TODO: NAVIGATE TO WORKOUT VIDEO */ }}
          >
            <Image source={videoIcon[levelColorName]} style={styles.videoIcon} />
          </TouchableOpacity>
        </Image>
      );
    } else if (workout.videoUrl) {
      content = (
        <View style={styles.videoPlayerContainer}>
          <VideoPlayer
            video={{ uri: workout.videoUrl }}
            customStyles={{
              wrapper: styles._videoPlayer,
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {this.state.isFetchingImage ? <Spinner size="large" color={levelColorHex} /> : content}
      </View>
    );
  }
}

const mapStateToProps = ({ training }) => ({ training });

export default connect(mapStateToProps)(WorkoutView);
