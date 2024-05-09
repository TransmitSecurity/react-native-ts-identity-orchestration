import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { type StackNavigationProp } from '@react-navigation/stack';
import idoService from '../services/ido-service';

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
        this.props.navigation.navigate('AuthenticatedUser', { username: this.state.username });
    };

    componentDidMount(): void {
        // Initialize the IDO service
        idoService.setupService();
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Welcome, please log in to your account</Text>
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
        alignItems: 'flex-start',
        justifyContent: 'center',
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
