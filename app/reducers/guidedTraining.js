import {
  DEVICE_CONNECT__START,
  DEVICE_CONNECT__ERROR,
} from '../actions/types';

export default (state = {
  isConnecting: false,
  isConnected: false,
  errorMessage: null,
  levels: [
    {
      color: 'orange',
      sessions: [
        [
          {
            title: 'L1S1E1',
          },
          {
            title: 'L1S1E2',
          },
        ],
        [
          {
            title: 'L1S2E1',
          },
        ],
      ],
    },
    {
      color: 'purple',
      sessions: [
        [
          {
            title: 'L2S1E1',
          },
          {
            title: 'L2S2E2',
          },
        ],
        [
          {
            title: 'L2S2E1',
          },
        ],
        [
          {
            title: 'L2S3E1',
          },
          {
            title: 'L2S3E2',
          },
          {
            title: 'L2S3E3',
          },
        ],
      ],
    },
  ],
  selectedLevel: 0,
  selectedSession: 0,
}, action) => {
  switch (action.type) {
    case DEVICE_CONNECT__START: {
      return {
        ...state,
        isConnecting: true,
        isConnected: false,
        errorMessage: null,
      };
    }
    case DEVICE_CONNECT__ERROR: {
      return {
        ...state,
        isConnecting: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
