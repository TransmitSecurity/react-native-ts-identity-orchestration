import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Hello, {username}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Authenticated</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={this.handleStartJourney}>
              <Text style={styles.primaryButtonText}>Start Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 0,
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
});

export default AuthenticatedUserScreen;
