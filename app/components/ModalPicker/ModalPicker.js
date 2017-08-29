import {
  Platform,
} from 'react-native';
import ModalPickerIOS from './ModalPickerIOS';
import ModalPickerAndroid from './ModalPickerAndroid';

export default Platform.OS === 'ios' ? ModalPickerIOS : ModalPickerAndroid;
