import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './app/screens/LoginScreen';
import AuthenticatedUserScreen from './app/screens/AuthenticatedUserScreen';
import idoService from './app/services/ido-service';

const Stack = createStackNavigator();

export const enum AppScreens {
  Login = 'LoginScreen',
  AuthenticatedUserScreen = 'AuthenticatedUserScreen'
}

class App extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.setupIDOService();
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={this.LoginScreenWrapper} options={{ title: 'Login' }} />
          <Stack.Screen name="AuthenticatedUser" component={this.AuthenticatedUserScreenWrapper} options={{ title: 'Authenticated User' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Screens

  LoginScreenWrapper = ({ navigation, route }: any) => (
    <LoginScreen
      navigation={navigation}
    />
  );

  AuthenticatedUserScreenWrapper = ({ navigation, route }: any) => (
    <AuthenticatedUserScreen
      username={route.params.username}
      navigation={navigation}
    />
  );

  // IDO Service

  private setupIDOService = () => {
    // Initialize the IDO service
    idoService.setupService();
  }
}

export default App;
