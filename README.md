# backbone-mobile
[![CircleCI](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master.svg?style=shield&circle-token=d4a87a1dbce0b07de3208d856f8e87a7e71180fe)](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master)

Backbone mobile app for iOS and Android

## Requirements

- Node.js 6.3.1

## Versioning

iOS apps have a marketing version and build version. These are used by the store to identify the build. The marketing version should follow semantic versioning (http://semver.org/), e.g., 1.2.3. The build version should be an integer that always increments, e.g., 1, 2, 3, etc.

The build version can be incremented without changing the marketing version, but any change to the marketing version requires a bump in the build version.

## Merge Process

When PRs are merged and the codebase is affected, the build version needs to be incremented. It will be responsibility of the person who did the merge to increment the build version.

To increment the build version, make sure to pull down the latest `master` and that you are on the `master` branch. Then close the Xcode project because agvtool will update the project file and could potentially cause problems for Xcode when the project is opened.

Then run the following from the `ios` folder:

```
sh buildVersion.sh
```

## Deployment

Before uploading the app to iTunes Connect, be sure to update the marketing version number.

To change the marketing version number, make sure to pull down the latest `master` and that you are on the `master` branch. Then close the Xcode project because agvtool will update the project file and could potentially cause problems for Xcode when the project is opened.

The run the following from the `ios` folder:

```
sh marketingVersion.sh <new_version_number>
```
