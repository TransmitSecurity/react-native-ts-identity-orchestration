import React from 'react';
import { View } from 'react-native';
import FloatingDebugButton from './ido/FloatingDebugButton';

interface GlobalFloatingDebugButtonProps {
  show?: boolean;
}

const GlobalFloatingDebugButton: React.FC<GlobalFloatingDebugButtonProps> = ({ show = true }) => {
  if (!show) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'box-none',
      zIndex: 999,
    }}>
      <FloatingDebugButton />
    </View>
  );
};

export default GlobalFloatingDebugButton;
