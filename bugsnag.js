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
const iOSBundleDir = path.join(__dirname, 'ios');
const iOSBundleName = 'main.jsbundle';

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
    bundleOutput = path.join(iOSBundleDir, iOSBundleName);
    assetsDest = iOSBundleDir;
  } else {
    bundleOutput = path.join(androidBundleDir, androidBundleName);
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

const bugsnagApiFormDataDefaults = {
  apiKey: process.env.BUGSNAG_API_KEY,
  overwrite: 'true',
};

Promise.resolve()
  .then(() => {
    if (!program.debug && !program.release) {
      error(red('Please specify at least one of the bundle options.'));
      process.exit(1);
    }
  })
  .then(() => {
    if (program.debug) {
      log(green('Generating iOS debug bundle...'));
      log(exec(getBundleCommand('ios', true), { encoding: 'utf8' }));

      log(green('Generating Android debug bundle...'));
      log(exec(getBundleCommand('android', true), { encoding: 'utf8' }));

      log(green('Uploading iOS debug source map...'));
      const upload1 = new Promise((resolve, reject) => {
        const plistFilePath = path.join(__dirname, 'ios/backbone/Info.plist');
        const plistString = fs.readFileSync(plistFilePath, 'utf8');
        const result = plist.parse(plistString);
        const buildNumber = result.CFBundleVersion;
        const bundlePath = path.join(__dirname, iOSBundleName);

        request({
          url: 'https://upload.bugsnag.com',
          method: 'POST',
          formData: Object.assign({}, bugsnagApiFormDataDefaults, {
            appVersion: buildNumber,
            minifiedUrl: 'http*://index.ios.bundle*', // this maps to the local dev server
            sourceMap: fs.createReadStream(`${bundlePath}.map`),
            minifedFile: fs.createReadStream(bundlePath),
          }),
        }, (err, response, body) => {
          if (err) {
            error(red('Error uploading iOS debug source map.'));
            reject(err);
          } else {
            const { statusCode } = response;
            if (statusCode >= 200 && response.statusCode <= 299) {
              log(green('Uploaded iOS debug source map.'));
            } else {
              log(red('Failed to upload iOS debug source map.'), body);
            }
            resolve();
          }
        });
      });

      log(green('Uploading Android debug source map...'));
      const upload2 = g2js.parseFile(path.join(__dirname, 'android/app/build.gradle'))
        .then(result => {
          const buildNumber = result.android.defaultConfig.versionCode;

          return new Promise((resolve, reject) => {
            const bundlePath = path.join(androidBundleDir, androidBundleName);
            request({
              url: 'https://upload.bugsnag.com',
              method: 'POST',
              formData: Object.assign({}, bugsnagApiFormDataDefaults, {
                appVersion: buildNumber,
                minifiedUrl: 'http*://index.android.bundle*', // this maps to the local dev server
                sourceMap: fs.createReadStream(`${bundlePath}.map`),
                minifedFile: fs.createReadStream(bundlePath),
              }),
            }, (err, response, body) => {
              if (err) {
                error(red('Error uploading Android debug source map.'));
                reject(err);
              } else {
                const { statusCode } = response;
                if (statusCode >= 200 && response.statusCode <= 299) {
                  log(green('Uploaded Android debug source map.'));
                } else {
                  log(red('Failed to upload Android debug source map.'), body);
                }
                resolve();
              }
            });
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
      const upload1 = new Promise((resolve, reject) => {
        const plistFilePath = path.join(__dirname, 'ios/backbone/Info.plist');
        const plistString = fs.readFileSync(plistFilePath, 'utf8');
        const result = plist.parse(plistString);
        const version = result.CFBundleVersion;
        const bundlePath = path.join(__dirname, iOSBundleName);
        const sourcePath = path.join(__dirname, 'index.ios.js');

        request({
          url: 'https://upload.bugsnag.com',
          method: 'POST',
          formData: Object.assign({}, bugsnagApiFormDataDefaults, {
            appVersion: version,
            minifiedUrl: iOSBundleName,
            sourceMap: fs.createReadStream(`${bundlePath}.map`),
            minifedFile: fs.createReadStream(bundlePath),
            [sourcePath]: fs.createReadStream(sourcePath),
          }),
        }, (err, response, body) => {
          if (err) {
            error(red('Error uploading iOS release source map.'));
            reject(err);
          } else {
            const { statusCode } = response;
            if (statusCode >= 200 && response.statusCode <= 299) {
              log(green('Uploaded iOS release source map.'));
            } else {
              log(red('Failed to upload iOS release source map.'), body);
            }
            resolve();
          }
        });
      });

      log(green('Uploading Android release source map...'));
      const upload2 = g2js.parseFile(path.join(__dirname, 'android/app/build.gradle'))
        .then(result => {
          const version = result.android.defaultConfig.versionCode;

          return new Promise((resolve, reject) => {
            const bundlePath = path.join(androidBundleDir, androidBundleName);
            const sourcePath = path.join(__dirname, 'index.android.js');
            request({
              url: 'https://upload.bugsnag.com',
              method: 'POST',
              formData: Object.assign({}, bugsnagApiFormDataDefaults, {
                appVersion: version,
                minifiedUrl: androidBundleName,
                sourceMap: fs.createReadStream(`${bundlePath}.map`),
                minifedFile: fs.createReadStream(bundlePath),
                [sourcePath]: fs.createReadStream(sourcePath),
              }),
            }, (err, response, body) => {
              if (err) {
                error(red('Error uploading Android release source map.'));
                reject(err);
              } else {
                const { statusCode } = response;
                if (statusCode >= 200 && statusCode <= 299) {
                  log(green('Uploaded Android release source map.'));
                } else {
                  log(red('Failed to upload Android release source map.'), body);
                }
                resolve();
              }
            });
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
    error(err);
    process.exit(1);
  });
