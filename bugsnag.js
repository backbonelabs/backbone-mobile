/* eslint-disable import/no-extraneous-dependencies */
require('localenv');
const chalk = require('chalk');
const program = require('commander');
const plist = require('plist');
const g2js = require('gradle-to-js/lib/parser');
const request = require('request');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const log = console.log;
const error = console.error;
const red = chalk.red;
const green = chalk.green;

program
  .option('-d, --debug', 'Upload the debug bundle')
  .option('-r, --release', 'Upload the release bundle')
  .parse(process.argv);

const androidBundleDir = path.join(__dirname, 'android/app/build');
const androidBundleName = 'index.android.bundle';
const androidBundlePath = path.join(androidBundleDir, androidBundleName);
const androidSourcePath = path.join(__dirname, 'index.android.js');
const iOSBundleDir = path.join(__dirname, 'ios');
const iOSBundleName = 'main.jsbundle';
const iOSBundlePath = path.join(iOSBundleDir, iOSBundleName);
const iOSSourcePath = path.join(__dirname, 'index.ios.js');

/**
 * Generates the shell command to run for the JS bundling
 * @param  {String}  platform 'ios' or 'android'
 * @param  {Boolean} isDev    Bundle under dev mode
 * @return {String}
 */
const getBundleCommand = (platform, isDev) => {
  let bundleOutput;
  let assetsDest;

  if (platform === 'ios') {
    bundleOutput = iOSBundlePath;
    assetsDest = iOSBundleDir;
  } else {
    bundleOutput = androidBundlePath;
    assetsDest = androidBundleDir;
  }
  const sourcemapOutput = `${bundleOutput}.map`;

  return `node ${require.resolve('react-native/local-cli/cli')} bundle \
  --entry-file index.${platform}.js \
  --platform ${platform} \
  --dev ${isDev ? 'true' : 'false'} \
  --reset-cache \
  --bundle-output ${bundleOutput} \
  --assets-dest ${assetsDest} \
  --sourcemap-output ${sourcemapOutput}`;
};

/**
 * Makes a submission request to the Bugsnag API
 * @param  {Object}  formData Form data to include in the request
 * @return {Promise}          Resolves if the status code is 2xx, rejects if otherwise
 */
const submitToBugsnag = formData => (
  new Promise((resolve, reject) => {
    request({
      url: 'https://upload.bugsnag.com',
      method: 'POST',
      formData: Object.assign({
        apiKey: process.env.BUGSNAG_API_KEY,
        overwrite: 'true',
      }, formData),
    }, (err, response, body) => {
      const { statusCode } = response;
      if (err) {
        reject(err);
      } else if (statusCode >= 200 && statusCode <= 299) {
        resolve(body);
      } else {
        reject(new Error(body));
      }
    });
  })
);

Promise.resolve()
  .then(() => {
    if (!program.debug && !program.release) {
      throw new Error('Please specify at least one of the bundle options.');
    }
  })
  .then(() => {
    if (program.debug) {
      log(green('Generating iOS debug bundle...'));
      log(exec(getBundleCommand('ios', true), { encoding: 'utf8' }));

      log(green('Generating Android debug bundle...'));
      log(exec(getBundleCommand('android', true), { encoding: 'utf8' }));

      log(green('Uploading iOS debug source map...'));
      const plistFilePath = path.join(__dirname, 'ios/backbone/Info.plist');
      const plistString = fs.readFileSync(plistFilePath, 'utf8');
      const plistResult = plist.parse(plistString);
      const iOSBuildNumber = plistResult.CFBundleVersion;
      const upload1 = submitToBugsnag({
        appVersion: iOSBuildNumber,
        minifiedUrl: 'http*://*index.ios.bundle*', // this maps to the local dev server
        sourceMap: fs.createReadStream(`${iOSBundlePath}.map`),
        minifedFile: fs.createReadStream(iOSBundlePath),
      })
        .then(() => {
          log(green('Uploaded iOS debug source map.'));
        })
        .catch(err => {
          error(red('Error uploading iOS debug source map.'), err);
        });

      log(green('Uploading Android debug source map...'));
      const upload2 = g2js.parseFile(path.join(__dirname, 'android/app/build.gradle'))
        .then(result => {
          const androidBuildNumber = result.android.defaultConfig.versionCode;
          return submitToBugsnag({
            appVersion: androidBuildNumber,
            minifiedUrl: 'http*://*index.android.bundle*', // this maps to the local dev server
            sourceMap: fs.createReadStream(`${androidBundlePath}.map`),
            minifedFile: fs.createReadStream(androidBundlePath),
          })
            .then(() => {
              log(green('Uploaded Android debug source map.'));
            })
            .catch(err => {
              error(red('Error uploading Android debug source map.'), err);
            });
        });

      return Promise.all([upload1, upload2]);
    }
  })
  .then(() => {
    if (program.release) {
      log(green('Generating iOS release bundle...'));
      log(exec(getBundleCommand('ios', false), { encoding: 'utf8' }));

      log(green('Generating Android release bundle...'));
      log(exec(getBundleCommand('android', false), { encoding: 'utf8' }));

      log(green('Uploading iOS release source map...'));
      const plistFilePath = path.join(__dirname, 'ios/backbone/Info.plist');
      const plistString = fs.readFileSync(plistFilePath, 'utf8');
      const plistResult = plist.parse(plistString);
      const iOSBuildNumber = plistResult.CFBundleVersion;
      const upload1 = submitToBugsnag({
        appVersion: iOSBuildNumber,
        minifiedUrl: iOSBundleName,
        sourceMap: fs.createReadStream(`${iOSBundlePath}.map`),
        minifedFile: fs.createReadStream(iOSBundlePath),
        '*/index.ios.js': fs.createReadStream(iOSSourcePath),
      })
        .then(() => {
          log(green('Uploaded iOS release source map.'));
        })
        .catch(err => {
          error(red('Error uploading iOS release source map.'), err);
        });

      log(green('Uploading Android release source map...'));
      const upload2 = g2js.parseFile(path.join(__dirname, 'android/app/build.gradle'))
        .then(result => {
          const androidBuildNumber = result.android.defaultConfig.versionCode;
          return submitToBugsnag({
            appVersion: androidBuildNumber,
            minifiedUrl: androidBundleName,
            sourceMap: fs.createReadStream(`${androidBundlePath}.map`),
            minifedFile: fs.createReadStream(androidBundlePath),
            '*/index.android.js': fs.createReadStream(androidSourcePath),
          })
            .then(() => {
              log(green('Uploaded Android release source map.'));
            })
            .catch(err => {
              error(red('Error uploading Android release source map.'), err);
            });
        });

      return Promise.all([upload1, upload2]);
    }
  })
  .then(() => {
    log(green('DONE!'));
    process.exit();
  })
  .catch(err => {
    error(red(err));
    process.exit(1);
  });
