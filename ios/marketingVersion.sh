#!/bin/sh
if [ -z "$1" ]
then
  echo "Missing version number"
else
  agvtool new-marketing-version $1
  VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" backbone/Info.plist)
  git commit -a -m "Version $VERSION"
  git push origin master
fi
