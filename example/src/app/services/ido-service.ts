import RNTSIdentityOrchestration from 'react-native-ts-identity-orchestration';

class IDOService {

    private idoSDK = RNTSIdentityOrchestration;
    private isInitialized: boolean = false;

    public setupService() {
        try {
            this.idoSDK.initializeSDK();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing IDO service', error);
        }
        
    }
}
export default new IDOService();