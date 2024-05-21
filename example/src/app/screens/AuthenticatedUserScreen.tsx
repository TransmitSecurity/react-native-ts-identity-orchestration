import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { type StackNavigationProp } from '@react-navigation/stack';

interface AuthenticatedUserProps {
    username: string
    navigation: StackNavigationProp<any,any>;
}

interface AuthenticatedUserState {
    
}

class AuthenticatedUserScreen extends React.Component<AuthenticatedUserProps, AuthenticatedUserState> {
  render() {
    const { username } = this.props;

    return (
      <View style={styles.container}>
        <Text>Welcome {username}</Text>
        <Button title="Start Journey" onPress={this.handleStartJourney} />
      </View>
    );
  }

  handleStartJourney = () => {
    // Handle start journey logic here
    console.log('Starting journey...');
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthenticatedUserScreen;
