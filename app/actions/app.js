import {
  SET_CONFIG,
  SET_TITLE_BAR,
  SHOW_FULL_MODAL,
  HIDE_FULL_MODAL,
  SHOW_PARTIAL_MODAL,
  HIDE_PARTIAL_MODAL,
  SET_NEXT_ROUTE,
  TOGGLE_OVERRIDE_BACK_BUTTON,
} from './types';

export default {
  setConfig(config) {
    return {
      type: SET_CONFIG,
      payload: config,
    };
  },
  setTitleBar(titleBarConfig) {
    return {
      type: SET_TITLE_BAR,
      payload: titleBarConfig,
    };
  },
  showFullModal(modalConfig) {
    return {
      type: SHOW_FULL_MODAL,
      payload: modalConfig,
    };
  },
  hideFullModal() {
    return { type: HIDE_FULL_MODAL };
  },
  showPartialModal(modalConfig) {
    return {
      type: SHOW_PARTIAL_MODAL,
      payload: modalConfig,
    };
  },
  hidePartialModal() {
    return { type: HIDE_PARTIAL_MODAL };
  },
  setNextRoute(route) {
    return {
      type: SET_NEXT_ROUTE,
      payload: route,
    };
  },
  toggleOverrideBackButton(state) {
    return {
      type: TOGGLE_OVERRIDE_BACK_BUTTON,
      payload: state,
    };
  },
};
