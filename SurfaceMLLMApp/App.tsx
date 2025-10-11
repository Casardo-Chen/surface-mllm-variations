import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import GenerateScreen from './src/screens/GenerateScreen';
import ExamplesScreen from './src/screens/ExamplesScreen';
import { theme } from './src/styles/theme';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              if (route.name === 'Generate') {
                iconName = 'add-circle';
              } else if (route.name === 'Examples') {
                iconName = 'collections';
              } else {
                iconName = 'help';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1976d2',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#ffffff',
              elevation: 4,
              shadowOpacity: 0.1,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="Generate" 
            component={GenerateScreen}
            options={{ title: 'Generate Analysis' }}
          />
          <Tab.Screen 
            name="Examples" 
            component={ExamplesScreen}
            options={{ title: 'Load Examples' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;