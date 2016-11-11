import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;

const updateTicketMessage = payload => ({
  type: 'UPDATE_SUPPORT_MESSAGE',
  payload,
});

const createTicketStart = () => ({ type: 'CREATE_SUPPORT_TICKET__START' });

const createTicket = payload => ({
  type: 'CREATE_SUPPORT_TICKET',
  payload,
});

const createTicketError = error => ({
  type: 'CREATE_SUPPORT_TICKET__ERROR',
  payload: error,
  error: true,
});

export default {
  updateMessage(message) {
    return (dispatch) => {
      dispatch(updateTicketMessage(message));
    };
  },
  createTicket(message) {
    return (dispatch, getState) => {
      const { auth: { accessToken }, user: { user } } = getState();
      dispatch(createTicketStart());

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/support`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          _id: user._id,
          message,
        }),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              dispatch(createTicketError(new Error(body.error)));
            } else {
              dispatch(createTicket());
            }
          })
        )
        .catch(() => (
          // Network error
          dispatch(createTicketError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },
};
