import { useGetAllMasjidsListedByUsername } from '@/apis/masjid/useGetAllMasjidListedByUsername';
import { Theme } from '@/constants/types';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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

  const navigation :any= useNavigation();

  const { colors } = useTheme() as Theme;

  const handleAddMasjid = () => {
    navigation.navigate('screens/masjid-panel/AddMasjidScreen');
  }

  const { profile } = useUserProfileStore();
    const { data, isLoading } = useGetAllMasjidsListedByUsername(profile?.mobile || '');

    console.log(data, 'dddddddddddddd')


  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // No masjid found → show "Add Masjid" button
  if (!data || !data?.length) {
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={handleAddMasjid} style={[styles.addMasjidButton, {borderColor: colors.BUTTON_TEXT}]}>
          <Text style={{ color: colors.BUTTON_TEXT }}>Add Masjid</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    borderWidth: 1,
    borderStyle: 'dashed',
    color: 'blue'
  }
});

export default MasjidPanel;
