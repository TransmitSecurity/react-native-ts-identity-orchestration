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


Initialize using strings.xml configuration:
To do this, update the strings.xml file in your Application with the following content. The CLIENT_ID should be replaced with your client ID

<resources>
    <!-- Transmit Security Credentials -->
    <string name="transmit_security_app_id">"default_application"</string>
    <string name="transmit_security_client_id">"CLIENT_ID"</string>
    <string name="transmit_security_base_url">https://api.transmitsecurity.io/</string>
</resources>

Call the dedicated Android function to initialize the SDK. Open your MainApplication.kt file and add the following to the bottom of the function onCreate()
TsIdentityOrchestrationModule.initializeAndroidSDK(this)

If you get a compile error:
`Manifest merger failed : Attribute application@allowBackup value=(false)`

1. Open your `AndroidManifest.xml` file
2. Add `xmlns:tools="http://schemas.android.com/tools"` to the main manifest tag
3. Add `tools:replace="android:allowBackup"` to the top of the `application` tag.