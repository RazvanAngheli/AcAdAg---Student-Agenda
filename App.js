// App.js
import React from 'react';
import Navigation from './Navigation';
import { useFonts } from 'expo-font';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Poppins_500Medium } from '@expo-google-fonts/poppins';


export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Poppins_500Medium,
  });

  if (!fontsLoaded) {
    return null; // sau un spinner dacă vrei
  }

  return <Navigation />;
}