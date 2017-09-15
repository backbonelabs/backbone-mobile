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
import videoIcon from '../images/video-icon-blue.png';
import routes from '../routes';
import styles from '../styles/workoutView';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import { getWorkoutGifFilePath } from '../utils/trainingUtils';

const { workoutTypes } = constants;

class WorkoutView extends Component {
  static propTypes = {
    media: PropTypes.oneOf(['image', 'video']),
    navigator: PropTypes.object.isRequired,
    training: PropTypes.shape({
      selectedLevelIdx: PropTypes.number,
    }).isRequired,
    workout: PropTypes.shape({
      gifFilename: PropTypes.string,
      videoUrl: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.number,
    }),
    isGuidedTraining: PropTypes.bool,
    defaultFullscreen: PropTypes.bool,
  }

  static defaultProps = {
    media: 'image',
    defaultFullscreen: false,
  };

  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      isFetchingImage: false,
    };
  }

  componentDidMount() {
    const gifFilename = getWorkoutGifFilePath(this.props.workout.gifFilename);
    if (this.props.media === 'image' && gifFilename) {
      // GIF URL exists, prefetch GIF
      this._prefetchGif(gifFilename);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.workout.gifFilename !== nextProps.workout.gifFilename &&
      nextProps.media === 'image' && nextProps.workout.gifFilename) {
      // Workout changed, fetch new workout GIF
      this._prefetchGif(getWorkoutGifFilePath(nextProps.workout.gifFilename));
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

  _navigateToVideo() {
    Mixpanel.trackWithProperties('workoutVideoIconClick',
      {
        workout: this.props.workout.title,
        videoUrl: this.props.workout.videoUrl,
      });

    this.props.navigator.push({
      ...routes.libraryContent,
      title: this.props.workout.title,
      props: {
        media: 'video',
      },
    });
  }

  render() {
    const workout = this.props.workout;

    // If the workout is a posture session, display PostureIntro. Otherwise, display workout media
    const isPostureSession = workout.type === workoutTypes.POSTURE;
    let content;

    if (isPostureSession) {
      content = (
        <PostureIntro
          duration={workout.duration}
          isGuidedTraining={this.props.isGuidedTraining ? this.props.isGuidedTraining : false}
          navigator={this.props.navigator}
        />
      );
    } else if (this.props.media === 'image' && workout.gifFilename) {
      content = (
        <View style={styles.gifContainer}>
          <Image source={{ uri: getWorkoutGifFilePath(workout.gifFilename) }} style={styles.gif}>
            <TouchableOpacity
              style={styles.videoLink}
              onPress={this._navigateToVideo}
            >
              <Image source={videoIcon} style={styles.videoIcon} />
            </TouchableOpacity>
          </Image>
        </View>
      );
    } else if (this.props.media === 'video' && workout.videoUrl) {
      content = (
        <View style={styles.videoPlayerContainer}>
          <VideoPlayer
            video={{ uri: workout.videoUrl }}
            defaultFullscreen={this.props.defaultFullscreen}
            autoplay
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {this.state.isFetchingImage ? <Spinner size="large" /> : content}
      </View>
    );
  }
}

const mapStateToProps = ({ training }) => ({ training });

export default connect(mapStateToProps)(WorkoutView);
