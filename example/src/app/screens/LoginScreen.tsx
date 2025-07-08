import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, SafeAreaView } from 'react-native';
import { type StackNavigationProp } from '@react-navigation/stack';
import idoService from '../services/ido-service';
import config from '../config';
import type { TSIDOModule } from 'react-native-ts-identity-orchestration';

interface LoginScreenProps {
    navigation: StackNavigationProp<any,any>;
}

interface LoginScreenState {
    username: string
}

class LoginScreen extends React.Component<LoginScreenProps, LoginScreenState> {
    constructor(props: LoginScreenProps) {
        super(props);
        this.state = {
            username: ''
        };
    }

    private handleUsernameChange = (username: string) => {
        this.setState({ username });
    };

    private handleSubmit = () => {
        if (!this.state.username || this.state.username.length === 0) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }
        idoService.startJourneyWithId(
            config.exampleJourneyId, 
            this.handleJourneySuccess, 
            this.handleJourneyRejection
        );
    };

    private navigateToAuthenticatedUserScreen = () => {
        this.props.navigation.navigate('AuthenticatedUser', { username: this.state.username });
    }

    private handleJourneySuccess = (results: TSIDOModule.ServiceResponse) => {
        console.log('Journey completed with success', results);
        if (results.token) {
            this.navigateToAuthenticatedUserScreen();
        }
    }

    private handleJourneyRejection = (results: TSIDOModule.ServiceResponse) => {
        console.error('Error during journey', results);
    }

    private handleGenerateDebugPin = async () => {
        const debugPin = await idoService.generateDebugPin();
        if (debugPin) {
            Alert.alert('Debug PIN', debugPin);
        } else {
            Alert.alert('Error', 'Error generating debug pin');
        }
    }

    private handleStartMobileApproveJourney = () => {
        console.log('Start Mobile Approve Journey button clicked');
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Please log in to your account</Text>
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username"
                            placeholderTextColor="#8e8e93"
                            value={this.state.username}
                            onChangeText={this.handleUsernameChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={this.handleSubmit}>
                            <Text style={styles.primaryButtonText}>Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={this.handleStartMobileApproveJourney}>
                            <Text style={styles.secondaryButtonText}>Start Mobile Approve Journey</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.debugButton} onPress={this.handleGenerateDebugPin}>
                            <Text style={styles.debugButtonText}>Generate Debug PIN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: 'flex-start',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#343a40',
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonContainer: {
        gap: 16,
    },
    primaryButton: {
        height: 56,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        height: 56,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    debugButton: {
        height: 48,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#6c757d',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    debugButtonText: {
        color: '#6c757d',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default LoginScreen;
