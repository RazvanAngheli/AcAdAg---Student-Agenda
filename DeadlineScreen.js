import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function DeadlineScreen() {
  const [deadlineuri, setDeadlineuri] = useState([]);
  const [titlu, setTitlu] = useState('');
  const [descriere, setDescriere] = useState('');
  const [prioritate, setPrioritate] = useState('mediu');
  const [dataLimita, setDataLimita] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('deadlineuri').then(data => {
      if (data) setDeadlineuri(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('deadlineuri', JSON.stringify(deadlineuri));
  }, [deadlineuri]);

  const salveazaDeadline = async () => {
    const complet = {
      id: editId || Date.now().toString(),
      titlu,
      descriere,
      prioritate,
      dataLimita,
    };

    if (editId) {
      setDeadlineuri(prev => prev.map(d => d.id === editId ? complet : d));
    } else {
      setDeadlineuri(prev => [...prev, complet]);
      await programeazaNotificare(dataLimita, titlu);
    }

    setTitlu('');
    setDescriere('');
    setPrioritate('mediu');
    setDataLimita(new Date());
    setEditId(null);
    Keyboard.dismiss();
  };

  const editeaza = (item) => {
    setTitlu(item.titlu);
    setDescriere(item.descriere);
    setPrioritate(item.prioritate);
    setDataLimita(new Date(item.dataLimita));
    setEditId(item.id);
  };

  const sterge = (id) => {
    setDeadlineuri(prev => prev.filter(d => d.id !== id));
  };

  const programeazaNotificare = async (data, titluProiect) => {
    if (!Device.isDevice) return;

    const permis = await Notifications.getPermissionsAsync();
    if (!permis.granted) {
      await Notifications.requestPermissionsAsync();
    }

    const oZiInainte = new Date(data.getTime() - 24 * 60 * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Deadline se apropie!',
        body: `Proiectul „${titluProiect}” are termen mâine.`,
        sound: true,
      },
      trigger: oZiInainte,
    });
  };

  const sortate = [...deadlineuri].sort((a, b) =>
    new Date(a.dataLimita) - new Date(b.dataLimita)
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.titlu}>DEADLINE-URI</Text>

          <TextInput
            style={styles.input}
            placeholder="Titlu proiect / temă"
            value={titlu}
            onChangeText={setTitlu}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descriere (opțional)"
            value={descriere}
            onChangeText={setDescriere}
            multiline
          />

          <View style={styles.prioritati}>
            {['scăzut', 'mediu', 'ridicat'].map((nivel) => (
              <TouchableOpacity
                key={nivel}
                onPress={() => setPrioritate(nivel)}
                style={[
                  styles.btnPrioritate,
                  prioritate === nivel && styles.selectat
                ]}
              >
                <Text style={styles.btnText}>{nivel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setShowDate(true)} style={styles.btn}>
            <Text style={styles.btnText}>Selectează data</Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={dataLimita}
              mode="date"
              display="default"
              onChange={(e, val) => {
                if (Platform.OS === 'android') setShowDate(false);
                if (val) setDataLimita(val);
              }}
            />
          )}

          <TouchableOpacity onPress={() => setShowTime(true)} style={styles.btn}>
            <Text style={styles.btnText}>Selectează ora</Text>
          </TouchableOpacity>
          {showTime && (
            <DateTimePicker
              value={dataLimita}
              mode="time"
              display="default"
              onChange={(e, val) => {
                if (Platform.OS === 'android') setShowTime(false);
                if (val) {
                  const nouaData = new Date(dataLimita);
                  nouaData.setHours(val.getHours());
                  nouaData.setMinutes(val.getMinutes());
                  setDataLimita(nouaData);
                }
              }}
            />
          )}

          <TouchableOpacity onPress={salveazaDeadline} style={styles.saveBtn}>
            <Text style={styles.btnText}>{editId ? 'Salvează' : 'Adaugă'}</Text>
          </TouchableOpacity>

          {sortate.map(d => {
            let bgColor = '#fff';
            if (d.prioritate === 'ridicat') bgColor = '#ffcdd2';
            else if (d.prioritate === 'mediu') bgColor = '#fff9c4';
            else if (d.prioritate === 'scăzut') bgColor = '#c8e6c9';

            return (
              <View key={d.id} style={[styles.card, { backgroundColor: bgColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitlu}>{d.titlu}</Text>
                  {d.descriere ? <Text style={styles.cardDescriere}>{d.descriere}</Text> : null}
                  <Text style={styles.cardData}>
                    {new Date(d.dataLimita).toLocaleDateString('ro-RO')} {new Date(d.dataLimita).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.cardPrioritate}>Prioritate: {d.prioritate}</Text>
                </View>
                <View style={styles.actiuni}>
                <TouchableOpacity onPress={() => editeaza(d)} style={styles.editBtn}>
  <Text style={styles.iconText}>✎ Edit</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => sterge(d.id)} style={styles.deleteBtn}>
  <Text style={styles.iconText}>🗑️ Șterge</Text>
</TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef4ff', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titlu: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#2e3c92' },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc' },
  btn: { backgroundColor: '#4b6fff', padding: 10, borderRadius: 10, marginBottom: 10 },
  btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  saveBtn: { backgroundColor: 'green', padding: 12, borderRadius: 12, marginVertical: 10 },
  prioritati: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  btnPrioritate: { padding: 10, borderRadius: 8, backgroundColor: '#db7093', flex: 1, marginHorizontal: 5 },
  selectat: { backgroundColor: '#fdd835' },
  card: { padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row' },
  cardTitlu: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDescriere: { color: '#444', marginBottom: 4 },
  cardData: { color: '#555' },
  cardPrioritate: { fontStyle: 'italic', color: '#444', marginTop: 5 },
  actiuni: { justifyContent: 'center', alignItems: 'center' },
  editBtn: {
    marginVertical: 4,
    padding: 5,
    backgroundColor: '#66cdaa',
    borderRadius: 8,
  },
  deleteBtn: {
    marginVertical: 4,
    padding: 5,
    backgroundColor: '#ff6347',
    borderRadius: 8,
  },
  iconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
});