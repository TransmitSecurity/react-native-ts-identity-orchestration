package com.tsidentityorchestration

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.transmit.idosdk.TSIdo
import com.transmit.idosdk.TSIdoCallback
import com.transmit.idosdk.TSIdoClientResponseOptionType
import com.transmit.idosdk.TSIdoServiceResponse
import com.transmit.idosdk.TSIdoStartJourneyOptions

class TsIdentityOrchestrationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

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
    TSIdo.startJourney(journeyId, convertStartJourneyOptions(startJourneyOptions))
  }

  @ReactMethod
  fun submitClientResponse(clientResponseOptionId: String, responseData: ReadableMap, promise: Promise) {
    TSIdo.submitClientResponse(
      clientResponseOptionId = convertResponseOptionId(clientResponseOptionId).toString(),
      data = responseData as? Map<String, Any>
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

  companion object {
    const val NAME = "TsIdentityOrchestration"
  }
}

private fun TSIdo.submitClientResponse(clientResponseOptionId: String, data: Map<String, Any>?) {

}

private fun TSIdo.startJourney(journeyId: String, options: TSIdoStartJourneyOptions?) {

}
