/* eslint-disable import/no-extraneous-dependencies */
require('localenv');
const plist = require('plist');
const request = require('request');
const fs = require('fs');
const path = require('path');

const bundleName = 'main.jsbundle';
const plistString = fs.readFileSync(path.resolve(__dirname, './backbone/Info.plist'), 'utf8');
const result = plist.parse(plistString);
const version = result.CFBundleVersion;

request({
  url: 'https://upload.bugsnag.com',
  method: 'POST',
  formData: {
    apiKey: process.env.BUGSNAG_API_KEY,
    appVersion: version,
    minifiedUrl: 'main.jsbundle',
    sourceMap: fs.createReadStream(path.resolve(__dirname, `${bundleName}.map`)),
    minifedFile: fs.createReadStream(path.resolve(__dirname, bundleName)),
    overwrite: 'true',
  },
}, (err, response, body) => {
  if (err) {
    console.error('ERROR', err);
  } else {
    console.log(body);
  }
});
