# backbone-mobile
[![CircleCI](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master.svg?style=shield&circle-token=d4a87a1dbce0b07de3208d856f8e87a7e71180fe)](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master)

Backbone mobile app for iOS and Android

## Requirements

- Node.js 6.2.2

## Development

Use [Yarn](https://yarnpkg.com/) instead of npm to install package dependencies. Using Yarn will ensure you get the same dependency versions. Assuming you already have Yarn installed, simply run `yarn install` from the project root.

Then, follow the setup instructions at https://facebook.github.io/react-native/docs/getting-started.html, and read the additional notes below for each OS.

### iOS

Before developing on your local machine, create xcconfig files at `ios/backbone/config/Debug.local.xcconfig` and `ios/backbone/config/Release.local.xcconfig`. These are used by the Debug configuration and Release configuration, respectively, to set variables for each configuration. These local xcconfig files should **not** be checked into version control.

In `Debug.local.xcconfig`, you will need to set `API_SERVER_URL` to value to the IP address that matches your machine (or where ever you are running the API server). For example, `API_SERVER_URL = http:/$()/192.168.1.1:3000`. The `$()` is required in order for Xcode to properly recognize the double forward slashes. Ask another dev for the `MIXPANEL_TOKEN` value.

### Android

Do not enable Instant Run in Android Studio. It will not work with the Gradle plugin. To make sure Instant Run is disabled, go to the Android Studio preferences, and navigate to Build, Execution, Deployment > Instant Run, and make sure the checkbox for the feature is unchecked.

Sensitive build/environment variables are maintained in `android/app/local.properties` (create the file if it doesn't exist). At the minimum, have the following in the properties file:

```
API_SERVER_URL="http://XXX.XXX.XXX.XXX:XXXX"
RELEASE_STORE_FILE=backbone-release-key.keystore
RELEASE_KEY_ALIAS=backboneAndroidSigningKey
RELEASE_STORE_PASSWORD=
RELEASE_KEY_PASSWORD=
MIXPANEL_TOKEN=
```

Fill in the `API_SERVER_URL` value with the IP address of your dev API server, e.g., http://192.168.1.1:3000. Ask another dev for the actual keystore file (backbone-release-key.keystore)—which you would place in the `android/app` folder—and the values for `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_PASSWORD`, and `MIXPANEL_TOKEN`. Make sure you wrap these values with double quotes to ensure they are treated as strings.

Similar to iOS, you can define environment variables specific to your machine when building/running the app. These variables are located in `android/app/build.gradle` under the `android.buildTypes.debug` property.

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

Make sure the appropriate production variables are set in `ios/backbone/config/Release.local.xcconfig`.

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
