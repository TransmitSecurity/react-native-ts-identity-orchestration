# React Native - Transmit Security Identity Orchestration SDK
Enhance your native iOS and Android applications with Transmit Identity Orchestration (IDO), delivering a seamless native experience. This guide explains how to leverage the React Native module to invoke journeys using the IDO platform.

## Installation

```sh
// using `npm`:
npm install react-native-ts-identity-orchestration
// or using `yarn`:
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
2. Create a plist file named TransmitSecurity.plist in your Application with the following content. CLIENT_ID is configured in your Transmit server. Make sure the file is linked to your target.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>credentials</key>
    <dict>
        <!-- Use api.eu.transmitsecurity.io for EU, api.ca.transmitsecurity.io for CA -->
        <key>baseUrl</key>
        <string>https://api.transmitsecurity.io</string>
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
    <string name="transmit_security_base_url">https://api.transmitsecurity.io</string>
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
### 1. Module setup: initializeSDK, startJourney and submitClientResponse

#### Example Implementation: IDO Module Service Wrapper

Below is an example implementation of a service that encapsulates the functionality of the IDO module. This example demonstrates how to:

- Initialize the IDO SDK with `idoSDK.initializeSDK()`
- Start a journey using `idoSDK.startJourney(journeyId, options)`
- Submit a client response with `idoSDK.submitClientResponse(clientResponseOptionId, data)`

This comprehensive example will guide you through the process of integrating the IDO module into your application, ensuring a seamless and secure user experience.

```javascript
import RNTSIdentityOrchestration, { TSIDOModule } from 'react-native-ts-identity-orchestration';

export type ServiceSuccessCallback = (results: TSIDOModule.ServiceResponse) => void;
export type ServiceErrorCallback = (error: TSIDOModule.SDKError) => void;

class AuthenticationService {

  private idoSDK = RNTSIdentityOrchestration;

  /**
    Creates a new Identity Orchestration SDK instance with your client context.
    Credentials are configured from TransmitSecurity.plist file (iOS) or manifest file (Android).
  */
  public initializeSDK = async (): Promise<void> => {
        try {
            await this.idoSDK.initializeSDK();
        } catch (error) {
            console.error('Error initializing IDO service', error);
        }
    }

  /**
       Starts a Journey with a given id.
     - Parameters:
       - journeyId: Journey Identifier in the Transmit Security Admin Console.
       - options: Optional - provide additionalParams, flowId and encrypted (encryptionMode, true=full, false=none)
       - Success and Error blocks to process responses
  */
  public startJourneyWithId = (
      journeyId: string, 
      options: TSIDOModule.StartJourneyOptions | null, 
      onSuccess: ServiceSuccessCallback, 
      onError: ServiceErrorCallback
  ) => {

      this.idoSDK.setResponseHandler({
          success: (results: TSIDOModule.ServiceResponse) => {
              onSuccess(results);
          },
          error: (error: TSIDOModule.SDKError) => {
              onError(error);
          }
      });

      this.idoSDK.startJourney(journeyId, options);
    }

    /**
       Starts a Mobile Approve Journey to handle mobile approval flows.
     - Parameters:
       - payload: A key-value object containing approval data.
       - options: Optional - provide additionalParams, flowId and encrypted (encryptionMode, true=full, false=none)
       - Success and Error blocks to process responses
    */
    public startMobileApproveJourney = (
        payload: { [key: string]: string; },
        options: TSIDOModule.StartJourneyOptions | null,
        onSuccess: ServiceSuccessCallback, 
        onError: ServiceErrorCallback
    ) => {

        this.idoSDK.setResponseHandler({
            success: (results: TSIDOModule.ServiceResponse) => {
                onSuccess(results);
            },
            error: (error: TSIDOModule.SDKError) => {
                onError(error);
            }
        });

        this.idoSDK.startMobileApproveJourney(payload, options);
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

#### Initialization options

There are two ways to initialize the SDK. Call one of them once, before starting a journey.

**Option A: from the native configuration files.** `initializeSDK()` reads credentials from `TransmitSecurity.plist` (iOS) or `strings.xml` (Android), as described in [Native Project Configuration](#native-project-configuration). It works from JS on both platforms.

```javascript
await idoSDK.initializeSDK();
```

**Option B: with an explicit client ID.** `initialize(clientId, options)` doesn't need the plist or strings.xml credentials.

```javascript
await idoSDK.initialize('CLIENT_ID', {
  serverPath: 'https://api.transmitsecurity.io/ido', // required
  resourceUri: null,      // optional
  pollingTimeout: null,   // optional
  locale: null,           // optional
  collectRiskData: false, // optional, defaults to false
});
```

| Option | Type | Required | Description |
|---|---|---|---|
| `serverPath` | `string` | Yes | IDO service URL, for example `https://api.transmitsecurity.io/ido` (use `api.eu` / `api.ca` for EU / CA). |
| `resourceUri` | `string` | No | Resource URI for the access token. |
| `pollingTimeout` | `number` | No | Polling timeout for steps that wait on another device. |
| `locale` | `string` | No | Locale for server-side texts. |
| `collectRiskData` | `boolean` | No | Collect risk (DRS) data during journeys. |

##### Initializing Android from MainApplication (optional)
Apps can still initialize Android natively by adding this to the bottom of `onCreate()` in MainApplication.kt. If they do, a later JS `initializeSDK()` call does nothing, so the SDK isn't initialized twice.
```java
TsIdentityOrchestrationModule.initializeAndroidSDK(this)
```

#### Start journey options

```javascript
idoSDK.startJourney('JOURNEY_ID', {
  additionalParams: { key: 'value' }, // optional
  flowId: null,                       // optional
  encrypted: false,                   // optional, true = full encryption, false = none
});
```

All fields are optional, and `options` can be omitted entirely.

#### Logging

Turn SDK logging on or off. It behaves the same on both platforms.

```javascript
await idoSDK.setLoggingEnabled(true);  // enable
await idoSDK.setLoggingEnabled(false); // disable
```

#### Push token

Register the device push token with the SDK: the APNs token (as a string) on iOS, the FCM token on Android.

```javascript
await idoSDK.setPushToken(token);
```

### 2. Handling responses

To handle responses and errors coming from the server or the native SDK, you must set a response handler by calling `this.idoSDK.setResponseHandler(handler)` before starting a journey.

Your response handler should provide two functions: success: (results: TSIDOModule.ServiceResponse) and error: (error: TSIDOModule.SDKError). The success handler can be implemented as follows:

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

#### Handling errors

The `error` handler receives a `TSIDOModule.SDKError` object:

```javascript
export interface SDKError {
  errorCode: TSIDOModule.JourneyErrorType; // string enum, same values on iOS and Android
  description?: string | null;
  data?: any | null;
}

error: (error: TSIDOModule.SDKError) => {
  if (error.errorCode === TSIDOModule.JourneyErrorType.expiredOTPPasscode) {
    // ask the user to resend the code
  }
  console.error(error.errorCode, error.description);
}
```

`JourneyErrorType` values: `notInitialized`, `noActiveJourney`, `networkError`, `clientResponseNotValid`, `serverError`, `initializationError`, `invalidCredentials`, `expiredOTPPasscode`, `maxResendReached`, `missingRequestIdInApprovalPayload`, `internalError` and `unknown`.

Codes reported only on Android: `invalidStateString`, `deviceRegistrationError`, `deviceValidationError`, `expiredValidationPasscode`, plus the identity verification codes `idvCameraPermissionRequired`, `idvSdkDisabled`, `idvSessionNotValid`, `idvInitializationError`, `idvNotInitialized`, `idvCanceled`, `idvInternalError` and `idvNotAvailable`.

#### Collecting User Input and Submitting to the Server

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
   ```

More complex cases, such as `Form`, may require additional data to be resolved. You can handle these cases as follows:

1. **Submit the Client Response with Additional Data**  
   Use `submitClientResponse` to provide the necessary data for resolving the step. For example, when dealing with a form that requires `externalUserId` and `userPassword`:

   ```javascript
   idoSDK.submitClientResponse(
       TSIDOModule.ClientResponseOptionType.clientInput, 
       { externalUserId: userId, userPassword: password }
   );
   ```

To follow a custom branch configured in the journey (for example, a "Forgot password" button), pass the option's `id` from `clientResponseOptions` as the `clientResponseOptionId`. Custom options keep their own id as `type`, the same on both platforms.

## Migrating from 0.1.x

- **Error handler:** `ResponseHandler.error` now receives a `TSIDOModule.SDKError` object (`errorCode`, `description`, `data`) instead of the bare error code. Update `error: (error: TSIDOModule.JourneyErrorType) => ...` to `error: (error: TSIDOModule.SDKError) => ...` and read `error.errorCode`.
- **Error codes:** `TSIDOModule.JourneyErrorType` is now a string enum. Comparisons like `error.errorCode === TSIDOModule.JourneyErrorType.networkError` now work as expected. Android's `expiredOtpPasscode` is now `expiredOTPPasscode`, and unrecognized codes are reported as `unknown` instead of `@unknown`.
- **Android initialization:** `initializeSDK()` now works from JS on Android. Existing `initializeAndroidSDK(this)` calls in MainApplication keep working.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## Author

Transmit Security, https://github.com/TransmitSecurity

## License

This project is licensed under the MIT license. See the LICENSE file for more info.
