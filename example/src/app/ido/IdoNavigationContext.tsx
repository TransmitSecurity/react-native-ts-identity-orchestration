import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TSIDOModule } from 'react-native-ts-identity-orchestration';

export interface IdoNavigationState {
  isVisible: boolean;
  currentScreen: ReactNode | null;
  journeyData: TSIDOModule.ServiceResponse | null;
  showDebugButton: boolean;
}

interface IdoNavigationContextType {
  state: IdoNavigationState;
  showScreen: (screen: ReactNode, data?: TSIDOModule.ServiceResponse) => void;
  hideNavigation: () => void;
  updateJourneyData: (data: TSIDOModule.ServiceResponse) => void;
  setDebugButtonVisibility: (visible: boolean) => void;
}

const IdoNavigationContext = createContext<IdoNavigationContextType | undefined>(undefined);

export const useIdoNavigation = () => {
  const context = useContext(IdoNavigationContext);
  if (!context) {
    throw new Error('useIdoNavigation must be used within IdoNavigationProvider');
  }
  return context;
};

interface IdoNavigationProviderProps {
  children: ReactNode;
}

export const IdoNavigationProvider: React.FC<IdoNavigationProviderProps> = ({ children }) => {
  const [state, setState] = useState<IdoNavigationState>({
    isVisible: false,
    currentScreen: null,
    journeyData: null,
    showDebugButton: false, // Default to false - only show in authentication screens
  });

  const showScreen = (screen: ReactNode, data?: TSIDOModule.ServiceResponse) => {
    setState({
      isVisible: true,
      currentScreen: screen,
      journeyData: data || null,
      showDebugButton: true, // Always show debug button for authentication screens
    });
  };

  const hideNavigation = () => {
    setState({
      isVisible: false,
      currentScreen: null,
      journeyData: null,
      showDebugButton: false, // Hide debug button when navigation is hidden
    });
  };

  const updateJourneyData = (data: TSIDOModule.ServiceResponse) => {
    setState(prev => ({
      ...prev,
      journeyData: data,
    }));
  };

  const setDebugButtonVisibility = (visible: boolean) => {
    setState(prev => ({
      ...prev,
      showDebugButton: visible,
    }));
  };

  return (
    <IdoNavigationContext.Provider value={{ state, showScreen, hideNavigation, updateJourneyData, setDebugButtonVisibility }}>
      {children}
    </IdoNavigationContext.Provider>
  );
};
