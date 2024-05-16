import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
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
            username: 'shachar@transmitsecurity.com'
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

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.titleLabel}>Welcome, please log in to your account</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={this.state.username}
                    onChangeText={this.handleUsernameChange}
                />
                <Button title="Submit" onPress={this.handleSubmit} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleLabel: {
        fontSize: 24,
        padding: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default LoginScreen;
