import WorkoutList from '../containers/WorkoutList';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'freeTraining',
  title: 'Training Content',
  component: WorkoutList,
  showTabBar: true,
  showRightComponent: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
