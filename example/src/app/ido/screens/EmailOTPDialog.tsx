import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

interface EmailOTPDialogProps {
  data: {
    title?: string;
    text?: string;
    button_text?: string;
    email?: string;
  };
  onSubmitOTP: (otp: string) => void;
}

const EmailOTPDialog: React.FC<EmailOTPDialogProps> = ({ data, onSubmitOTP }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = () => {
    if (otp.trim()) {
      onSubmitOTP(otp.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 50}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{data.title || 'Email Verification'}</Text>
              <Text style={styles.subtitle}>
                {data.text || 'Please enter the verification code sent to your email'}
              </Text>
              {data.email && (
                <Text style={styles.emailText}>{data.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#8e8e93"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.primaryButton, !otp.trim() && styles.disabledButton]} 
                onPress={handleSubmit}
                disabled={!otp.trim()}
              >
                <Text style={[styles.primaryButtonText, !otp.trim() && styles.disabledButtonText]}>
                  {data.button_text || 'Verify Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    justifyContent: 'flex-start',
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
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
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
    paddingBottom: 60,
    marginTop: 20,
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
  disabledButton: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#6c757d',
  },
});

export default EmailOTPDialog;
