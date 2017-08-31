import Stats from '../containers/Stats';
import { LeftProfileComponent } from '../containers/TitleBar';

export default {
  name: 'stats',
  title: 'Stats',
  component: Stats,
  showTabBar: true,
  showLeftComponent: true,
  leftComponent: LeftProfileComponent,
};
