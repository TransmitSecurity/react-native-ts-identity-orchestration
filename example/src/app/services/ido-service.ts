import { Alert } from 'react-native';
import RNTSIdentityOrchestration, { TSIDOModule } from 'react-native-ts-identity-orchestration';

export type ServiceSuccessCallback = (results: TSIDOModule.ServiceResponse) => void;
export type ServiceErrorCallback = (results: TSIDOModule.ServiceResponse) => void;

// Navigation callbacks for IDO screens
export type ShowScreenCallback = (screen: React.ReactNode, data?: TSIDOModule.ServiceResponse) => void;
export type HideNavigationCallback = () => void;

class IDOService {

    private idoSDK = RNTSIdentityOrchestration;
    private isInitialized: boolean = false;
    private useEncryptedModeFull: boolean = false;
    private onJourneyEndSuccess: ServiceSuccessCallback | null = null;
    private onJourneyRejectionError: ServiceErrorCallback | null = null;
    
    // Navigation callbacks
    private showScreen: ShowScreenCallback | null = null;
    private hideNavigation: HideNavigationCallback | null = null;

    public setupService() {
        try {
            this.idoSDK.initializeSDK();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing IDO service', error);
        }
    }

    public setNavigationCallbacks(showScreen: ShowScreenCallback, hideNavigation: HideNavigationCallback) {
        this.showScreen = showScreen;
        this.hideNavigation = hideNavigation;
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
                console.error('Journey action error:', error);
                this.handleJourneyActionError(error);
            }
        };

        this.idoSDK.setResponseHandler(responseHandler);
        this.idoSDK.startJourney(journeyId, { encrypted: this.useEncryptedModeFull });
    }

    public startMobileApproveJourney = (onSuccess: ServiceSuccessCallback, onError: ServiceErrorCallback) => {
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
                console.error('Mobile approve journey error:', error);
                this.handleJourneyActionError(error);
            }
        };

        // The approvalData is sent by the server and should be replaced with actual data
        const approvalData: { [key: string]: string } = {
            "requestId": "example_value"
        };

        this.idoSDK.setResponseHandler(responseHandler);
        this.idoSDK.startMobileApproveJourney(approvalData, { encrypted: this.useEncryptedModeFull });
    }

    public generateDebugPin = async (): Promise<string | null> => {
        return await this.idoSDK.generateDebugPin();
    }

    private handleJourneyActionResponse = (results: TSIDOModule.ServiceResponse) => {

        console.log(`Handle Journey Action Response: ${JSON.stringify(results)}`);

        switch (results.journeyStepId) {
            case TSIDOModule.JourneyActionType.success: 
                this.hideNavigation && this.hideNavigation();
                this.onJourneyEndSuccess && this.onJourneyEndSuccess(results); 
                break;
            case TSIDOModule.JourneyActionType.rejection: 
                this.hideNavigation && this.hideNavigation();
                this.onJourneyRejectionError && this.onJourneyRejectionError(results); 
                break;
            case TSIDOModule.JourneyActionType.information: this.handleInformationStep(results); break;
            case TSIDOModule.JourneyActionType.debugBreak: this.handleDebugBreakStep(results); break;
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
        if (error) {
            console.error(error);
        }
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

        // Use the new navigation system if available, otherwise fallback to Alert
        if (this.showScreen) {
            // Dynamic import to avoid circular dependencies
            const InformationDialog = require('../ido/screens/InformationDialog').default;
            const React = require('react');
            
            const screen = React.createElement(InformationDialog, {
                data: {
                    title,
                    text,
                    button_text: buttonText,
                    challenge,
                    parameters
                },
                onContinue
            });
            
            this.showScreen(screen, results);
        } else {
            // Fallback to Alert for backward compatibility
            Alert.alert(title, text, [{
                text: buttonText,
                onPress: () => onContinue()
            }]);
        }
    }

    private handleDebugBreakStep = async (results: TSIDOModule.ServiceResponse) => {
        console.log('Debug break step:', results);

        const onContinue = () => {
            this.idoSDK.submitClientResponse(
                TSIDOModule.ClientResponseOptionType.clientInput
            );
        };

        // Use the new navigation system if available, otherwise fallback to Alert
        if (this.showScreen) {
            const DebugBreakDialog = require('../ido/screens/DebugBreakDialog').default;
            const React = require('react');
            
            const screen = React.createElement(DebugBreakDialog, {
                data: results.data,
                onContinue
            });
            
            this.showScreen(screen, results);
        } else {
            // Fallback to Alert for backward compatibility
            Alert.alert('Debug Break', 'Journey paused for debugging', [{
                text: 'Continue',
                onPress: () => onContinue()
            }]);
        }
    }
}
export default new IDOService();