#!/bin/sh
agvtool next-version -all
BUILD_VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" backbone/Info.plist)
git commit -a -m "Build $BUILD_VERSION"
git push origin master
