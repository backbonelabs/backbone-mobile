import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Platform,
  TouchableOpacity,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import autobind from 'class-autobind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import styles from '../styles/videoPlayer';
import Mixpanel from '../utils/Mixpanel';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      isStarted: props.autoplay,
      isPlaying: props.autoplay,
      width: 200,
      progress: 0,
      isMuted: props.defaultMuted,
      isControlsVisible: !props.hideControlsOnStart,
      duration: 0,
      isSeeking: false,
      videoCompletion: false,
    };

    this.seekBarWidth = 200;
    this.wasPlayingBeforeSeek = props.autoplay;
    this.seekTouchStart = 0;
    this.seekProgressStart = 0;
  }

  componentDidMount() {
    if (this.props.autoplay) {
      this.hideControls();
    }
  }

  componentWillUnmount() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    if (this.fullScreenVideoLoadedListener) {
      this.fullScreenVideoLoadedListener.remove();
    }

    if (this.fullScreenVideoEndedListener) {
      this.fullScreenVideoEndedListener.remove();
    }

    if (this.fullScreenVideoErrorListener) {
      this.fullScreenVideoErrorListener.remove();
    }

    if (this.fullScreenVideoProgressListener) {
      this.fullScreenVideoProgressListener.remove();
    }
    if (!this.state.videoCompletion && this.state.isStarted) {
      Mixpanel.trackWithProperties('videoAbandon', this._getCurrentPlaybackState());
    }
  }

  onLayout(event) {
    const { width } = event.nativeEvent.layout;
    this.setState({
      width,
    });
  }

  onStartPress() {
    Mixpanel.trackWithProperties('videoPlay', this._getCurrentPlaybackState());
    if (this.props.onStart) {
      this.props.onStart();
    }

    this.setState({
      isPlaying: true,
      isStarted: true,
    });

    this.hideControls();
  }

  onProgress(event) {
    if (this.state.isSeeking) {
      return;
    }
    if (this.props.onProgress) {
      this.props.onProgress(event);
    }
    this.setState({
      progress: event.currentTime / (this.props.duration || this.state.duration),
    });
  }

  onEnd(event) {
    this.setState({ videoCompletion: true }, () => {
      Mixpanel.trackWithProperties('videoCompletion', this._getCurrentPlaybackState());
    });
    if (this.props.onEnd) {
      this.props.onEnd(event);
    }

    if (this.props.endWithThumbnail) {
      this.setState({ isStarted: false });
    }

    if (!this.props.loop) {
      return this.setState({
        progress: 1,
        isPlaying: false,
      }, () => this.player.seek(0));
    }

    this.setState({ progress: 1 });
  }

  onLoad(event) {
    if (this.props.onLoad) {
      this.props.onLoad(event);
    }

    const { duration } = event;
    this.setState({ duration });
  }

  onPlayPress() {
    Mixpanel.trackWithProperties('videoResume', this._getCurrentPlaybackState());
    if (this.props.onPlayPress) {
      this.props.onPlayPress();
    }

    this.setState({
      isPlaying: true,
    });
    this.showControls();
  }

  onStopPress() {
    Mixpanel.trackWithProperties('videoPause', this._getCurrentPlaybackState());
    if (this.props.onStopPress) {
      this.props.onStopPress();
    }

    this.setState({
      isPlaying: false,
    });
    this.showControls();
  }

  onMutePress() {
    this.setState((prevState) => ({ isMuted: !prevState.isMuted }));
    this.showControls();
  }

  onToggleFullScreen() {
    if (Platform.OS === 'android') {
      const FullScreenBridgeModuleEvents = new NativeEventEmitter(
        NativeModules.FullScreenBridgeModule);

      if (!this.fullScreenVideoLoadedListener) {
        this.fullScreenVideoLoadedListener = FullScreenBridgeModuleEvents.addListener(
          'VideoLoaded',
          () => {
            // Do what we need when the video has been loaded in the fullscreen player
          }
        );
      }

      if (!this.fullScreenVideoEndedListener) {
        this.fullScreenVideoEndedListener = FullScreenBridgeModuleEvents.addListener(
          'VideoEnded',
          () => {
            // Stop the playback to prevent auto-play when returning from the fullscreen video
            if (!this.props.loop) {
              this.setState({
                isPlaying: false,
                isStarted: false,
                progress: 1,
              });
            }
            this.setState({ videoCompletion: true }, () => {
              Mixpanel.trackWithProperties('videoCompletion', this._getCurrentPlaybackState());
            });
          }
        );
      }

      if (!this.fullScreenVideoErrorListener) {
        this.fullScreenVideoErrorListener = FullScreenBridgeModuleEvents.addListener(
          'VideoError',
          (event) => {
            // Handle fullscreen playback errors here
            if (this.props.onAndroidFullScreenError) {
              this.props.onAndroidFullScreenError(event);
            }
          }
        );
      }

      if (!this.fullScreenVideoProgressListener) {
        this.fullScreenVideoProgressListener = FullScreenBridgeModuleEvents.addListener(
          'VideoProgress',
          event => {
            // Use the elapsed time of the fullscreen player to sync with the RN player
            const { currentTime } = event;

            if (this.player && this.state.isStarted) {
              this.player.seek(currentTime);
              this.onProgress(event);
            }
          }
        );
      }

      const uri = this.props.video.uri;
      const { progress } = this.state;
      const elapsedTime = progress * (this.props.duration || this.state.duration);
      const { loop } = this.props;

      // Set the current elapsed time as well
      NativeModules.FullScreenBridgeModule.showFullscreen(uri, elapsedTime, loop);
    } else {
      this.player.presentFullscreenPlayer();
    }
  }

  onSeekBarLayout({ nativeEvent }) {
    const customStyle = this.props.customStyles.seekBar;
    let padding = 0;
    if (customStyle && customStyle.paddingHorizontal) {
      padding = customStyle.paddingHorizontal * 2;
    } else if (customStyle) {
      padding = customStyle.paddingLeft || 0;
      padding += customStyle.paddingRight ? customStyle.paddingRight : 0;
    } else {
      padding = 20;
    }

    this.seekBarWidth = nativeEvent.layout.width - padding;
  }

  onSeekStartResponder() {
    return true;
  }

  onSeekMoveResponder() {
    return true;
  }

  onSeekGrant(e) {
    this.seekTouchStart = e.nativeEvent.pageX;
    this.seekProgressStart = this.state.progress;
    this.wasPlayingBeforeSeek = this.state.isPlaying;
    this.setState({
      isSeeking: true,
      isPlaying: false,
    });
  }

  onSeekRelease() {
    this.setState({
      isSeeking: false,
      isPlaying: this.wasPlayingBeforeSeek,
    });
    this.showControls();
  }

  onSeek(e) {
    const diff = e.nativeEvent.pageX - this.seekTouchStart;
    const ratio = 100 / this.seekBarWidth;
    const progress = this.seekProgressStart + ((ratio * diff) / 100);

    this.setState({
      progress,
    });

    this.player.seek(progress * this.state.duration);
  }

  onFullscreenPlayerWillDismiss() {
    if (Platform.OS === 'ios') {
      NativeModules.ViewControllerService.resetStatusBar();
    }
  }

  getSizeStyles() {
    const { videoWidth, videoHeight } = this.props;
    const { width } = this.state;
    const ratio = videoHeight / videoWidth;
    return {
      height: width * ratio,
      width,
    };
  }

  _getCurrentPlaybackState() {
    const { uri } = this.props.video;
    const { progress, duration, videoCompletion } = this.state;

    return {
      progress,
      uri,
      duration,
      videoCompletion,
    };
  }

  hideControls() {
    if (this.props.disableControlsAutoHide) {
      return;
    }

    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }
    this.controlsTimeout = setTimeout(() => {
      this.setState({ isControlsVisible: false });
    }, this.props.controlsTimeout);
  }

  showControls() {
    this.setState({
      isControlsVisible: true,
    });
    this.hideControls();
  }

  renderStartButton() {
    const { customStyles } = this.props;
    return (
      <TouchableOpacity
        style={[styles.playButton, customStyles.playButton]}
        onPress={this.onStartPress}
      >
        <Icon style={[styles.playArrow, customStyles.playArrow]} name="play-arrow" size={42} />
      </TouchableOpacity>
    );
  }

  renderThumbnail() {
    const { thumbnail, customStyles, ...props } = this.props;
    return (
      <Image
        {...props}
        style={[
          styles.thumbnail,
          this.getSizeStyles(),
          customStyles.thumbnail,
        ]}
        source={thumbnail}
      >
        {this.renderStartButton()}
      </Image>
    );
  }

  renderSeekBar(fullWidth) {
    const { customStyles } = this.props;
    return (
      <View
        style={[
          styles.seekBar,
          fullWidth ? styles.seekBarFullWidth : {},
          customStyles.seekBar,
          fullWidth ? customStyles.seekBarFullWidth : {},
        ]}
        onLayout={this.onSeekBarLayout}
      >
        <View
          style={[
            { flexGrow: this.state.progress },
            styles.seekBarProgress,
            customStyles.seekBarProgress,
          ]}
        />
        { !fullWidth ? (
          <View
            style={[
              styles.seekBarKnob,
              customStyles.seekBarKnob,
              this.state.isSeeking ? { transform: [{ scale: 1 }] } : {},
              this.state.isSeeking ? customStyles.seekBarKnobSeeking : {},
            ]}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            onStartShouldSetResponder={this.onSeekStartResponder}
            onMoveShouldSetPanResponder={this.onSeekMoveResponder}
            onResponderGrant={this.onSeekGrant}
            onResponderMove={this.onSeek}
            onResponderRelease={this.onSeekRelease}
            onResponderTerminate={this.onSeekRelease}
          />
        ) : null }
        <View
          style={[
            styles.seekBarBackground,
          { flexGrow: 1 - this.state.progress },
            customStyles.seekBarBackground,
          ]}
        />
      </View>
    );
  }

  renderControls() {
    const { customStyles } = this.props;
    return (
      <View style={[styles.controls, customStyles.controls]}>
        <TouchableOpacity
          onPress={this.state.isPlaying ? this.onStopPress : this.onPlayPress}
          style={[customStyles.controlButton, customStyles.playControl]}
        >
          <Icon
            style={[styles.playControl, customStyles.controlIcon, customStyles.playIcon]}
            name={this.state.isPlaying ? 'pause' : 'play-arrow'}
            size={32}
          />
        </TouchableOpacity>
        {this.renderSeekBar()}
        {this.props.muted ? null : (
          <TouchableOpacity onPress={this.onMutePress} style={customStyles.controlButton}>
            <Icon
              style={[styles.extraControl, customStyles.controlIcon]}
              name={this.state.isMuted ? 'volume-off' : 'volume-up'}
              size={24}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={this.onToggleFullScreen} style={customStyles.controlButton}>
          <Icon
            style={[styles.extraControl, customStyles.controlIcon]}
            name="fullscreen"
            size={32}
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderVideo() {
    const {
      video,
      resizeMode,
      customStyles,
      ...props,
    } = this.props;
    return (
      <View style={customStyles.videoWrapper}>
        <Video
          {...props}
          style={[
            styles.video,
            this.getSizeStyles(),
            customStyles.video,
          ]}
          repeat={this.props.loop}
          ref={p => { this.player = p; }}
          muted={this.props.muted || this.state.isMuted}
          paused={!this.state.isPlaying}
          onProgress={this.onProgress}
          onEnd={this.onEnd}
          onLoad={this.onLoad}
          onFullscreenPlayerWillDismiss={this.onFullscreenPlayerWillDismiss}
          source={video}
          resizeMode={resizeMode}
        />
        <View
          style={[
            this.getSizeStyles(),
            { marginTop: -this.getSizeStyles().height },
          ]}
        >
          <TouchableOpacity style={styles.overlayButton} onPress={this.showControls} />
        </View>
        {((!this.state.isPlaying) || this.state.isControlsVisible)
          ? this.renderControls() : this.renderSeekBar(true)}
      </View>
    );
  }

  renderContent() {
    const { thumbnail } = this.props;
    const { isStarted } = this.state;

    if (!isStarted && thumbnail) {
      return this.renderThumbnail();
    } else if (!isStarted) {
      return (
        <View style={[styles.preloadingPlaceholder, this.getSizeStyles()]}>
          {this.renderStartButton()}
        </View>
      );
    }
    return this.renderVideo();
  }

  render() {
    return (
      <View onLayout={this.onLayout} style={this.props.customStyles.wrapper}>
        {this.renderContent()}
      </View>
    );
  }
}

VideoPlayer.propTypes = {
  video: Video.propTypes.source,
  thumbnail: Image.propTypes.source,
  videoWidth: PropTypes.number,
  videoHeight: PropTypes.number,
  duration: PropTypes.number,
  autoplay: PropTypes.bool,
  defaultMuted: PropTypes.bool,
  muted: PropTypes.bool,
  controlsTimeout: PropTypes.number,
  disableControlsAutoHide: PropTypes.bool,
  disableFullscreen: PropTypes.bool,
  loop: PropTypes.bool,
  resizeMode: Video.propTypes.resizeMode,
  hideControlsOnStart: PropTypes.bool,
  endWithThumbnail: PropTypes.bool,
  customStyles: PropTypes.shape({
    wrapper: View.propTypes.style,
    video: Video.propTypes.style,
    videoWrapper: View.propTypes.style,
    controls: View.propTypes.style,
    playControl: TouchableOpacity.propTypes.style,
    controlButton: TouchableOpacity.propTypes.style,
    controlIcon: Icon.propTypes.style,
    playIcon: Icon.propTypes.style,
    seekBar: View.propTypes.style,
    seekBarFullWidth: View.propTypes.style,
    seekBarProgress: View.propTypes.style,
    seekBarKnob: View.propTypes.style,
    seekBarKnobSeeking: View.propTypes.style,
    seekBarBackground: View.propTypes.style,
    thumbnail: Image.propTypes.style,
    playButton: TouchableOpacity.propTypes.style,
    playArrow: Icon.propTypes.style,
  }),
  onEnd: PropTypes.func,
  onProgress: PropTypes.func,
  onLoad: PropTypes.func,
  onStart: PropTypes.func,
  onPlayPress: PropTypes.func,
  onStopPress: PropTypes.func,
  onHideControls: PropTypes.func,
  onShowControls: PropTypes.func,
  onAndroidFullScreenError: PropTypes.func,
};

VideoPlayer.defaultProps = {
  videoWidth: 1280,
  videoHeight: 720,
  autoplay: false,
  controlsTimeout: 2000,
  loop: false,
  resizeMode: 'cover',
  customStyles: {},
};
