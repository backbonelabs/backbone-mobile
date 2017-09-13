# backbone-mobile
[![CircleCI](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master.svg?style=shield&circle-token=d4a87a1dbce0b07de3208d856f8e87a7e71180fe)](https://circleci.com/gh/backbonelabs/backbone-mobile/tree/master)

Backbone mobile app for iOS and Android

## Development

Use [Yarn](https://yarnpkg.com/) instead of npm to install package dependencies. Using Yarn will ensure you get the same dependency versions. Assuming you already have Yarn installed, simply run `yarn install` from the project root.

Then, follow the setup instructions at https://facebook.github.io/react-native/docs/getting-started.html, and read the additional notes below for each OS.

### iOS

Before developing on your local machine, create xcconfig files at `ios/backbone/config/Debug.local.xcconfig` and `ios/backbone/config/Release.local.xcconfig`. These are used by the Debug configuration and Release configuration, respectively, to set variables for each configuration. These local xcconfig files should **not** be checked into version control.

In `Debug.local.xcconfig`, you will need to set `API_SERVER_URL` and `WEB_SERVER_URL` to the IP addresses of your local Backbone API and web servers. For example, `API_SERVER_URL = http:/$()/192.168.1.1:3000`. The `$()` is required in order for Xcode to properly recognize the double forward slashes. Ask another dev for the `MIXPANEL_TOKEN` and `BUGSNAG_API_KEY` values.

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
BUGSNAG_API_KEY=
WEB_SERVER_URL="http://XXX.XXX.XXX.XXX:XXXX"
```

Fill in the `API_SERVER_URL` and `WEB_SERVER_URL` variables with the IP addresses of your local Backbone API and web servers, e.g., http://192.168.1.1:3000 and http://192.168.1.1:9999. Ask another dev for the actual keystore file (backbone-release-key.keystore)—which you would place in the `android/app` folder—and the values for `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_PASSWORD`, `MIXPANEL_TOKEN`, and `BUGSNAG_API_KEY`. Make sure you wrap these values with double quotes to ensure they are treated as strings.

Similar to iOS, you can define environment variables specific to your machine when building/running the app. These variables are located in `android/app/build.gradle` under the `android.buildTypes.debug` property.

## Versioning

iOS apps have a marketing version and build version. These are used by the store to identify the build. The **marketing version** should follow semantic versioning (http://semver.org/), e.g., 1.2.3. The **build version** should be an integer that always increments, e.g., 1, 2, 3, etc.

The build version can be incremented without changing the marketing version, but any change to the marketing version requires a bump in the build version.

Android is similar in that there is a version code and a version name. The **version code** represents the internal version number, or build, and the **version name** is the public-facing version number that should follow semantic versioning.

## Merge Process

When PRs are merged and the codebase is affected, the build version needs to be incremented for whichever platforms were affected. It will be responsibility of the person who did the merge to increment the build version.

### iOS

1. Switch to the `master` branch and pull down the latest `master`
2. Close the Xcode project because agvtool will update the project file and could potentially cause problems for Xcode when the project is opened
3. Run the following from the `ios` folder:

 ```
 sh buildVersion.sh
 ```

### Android

1. Switch to the `master` branch and pull down the latest `master`
2. Manually increment the build version by updating the `versionCode` property in `android/app/build.gradle`
3. Commit the change to version control with a commit message of "Android build X" where X is the new build version
4. Push the commit to the repo's `master`

## Bugsnag

We use [Bugsnag](https://www.bugsnag.com/) to log application errors originating from either JavaScript or native code. It provides stacktraces, app and device details, user details, and much more.

Since React Native bundles the JavaScript files into one file, source maps must be uploaded to Bugsnag in order to unminify and demangle stacktraces to show full stacktraces with methods, file paths, and line numbers. When source maps are uploaded to Bugsnag, they will be attributed to an "app version." This app version will match the build number. So if source maps were uploaded for iOS for builds 100 and 110, and an error was sent to Bugsnag from a phone with app build 100, the error would be matched against the source map for build 100.

When developing, it isn't critical to upload source maps to Bugsnag because hopefully there will be enough error details in the Xcode or Android Studio logs. In addition, it's likely each developer will be working on something different at the same time, so even if you upload an updated source map for your development code, it may affect error logs produced by another dev in development, and vice versa. However, if you would like to take advantage of Bugsnag while developing in spite of those shortcomings, you can!

In order to upload source maps to Bugsnag, first create an `.env.local` file in the project root if it doesn't already exist, and add an `BUGSNAG_API_KEY` variable with the value of the Bugsnag API key. Ask another dev for the key. Then, simply run one of the following commands in the root folder:

```
# Bundle and upload the debug version (use this while developing)
npm run bugsnag-debug

# Bundle and upload the release version (this should not be used while developing)
npm run bugsnag-release

# Bundles and uploads both the debug and release versions (this should not be used while developing)
npm run bugsnag
```

Handled errors can be sent to Bugsnag from JavaScript, native iOS, and native Android. Below are examples of how to send errors from each environment. More examples can be found in the Bugsnag API docs and their example apps.

```
// JavaScript
import Bugsnag from './utils/Bugsnag';

Bugsnag.notify(new Error('Test error from JS'));

// iOS
#import "Bugsnag.h"

[Bugsnag notify:[NSException exceptionWithName:@"Test error from iOS native" reason:nil userInfo:nil]];]

// Android
import com.bugsnag.android.Bugsnag;

Bugsnag.notify(new Throwable("Test error from Android native"));
```

## Deployment

1. Check out to the `master` branch and make sure you have the latest master.
2. Make sure the appropriate production variables are set in `android/app/build.gradle` and `android/app/local.properties`.
3. Make sure the appropriate production variables are set in `./ios/backbone/config/Release.local.xcconfig`.
4. Increment the `versionName` in `./android/app/build.gradle` following semver guidelines. This is the marketing version to use in the next step.
5. Commit the change with a commit message in the following format: "Android version <marketing_version>", e.g., "Android version 1.0.0".
6. Go to the `./ios` folder and run `sh marketingVersion.sh <new_marketing_version_number>`, where `<new_marketing_version_number>` is the semver version number. This will automatically create a commit with the following message: "iOS version <marketing_version>".
7. Add a git tag for the marketing version, e.g., `git tag v1.0.0`.
8. Push the git tag to the repo, e.g., `git push origin v1.0.0`.
9. Check out to the `production` branch and then merge in `master`, i.e., (from the production branch) `git merge master`.
10. From the `./android` folder, run `./gradlew clean` to remove prior build artifacts just in case they conflict with the release build.
11. Then run `./gradlew assembleRelease` to build the release variant APK. When finished, the APK will be saved under `./android/app/build/outputs/apk/app-release.apk`.
12. Create a new **beta** release in the [Google Play](https://play.google.com/apps/publish/) console. Google doesn't review the app like Apple does, but we put it in beta so we can release at the same time Apple reviews and approves the iOS version.
    1. In Google Play, create a new beta release.
    2. Upload the new APK to the beta release.
    3. The release name should be the same as the marketing version, e.g., 1.0.0.
    4. Enter release notes. These will be visible to users when downloading the app. See release history to get a general idea of what to write.
    5. Submit the beta release.
13. In Xcode, select the `backbone prod` scheme and use the _Generic iOS Device_.
14. Clean the build folder (hold Alt and click the Product menu and click Clean Build Folder, or press Alt-Command-Shift-K)
15. Click Product > Archive.
16. After the archive is created, upload it to iTunes Connect using the Backbone Labs team provisioning profile.
17. Log into [iTunes Connect](https://itunesconnect.apple.com) and create a new iOS version for the app.
    1. For the version number, use the same value as the marketing version, e.g., 1.0.0.
    2. Enter release notes. These will be visible to users when downloading the app. See release history to get a general idea of what to write.
    3. It usually takes a couple minutes after the build is uploaded to iTunes Connect for it to be fully processed and available to be included in the release. When it is ready, it will be available for selection in the Build section.
    4. Verify the **Version** field is the same as the marketing version.
    5. In the **Version Release** section, select _Manually release this version_. We will later release both the iOS and Android versions at the same time.
    6. Submit the new version for review.
    7. On the next screen, select **No** when asked if our app uses the Advertising Identifier, and continue with the submission.
    8. It usually takes 1–2 business days for Apple to review and approve the app.
    9. You will receive email notifications if they require additional information or when the app is ready.
18. Run `npm run bugsnag-release` from the project root to upload the new source map to Bugsnag.
19. When the iOS app is approved and ready, log into iTunes Connect and release the app.
20. Log into Google Play and promote the beta release to production.
21. Finally, log into [Mixpanel](https://www.mixpanel.com) and add an annotation for the release.
    1. Navigate to **Segmentation**.
    2. Make sure at least one event is shown and the date range includes today.
    3. Click on a marker in the line chart for today's date to add an annotation.
    4. The annotation name should be the marketing version and the time of release, e.g., v1.0.0 (12:00 pm). The time should be in Pacific time.
