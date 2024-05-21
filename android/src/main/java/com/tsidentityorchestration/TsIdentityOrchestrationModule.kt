package com.tsidentityorchestration

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.transmit.idosdk.TSIdo
import com.transmit.idosdk.TSIdoCallback
import com.transmit.idosdk.TSIdoClientResponseOptionType
import com.transmit.idosdk.TSIdoSdkError
import com.transmit.idosdk.TSIdoServiceResponse
import com.transmit.idosdk.TSIdoStartJourneyOptions
import com.transmit.idosdk.TSIdoErrorCode
import com.transmit.idosdk.TSIdoJourneyActionType
import com.transmit.idosdk.TSIdoClientResponseOption

class TsIdentityOrchestrationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), TSIdoCallback<TSIdoServiceResponse> {

  private val idvStatusChangeEventName: String = "tsido_response_handler_event"

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initializeSDK(promise: Promise) {
    TSIdo.initializeSDK(reactContext)
    promise.resolve(true)
  }

  @ReactMethod
  fun startJourney(journeyId: String, startJourneyOptions: ReadableMap?, promise: Promise) {
    TSIdo.startJourney(journeyId,
      convertStartJourneyOptions(startJourneyOptions), object: TSIdoCallback<TSIdoServiceResponse>{
        override fun idoSuccess(result: TSIdoServiceResponse) {
          promise.resolve(true);
        }

        override fun idoError(error: TSIdoSdkError) {
          promise.reject("Error during startJourney", error.toString());
        }
      })
  }

  @ReactMethod
  fun submitClientResponse(clientResponseOptionId: String, responseData: ReadableMap, promise: Promise) {
    TSIdo.submitClientResponse(
      clientResponseOptionId = convertResponseOptionId(clientResponseOptionId).toString(),
      data = responseData as? Map<String, Any>,
      object: TSIdoCallback<TSIdoServiceResponse>{
        override fun idoSuccess(result: TSIdoServiceResponse) {
          promise.resolve(true);
        }

        override fun idoError(error: TSIdoSdkError) {
          promise.reject("Error during submitClientResponse", error.toString());
        }
      }
    )
  }

  // region SDK API Conversion

  private fun convertStartJourneyOptions(rawOptions: ReadableMap?):  TSIdoStartJourneyOptions? {
    if (rawOptions == null) return null

    return TSIdoStartJourneyOptions(
      additionalParams = rawOptions.getMap("additionalParams") as? Map<String, Any>,
      flowId = rawOptions.getString("flowId")
    )
  }

  private fun convertResponseOptionId(rawResponseOptionId: String): TSIdoClientResponseOptionType {
    return when (rawResponseOptionId) {
      "clientInput" -> TSIdoClientResponseOptionType.ClientInput
      "cancel" -> TSIdoClientResponseOptionType.Cancel
      "fail" -> TSIdoClientResponseOptionType.Fail
      "resend" -> TSIdoClientResponseOptionType.Resend
      else -> TSIdoClientResponseOptionType.valueOf(rawResponseOptionId)
    }
  }

  // endregion

  // JS Event Emitter

  private fun reportResponseEvent(success: Boolean, additionalData: ReadableMap) {
    var params: WritableMap = Arguments.createMap()
    params.putBoolean("success", success);
    params.putMap("additionalData", additionalData);
    sendEvent(reactContext, idvStatusChangeEventName, params)
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(eventName, params)
  }

  // endregion

  // IDO Response Handler

  override fun idoError(error: TSIdoSdkError) {
    reportResponseEvent(false, convertServiceError(error))
  }

  override fun idoSuccess(result: TSIdoServiceResponse) {
    reportResponseEvent(true, convertServiceResponse(result))
  }

  private fun convertServiceResponse(response: TSIdoServiceResponse): WritableMap {
    val jsResponse = Arguments.createMap()
    jsResponse.putMap("data", response.data as ReadableMap)
    jsResponse.putMap("errorData", convertErrorData(response.errorData) as WritableMap)
    jsResponse.putString("journeyStepId", idoJourneyStepIdToString(response.journeyStepId))
    jsResponse.putMap("clientResponseOptions", convertClientResponseOption(response.clientResponseOptions) as WritableMap)
    jsResponse.putString("token", response.token)
    return jsResponse
  }

  private fun convertErrorData(errorData: TSIdoSdkError?): WritableMap? {
    if (errorData == null) return null

    val map = Arguments.createMap()
    map.putString("errorCode", idoErrorCodeToString(errorData))
    map.putString("description", errorData.errorMessage)
    map.putString("data", errorData.toString())

    return map
  }

  private fun convertServiceError(error: TSIdoSdkError): WritableMap {
    val map = Arguments.createMap()
    map.putString("error", idoErrorCodeToString(error))
    return map
  }

  private fun idoErrorCodeToString(errorData: TSIdoSdkError): String {
    return when (errorData.errorCode) {
      TSIdoErrorCode.NotInitialized -> "notInitialized"
      TSIdoErrorCode.NoActiveJourney -> "noActiveJourney"
      TSIdoErrorCode.NetworkError -> "networkError"
      TSIdoErrorCode.ClientResponseNotValid -> "clientResponseNotValid"
      TSIdoErrorCode.ServerError -> "serverError"
      TSIdoErrorCode.InvalidStateString -> "invalidStateString"
      TSIdoErrorCode.InternalError -> "internalError"
      TSIdoErrorCode.DeviceRegistrationError -> "deviceRegistrationError"
      TSIdoErrorCode.DeviceValidationError -> "deviceValidationError"
      TSIdoErrorCode.InvalidCredentials -> "invalidCredentials"
      TSIdoErrorCode.ExpiredOtpPasscode -> "expiredOtpPasscode"
      else -> "@unknown"
    }
  }

  private fun idoJourneyStepIdToString(journeyStepId: String?): String? {
    if (journeyStepId == null) return null

    return when (journeyStepId) {
      TSIdoJourneyActionType.Success.toString() -> "success"
      TSIdoJourneyActionType.Rejection.toString() -> "rejection"
      TSIdoJourneyActionType.Information.toString() -> "information"
      TSIdoJourneyActionType.DebugBreak.toString() -> "debugBreak"
      TSIdoJourneyActionType.WaitForAnotherDevice.toString() -> "waitForAnotherDevice"
      TSIdoJourneyActionType.RegisterDevice.toString() -> "registerDevice"
      TSIdoJourneyActionType.ValidateDeviceAction.toString() -> "validateDeviceAction"
      TSIdoJourneyActionType.DrsTriggerAction.toString() -> "drsTriggerAction"
      TSIdoJourneyActionType.IdentityVerification.toString() -> "identityVerification"
      TSIdoJourneyActionType.WebAuthnRegistration.toString() -> "webAuthnRegistration"
      TSIdoJourneyActionType.RegisterNativeBiometrics.toString() -> "registerNativeBiometrics"
      TSIdoJourneyActionType.AuthenticateNativeBiometrics.toString() -> "authenticateNativeBiometrics"
      TSIdoJourneyActionType.EmailOTPAuthentication.toString() -> "emailOTPAuthentication"
      TSIdoJourneyActionType.SmsOTPAuthentication.toString() -> "smsOTPAuthentication"
      else -> "@unknown"
    }
  }

  private fun convertClientResponseOption(
    responseOptions: Map<String, TSIdoClientResponseOption>?
  ): Map<String, Any?>? {
    if (responseOptions == null) return null

    val jsOptions = mutableMapOf<String, Any?>()

    for ((key, value) in responseOptions) {
      val option = mapOf(
        "type" to responseOptionTypeToString(value.type),
        "id" to value.id,
        "label" to value.label
      )
      jsOptions[key] = option
    }

    return jsOptions
  }

  private fun responseOptionTypeToString(optionType: TSIdoClientResponseOptionType): String {
    return when (optionType) {
      TSIdoClientResponseOptionType.ClientInput -> "clientInput"
      TSIdoClientResponseOptionType.Cancel -> "cancel"
      TSIdoClientResponseOptionType.Fail -> "fail"
      TSIdoClientResponseOptionType.Resend -> "resend"
      TSIdoClientResponseOptionType.Custom -> optionType.toString()
      else -> "unknown"
    }
  }

  // endregion

  companion object {
    const val NAME = "TsIdentityOrchestration"
  }
}
