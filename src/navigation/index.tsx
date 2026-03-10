import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@store/authStore';
import { palette, typography } from '@theme/index';

// ─── Screen Imports ───────────────────────────────────────────────────────────
import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/Auth/ForgotPasswordScreen';
import DiscoverScreen from '@screens/Discover/DiscoverScreen';
import StreamViewScreen from '@screens/Stream/StreamViewScreen';
import StreamBroadcastScreen from '@screens/Stream/StreamBroadcastScreen';
import RoomListScreen from '@screens/Room/RoomListScreen';
import RoomViewScreen from '@screens/Room/RoomViewScreen';
import RoomCreateScreen from '@screens/Room/RoomCreateScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import CoinShopScreen from '@screens/Profile/CoinShopScreen';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  DiscoverStackParamList,
  RoomStackParamList,
  ProfileStackParamList,
} from '@appTypes/index';

// ─── Stacks ───────────────────────────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();
const RoomStack = createNativeStackNavigator<RoomStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// ─── Auth Navigator ───────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Discover Stack ───────────────────────────────────────────────────────────
function DiscoverNavigator() {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="DiscoverHome" component={DiscoverScreen} />
      <DiscoverStack.Screen
        name="StreamView"
        component={StreamViewScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </DiscoverStack.Navigator>
  );
}

// ─── Room Stack ───────────────────────────────────────────────────────────────
function RoomNavigator() {
  return (
    <RoomStack.Navigator screenOptions={{ headerShown: false }}>
      <RoomStack.Screen name="RoomList" component={RoomListScreen} />
      <RoomStack.Screen name="RoomCreate" component={RoomCreateScreen} />
      <RoomStack.Screen
        name="RoomView"
        component={RoomViewScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </RoomStack.Navigator>
  );
}

// ─── Profile Stack ────────────────────────────────────────────────────────────
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="CoinShop" component={CoinShopScreen} />
      <ProfileStack.Screen
        name="StreamBroadcast"
        component={StreamBroadcastScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </ProfileStack.Navigator>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const tabs = [
    { name: 'Discover', label: 'Keşfet', icon: '🔥' },
    { name: 'Room', label: 'Özel Oda', icon: '🔒' },
    { name: 'Profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainNavigator() {
  return (
    <MainTab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <MainTab.Screen name="Discover" component={DiscoverNavigator} />
      <MainTab.Screen name="Room" component={RoomNavigator} />
      <MainTab.Screen name="Profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { isLoggedIn } = useAuthStore();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.dark2,
    borderTopWidth: 1,
    borderTopColor: palette.dark4,
    paddingBottom: 24,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: typography.xs,
    color: palette.grey1,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 3,
    backgroundColor: palette.primary,
    borderRadius: 2,
  },
});
