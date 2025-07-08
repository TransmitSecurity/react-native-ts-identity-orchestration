import React from 'react';
import { Modal, View, StyleSheet, StatusBar } from 'react-native';
import { useIdoNavigation } from './IdoNavigationContext';

const IdoOverlay: React.FC = () => {
  const { state } = useIdoNavigation();

  if (!state.isVisible || !state.currentScreen) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={state.isVisible}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        {state.currentScreen}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default IdoOverlay;
