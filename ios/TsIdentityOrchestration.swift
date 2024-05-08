import IdentityOrchestration
import React

@objc(TsIdentityOrchestration)
class TsIdentityOrchestration: RCTEventEmitter {
    
    private static let ResponseHandlerEventName = "tsido_response_handler_event"
    private let kTag = "TSIdentityOrchestration"
    private var isListening: Bool = false
    
    @objc(initializeSDK:withRejecter:)
    func initializeSDK(
        _ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain { [weak self] in
                guard let self = self else { return }
                
                do {
                    TSIdo.delegate = self
                    try TSIdo.initializeSDK()
                    resolve(true)
                } catch {
                    reject(self.kTag, "Error during initializeSDK", error)
                }
            }
        }
    
    @objc(startJourney:startJourneyOptions:withResolver:withRejecter:)
    func startJourney(
        _ journeyId: String,
        startJourneyOptions: NSDictionary?,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain { [weak self] in
                guard let self = self else { return }
                TSIdo.startJourney(
                    journeyId: journeyId,
                    options: self.convertStartJourneyOptions(startJourneyOptions)
                )
                resolve(true)
            }
        }
    
    @objc(submitClientResponse:responseData:withResolver:withRejecter:)
    func submitClientResponse(
        _ clientResponseOptionId: String,
        responseData: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain { [weak self] in
                guard let self = self else { return }
                TSIdo.submitClientResponse(
                    clientResponseOptionId: self.convertResponseOptionId(clientResponseOptionId),
                    data: responseData as? [String : Any]
                )
                
                resolve(true)
            }
        }
    
    // MARK: - Helpers
    
    private func convertResponseOptionId(_ rawResponseOptionId: String) -> TSIdoClientResponseOptionType {
        switch rawResponseOptionId {
        case "clientInput": return .clientInput
        case "cancel": return .cancel
        case "fail": return .fail
        case "resend": return .resend
        default: return .custom(id: rawResponseOptionId)
        }
    }
    
    private func convertStartJourneyOptions(_ rawOptions: NSDictionary?) -> TSIdoStartJourneyOptions? {
        guard let rawOptions = rawOptions else { return nil }
        
        return TSIdoStartJourneyOptions(
            additionalParams: rawOptions["additionalParams"] as? [String : Any],
            flowId: rawOptions["flowId"] as? String
        )
    }
    
    // MARK: - Events
    
    @objc override func supportedEvents() -> [String]! {
        return [TsIdentityOrchestration.ResponseHandlerEventName]
    }
    
    override func startObserving() {
        isListening = true
    }
    
    override func stopObserving() {
        isListening = false
    }
    
    // MARK: - RCTEventEmitter
    
    private func reportResponseEvent(_ success: Bool, additionalData: [String: Any?]) {
        guard isListening else { return }
        self.sendEvent(
            withName: TsIdentityOrchestration.ResponseHandlerEventName,
            body: [
                "success": success,
                "additionalData": additionalData
            ]
        )
    }
    
    // MARK: - Threading
    
    private func runBlockOnMain(_ block: @escaping () -> Void) {
        DispatchQueue.main.async {
            block()
        }
    }
}

extension TsIdentityOrchestration: TSIdoDelegate {
    func TSIdoDidReceiveResult(_ result: Result<TSIdoServiceResponse, TSIdoJourneyError>) {
        switch result {
        case .success(let response):
            reportResponseEvent(true, additionalData: convertServiceResponse(response))
        case .failure(let error):
            reportResponseEvent(false, additionalData: convertServiceError(error))
        }
    }
    
    private func convertServiceResponse(_ response: TSIdoServiceResponse) -> [String: Any?] {
        let jsResponse: [String: Any?] = [
            "data": response.data,
            "errorData": convertErrorData(response.errorData),
            "journeyStepId": idoJourneyStepIdToString(response.journeyStepId),
            "clientResponseOptions": convertClientResponseOption(response.clientResponseOptions),
            "token": response.token
        ]
        
        return jsResponse
    }
    
    private func convertServiceError(_ error: TSIdoJourneyError) -> [String: Any] {
        return ["error": idoErrorCodeToString(error)]
    }
    
    // MARK: Convertion Helpers
    
    private func convertErrorData(_ errorData: TSIdoSdkError?) -> [String: Any?]? {
        guard let errorData = errorData else { return nil }
        
        return [
            "errorCode": idoErrorCodeToString(errorData.errorCode),
            "description": errorData.description,
            "data": errorData.data
        ]
    }
    
    private func idoJourneyStepIdToString(_ journeyStepId: IdentityOrchestration.TSIdoJourneyActionType?) -> String? {
        guard let journeyStepId = journeyStepId else { return nil }
        
        switch journeyStepId {
            
        case .success: return "success"
        case .rejection: return "rejection"
        case .information: return "information"
        case .debugBreak: return "debugBreak"
        case .waitForAnotherDevice: return "waitForAnotherDevice"
        case .drsTriggerAction: return "drsTriggerAction"
        case .identityVerification: return "identityVerification"
        case .webAuthnRegistration: return "webAuthnRegistration"
        case .registerDeviceAction: return "registerDeviceAction"
        case .validateDeviceAction: return "validateDeviceAction"
        case .nativeBiometricsRegistration: return "nativeBiometricsRegistration"
        case .nativeBiometricsAuthenticaton: return "nativeBiometricsAuthenticaton"
        case .emailOTPAuthentication: return "emailOTPAuthentication"
        case .smsOTPAuthentication: return "smsOTPAuthentication"
        case .custom(name: let name): return "\(name)"
        @unknown default: return "@unknown"
        }
    }
    
    private func idoErrorCodeToString(_ errorCode: IdentityOrchestration.TSIdoJourneyError) -> String {
        switch errorCode {
        case .notInitialized: return "notInitialized"
        case .networkError: return "networkError"
        case .clientResponseNotValid: return "clientResponseNotValid"
        case .serverError(_): return "serverError"
        case .initializationError: return "initializationError"
        case .invalidCredentials: return "invalidCredentials"
        @unknown default: return "@unknown"
        }
    }
    
    private func convertClientResponseOption(
        _ responseOptions: [String : IdentityOrchestration.TSIdoClientResponseOption]?
    ) -> [String: Any?]? {
        
        guard let responseOptions = responseOptions else { return nil }
        
        var jsOptions: [String: Any?] = [:]
        
        for (key, value) in responseOptions {
            let option: [String: Any?] = [
                "type": responseOptionTypeToString(value.type),
                "id": value.id,
                "label": value.label
            ]
            jsOptions[key] = option
        }
        
        return jsOptions
    }
    
    private func responseOptionTypeToString(
        _ optionType: IdentityOrchestration.TSIdoClientResponseOptionType
    ) -> String {
        switch optionType {
        case .clientInput: return "clientInput"
        case .cancel: return "cancel"
        case .fail: return "fail"
        case .resend: return "resend"
        case .custom(id: let id): return "\(id)"
        @unknown default: return "unknown"
        }
    }
}
