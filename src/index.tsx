import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ts-identity-orchestration' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const TsIdentityOrchestration = NativeModules.TsIdentityOrchestration
  ? NativeModules.TsIdentityOrchestration
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

const eventEmitter = new NativeEventEmitter(TsIdentityOrchestration);

export namespace TSIDOModule {

  export interface StartJourneyOptions {
    additionalParams?: { [key: string]: any; } | null;
    flowId?: string | null;
  }

  export const enum ClientResponseOptionType {
    clientInput = "clientInput",
    cancel = "cancel",
    fail = "fail",
    resend = "resend"
  }

  export enum JourneyActionType {
    success = "success",
    rejection = "rejection",
    information = "information",
    debugBreak = "debugBreak",
    waitForAnotherDevice = "waitForAnotherDevice",
    drsTriggerAction = "drsTriggerAction",
    identityVerification = "identityVerification",
    webAuthnRegistration = "webAuthnRegistration",
    registerDeviceAction = "registerDeviceAction",
    validateDeviceAction = "validateDeviceAction",
    nativeBiometricsRegistration = "nativeBiometricsRegistration",
    nativeBiometricsAuthenticaton = "nativeBiometricsAuthenticaton",
    emailOTPAuthentication = "emailOTPAuthentication",
    smsOTPAuthentication = "smsOTPAuthentication"
  }

  export const enum JourneyErrorType {
    notInitialized,
    networkError,
    clientResponseNotValid,
    serverError,
    initializationError,
    invalidCredentials
  }

  export interface SDKError {
    errorCode: TSIDOModule.JourneyErrorType
    description: string;
    data?: any | null;
  }

  export interface ClientResponseOption {
    type: TSIDOModule.ClientResponseOptionType | string;
    id: string;
    label: string;
  }

  export interface ServiceResponse {
    data?: { [key: string]: any; } | null;
    errorData?: TSIDOModule.SDKError | null;
    journeyStepId?: TSIDOModule.JourneyActionType | string | null;
    clientResponseOptions?: { [key: string]: TSIDOModule.ClientResponseOption; }
    token?: string | null;
  }

  export interface ResponseHandler {
    success: (results: TSIDOModule.ServiceResponse) => void;
    error: (results: TSIDOModule.JourneyErrorType) => void;
  }

  // Module API

  export interface API {
    /**
    Creates a new Identity Orchestration SDK instance with your client context.
    Credentials are configured from TransmitSecurity.plist file (iOS) or strings.xml file (Android).
    */
    initializeSDK: () => Promise<boolean>;
    /**
       Starts a Journey with a given id.
     - Parameters:
       - journeyId: Journey Identifier in the Transmit Security Admin Console.
       - options: Additional parameters to be passed to the journey.
    */
    startJourney: (journeyId: string, options?: TSIDOModule.StartJourneyOptions | null | undefined) => void;
    /**
      This method will submit client input to the Journey step to process.
  
      - Parameters:
        - clientResponseOptionId: The response option ID is one of the IDs provided in the clientResponseOptions. This would either be ClientInput for collected user input, or one of the others if another journey path was selected by the user.
        - data: The client response data object. Mandatory in ClientInput response option type, populate with data for the Journey step to process. Optional in Cancel and Custom as an additional parameters for the branch.
      */
    submitClientResponse: (clientResponseOptionId: TSIDOModule.ClientResponseOptionType | string, data?: { [key: string]: any; } | null | undefined) => void;

    /**
      This method will expose a success and error handlers to your application.
  
      - Parameters:
        - responseHandler : The response handler object with success and error callbacks.
      */
    setResponseHandler: (responseHandler: TSIDOModule.ResponseHandler) => void;
  }
}

class RNTSIdentityOrchestration implements TSIDOModule.API {

  private responseHandler?: TSIDOModule.ResponseHandler;
  private static kResponseHandlerEventname = "tsido_response_handler_event";

  initializeSDK = async (): Promise<boolean> => {
    return await TsIdentityOrchestration.initializeSDK();
  }

  startJourney = (journeyId: string, options?: TSIDOModule.StartJourneyOptions | null | undefined): void => {
    TsIdentityOrchestration.startJourney(journeyId, options);
  }

  submitClientResponse = (
    clientResponseOptionId: string | TSIDOModule.ClientResponseOptionType,
    data?: { [key: string]: any; } | null | undefined
  ): void => {
    TsIdentityOrchestration.submitClientResponse(clientResponseOptionId, data);
  }

  setResponseHandler = (responseHandler: TSIDOModule.ResponseHandler): void => {
    this.responseHandler = responseHandler;
    eventEmitter.addListener(
      RNTSIdentityOrchestration.kResponseHandlerEventname,
      this.onResponseReceived
    );
  }

  private onResponseReceived = async (params: any) => {
    const success: boolean = params["success"];
    const additionalData: { [key: string]: any } = params["additionalData"];

    if (success) {
      this.responseHandler?.success(additionalData);
    } else {
      this.responseHandler?.error(additionalData.errorCode);
    }
  }
}
export default new RNTSIdentityOrchestration();
