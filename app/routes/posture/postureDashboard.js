import PostureDashboard from '../../components/posture/PostureDashboard';
import tutorial from '../../routes/tutorial';
import postureTutorialSteps from '../../components/posture/postureTutorialSteps';

export default {
  name: 'postureDashboard',
  title: 'Posture Dashboard',
  component: PostureDashboard,
  showMenu: true,
  rightButton: {
    onPress: navigator => (navigator.push(
      Object.assign({}, tutorial, { tutorialSteps: postureTutorialSteps })
    )),
    iconName: 'question-circle-o',
  },
};
