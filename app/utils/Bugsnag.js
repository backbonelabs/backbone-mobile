import { Client } from 'bugsnag-react-native';
import { NativeModules } from 'react-native';

const bugsnag = new Client(NativeModules.Environment.BUGSNAG_API_KEY);

// See https://docs.bugsnag.com/platforms/react-native/ for Bugsnag client API

export default bugsnag;
