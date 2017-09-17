import Stats from '../containers/Stats';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'stats',
  title: 'Training History',
  component: Stats,
  showTabBar: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
