import {
  SET_CONFIG,
  SHOW_FULL_MODAL,
  HIDE_FULL_MODAL,
  SHOW_PARTIAL_MODAL,
  HIDE_PARTIAL_MODAL,
  NEXT_STEP,
  REMOVE_NEXT_STEP,
} from './types';

export default {
  setConfig(config) {
    return {
      type: SET_CONFIG,
      payload: config,
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
  nextStep() {
    return { type: NEXT_STEP };
  },
  removeNextStep() {
    return { type: REMOVE_NEXT_STEP };
  },
};
