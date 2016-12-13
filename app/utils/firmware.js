import { NativeModules } from 'react-native';
import ReactNativeFS from 'react-native-fs';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;
const { DEV_MODE, API_SERVER_URL } = Environment;
const firmwareUrl = DEV_MODE ? 'https://api.gobackbone.com/firmware' : `${API_SERVER_URL}/firmware`;

// Compares the current firmware version with the new version
// Goes through each of the digits of the new firmware version
// and sees if it's larger than the current firmware version.
// Since it goes in order from left to right, if there is a digit
// in the new firmware version that's larger than the current
// firmware, then that means that there's a new update available
const compareFirmware = firmwareVersion => (
  Fetcher.get({ url: firmwareUrl })
    .then(res => res.json()
      .then(body => {
        const currentFirmware = firmwareVersion.split('.');
        const newFirmware = body.version.split('.');
        let updateAvailable = false;

        // Check each of the firmware version values
        // Use for loop, since forEach can't be interrupted
        for (let i = 0; i < newFirmware.length; i++) {
          if (newFirmware[i] > currentFirmware[i]) {
            updateAvailable = true;
            break;
          }
        }

        return updateAvailable;
      })
    )
);

const beginFirmwareDownload = res => {
  console.log('begin', res);
};

const progressFirmwareDownload = res => {
  console.log('progress', res);
};

const downloadFirmware = () => (
  Fetcher.get({ url: firmwareUrl })
    .then(res => res.json()
      .then(body => (
        ReactNativeFS.downloadFile({
          fromUrl: body.url,
          toFile: `${ReactNativeFS.DocumentDirectoryPath}/Backbone.cyacd`,
          begin: beginFirmwareDownload,
          progress: progressFirmwareDownload,
        })
      ))
      .then(result => result.promise.then(downloadResult => {
        if (downloadResult.statusCode === 200) {
          // Successful file download attempt
          // Call method to send file path / name to native modules
        }
      }))
    )
);

export default { compareFirmware, downloadFirmware };
