/* eslint-disable import/no-extraneous-dependencies */
require('localenv');
const g2js = require('gradle-to-js/lib/parser');
const request = require('request');
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, './app/build/intermediates/assets/release');
const bundleName = 'index.android.bundle';

g2js.parseFile(path.resolve(__dirname, './app/build.gradle'))
  .then(result => {
    const version = result.android.defaultConfig.versionCode;

    request({
      url: 'https://upload.bugsnag.com',
      method: 'POST',
      formData: {
        apiKey: process.env.BUGSNAG_API_KEY,
        appVersion: version,
        minifiedUrl: 'index.android.bundle',
        sourceMap: fs.createReadStream(path.join(bundlePath, `${bundleName}.map`)),
        minifedFile: fs.createReadStream(path.join(bundlePath, bundleName)),
        overwrite: 'true',
      },
    }, (err, response, body) => {
      if (err) {
        console.error('ERROR', err);
      } else {
        console.log(body);
      }
    });
  });
