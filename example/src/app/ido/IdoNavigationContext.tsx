import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TSIDOModule } from 'react-native-ts-identity-orchestration';

export interface IdoNavigationState {
  isVisible: boolean;
  currentScreen: ReactNode | null;
  journeyData: TSIDOModule.ServiceResponse | null;
}

interface IdoNavigationContextType {
  state: IdoNavigationState;
  showScreen: (screen: ReactNode, data?: TSIDOModule.ServiceResponse) => void;
  hideNavigation: () => void;
  updateJourneyData: (data: TSIDOModule.ServiceResponse) => void;
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
  });

  const showScreen = (screen: ReactNode, data?: TSIDOModule.ServiceResponse) => {
    setState({
      isVisible: true,
      currentScreen: screen,
      journeyData: data || null,
    });
  };

  const hideNavigation = () => {
    setState({
      isVisible: false,
      currentScreen: null,
      journeyData: null,
    });
  };

  const updateJourneyData = (data: TSIDOModule.ServiceResponse) => {
    setState(prev => ({
      ...prev,
      journeyData: data,
    }));
  };

  return (
    <IdoNavigationContext.Provider value={{ state, showScreen, hideNavigation, updateJourneyData }}>
      {children}
    </IdoNavigationContext.Provider>
  );
};
