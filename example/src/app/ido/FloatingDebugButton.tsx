import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import idoService from '../services/ido-service';

const FloatingDebugButton: React.FC = () => {
  const handleGenerateDebugPin = async () => {
    try {
      const debugPin = await idoService.generateDebugPin();
      if (debugPin) {
        Alert.alert(
          'Debug PIN',
          debugPin,
          [
            {
              text: 'Copy to Clipboard',
              onPress: () => {
                // For now, just show another alert with the PIN
                // You can implement clipboard functionality later with @react-native-clipboard/clipboard
                Alert.alert('Debug PIN', `PIN: ${debugPin}\n\nManually copy this PIN if needed.`);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Error generating debug pin');
      }
    } catch (error) {
      Alert.alert('Error', 'Error generating debug pin');
    }
  };

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={handleGenerateDebugPin}>
      <Text style={styles.buttonText}>🐛</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 24,
    textAlign: 'center',
  },
});

export default FloatingDebugButton;
