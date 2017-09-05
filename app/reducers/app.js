import { isString, mapValues } from 'lodash';
import {
  UPDATE_BLUETOOTH_STATE,
  SET_CONFIG,
  SET_TITLE_BAR,
  SHOW_FULL_MODAL,
  HIDE_FULL_MODAL,
  SHOW_PARTIAL_MODAL,
  HIDE_PARTIAL_MODAL,
} from '../actions/types';

export default (state = {
  bluetoothState: null,
  config: {},
  modal: {
    showFull: false,
    showPartial: false,
    content: null,
    config: null,
    onClose: null,
  },
  titleBar: {
    name: null,
    title: null,
    component: null,
    showLeftComponent: false,
    showNavbar: false,
    rightComponent: null,
    styles: {},
  },
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_BLUETOOTH_STATE: {
      return {
        ...state,
        bluetoothState: payload,
      };
    }
    case SET_CONFIG: {
      // Convert string true/false values to primitive boolean
      const transformedConfig = mapValues(payload, value => {
        if (isString(value)) {
          const _value = value.toLowerCase();
          if (_value === 'true') {
            return true;
          } else if (_value === 'false') {
            return false;
          }
        }
        return value;
      });

      return {
        ...state,
        config: transformedConfig,
      };
    }
    case SET_TITLE_BAR:
      return {
        ...state,
        titleBar: payload,
      };
    case SHOW_FULL_MODAL: {
      const { content, onClose } = payload;
      return {
        ...state,
        modal: {
          showFull: true,
          content,
          onClose,
        },
      };
    }
    case HIDE_FULL_MODAL: {
      return {
        ...state,
        modal: {
          showFull: false,
          content: null,
          onClose: null,
          config: null,
        },
      };
    }
    case SHOW_PARTIAL_MODAL: {
      return {
        ...state,
        modal: {
          showPartial: true,
          config: { ...payload },
          onClose: null,
        },
      };
    }
    case HIDE_PARTIAL_MODAL: {
      return {
        ...state,
        modal: {
          showPartial: false,
          content: null,
          config: null,
          onClose: null,
        },
      };
    }
    default:
      return state;
  }
};
