import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import InputScreen from '../screens/InputScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen'; // 新しく作る設定画面

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
    initialRouteName="履歴"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#6f4e37',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#6f4e37' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === '登録 / 編集') iconName = 'add-circle-outline';
          else if (route.name === '履歴') iconName = 'list-outline';
          else if (route.name === '設定') iconName = 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="登録 / 編集" component={InputScreen} />
      <Tab.Screen name="履歴" component={HistoryScreen} />
      <Tab.Screen name="設定" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
