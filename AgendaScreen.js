import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgendaScreen() {
  const [notite, setNotite] = useState([]);
  const [text, setText] = useState('');
  const [important, setImportant] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('notite').then(data => {
      if (data) setNotite(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('notite', JSON.stringify(notite));
  }, [notite]);

  const adaugaSauModifica = () => {
    if (!text.trim()) return;

    const nouaNotita = {
      id: editId || Date.now().toString(),
      text,
      important,
    };

    if (editId) {
      setNotite(prev => prev.map(n => (n.id === editId ? nouaNotita : n)));
    } else {
      setNotite(prev => [...prev, nouaNotita]);
    }

    setText('');
    setImportant(false);
    setEditId(null);
    Keyboard.dismiss(); // ascunde tastatura
  };

  const editeaza = (notita) => {
    setText(notita.text);
    setImportant(notita.important);
    setEditId(notita.id);
  };

  const sterge = (id) => {
    setNotite(prev => prev.filter(n => n.id !== id));
  };

  const toggleImportant = (id) => {
    setNotite(prev =>
      prev.map(n =>
        n.id === id ? { ...n, important: !n.important } : n
      )
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.titlu}>AGENDĂ</Text>

        <TextInput
          style={styles.inputText}
          placeholder="Scrie ceva..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setImportant(!important)}
            style={[
              styles.btn, { backgroundColor: important ? '#ffd700' : '#ccc' }
            ]}
          >
            <Text style={styles.btnText}>⭐ Important</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={adaugaSauModifica} style={styles.saveBtn}>
            <Text style={styles.btnText}>{editId ? 'Salvează' : 'Adaugă'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.lista}>
          {notite.map((n) => (
            <View
              key={n.id}
              style={[
                styles.notita,
                { backgroundColor: n.important ? '#fff9c4' : '#c8e6c9' }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{n.text}</Text>
                {n.important && <Text style={styles.important}>⭐</Text>}
              </View>
              <View style={styles.butoane}>
                <TouchableOpacity onPress={() => toggleImportant(n.id)} style={styles.starBtn}>
                  <Text style={styles.icon}>⭐ Important</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => editeaza(n)} style={styles.editBtn}>
                  <Text style={styles.icon}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sterge(n.id)} style={styles.deleteBtn}>
                  <Text style={styles.icon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, backgroundColor: '#f0f4ff' },
  titlu: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#2e3c92' },

  inputText: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    height: 200,
  },

  btn: { padding: 10, borderRadius: 10, marginRight: 10 },
  saveBtn: { backgroundColor: 'green', padding: 10, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  lista: { marginTop: 10 },
  notita: { padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 16 },
  important: { color: '#d4af37', fontSize: 16, fontWeight: 'bold', marginTop: 5 },

  butoane: { flexDirection: 'row' },
  icon: { fontSize: 18, marginHorizontal: 5 },
  editBtn: { padding: 6, marginHorizontal: 2 },
  deleteBtn: { padding: 6, marginHorizontal: 2 },
  starBtn: { padding: 6, marginHorizontal: 2 },
});