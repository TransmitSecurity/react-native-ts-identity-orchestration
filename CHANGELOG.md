# Changelog

## 0.2.0

### Breaking changes

- **Error handler signature:** `ResponseHandler.error` now receives a `TSIDOModule.SDKError` object (`errorCode`, `description`, `data`) instead of only the error code. Update handlers from `error: (error: TSIDOModule.JourneyErrorType) => ...` to `error: (error: TSIDOModule.SDKError) => ...` and read `error.errorCode`.
- **String error codes:** `TSIDOModule.JourneyErrorType` is now a string enum, and the native modules send the same values on iOS and Android. Previously the enum was numeric while the native modules sent strings, so comparisons against the enum never matched.
  - Android: `expiredOtpPasscode` is now `expiredOTPPasscode` (same as iOS).
  - Android: `InvalidInitializationOptions` is reported as `initializationError` (same as iOS).
  - Both platforms: unrecognized codes are reported as `unknown` instead of `@unknown`.

### New features

- **`initialize(clientId, options)`:** initialize the SDK with an explicit client ID and options (`serverPath`, `resourceUri`, `pollingTimeout`, `locale`, `collectRiskData`) instead of TransmitSecurity.plist / strings.xml.
- **`setLoggingEnabled(enabled)`:** turn SDK logging on or off on both platforms.
- **`setPushToken(token)`:** register the device push token (APNs on iOS, FCM on Android).
- **Android `initializeSDK()` from JS:** previously this always rejected on Android. It now initializes the SDK, or does nothing if the app already called `initializeAndroidSDK` in MainApplication.
- **New Android error codes:** `idvCameraPermissionRequired`, `idvSdkDisabled`, `idvSessionNotValid`, `idvInitializationError`, `idvNotInitialized`, `idvCanceled`, `idvInternalError`, `idvNotAvailable`.
- **Error details:** errors now include `description` (and, where available, `data`) on both platforms.

### Bug fixes

- Android: `startJourney` / `startMobileApproveJourney` no longer crash when `flowId`, `encrypted` or `additionalParams` are left out of the options.
- Android: custom client response options now report their own id as `type` (it was previously the literal string `"Custom"`), the same as on iOS.
- Android: exceptions thrown while starting a Mobile Approve journey are now reported as a normal `internalError` with a description.
- iOS: removed leftover debug logging from `submitClientResponse`.
- Fixed the podspec source URL.

### Dependencies

- iOS: IdentityOrchestration SDK `1.2.0` → `1.2.3`.
- Android: IdentityOrchestration SDK `1.0.31` → `1.0.36`.

### Other

- Example app: added an Information step screen and updated it to the new error handler.
- Removed the unused Lefthook git hooks from the repo.
