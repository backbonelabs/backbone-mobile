# backbone-mobile
[![CircleCI](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master.svg?style=shield&circle-token=d4a87a1dbce0b07de3208d856f8e87a7e71180fe)](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master)

Backbone mobile app for iOS and Android

## Requirements

- Node.js 6.2.2 (This is currently the highest Node.js version supported by AWS)

## Development

First, follow the setup instructions at https://facebook.github.io/react-native/docs/getting-started.html, and then read the additional notes below for each OS.

### iOS

Before developing on your local machine, make a copy of the `backbone dev` scheme in Xcode. You can duplicate this scheme by going to Product > Scheme > Manage Schemes. You can name your duplicate scheme whatever you want, but make sure the Shared checkbox is not checked so that it will not be included in the project (since this scheme will be specific to your machine).

You can use your custom scheme when running the app on your machine. Be sure to review the environment variables in the scheme. Edit the scheme, and in the Run step, and you will find the environment variables under the Arguments tab. You will most likely need to change the `API_SERVER_URL` value to the IP address that matches your machine (or where ever you are running the API server from).

### Android

Do not enable Instant Run in Android Studio. It will not work with the Gradle plugin. To make sure Instant Run is disabled, go to the Android Studio preferences, and navigate to Build, Execution, Deployment > Instant Run, and make sure the checkbox for the feature is unchecked.

Add the following to `~/.gradle/gradle.properties`:

```
BACKBONE_RELEASE_STORE_FILE=backbone-release-key.keystore
BACKBONE_RELEASE_KEY_ALIAS=backboneAndroidSigningKey
BACKBONE_RELEASE_STORE_PASSWORD=
BACKBONE_RELEASE_KEY_PASSWORD=
```

Ask another dev for the keystore file and the store and key passwords, and fill in the passwords for the last two lines. Place the keystore file in the `android/app` folder of the project.

Similar to iOS, you can define environment variables specific to your machine when building/running the app. These variables are located in `android/app/build.gradle` under the `android.buildTypes.debug` property. You will most likely need to change the `API_SERVER_URL` value to the IP address that matches your machine (or where ever you are running the API server from).

## Versioning

iOS apps have a marketing version and build version. These are used by the store to identify the build. The marketing version should follow semantic versioning (http://semver.org/), e.g., 1.2.3. The build version should be an integer that always increments, e.g., 1, 2, 3, etc.

The build version can be incremented without changing the marketing version, but any change to the marketing version requires a bump in the build version.

Android is similar in that there is a version code and a version name. The version code represents the internal version number, or build, and the version name is the public-facing version number.

## Merge Process

When PRs are merged and the codebase is affected, the build version needs to be incremented. It will be responsibility of the person who did the merge to increment the build version.

### iOS

To increment the build version, make sure to pull down the latest `master` and that you are on the `master` branch. Then close the Xcode project because agvtool will update the project file and could potentially cause problems for Xcode when the project is opened.

Then run the following from the `ios` folder:

```
sh buildVersion.sh
```

### Android

1. Switch to the `master` branch and pull down the latest `master`
2. Manually increment the build version by updating the `versionCode` property in `android/app/build.gradle`
3. Commit the change to version control with a commit message of "Android build X" where X is the new build version
4. Push the commit to the repo's `master`

## Deployment

### iOS

Before uploading the app to iTunes Connect, be sure to update the marketing version number.

To change the marketing version number, make sure you are on the `master` branch and it is up to date. Then close the Xcode project because agvtool will update the project file and could potentially cause problems for Xcode when the project is opened.

Then run the following from the `ios` folder:

```
sh marketingVersion.sh <new_version_number>
```

### Android

1. Increment the `versionName` in `android/app/build.gradle`. The `versionCode` should have already been incremented beforehand when the codebase was modified, but if it wasn't, increment it as well.
2. In Android Studio, apply the `release` variant to all project modules by navigating to Build > Select Build Variant...
3. Build the project by navigating to Build > Build APK
4. Find the APK in `android/app/build/outputs/apk`
