import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { TSIDOModule } from 'react-native-ts-identity-orchestration';

interface InformationDialogProps {
  data: {
    title?: string;
    text?: string;
    button_text?: string;
    challenge?: string;
    parameters?: any;
  };
  onContinue: () => void;
}

const InformationDialog: React.FC<InformationDialogProps> = ({ data, onContinue }) => {
  const handleContinue = () => {
    onContinue();
    // Don't hide navigation here as the journey might continue with another screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title || 'Information'}</Text>
          <Text style={styles.subtitle}>{data.text || 'Please review the information below'}</Text>
        </View>

        {data.challenge && (
          <View style={styles.challengeContainer}>
            <Text style={styles.challengeLabel}>Challenge:</Text>
            <Text style={styles.challengeText}>{data.challenge}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>{data.button_text || 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  challengeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 40,
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

export default InformationDialog;
