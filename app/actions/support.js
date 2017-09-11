import { NativeModules } from 'react-native';
import {
  CREATE_SUPPORT_TICKET,
  UPDATE_SUPPORT_MESSAGE,
  RESEND_CONFIRMATION_EMAIL,
} from './types';
import store from '../store';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { errorMessages } = constants;

const handleNetworkError = mixpanelEvent => {
  Mixpanel.track(`${mixpanelEvent}-serverError`);
  throw new Error(errorMessages.NETWORK_ERROR);
};

export default {
  updateMessage(message) {
    return {
      type: UPDATE_SUPPORT_MESSAGE,
      payload: message,
    };
  },
  createTicket(message) {
    const { auth: { accessToken }, user: { user } } = store.getState();
    const createTicketEventName = 'createTicket';

    return {
      type: CREATE_SUPPORT_TICKET,
      payload: () => Fetcher.post({
        url: `${Environment.API_SERVER_URL}/support`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          _id: user._id,
          message,
        }),
      })
        .catch(() => handleNetworkError(createTicketEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            Mixpanel.trackWithProperties(`${createTicketEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }
          Mixpanel.track(`${createTicketEventName}-success`);
          return;
        }),
    };
  },
  resendEmail() {
    const { auth: { accessToken }, user: { user } } = store.getState();
    const resendEmailEventName = 'resendEmail';

    return {
      type: RESEND_CONFIRMATION_EMAIL,
      payload: () => Fetcher.post({
        url: `${Environment.API_SERVER_URL}/support/resend-email`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          _id: user._id,
        }),
      })
        .catch(() => handleNetworkError(resendEmailEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            Mixpanel.trackWithProperties(`${resendEmailEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }
          Mixpanel.track(`${resendEmailEventName}-success`);

          return body;
        }),
    };
  },
};
