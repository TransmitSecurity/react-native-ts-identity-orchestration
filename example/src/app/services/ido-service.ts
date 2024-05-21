import { Alert } from 'react-native';
import RNTSIdentityOrchestration, { TSIDOModule } from 'react-native-ts-identity-orchestration';

export type ServiceSuccessCallback = (results: TSIDOModule.ServiceResponse) => void;
export type ServiceErrorCallback = (results: TSIDOModule.ServiceResponse) => void;

class IDOService {

    private idoSDK = RNTSIdentityOrchestration;
    private isInitialized: boolean = false;
    private onJourneyEndSuccess: ServiceSuccessCallback | null = null;
    private onJourneyRejectionError: ServiceErrorCallback | null = null;

    public setupService() {
        try {
            this.idoSDK.initializeSDK();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing IDO service', error);
        }
    }

    public startJourneyWithId = (journeyId: string, onSuccess: ServiceSuccessCallback, onError: ServiceErrorCallback) => {
        if (!this.isInitialized) {
            console.error('IDO service not initialized');
            return;
        }

        this.onJourneyEndSuccess = onSuccess;
        this.onJourneyRejectionError = onError;

        const responseHandler: TSIDOModule.ResponseHandler = {
            success: (results: TSIDOModule.ServiceResponse) => {
                this.handleJourneyActionResponse(results);
            },
            error: (error: TSIDOModule.JourneyErrorType) => {
                this.handleJourneyActionError(error);
            }
        };

        this.idoSDK.setResponseHandler(responseHandler);
        this.idoSDK.startJourney(journeyId);
    }

    private handleJourneyActionResponse = (results: TSIDOModule.ServiceResponse) => {

        console.log(`Handle Journey Action Response: ${JSON.stringify(results)}`);

        switch (results.journeyStepId) {
            case TSIDOModule.JourneyActionType.success: this.onJourneyEndSuccess && this.onJourneyEndSuccess(results); break;
            case TSIDOModule.JourneyActionType.rejection: this.onJourneyRejectionError && this.onJourneyRejectionError(results); break;
            case TSIDOModule.JourneyActionType.information: this.handleInformationStep(results); break;
            case TSIDOModule.JourneyActionType.debugBreak: console.log("debugBreak"); break;
            case TSIDOModule.JourneyActionType.waitForAnotherDevice: console.log("waitForAnotherDevice"); break;
            case TSIDOModule.JourneyActionType.drsTriggerAction: console.log("drsTriggerAction"); break;
            case TSIDOModule.JourneyActionType.identityVerification: console.log("identityVerification"); break;
            case TSIDOModule.JourneyActionType.webAuthnRegistration: console.log("webAuthnRegistration"); break;
            case TSIDOModule.JourneyActionType.registerDeviceAction: console.log("registerDeviceAction"); break;
            case TSIDOModule.JourneyActionType.validateDeviceAction: console.log("validateDeviceAction"); break;
            case TSIDOModule.JourneyActionType.nativeBiometricsRegistration: console.log("nativeBiometricsRegistration"); break;
            case TSIDOModule.JourneyActionType.nativeBiometricsAuthenticaton: console.log("nativeBiometricsAuthenticaton"); break;
            case TSIDOModule.JourneyActionType.emailOTPAuthentication: console.log("emailOTPAuthentication"); break;
            case TSIDOModule.JourneyActionType.smsOTPAuthentication: console.log("smsOTPAuthentication"); break;
            default: console.log("unknown journey step");
        }
    }

    private handleJourneyActionError = (error: TSIDOModule.JourneyErrorType) => {
        console.log("ERROR ACTION")
        console.error(error)
    }

    // Handle Journey Steps

    private handleInformationStep = async (results: TSIDOModule.ServiceResponse) => {
        console.log(results)
        if (!results.data) {
            console.error('Information step has no data');
            return;
        }


        const data = results.data;
        if (!data || results.errorData) {
            this.onJourneyRejectionError && this.onJourneyRejectionError(results);
            return;
        }

        const buttonText = data.button_text;
        const challenge = data.challenge;
        const parameters = data.parameters;
        const text = data.text;
        const title = data.title;

        console.log(`Button text: ${buttonText} Challenge: ${challenge} Parameters: ${parameters} Text: ${text} Title: ${title}`);

        const onContinue = () => {
            this.idoSDK.submitClientResponse(
                TSIDOModule.ClientResponseOptionType.clientInput
            );
        };

        Alert.alert(title, text, [{
            text: buttonText,
            onPress: () => onContinue()
        }]);

        /*
            {
                "client_input": {
                "id": "client_input", 
                "label": "Client Input", 
                "type": "clientInput"}
            }, 
                "data": {"button_text": "OK", "challenge": "9HQMfiXbcfSLmF3SgAejokao", "parameters": [], "text": "Example information text.", "title": "Information", "token": null}, "errorData": null, "journeyStepId": "information", "token": null}
        */
    }
}
export default new IDOService();