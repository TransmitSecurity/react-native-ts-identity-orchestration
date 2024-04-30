import IdentityOrchestration

@objc(TsIdentityOrchestration)
class TsIdentityOrchestration: NSObject {
    
    private let kTag = "TSIdentityOrchestration"
    
    @objc(initializeSDK:withRejecter:)
    func initializeSDK(
        _ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain { [weak self] in
                guard let self = self else { return }
                
                do {
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
    
    // MARK: - Threading
    
    private func runBlockOnMain(_ block: @escaping () -> Void) {
        DispatchQueue.main.async {
            block()
        }
    }
}
