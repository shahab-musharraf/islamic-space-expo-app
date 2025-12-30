import { Theme } from '@/constants/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AddMasjidScreen = () => {
  const { colors } = useTheme() as Theme;

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/917033043952?text=I%20want%20to%20onboard%20a%20masjid%20which%20I%20am%20managing.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={[styles.card, { backgroundColor: colors.CARD }]}>
        {/* <Text style={[styles.title, { color: colors.TEXT }]}>
          Add Your Masjid
        </Text> */}

        <Text style={[styles.messageText, { color: colors.TEXT }]}>
          If you are a Muazzin or managing a Masjid, please contact us to list it on
          the app. This helps Muslims easily find nearby Masjids and prayer
          information.
        </Text>

        <TouchableOpacity
          style={styles.whatsappButton}
          activeOpacity={0.85}
          onPress={handleWhatsApp}
        >
          <FontAwesome name="whatsapp" size={22} color="#fff" />
          <Text style={styles.whatsappText}>Contact via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddMasjidScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',

    // Android
    elevation: 4,

    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.85,
  },

  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
  },

  whatsappText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
