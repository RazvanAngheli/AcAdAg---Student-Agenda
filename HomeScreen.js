import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.title}>AcadAg - Agenda Studenților</Text>
      </View>

      <ScrollView contentContainerStyle={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Orar')}>
          <Text style={styles.buttonText}>Orar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Examene')}>
          <Text style={styles.buttonText}>Examene</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Agenda')}>
          <Text style={styles.buttonText}>Agendă</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Deadline')}>
          <Text style={styles.buttonText}>Deadline-uri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NotiteMaterii')}>
          <Text style={styles.buttonText}>Notițe materii</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NoteMaterii')}>
          <Text style={styles.buttonText}>Note Materii</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8ecfa', // bleu deschis
  },
  navbar: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0057a3', // albastru strident
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffecb3',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // sau folosește un font custom gen "Trajan Pro"
    lineHeight: 28,
  },
  buttonsContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#9dd4f5',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 40,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#004276',
    width: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#003459',
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
});