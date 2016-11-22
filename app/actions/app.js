export default {
  setConfig(config) {
    return {
      type: 'SET_CONFIG',
      payload: config,
    };
  },
  showFullModal(modalConfig) {
    return {
      type: 'SHOW_FULL_MODAL',
      payload: modalConfig,
    };
  },
  hideFullModal() {
    return { type: 'HIDE_FULL_MODAL' };
  },
};
