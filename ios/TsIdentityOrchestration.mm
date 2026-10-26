#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TsIdentityOrchestration, NSObject)

RCT_EXTERN_METHOD(initializeSDK:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initialize:(NSString *)clientId initOptions:(NSDictionary*)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setLoggingEnabled:(BOOL)enabled withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setPushToken:(NSString *)token withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startJourney:(NSString *)journeyId startJourneyOptions:(NSDictionary*)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startMobileApproveJourney:(NSDictionary *)payload startJourneyOptions:(NSDictionary*)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(submitClientResponse:(NSString *)clientResponseOptionId responseData:(NSDictionary*)data withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateDebugPin:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
