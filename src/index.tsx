import { NativeModules, Platform } from 'react-native';

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


export namespace TSIDOModule {

  export interface StartJourneyOptions {
    additionalParams?: { [key: string]: any; } | null;
    flowId?: string | null;
  }

  export const enum ClientResponseOptionType {
    clientInput,
    cancel,
    fail,
    resend
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
    journeyStepId?: TSIDOModule.ClientResponseOptionType | string | null;
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
  }
}

class RNTSIdentityOrchestration implements TSIDOModule.API {

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

}
export default new RNTSIdentityOrchestration();
