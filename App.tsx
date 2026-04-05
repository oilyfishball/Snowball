import { StyleSheet, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import { TABS } from './constants/tabs';
import { TabBar } from './components/TabBar';
import { TabContent } from './components/TabContent';
import { useSwipe } from './hooks/Useswipe';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { CreatePost } from './components/CreatePost';
import { Feed } from './components/Feed';
import { supabase } from './lib/supabase';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const swipeHandlers = useSwipe({
    activeTab,
    tabCount: TABS.length,
    onSwipe: setActiveTab,
  });

  return (
    <View style={styles.container}>
      {activeTab === 0 ? (
        <Feed />
      ) : (
        <CreatePost />
      )}
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onLogout={() => {
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); } },
            ]
          );
        }}
      />
      <StatusBar style="light" />
    </View>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Verify the user still exists on the server
        supabase.auth.getUser().then(({ error }) => {
          if (error) {
            supabase.auth.signOut();
          } else {
            setSession(session);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20', // Classic Charcoal background
  },
});