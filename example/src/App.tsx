import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './app/screens/LoginScreen';
import AuthenticatedUserScreen from './app/screens/AuthenticatedUserScreen';

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

  componentDidMount() {

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

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
