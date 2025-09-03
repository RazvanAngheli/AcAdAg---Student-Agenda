// Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import OrarScreen from './screens/OrarScreen';
import ExameneScreen from './screens/ExameneScreen';
import AgendaScreen from './screens/AgendaScreen';
import DeadlineScreen from './screens/DeadlineScreen';
import NotiteMateriiScreen from './screens/NotiteMateriiScreen';
import NoteMateriiScreen from './screens/NoteMateriiScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} //  ascunde bara albă de sus
        />
        <Stack.Screen name="Orar" component={OrarScreen} />
        <Stack.Screen name="Examene" component={ExameneScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Deadline" component={DeadlineScreen} />
        <Stack.Screen name="NotiteMaterii" component={NotiteMateriiScreen} />
        <Stack.Screen name="NoteMaterii" component={NoteMateriiScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}