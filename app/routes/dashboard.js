import Dashboard from '../containers/Dashboard';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'dashboard',
  title: 'Home',
  component: Dashboard,
  showTabBar: true,
  showBanner: true,
  showRightComponent: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
