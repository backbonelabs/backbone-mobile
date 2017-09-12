import WorkoutList from '../containers/WorkoutList';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'freeTraining',
  title: 'Free Training',
  component: WorkoutList,
  showTabBar: true,
  showRightComponent: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
