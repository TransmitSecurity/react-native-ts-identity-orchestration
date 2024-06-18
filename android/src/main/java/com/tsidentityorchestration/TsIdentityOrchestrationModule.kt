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
  fun initializeSDK(promise: Promise) {
    promise.reject(
      "TSIDOModule",
      "On Android, please call the initializeAndroidSDK function from your Application class"
    )
  }

  @ReactMethod
  fun startJourney(journeyId: String, startJourneyOptions: ReadableMap?, promise: Promise) {
    TSIdo.startJourney(journeyId,
      convertStartJourneyOptions(startJourneyOptions), object: TSIdoCallback<TSIdoServiceResponse>{
        override fun idoSuccess(result: TSIdoServiceResponse) {
          //promise.resolve(true)
          reportResponseEvent(true, convertServiceResponse(result))
        }

        override fun idoError(error: TSIdoSdkError) {
          //promise.reject("Error during startJourney", error.toString());
          reportResponseEvent(false, convertServiceError(error))
        }
      })
    promise.resolve(true)
  }

  @ReactMethod
  fun submitClientResponse(clientResponseOptionId: String?, responseData: ReadableMap?, promise: Promise) {
    if (clientResponseOptionId == null) {
      promise.reject("IDO Module", "Must provide a client response option ID string")
      return
    }

    val responseToOptionId = convertResponseOptionId(clientResponseOptionId)
    var optionId = responseToOptionId.type
    var nativeMap = readableMapToNativeMap(responseData)

    if (responseToOptionId == TSIdoClientResponseOptionType.Custom) {
      optionId = clientResponseOptionId
      val mutableMap = nativeMap?.toMutableMap()

      if (mutableMap !== null) {
        mutableMap["escape_id"] = optionId
        mutableMap["escape_params"] = mutableMap
      }
    }

    TSIdo.submitClientResponse(optionId, nativeMap,
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

    val hashMap = rawOptions.getMap("additionalParams")?.toHashMap()
    val options =  TSIdoStartJourneyOptions(
      additionalParams = hashMap,
      flowId = rawOptions.getString("flowId")
    )

    return options
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
      option.putString("type", responseOptionTypeToString(value.type))
      option.putString("id", value.id)
      option.putString("label", value.label)

      jsOptions.putMap(key, option)
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

    fun initializeAndroidSDK(context: Context) {
      TSIdo.initializeSDK(context)
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
