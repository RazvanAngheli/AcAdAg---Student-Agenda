// screens/OrarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const zileSaptamana = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const culoriPredefinite = [
  { nume: 'Roșu', cod: '#FF6B6B' },
  { nume: 'Albastru', cod: '#4D96FF' },
  { nume: 'Verde', cod: '#4CAF50' },
  { nume: 'Galben', cod: '#FFEB3B' },
  { nume: 'Portocaliu', cod: '#FF9800' },
  { nume: 'Mov', cod: '#9C27B0' },
  { nume: 'Roz', cod: '#F48FB1' },
  { nume: 'Gri', cod: '#9E9E9E' },
  { nume: 'Turcoaz', cod: '#00BCD4' },
  { nume: 'Indigo', cod: '#3F51B5' },
  { nume: 'Maro', cod: '#795548' },
  { nume: 'Negru', cod: '#000000' },
  { nume: 'Bej', cod: '#F5F5DC' },
  { nume: 'Auriu', cod: '#FFD700' },
  { nume: 'Argintiu', cod: '#C0C0C0' },
];

export default function OrarScreen() {
  const [orar, setOrar] = useState([]);
  const [materieNoua, setMaterieNoua] = useState({ zi: 'Luni', ora: '', nume: '', sala: '', culoare: '#FF6B6B' });
  const [modalVizibil, setModalVizibil] = useState(false);
  const [materieEditata, setMaterieEditata] = useState(null);
  const [modalEditare, setModalEditare] = useState(false);
  const [modEditare, setModEditare] = useState(false);
  const [doarZiuaCurenta, setDoarZiuaCurenta] = useState(false);

  const ziCurenta = () => {
    const zile = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    const azi = new Date();
    return zile[azi.getDay()];
  };

  useEffect(() => {
    incarcaOrar();
  }, []);

  const incarcaOrar = async () => {
    try {
      const date = await AsyncStorage.getItem('orar');
      if (date) {
        setOrar(JSON.parse(date));
      }
    } catch (err) {
      console.error('Eroare la incarcarea orarului', err);
    }
  };

  const salveazaOrar = async (orarActualizat) => {
    try {
      await AsyncStorage.setItem('orar', JSON.stringify(orarActualizat));
    } catch (err) {
      console.error('Eroare la salvarea orarului', err);
    }
  };

  const adaugaMaterie = () => {
    if (!materieNoua.nume || !materieNoua.ora || !/^[0-2]?\d:[0-5]\d$/.test(materieNoua.ora)) {
      Alert.alert('Completează toate câmpurile corect');
      return;
    }
    const cuId = { ...materieNoua, id: Date.now() + Math.random() };
    const actualizat = [...orar, cuId];
    const sortat = actualizat.sort((a, b) => a.ora.localeCompare(b.ora));
    setOrar(sortat);
    salveazaOrar(sortat);
    setModalVizibil(false);
    setMaterieNoua({ zi: 'Luni', ora: '', nume: '', culoare: '#FF6B6B' });
  };

  const salveazaEditare = () => {
    if (!materieEditata.nume || !materieEditata.ora || !/^[0-2]?\d:[0-5]\d$/.test(materieEditata.ora)) {
      Alert.alert('Completează toate câmpurile corect');
      return;
    
    }
    const actualizat = orar.map(item =>
      item.id === materieEditata.id ? { ...materieEditata } : item
    );
    const sortat = actualizat.sort((a, b) => a.ora.localeCompare(b.ora));
    setOrar(sortat);
    salveazaOrar(sortat);
    setModalEditare(false);
  };

  const stergeMaterie = (id) => {
    const filtrat = orar.filter(item => item.id !== id);
    setOrar(filtrat);
    salveazaOrar(filtrat);
    setModalEditare(false);
  };

  const afiseazaMaterii = (zi, ora) => {
    return orar
      .filter(item => item.zi === zi && item.ora === ora)
      .map((materie, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.materie, { backgroundColor: materie.culoare }]}
          onPress={() => {
            if (modEditare) {
              setMaterieEditata(materie);
              setTimeout(() => setModalEditare(true), 50);
            }
          }}>
          <Text style={styles.textMaterie}>{materie.nume}</Text>
{materie.sala ? (
  <Text style={styles.textSala}>{materie.sala}</Text>
) : null}
        </TouchableOpacity>
      ));
  };

  const oreUnice = [...new Set(orar.map(item => item.ora))].sort();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.butonAdauga} onPress={() => setModalVizibil(true)}>
        <Text style={styles.textButon}>Adaugă Materie</Text>
      </TouchableOpacity>

      <ScrollView horizontal>
        <View>
          <View style={styles.randHeader}>
            <View style={styles.celulaHeader} />
            {zileSaptamana
            .filter(zi => !doarZiuaCurenta || zi === ziCurenta())
            .map((zi, index) => (
           <View key={index} style={styles.celulaHeader}>
           <Text style={styles.textHeader}>{zi}</Text>
         </View>
          ))}
          </View>

          {oreUnice.map((ora, index) => (
            <View key={index} style={styles.rand}>
              <View style={styles.celulaOra}>
                <Text style={styles.textOra}>{ora}</Text>
              </View>
              {zileSaptamana
                 .filter(zi => !doarZiuaCurenta || zi === ziCurenta())
                 .map((zi, index2) => (
              <View key={index2} style={styles.celulaMaterie}>
               {afiseazaMaterii(zi, ora)}
               </View>
                ))}
             </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
  style={[styles.butonEditeaza, { backgroundColor: '#888' }]}
  onPress={() => setDoarZiuaCurenta(prev => !prev)}
>
  <Text style={{ color: 'white' }}>
    {doarZiuaCurenta ? 'Vezi toate zilele' : 'Vezi doar ziua curentă'}
  </Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.butonEditeaza} onPress={() => setModEditare(!modEditare)}>
        <Text style={{ color: 'white' }}>{modEditare ? 'Ieși din editare' : 'Editează orarul'}</Text>
      </TouchableOpacity>

      {/* MODAL ADĂUGARE */}
      <Modal visible={modalVizibil} animationType="slide">
        <SafeAreaView style={styles.modalContent}>
          <TouchableOpacity onPress={() => setModalVizibil(false)} style={styles.inchideModal}>
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          <Text style={{ marginLeft: 5, marginTop: 10 }}>Nume:</Text>
            <TextInput
            style={styles.input}
            placeholder="Nume materie"
            value={materieNoua.nume}
            onChangeText={(text) => setMaterieNoua({ ...materieNoua, nume: text })}
          />

<Text style={{ marginLeft: 5, marginTop: 10 }}>Ora:</Text>
<TextInput
  style={styles.input}
  placeholder="Ora (ex: 13:00)"
  value={materieNoua.ora}
  onChangeText={(text) => setMaterieNoua({ ...materieNoua, ora: text })}
/>

<Text style={{ marginLeft: 5, marginTop: 10 }}>Sală:</Text>
<TextInput
  style={styles.input}
  placeholder="Ex: 206"
  value={materieNoua.sala}
  onChangeText={(text) => setMaterieNoua({ ...materieNoua, sala: text })}
/>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {zileSaptamana.map((zi, idx) => (
              <TouchableOpacity key={idx} style={[styles.selectZi, materieNoua.zi === zi && styles.selectZiActiv]} onPress={() => setMaterieNoua({ ...materieNoua, zi })}>
                <Text>{zi}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text>Alege o culoare:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {culoriPredefinite.map((culoare, index) => (
              <TouchableOpacity key={index} style={[styles.selectCuloare, { backgroundColor: culoare.cod }, materieNoua.culoare === culoare.cod && styles.selectCuloareActiv]} onPress={() => setMaterieNoua({ ...materieNoua, culoare: culoare.cod })} />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.butonConfirma} onPress={adaugaMaterie}>
            <Text style={{ color: 'white', fontSize: 16 }}>Salvează</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* MODAL EDITARE */}
<Modal visible={modalEditare && materieEditata !== null} animationType="slide">
  <SafeAreaView style={[styles.modalContent, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
    {materieEditata && (
      <>
        <TouchableOpacity onPress={() => setModalEditare(false)} style={styles.inchideModal}>
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nume materie"
          value={materieEditata.nume}
          onChangeText={(text) => setMaterieEditata({ ...materieEditata, nume: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Ora (ex: 13:00)"
          value={materieEditata.ora}
          onChangeText={(text) => setMaterieEditata({ ...materieEditata, ora: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Sală"
          value={materieEditata.sala || ''}
          onChangeText={(text) => setMaterieEditata({ ...materieEditata, sala: text })}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {zileSaptamana.map((zi, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.selectZi, materieEditata.zi === zi && styles.selectZiActiv]}
              onPress={() => setMaterieEditata({ ...materieEditata, zi })}
            >
              <Text>{zi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text>Alege o culoare:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {culoriPredefinite.map((culoare, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.selectCuloare,
                { backgroundColor: culoare.cod },
                materieEditata.culoare === culoare.cod && styles.selectCuloareActiv
              ]}
              onPress={() => setMaterieEditata({ ...materieEditata, culoare: culoare.cod })}
            />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.butonConfirma} onPress={salveazaEditare}>
          <Text style={{ color: 'white', fontSize: 16 }}>Salvează modificările</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.butonConfirma, { backgroundColor: 'crimson' }]}
          onPress={() => stergeMaterie(materieEditata.id)}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Șterge materia</Text>
        </TouchableOpacity>
      </>
    )}
  </SafeAreaView>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f8ff' },
  butonAdauga: { backgroundColor: '#4D96FF', padding: 10, borderRadius: 8, alignSelf: 'center', marginBottom: 10 },
  textButon: { color: 'white', fontSize: 16 },
  randHeader: { flexDirection: 'row', marginBottom: 5 },
  celulaHeader: { width: 100, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d2c45' },
  textHeader: { color: 'white', fontWeight: 'bold' },
  rand: { flexDirection: 'row', marginBottom: 5 },
  celulaOra: { width: 100, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' },
  celulaMaterie: { width: 100, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f0fa' },
  materie: { padding: 4, borderRadius: 6, width: '90%', height: 45, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  textMaterie: { color: 'white', fontWeight: '600', fontSize: 14 },
  textSala: {
    fontSize: 11,
    color: 'white',
    opacity: 0.8,
  },
  modalContent: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, marginVertical: 10, borderRadius: 6 },
  selectZi: { padding: 10, margin: 10, borderWidth: 1, borderColor: '#aaa', borderRadius: 5, height: 40 },
  selectZiActiv: { backgroundColor: '#cce5ff' },
  selectCuloare: { width: 30, height: 30, margin: 5, borderRadius: 15, borderWidth: 1, borderColor: '#000' },
  selectCuloareActiv: { borderWidth: 2, borderColor: 'black' },
  butonConfirma: { marginTop: 20, backgroundColor: '#4D96FF', padding: 10, alignItems: 'center', borderRadius: 6 },
  inchideModal: { alignSelf: 'flex-end', padding: 10 },
  textOra: { fontSize: 12 },
  butonEditeaza: { backgroundColor: '#0d2c45', padding: 10, alignItems: 'center', borderRadius: 8, marginTop: 10, alignSelf: 'center' },
});
