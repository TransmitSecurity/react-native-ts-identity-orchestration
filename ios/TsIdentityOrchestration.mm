#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TsIdentityOrchestration, NSObject)

RCT_EXTERN_METHOD(initializeSDK:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startJourney:(NSString *)journeyId startJourneyOptions:(NSDictionary*)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(submitClientResponse:(NSString *)clientResponseOptionId responseData:(NSDictionary*)data withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
