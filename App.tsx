import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerGlobals } from '@livekit/react-native';
import { useAuthStore } from '@store/authStore';
import RootNavigator from '@navigation/index';
import { palette } from '@theme/index';

// LiveKit WebRTC global'lerini kaydet — en üstte çağrılmalı
registerGlobals();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="light-content" backgroundColor={palette.dark1} />
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
