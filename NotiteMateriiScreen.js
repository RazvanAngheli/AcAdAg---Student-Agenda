import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotiteMateriiScreen() {
  const [materii, setMaterii] = useState([]);
  const [materieNoua, setMaterieNoua] = useState('');
  const [materieSelectata, setMaterieSelectata] = useState(null);
  const [notite, setNotite] = useState([]);
  const [titlu, setTitlu] = useState('');
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const incarca = async () => {
      const m = await AsyncStorage.getItem('materii');
      if (m) setMaterii(JSON.parse(m));
    };
    incarca();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('materii', JSON.stringify(materii));
  }, [materii]);

  useEffect(() => {
    if (materieSelectata) {
      AsyncStorage.getItem(`notite_${materieSelectata}`).then(data => {
        if (data) setNotite(JSON.parse(data));
      });
    }
  }, [materieSelectata]);

  useEffect(() => {
    if (materieSelectata) {
      AsyncStorage.setItem(`notite_${materieSelectata}`, JSON.stringify(notite));
    }
  }, [notite]);

  const adaugaMaterie = () => {
    if (materieNoua.trim()) {
      setMaterii([...materii, materieNoua.trim()]);
      setMaterieNoua('');
    }
  };

  const stergeMaterie = () => {
    if (!materieSelectata) return;

    setMaterii(prev => prev.filter(m => m !== materieSelectata));
    AsyncStorage.removeItem(`notite_${materieSelectata}`);
    setMaterieSelectata(null);
    setNotite([]);
  };

  const adaugaSauModificaNotita = () => {
    if (!text.trim()) return;

    if (editId) {
      const update = notite.map(n =>
        n.id === editId ? { ...n, titlu, text } : n
      );
      setNotite(update);
    } else {
      const noua = {
        id: Date.now().toString(),
        titlu,
        text
      };
      setNotite([...notite, noua]);
    }

    setTitlu('');
    setText('');
    setEditId(null);
    Keyboard.dismiss();
  };

  const editeaza = (notita) => {
    setTitlu(notita.titlu);
    setText(notita.text);
    setEditId(notita.id);
  };

  const stergeNotita = (id) => {
    setNotite(prev => prev.filter(n => n.id !== id));
  };

  return (
    <View style={styles.container}>
      {!materieSelectata ? (
        <>
          <Text style={styles.titlu}>NOTIȚE PE MATERII</Text>
          <View style={styles.form}>
            <TextInput
              value={materieNoua}
              onChangeText={setMaterieNoua}
              placeholder="Adaugă materie nouă"
              style={styles.input}
            />
            <TouchableOpacity onPress={adaugaMaterie} style={styles.btn}>
              <Text style={styles.btnText}>Adaugă Materie</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {materii.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMaterieSelectata(m)}
                style={styles.materieBox}
              >
                <Text style={styles.materieText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <View style={styles.headerRand}>
            <Text style={styles.titlu}>{materieSelectata}</Text>
            <TouchableOpacity onPress={stergeMaterie} style={styles.deleteBtn}>
              <Text style={styles.btnText}>Șterge materia</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={titlu}
            onChangeText={setTitlu}
            placeholder="Titlu notiță"
            style={styles.input}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Scrie notița aici"
            style={[styles.input, styles.textarea]}
            multiline
          />
          <TouchableOpacity
            onPress={adaugaSauModificaNotita}
            style={[styles.btn, { marginTop: 20 }]}
          >
            <Text style={styles.btnText}>
              {editId ? 'Salvează Modificarea' : 'Salvează Notița'}
            </Text>
          </TouchableOpacity>

          <ScrollView style={{ marginTop: 30 }}>
            {notite.map((n) => (
              <View key={n.id} style={styles.notitaBox}>
                <Text style={styles.titluNotita}>{n.titlu}</Text>
                <Text style={styles.textNotita}>{n.text}</Text>
                <View style={styles.butoane}>
                  <TouchableOpacity onPress={() => editeaza(n)} style={styles.editBtn}>
                    <Text style={styles.btnText}>Editează</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => stergeNotita(n.id)} style={styles.deleteBtn}>
                    <Text style={styles.btnText}>Șterge</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => setMaterieSelectata(null)} style={styles.backBtn}>
            <Text style={styles.btnText}>Înapoi la materii</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: '#f8f8ff' },
  titlu: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#2f3e9e' },
  form: { marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 10, borderColor: '#ccc', borderWidth: 1 },
  textarea: { height: 120, textAlignVertical: 'top' },
  btn: { backgroundColor: '#4a66ff', padding: 10, borderRadius: 8 },
  backBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 8, marginTop: 20 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  materieBox: { backgroundColor: '#dde4ff', padding: 15, borderRadius: 10, marginBottom: 10 },
  materieText: { fontWeight: 'bold', color: '#333' },
  notitaBox: { backgroundColor: '#fff9d6', padding: 15, borderRadius: 10, marginBottom: 15 },
  titluNotita: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  textNotita: { color: '#333' },
  butoane: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editBtn: { backgroundColor: '#ffa500', padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: 'red', padding: 8, borderRadius: 8 },
  headerRand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
});