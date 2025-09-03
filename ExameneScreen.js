import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Keyboard
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

export default function ExameneScreen() {
  const [examene, setExamene] = useState([]);
  const [materie, setMaterie] = useState('');
  const [data, setData] = useState(new Date());
  const [ora, setOra] = useState(new Date());
  const [editId, setEditId] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('examene').then(data => {
      if (data) setExamene(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('examene', JSON.stringify(examene));
  }, [examene]);

  const adaugaSauModifica = () => {
    const dataCompleta = new Date(data);
    dataCompleta.setHours(ora.getHours());
    dataCompleta.setMinutes(ora.getMinutes());

    if (editId) {
      const update = examene.map(e =>
        e.id === editId ? { ...e, materie, data: dataCompleta } : e
      );
      setExamene(update);
    } else {
      const nouExamen = {
        id: Date.now().toString(),
        materie,
        data: dataCompleta
      };
      setExamene(prev => [...prev, nouExamen]);
      programeazaNotificare(dataCompleta, materie);
    }

    setMaterie('');
    setData(new Date());
    setOra(new Date());
    setEditId(null);
    Keyboard.dismiss(); // închide tastatura
  };

  const editeaza = (ex) => {
    setMaterie(ex.materie);
    setData(new Date(ex.data));
    setOra(new Date(ex.data));
    setEditId(ex.id);
  };

  const sterge = (id) => {
    setExamene(prev => prev.filter(e => e.id !== id));
  };

  const programeazaNotificare = async (oraExamen, materieExamen) => {
    if (!Device.isDevice) return;
    const permis = await Notifications.getPermissionsAsync();
    if (!permis.granted) {
      await Notifications.requestPermissionsAsync();
    }

    const twoHoursBefore = new Date(oraExamen.getTime() - 2 * 60 * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Examenul se apropie!',
        body: `Ai examen la ${materieExamen} în 2 ore.`,
        sound: true,
      },
      trigger: twoHoursBefore,
    });
  };

  const exameneSortate = [...examene].sort((a, b) =>
    new Date(a.data) - new Date(b.data)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titlu}>EXAMENE</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Materie"
          value={materie}
          onChangeText={setMaterie}
        />

        <TouchableOpacity onPress={() => setShowDate(true)} style={styles.btn}>
          <Text style={styles.btnText}>Alege data</Text>
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowDate(false);
                if (selectedDate) setData(selectedDate);
              } else {
                if (selectedDate) setData(selectedDate);
              }
            }}
          />
        )}

        <TouchableOpacity onPress={() => setShowTime(true)} style={styles.btn}>
          <Text style={styles.btnText}>Alege ora</Text>
        </TouchableOpacity>
        {showTime && (
          <DateTimePicker
            value={ora}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowTime(false);
                if (selectedDate) setOra(selectedDate);
              } else {
                if (selectedDate) setOra(selectedDate);
              }
            }}
          />
        )}

        <TouchableOpacity onPress={adaugaSauModifica} style={styles.saveBtn}>
          <Text style={styles.btnText}>{editId ? 'Salvează modificarea' : 'Adaugă Examen'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.lista}>
        {exameneSortate.map((ex) => (
          <View key={ex.id} style={styles.examBox}>
            <View>
              <Text style={styles.materie}>{ex.materie}</Text>
              <Text style={styles.data}>
                {new Date(ex.data).toLocaleDateString('ro-RO')} - {new Date(ex.data).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.butoaneActiune}>
              <TouchableOpacity onPress={() => editeaza(ex)} style={styles.editBtn}>
                <Text style={styles.actText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sterge(ex.id)} style={styles.deleteBtn}>
                <Text style={styles.actText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, backgroundColor: '#f4f7ff' },
  titlu: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#2f3e9e' },
  form: { marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 10, borderColor: '#ccc', borderWidth: 1 },
  btn: { backgroundColor: '#4b6fff', padding: 10, borderRadius: 10, marginBottom: 10 },
  btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  saveBtn: { backgroundColor: 'green', padding: 12, borderRadius: 12, marginTop: 10 },
  lista: { flex: 1 },
  examBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#e6edff', padding: 15, borderRadius: 10, marginBottom: 10 },
  materie: { fontSize: 16, fontWeight: '600' },
  data: { color: '#555' },
  butoaneActiune: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { marginRight: 10, backgroundColor: '#ffaa00', padding: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: 'red', padding: 6, borderRadius: 6 },
  actText: { color: 'white', fontWeight: 'bold' },
});