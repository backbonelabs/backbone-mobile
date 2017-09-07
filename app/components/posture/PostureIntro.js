import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { View, Image } from 'react-native';
import Button from '../Button';
import BodyText from '../BodyText';
import postureActions from '../../actions/posture';
import femaleSitting from '../../images/posture/female-sitting.gif';
import routes from '../../routes';
import styles from '../../styles/posture/postureIntro';

// The setSessionTime action creator must be dispatched after initial mount/render
// to avoid a setState warning, so a React Component is required
class PostureIntro extends Component {
  static propTypes = {
    duration: PropTypes.number.isRequired,
    navigator: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
    onProceed: PropTypes.func,
    setSessionTime: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onProceed: (navigator) => {
      navigator.replace(routes.postureCalibrate);
    },
  };

  componentDidMount() {
    // Set posture session duration in Redux store
    this.props.setSessionTime(this.props.duration);
  }

  render() {
    return (
      <View style={styles.container}>
        <BodyText size={3} style={styles.text}>Sit or stand up straight before you begin</BodyText>
        <Image source={femaleSitting} style={styles.image} />
        <Button text="START" primary onPress={() => this.props.onProceed(this.props.navigator)} />
      </View>
    );
  }
}

export default connect(null, postureActions)(PostureIntro);
