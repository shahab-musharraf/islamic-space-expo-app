import { Theme } from '@/constants/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AddMasjidScreen = () => {
      const { colors } = useTheme() as Theme;
  return (
    <View style={styles.messageContainer}>
        <Text style={[styles.messageText, { color: colors.TEXT }]}>
          If you are a muazzin or managing a masjid, please contact us to list the masjid on the app. This will help Muslims find it easily.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/7033043952')} style={styles.whatsappButton}>
          <FontAwesome name="whatsapp" size={24} color="#25D366" />
          <Text style={[styles.whatsappText, { color: colors.TEXT }]}>Contact via WhatsApp</Text>
        </TouchableOpacity>
      </View>
  )
}

export default AddMasjidScreen

const styles = StyleSheet.create({
    messageContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  whatsappText: {
    fontSize: 14,
    marginLeft: 8,
  },
});