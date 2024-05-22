# react-native-ts-identity-orchestration

React Native wrapper for Transmit Security IDO SDK

## Installation

```sh
npm install react-native-ts-identity-orchestration
```
* Note that this module is not yet documented.

Important Notes:
- Add transmit plist file to ios and json file/manifest for android
- You must set response handler


Android
=======
Add to app/build.gradle

repositories {
  google()
  maven {
    url('https://transmit.jfrog.io/artifactory/transmit-security-gradle-release-local/')
  }
}