import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dummy function to fetch masjid for userId
const fetchMasjidByUser = async (userId: string) => {
  // Replace with real API call
  // e.g. GET /masjids?userId=<userId>
  // Return null if no masjid
  // Example:
  // { id, name, address, facilities } or null
  return null; 
};

interface Masjid {
  id: string;
  name: string;
  address: string;
  facilities?: Record<string, any>;
}

interface Props {
  userId: string;
}

const MasjidPanel: React.FC<Props> = ({ userId }) => {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loading, setLoading] = useState(true);

  const navigation :any= useNavigation();

  const handleAddMasjid = () => {
    console.log("Navigating to AddMasjidScreen");
    navigation.navigate('screens/masjid-panel/AddMasjidScreen');
  }

  useEffect(() => {
    const loadMasjid = async () => {
      setLoading(true);
      const data = await fetchMasjidByUser(userId);
      setMasjid(data);
      setLoading(false);
    };
    loadMasjid();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // No masjid found → show "Add Masjid" button
  if (!masjid) {
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={handleAddMasjid} style={styles.addMasjidButton}>
          <Text style={{ color:'blue' }}>Add Masjid</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Masjid exists → show masjid details
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{masjid.name}</Text>
      <Text>{masjid.address}</Text>
      {/* Render facilities if available */}
      {masjid.facilities &&
        Object.entries(masjid.facilities).map(([key, value]) => (
          <Text key={key}>
            {key}: {value ? 'Yes' : 'No'}
          </Text>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addMasjidButton: {
    backgroundColor: 'transparent',
    padding: 12,
    paddingInline: 20,
    borderRadius: 8,
    borderColor: 'blue',
    borderWidth: 1,
    borderStyle: 'dashed',
    color: 'blue'
  }
});

export default MasjidPanel;
