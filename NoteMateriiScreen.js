import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NoteMateriiScreen() {
  const [materii, setMaterii] = useState([]);
  const [nume, setNume] = useState('');
  const [notaProiect, setNotaProiect] = useState('');
  const [pondereProiect, setPondereProiect] = useState('');
  const [notaExamen, setNotaExamen] = useState('');
  const [pondereExamen, setPondereExamen] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('noteMaterii').then(data => {
      if (data) setMaterii(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('noteMaterii', JSON.stringify(materii));
  }, [materii]);

  const calculeazaMedia = (np, pp, ne, pe) => {
    const p1 = parseFloat(pp) / 100;
    const p2 = parseFloat(pe) / 100;
    return (np * p1 + ne * p2).toFixed(2);
  };

  const adaugaSauModifica = () => {
    const np = parseFloat(notaProiect);
    const pp = parseFloat(pondereProiect);
    const ne = parseFloat(notaExamen);
    const pe = parseFloat(pondereExamen);

    if (!nume || isNaN(np) || isNaN(pp) || isNaN(ne) || isNaN(pe) || pp + pe !== 100) {
      Alert.alert('Eroare', 'Completează toate câmpurile corect. Ponderile trebuie să însumeze 100%.');
      return;
    }

    const media = calculeazaMedia(np, pp, ne, pe);
    const nouaMaterie = {
      id: editId || Date.now().toString(),
      nume,
      notaProiect: np,
      pondereProiect: pp,
      notaExamen: ne,
      pondereExamen: pe,
      media
    };

    if (editId) {
      setMaterii(prev => prev.map(m => (m.id === editId ? nouaMaterie : m)));
    } else {
      setMaterii(prev => [...prev, nouaMaterie]);
    }

    setNume('');
    setNotaProiect('');
    setPondereProiect('');
    setNotaExamen('');
    setPondereExamen('');
    setEditId(null);
  };

  const editeaza = (m) => {
    setNume(m.nume);
    setNotaProiect(m.notaProiect.toString());
    setPondereProiect(m.pondereProiect.toString());
    setNotaExamen(m.notaExamen.toString());
    setPondereExamen(m.pondereExamen.toString());
    setEditId(m.id);
  };

  const sterge = (id) => {
    setMaterii(prev => prev.filter(m => m.id !== id));
  };

  const mediaGenerala = materii.length
  ? (
      materii.reduce((suma, m) => {
        const mediaNumerica = parseFloat(m.media);
        const notaRotunjita = Math.floor(mediaNumerica) + (mediaNumerica % 1 >= 0.5 ? 1 : 0);
        return suma + notaRotunjita;
      }, 0) / materii.length
    ).toFixed(2)
  : '-';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titlu}>NOTE MATERII</Text>

      <TextInput style={styles.input} placeholder="Nume materie" value={nume} onChangeText={setNume} />
      <TextInput style={styles.input} placeholder="Notă proiect" value={notaProiect} onChangeText={setNotaProiect} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Pondere proiect (%)" value={pondereProiect} onChangeText={setPondereProiect} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Notă examen" value={notaExamen} onChangeText={setNotaExamen} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Pondere examen (%)" value={pondereExamen} onChangeText={setPondereExamen} keyboardType="numeric" />

      <TouchableOpacity style={styles.btnSalveaza} onPress={adaugaSauModifica}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{editId ? 'Salvează modificările' : 'Adaugă materie'}</Text>
      </TouchableOpacity>

      <Text style={styles.mediaGenerala}>Media generală: {mediaGenerala}</Text>

      {materii.map(m => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.numeMaterie}>{m.nume}</Text>
          <Text>Proiect: {m.notaProiect} ({m.pondereProiect}%)</Text>
          <Text>Examen: {m.notaExamen} ({m.pondereExamen}%)</Text>
          <Text style={{ fontWeight: 'bold' }}>
  Media: {Math.floor(parseFloat(m.media)) + (parseFloat(m.media) % 1 >= 0.5 ? 1 : 0)} ({m.media})
</Text>
          <View style={styles.rowBtns}>
            <TouchableOpacity onPress={() => editeaza(m)} style={styles.btnEdit}>
              <Text style={{ color: 'white' }}>✎ Editare</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => sterge(m.id)} style={styles.btnDelete}>
              <Text style={{ color: 'white' }}>🗑️ Ștergere</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
    backgroundColor: '#eef3ff'
  },
  titlu: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e3c92'
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1
  },
  btnSalveaza: {
    backgroundColor: '#2e86de',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  mediaGenerala: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  numeMaterie: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5
  },
  rowBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  btnEdit: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 8
  },
  btnDelete: {
    backgroundColor: '#e53935',
    padding: 8,
    borderRadius: 8
  }
});