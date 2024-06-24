# React Native - Transmit Security Identity Orchestration SDK
Enhance your native iOS and Android applications with Transmit Identity Orchestration (IDO), delivering a seamless native experience. This guide explains how to leverage the React Native module to invoke journeys using the IDO platform.

## Installation

```sh
npm install react-native-ts-identity-orchestration
```
Or using Yarn:
```sh
yarn add react-native-ts-identity-orchestration
```
#### For iOS run:
```sh
cd YOUR_PROJECT_PATH/ios
pod install
```

## Native Project Configuration
#### iOS
1. Open your project's `.xcworkspace` found under `YOUR_PROJECT_PATH/iOS` in Xcode.
2. Create a plist file named TransmitSecurity.plist in your Application with the following content. CLIENT_ID is your client ID (obtained in Step 1).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>credentials</key>
    <dict>
        <!-- Use api.eu.transmitsecurity.io for EU, api.ca.transmitsecurity.io for CA -->
        <key>baseUrl</key>
        <string>https://api.transmitsecurity.io/</string>
        <key>clientId</key>
        <string>CLIENT_ID</string>
    </dict>
</dict>
</plist>
```
#### Android
1. Open your Android manifest XML file, usually located at `android/app/src/main`.
2. Update the strings.xml file in your Application with the following content. The CLIENT_ID should be replaced with your client ID

```xml
<resources>
    <!-- Transmit Security Credentials -->
    <string name="transmit_security_app_id">"default_application"</string>
    <string name="transmit_security_client_id">"CLIENT_ID"</string>
    <string name="transmit_security_base_url">https://api.transmitsecurity.io/</string>
</resources>
```

3. Open your `android/app/build.gradle` file.
4. Add the following maven repository url to the bottom of this file

```java
repositories {
  google()
  maven {
    url('https://transmit.jfrog.io/artifactory/transmit-security-gradle-release-local/')
  }
}
```
#### **Try to compile your app in Android Studio**
> 
> If you get a compile error:
>`Manifest merger failed : Attribute application@allowBackup value=(false)`
>
> 1. Open your `AndroidManifest.xml` file
> 2. Add `xmlns:tools="http://schemas.android.com/tools"` to the main manifest tag
> 3. Add `tools:replace="android:allowBackup"` to the top of the `application` tag.


## Using the IDO Module
#### 1. Module setup: Initialize, startJourneyWithId and sendClientResponse

```javascript
import RNTSIdentityOrchestration, { TSIDOModule } from 'react-native-ts-identity-orchestration';

export type ServiceSuccessCallback = (results: TSIDOModule.ServiceResponse) => void;
export type ServiceErrorCallback = (results: TSIDOModule.JourneyErrorType) => void;

class AuthenticationService {

  private idoSDK = RNTSIdentityOrchestration;

  /**
    Creates a new Identity Orchestration SDK instance with your client context.
    Credentials are configured from TransmitSecurity.plist file (iOS) or manifest file (Android).
  */
  public initializeSDK = (): void => {
        try {
            if (Platform.OS === 'ios') {
              this.idoSDK.initializeSDK();
            } else {
              // Initialize Android SDK on MainApplication (see details below)
            }
        } catch (error) {
            console.error('Error initializing IDO service', error);
        }
    }

  /**
       Starts a Journey with a given id.
     - Parameters:
       - journeyId: Journey Identifier in the Transmit Security Admin Console.
       - additionalParams: Additional parameters to be passed to the journey.
       - Success and Error blocks to process responses
  */
  public startJourneyWithId = (
      journeyId: string, 
      additionalParams: { [key: string]: any; } | null, 
      onSuccess: ServiceSuccessCallback, 
      onError: ServiceErrorCallback
  ) => {

      let options: TSIDOModule.StartJourneyOptions | null = null;
      if (additionalParams) {
          options = {
              additionalParams: additionalParams
          };
      }

      this.idoSDK.setResponseHandler({
          success: (results: TSIDOModule.ServiceResponse) => {
              onSuccess(results);
          },
          error: (error: TSIDOModule.JourneyErrorType) => {
              onError(error);
          }
      });

      this.idoSDK.startJourney(journeyId, options);
    }

    /**
      This method will submit client input to the Journey step to process.
      - Parameters:
        - clientResponseOptionId: The response option ID is one of the IDs provided in the clientResponseOptions.
        - data: The client response data object. Mandatory in ClientInput response option type.
    */
    public sendClientResponse = (
        clientResponseOptionId: string | TSIDOModule.ClientResponseOptionType,
        data?: { [key: string]: any; } | null | undefined
    ) => {
        this.idoSDK.submitClientResponse(clientResponseOptionId, data);
    }
}
```

##### Initialize Android SDK
The Android SDK requires to be initialized in your App's Main Application class. To do that, open your MainApplication.kt file and add the following to the bottom of the function onCreate()
```java
TsIdentityOrchestrationModule.initializeAndroidSDK(this)
```

#### 2. Handling responses

To handle responses and errors coming from the server or the native SDK, you must set a response handler by calling `this.idoSDK.setResponseHandler(handler)` before starting a journey.

Your response handler should provide two functions: success: (results: TSIDOModule.ServiceResponse) and error: (error: TSIDOModule.JourneyErrorType). The success handler can be implemented as follows:

```javascript
private handleJourneyServiceResponse = (results: TSIDOModule.ServiceResponse) => {
      switch (results.journeyStepId) {
          // Prefixed Steps
          case TSIDOModule.JourneyActionType.success: this.props.onJourneyEndedWithSuccess(results); break;
          case TSIDOModule.JourneyActionType.rejection: this.props.onJourneyEndedWithRejection(results); break;
          case TSIDOModule.JourneyActionType.information: console.log('information'); break;
          case TSIDOModule.JourneyActionType.debugBreak: console.log("debugBreak"); break;
          case TSIDOModule.JourneyActionType.waitForAnotherDevice: console.log("waitForAnotherDevice"); break;
          case TSIDOModule.JourneyActionType.drsTriggerAction: console.log("drsTriggerAction"); break;
          case TSIDOModule.JourneyActionType.identityVerification: console.log("identityVerification"); break;
          case TSIDOModule.JourneyActionType.webAuthnRegistration: console.log("webAuthnRegistration"); break;
          case TSIDOModule.JourneyActionType.registerDeviceAction: console.log("registerDeviceAction"); break;
          case TSIDOModule.JourneyActionType.validateDeviceAction: console.log("validateDeviceAction"); break;
          case TSIDOModule.JourneyActionType.nativeBiometricsRegistration: console.log("nativeBiometricsRegistration"); break;
          case TSIDOModule.JourneyActionType.nativeBiometricsAuthenticaton: console.log("nativeBiometricsAuthenticaton"); break;
          case TSIDOModule.JourneyActionType.emailOTPAuthentication: console.log(''); break;
          case TSIDOModule.JourneyActionType.smsOTPAuthentication: console.log("smsOTPAuthentication"); break;

          // Custom Steps
          case `userRegistrationForm`: this.handleUserRegistrationForm(results); break;
          default: logger.warn(`handleJourneyServiceResponse: Unknown journey step: ${results.journeyStepId}`); break;
      }
  }
```

The `results: TSIDOModule.ServiceResponse` contains information about the current step that is requested by the server:
```javascript
export interface ServiceResponse {
  data?: { [key: string]: any; } | null;
  errorData?: TSIDOModule.SDKError | null;
  journeyStepId?: TSIDOModule.JourneyActionType | string | null;
  clientResponseOptions?: { [key: string]: TSIDOModule.ClientResponseOption; }
  token?: string | null;
}
```

### Collecting User Input and Submitting to the Server

At this point, you may need to collect user input and submit it to the server using the module. You can do this using the `submitClientResponse(clientResponseOptionId, data)` API. 

For example, handling an `information` step, which doesn't require any additional data to be resolved, typically involves the following steps:

1. **Identify the Case in `handleJourneyServiceResponse`**  
   Handle the case `TSIDOModule.JourneyActionType.information`.

2. **Present UI to the User**  
   Use the `data` object to present the UI to the user:
   - `data.title`
   - `data.text`
   - `data.button_text`

3. **Invoke the Module When User Presses the Button**  
   When the user presses the button to continue, invoke the module with `submitClientResponse`, providing `clientInput` for `clientResponseOptionId`:
   ```javascript
   idoSDK.submitClientResponse(TSIDOModule.ClientResponseOptionType.clientInput);

More complex cases, such as `Form`, may require additional data to be resolved. You can handle these cases as follows:

1. **Submit the Client Response with Additional Data**  
   Use `submitClientResponse` to provide the necessary data for resolving the step. For example, when dealing with a form that requires `externalUserId` and `userPassword`:

   ```javascript
   idoSDK.submitClientResponse(
       TSIDOModule.ClientResponseOptionType.clientInput, 
       { externalUserId: userId, userPassword: password }
   );