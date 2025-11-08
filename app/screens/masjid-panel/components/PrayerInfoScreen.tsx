import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { PrayerInfo } from '../AddMasjidScreen';

interface PrayerInfoProps {
    prayerInfo: PrayerInfo,
    setPrayerInfo : (prayerInfo : PrayerInfo | ((prev:PrayerInfo) => PrayerInfo)) => void
}

const PrayerInfoScreen : React.FC<PrayerInfoProps> = ({ prayerInfo, setPrayerInfo }) => {

    const handleChangeInput = (name: string, value: string) => {
        setPrayerInfo((prev: PrayerInfo) => (
            {
                ...prev,
                [name] : value
            }
        ))
    }
    
  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.label}>Fajr</Text>
      <TextInput style={styles.input} value={prayerInfo.fajr} onChangeText={(text : string) => handleChangeInput("fajr", text)} placeholder="05:30" />

      <Text style={styles.label}>Dhuhr</Text>
      <TextInput style={styles.input} value={prayerInfo.dhuhr} onChangeText={(text : string) => handleChangeInput("dhuhr", text)} placeholder="13:00" />

      <Text style={styles.label}>Asr</Text>
      <TextInput style={styles.input} value={prayerInfo.asr} onChangeText={(text : string) => handleChangeInput("asr", text)} placeholder="16:30" />

      <Text style={styles.label}>Maghrib</Text>
      <TextInput style={styles.input} value={prayerInfo.maghrib} onChangeText={(text : string) => handleChangeInput("maghrib", text)} placeholder="18:40" />

      <Text style={styles.label}>Isha</Text>
      <TextInput style={styles.input} value={prayerInfo.isha} onChangeText={(text : string) => handleChangeInput("isha", text)} placeholder="20:00" />

      <Text style={styles.label}>Jumuah</Text>
      <TextInput style={styles.input} value={prayerInfo.jumuah} onChangeText={(text : string) => handleChangeInput("jumuah", text)} placeholder="13:15" />

      <Text style={styles.label}>Sehri</Text>
      <TextInput style={styles.input} value={prayerInfo.sehri} onChangeText={(text : string) => handleChangeInput("sehri", text)} placeholder="05:30" />

      <Text style={styles.label}>Iftaar</Text>
      <TextInput style={styles.input} value={prayerInfo.iftaar} onChangeText={(text : string) => handleChangeInput("iftaar", text)} placeholder="13:00" />

      <Text style={styles.label}>Taraweeh</Text>
      <TextInput style={styles.input} value={prayerInfo.taraweeh} onChangeText={(text : string) => handleChangeInput("taraweeh", text)} placeholder="16:30" />

      <Text style={styles.label}>Eid-Ul-Fitr</Text>
      <TextInput style={styles.input} value={prayerInfo.eid_ul_fitr} onChangeText={(text : string) => handleChangeInput("eid_ul_fitr", text)} placeholder="13:00" />

      <Text style={styles.label}>Eid-Ul-Azha</Text>
      <TextInput style={styles.input} value={prayerInfo.eid_ul_azha} onChangeText={(text : string) => handleChangeInput("eid_ul_azha", text)} placeholder="16:30" />

    </ScrollView>
  )
}

export default PrayerInfoScreen;

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 }
});
