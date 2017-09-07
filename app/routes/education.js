import WorkoutList from '../containers/WorkoutList';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'education',
  title: 'Education',
  component: WorkoutList,
  showTabBar: true,
  showBanner: true,
  showRightComponent: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
