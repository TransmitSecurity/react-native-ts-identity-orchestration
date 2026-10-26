package com.tsidentityorchestration

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
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
import com.transmit.idosdk.TSIdoEncryptionMode
import com.transmit.idosdk.TSIdoInitOptions
import com.transmit.idosdk.TSPushTokenType
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class TsIdentityOrchestrationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), TSIdoCallback<TSIdoServiceResponse> {
    private val idvStatusChangeEventName: String = "tsido_response_handler_event"

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun initializeSDK(promise: Promise) {
    try {
      if (!isInitialized) {
        initializeAndroidSDK(reactContext.applicationContext)
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("TSIDOModule", "Error during initializeSDK", e)
    }
  }

  @ReactMethod
  fun initialize(clientId: String, initOptions: ReadableMap, promise: Promise) {
    val serverPath = optString(initOptions, "serverPath")
    if (serverPath == null) {
      promise.reject("TSIDOModule", "initialize requires options.serverPath")
      return
    }

    try {
      val options = TSIdoInitOptions(
        serverPath,
        optInt(initOptions, "pollingTimeout"),
        optString(initOptions, "resourceUri"),
        optString(initOptions, "locale"),
        optBoolean(initOptions, "collectRiskData") ?: false
      )
      TSIdo.initializeSDK(reactContext.applicationContext, clientId, options)
      isInitialized = true
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("TSIDOModule", "Error during initialize", e)
    }
  }

  @ReactMethod
  fun setLoggingEnabled(enabled: Boolean, promise: Promise) {
    TSIdo.setLoggingEnabled(enabled)
    promise.resolve(true)
  }

  @ReactMethod
  fun setPushToken(token: String, promise: Promise) {
    try {
      TSIdo.setPushToken(token, TSPushTokenType.Fcm)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("TSIDOModule", "Error during setPushToken", e)
    }
  }

  @ReactMethod
  fun startJourney(journeyId: String, startJourneyOptions: ReadableMap?, promise: Promise) {
    TSIdo.startJourney(journeyId,
      convertStartJourneyOptions(startJourneyOptions), object: TSIdoCallback<TSIdoServiceResponse>{
        override fun idoSuccess(result: TSIdoServiceResponse) {
          reportResponseEvent(true, convertServiceResponse(result))
        }

        override fun idoError(error: TSIdoSdkError) {
          reportResponseEvent(false, convertServiceError(error))
        }
      })
    promise.resolve(true)
  }

  @ReactMethod
  fun startMobileApproveJourney(payload: ReadableMap, startJourneyOptions: ReadableMap?, promise: Promise) {
    try {
      val stringPayload = readableMapToStringMap(payload)
      val options = convertStartJourneyOptions(startJourneyOptions)

      TSIdo.startMobileApproveJourney(
        stringPayload,
        options,
        object : TSIdoCallback<TSIdoServiceResponse> {
          override fun idoSuccess(result: TSIdoServiceResponse) {
            reportResponseEvent(true, convertServiceResponse(result))
          }

          override fun idoError(error: TSIdoSdkError) {
            reportResponseEvent(false, convertServiceError(error))
          }
        }
      )
    } catch (exception: Exception) {
      reportResponseEvent(false, createExceptionMap(exception))
    }

    promise.resolve(true)
  }

  @ReactMethod
  fun submitClientResponse(clientResponseOptionId: String?, responseData: ReadableMap?, promise: Promise) {
    if (clientResponseOptionId == null) {
      promise.reject("IDO Module", "Must provide a client response option ID string")
      return
    }

    val responseToOptionId = convertResponseOptionId(clientResponseOptionId)
    val optionId = if (responseToOptionId == TSIdoClientResponseOptionType.Custom) {
      clientResponseOptionId
    } else {
      responseToOptionId.type
    }

    TSIdo.submitClientResponse(optionId, readableMapToNativeMap(responseData),
      object: TSIdoCallback<TSIdoServiceResponse>{

        override fun idoSuccess(result: TSIdoServiceResponse) {
          reportResponseEvent(true, convertServiceResponse(result))
        }

        override fun idoError(error: TSIdoSdkError) {
          reportResponseEvent(false, convertServiceError(error))
        }
      }
    )

    promise.resolve(true)
  }

  @ReactMethod
  fun generateDebugPin(promise: Promise) {
    TSIdo.generateDebugPin(object : TSIdoCallback<String> {
      override fun idoSuccess(result: String) {
        promise.resolve(result)
      }

      override fun idoError(error: TSIdoSdkError) {
        promise.reject("Error during generateDebugPin", error.toString())
      }
    })
  }

  // region Private Methods

  private fun optString(map: ReadableMap, key: String): String? =
    if (map.hasKey(key) && !map.isNull(key)) map.getString(key) else null

  private fun optInt(map: ReadableMap, key: String): Int? =
    if (map.hasKey(key) && !map.isNull(key)) map.getInt(key) else null

  private fun optBoolean(map: ReadableMap, key: String): Boolean? =
    if (map.hasKey(key) && !map.isNull(key)) map.getBoolean(key) else null

  private fun readableMapToStringMap(readableMap: ReadableMap): Map<String, String> {
    val result = mutableMapOf<String, String>()
    val iterator = readableMap.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      val type = readableMap.getType(key)
      if (type == ReadableType.String) {
        result[key] = readableMap.getString(key) ?: ""
      } else {
        throw IllegalArgumentException("Expected string value for key '$key', but got $type")
      }
    }
    return result
  }

  private fun readableMapToNativeMap(readableMap: ReadableMap?): Map<String, Any?>? {
    if (readableMap == null) {
      return null
    }

    val result = HashMap<String, Any?>()

    val iterator = readableMap.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      when (readableMap.getType(key)) {
        ReadableType.Null -> result[key] = null
        ReadableType.Boolean -> result[key] = readableMap.getBoolean(key)
        ReadableType.Number -> result[key] = readableMap.getDouble(key)
        ReadableType.String -> result[key] = readableMap.getString(key)
        ReadableType.Map -> result[key] = readableMapToNativeMap(readableMap.getMap(key))
        ReadableType.Array -> result[key] = readableArrayToList(readableMap.getArray(key))
        else -> throw IllegalArgumentException("Unsupported type for key: $key")
      }
    }
    return result
  }

  private fun readableArrayToList(readableArray: ReadableArray?): List<Any?> {
    val result = ArrayList<Any?>()
    if (readableArray == null) {
      return result
    }

    for (i in 0 until readableArray.size()) {
      when (readableArray.getType(i)) {
        ReadableType.Null -> result.add(null)
        ReadableType.Boolean -> result.add(readableArray.getBoolean(i))
        ReadableType.Number -> result.add(readableArray.getDouble(i))
        ReadableType.String -> result.add(readableArray.getString(i))
        ReadableType.Map -> result.add(readableMapToNativeMap(readableArray.getMap(i)))
        ReadableType.Array -> result.add(readableArrayToList(readableArray.getArray(i)))
        else -> throw IllegalArgumentException("Unsupported array element type at index: $i")
      }
    }
    return result
  }

  // region SDK API Conversion

  private fun convertStartJourneyOptions(rawOptions: ReadableMap?):  TSIdoStartJourneyOptions? {
    if (rawOptions == null) return null

    val additionalParams =
      if (rawOptions.hasKey("additionalParams") && !rawOptions.isNull("additionalParams")) {
        rawOptions.getMap("additionalParams")?.toHashMap()
      } else null

    return TSIdoStartJourneyOptions(
      additionalParams = additionalParams,
      flowId = optString(rawOptions, "flowId"),
      encryptionMode = parseEncryptionMode(optBoolean(rawOptions, "encrypted"))
    )
  }

  private fun convertResponseOptionId(rawResponseOptionId: String): TSIdoClientResponseOptionType {
    return when (rawResponseOptionId) {
      "clientInput" -> TSIdoClientResponseOptionType.ClientInput
      "cancel" -> TSIdoClientResponseOptionType.Cancel
      "fail" -> TSIdoClientResponseOptionType.Fail
      "resend" -> TSIdoClientResponseOptionType.Resend
      else -> TSIdoClientResponseOptionType.Custom
    }
  }

  private fun parseEncryptionMode(encrypted: Boolean?): TSIdoEncryptionMode {
    return when (encrypted) {
      true -> TSIdoEncryptionMode.Full
      false, null -> TSIdoEncryptionMode.None
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
    //reportResponseEvent(false, convertServiceError(error))
  }

  override fun idoSuccess(result: TSIdoServiceResponse) {
    //reportResponseEvent(true, convertServiceResponse(result))
  }

  private fun convertServiceResponse(response: TSIdoServiceResponse): WritableMap {
    val jsResponse = Arguments.createMap()
    jsResponse.putMap("data", responseDataAnyToMap(response.data))
    jsResponse.putMap("errorData", convertErrorData(response.errorData))
    jsResponse.putString("journeyStepId", idoJourneyStepIdToString(response.journeyStepId))
    jsResponse.putMap("clientResponseOptions", convertClientResponseOptions(response.clientResponseOptions) as WritableMap)
    jsResponse.putString("token", response.token)
    return jsResponse
  }

  private fun responseDataAnyToMap(data: Any?): ReadableMap? {
    if (data == null) return null

    val dataAsString = responseDataAnyToString(data) ?: return null

    return jsonToReadableMap((dataAsString))
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
    map.putString("errorCode", idoErrorCodeToString(error))
    map.putString("description", error.errorMessage)
    map.putString("data", error.throwable?.message)
    return map
  }

  private fun createExceptionMap(exception: Exception): WritableMap {
    val map = Arguments.createMap()
    map.putString("errorCode", "internalError")
    map.putString("description", exception.message ?: exception.toString())
    map.putNull("data")
    return map
  }

  private fun idoErrorCodeToString(errorData: TSIdoSdkError): String {
    return when (errorData.errorCode) {
      TSIdoErrorCode.InvalidInitializationOptions -> "initializationError"
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
      TSIdoErrorCode.ExpiredOtpPasscode -> "expiredOTPPasscode"
      TSIdoErrorCode.ExpiredValidationPasscode -> "expiredValidationPasscode"
      TSIdoErrorCode.MaxResendReached -> "maxResendReached"
      TSIdoErrorCode.IdvCameraPermissionRequired -> "idvCameraPermissionRequired"
      TSIdoErrorCode.IdvSdkDisabled -> "idvSdkDisabled"
      TSIdoErrorCode.IdvSessionNotValid -> "idvSessionNotValid"
      TSIdoErrorCode.IdvInitializationError -> "idvInitializationError"
      TSIdoErrorCode.IdvNotInitialized -> "idvNotInitialized"
      TSIdoErrorCode.IdvCanceled -> "idvCanceled"
      TSIdoErrorCode.IdvInternalError -> "idvInternalError"
      TSIdoErrorCode.IdvNotAvailable -> "idvNotAvailable"
      else -> "unknown"
    }
  }

  private fun idoJourneyStepIdToString(journeyStepId: String?): String? {
    if (journeyStepId == null) return null

    val cleanId = journeyStepId.replace("action:", "")
    val matchEnum = cleanId.replaceFirstChar { it.uppercase() }

    return when (matchEnum) {
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
      TSIdoJourneyActionType.EmailValidation.toString() -> "emailValidation"
      TSIdoJourneyActionType.SmsValidation.toString() -> "smsValidation"
      TSIdoJourneyActionType.TotpRegistration.toString() -> "totpRegistration"
      TSIdoJourneyActionType.TransactionSigningTOTP.toString() -> "totpSigningTransaction"
      TSIdoJourneyActionType.TransactionSigningWebAuthn.toString() -> "webAuthnTransactionSigning"
      TSIdoJourneyActionType.TransactionSigningNativeBiometrics.toString() -> "nativeBiometricsTransactionSigning"
      TSIdoJourneyActionType.PinCodeRegistration.toString() -> "pinCodeRegistration"
      TSIdoJourneyActionType.PinCodeAuthentication.toString() -> "pinCodeAuthentication"

      "Transmit_platform_email_otp_authentication" -> "emailOTPAuthentication"
      else -> journeyStepId
    }
  }

  private fun convertClientResponseOptions(
    responseOptions: Map<String, TSIdoClientResponseOption>?
  ): WritableMap? {
    var jsOptions: WritableMap = Arguments.createMap()

    if (responseOptions == null) return jsOptions

    for ((key, value) in responseOptions) {
      var option: WritableMap = Arguments.createMap()
      option.putString("type", responseOptionTypeToString(value))
      option.putString("id", value.id)
      option.putString("label", value.label)

      jsOptions.putMap(key, option)
    }

    return jsOptions
  }

  private fun responseOptionTypeToString(option: TSIdoClientResponseOption): String {
    return when (option.type) {
      TSIdoClientResponseOptionType.ClientInput -> "clientInput"
      TSIdoClientResponseOptionType.Cancel -> "cancel"
      TSIdoClientResponseOptionType.Fail -> "fail"
      TSIdoClientResponseOptionType.Resend -> "resend"
      TSIdoClientResponseOptionType.Custom -> option.id
      else -> "unknown"
    }
  }

  // endregion

  companion object {
    const val NAME = "TsIdentityOrchestration"

    @Volatile
    private var isInitialized = false

    fun initializeAndroidSDK(context: Context) {
      TSIdo.initializeSDK(context)
      isInitialized = true
    }
  }

  private fun responseDataAnyToString(data: Any?): String? {
    return when (data) {
      null -> null
      is String -> data
      is JSONObject -> data.toString()
      is JSONArray -> data.toString()
      is Number, is Boolean -> data.toString()
      is Map<*, *> -> JSONObject(data as Map<*, *>).toString()
      is Collection<*> -> JSONArray(data).toString()
      else -> throw IllegalArgumentException("Unsupported data type")
    }
  }

  private fun jsonToReadableMap(json: String): ReadableMap? {
    return try {
      val jsonObject = JSONObject(json)
      convertJsonToMap(jsonObject)
    } catch (e: JSONException) {
      e.printStackTrace()
      null
    }
  }

  private fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
    val map = Arguments.createMap()
    val keys = jsonObject.keys()

    while (keys.hasNext()) {
      val key = keys.next()
      val value = jsonObject.get(key)

      if (value is JSONObject) {
        map.putMap(key, convertJsonToMap(value))
      } else if (value is JSONArray) {
        map.putArray(key, convertJsonToArray(value))
      } else if (value is Boolean) {
        map.putBoolean(key, value)
      } else if (value is Int) {
        map.putInt(key, value)
      } else if (value is Double) {
        map.putDouble(key, value)
      } else if (value is String) {
        map.putString(key, value)
      } else {
        map.putString(key, value.toString())
      }
    }

    return map
  }

  private fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
    val array = Arguments.createArray()

    for (i in 0 until jsonArray.length()) {
      val value = jsonArray.get(i)

      if (value is JSONObject) {
        array.pushMap(convertJsonToMap(value))
      } else if (value is JSONArray) {
        array.pushArray(convertJsonToArray(value))
      } else if (value is Boolean) {
        array.pushBoolean(value)
      } else if (value is Int) {
        array.pushInt(value)
      } else if (value is Double) {
        array.pushDouble(value)
      } else if (value is String) {
        array.pushString(value)
      } else {
        array.pushString(value.toString())
      }
    }

    return array
  }
}
