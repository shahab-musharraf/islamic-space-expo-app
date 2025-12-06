import { Theme } from '@/constants/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PrayerInfo } from '../AddMasjidScreen';

interface PrayerInfoProps {
  prayerInfo: PrayerInfo;
  setPrayerInfo: (prayerInfo: PrayerInfo | ((prev: PrayerInfo) => PrayerInfo)) => void;
}

// --- UPDATED: Placeholders now use 12-hour AM/PM format ---
const PRAYER_FIELDS: { key: keyof PrayerInfo; label: string; placeholder: string, mandatory: boolean }[] = [
  { key: 'fajr', label: 'Fajr', placeholder: '05:30 AM', mandatory: true },
  { key: 'dhuhr', label: 'Dhuhr', placeholder: '01:00 PM', mandatory: true },
  { key: 'asr', label: 'Asr', placeholder: '04:30 PM', mandatory: true },
  { key: 'maghrib', label: 'Maghrib', placeholder: '06:40 PM', mandatory: true },
  { key: 'isha', label: 'Isha', placeholder: '08:00 PM', mandatory: true },
  { key: 'jumuah', label: 'Jumuah', placeholder: '01:15 PM', mandatory: true },
  { key: 'sehri', label: 'Sehri', placeholder: '05:30 AM', mandatory: false },
  { key: 'iftaar', label: 'Iftaar', placeholder: '06:40 PM', mandatory: false },
  { key: 'taraweeh', label: 'Taraweeh', placeholder: '08:00 PM', mandatory: false },
  { key: 'eid_ul_fitr', label: 'Eid-Ul-Fitr', placeholder: '08:00 AM', mandatory: false },
  { key: 'eid_ul_azha', label: 'Eid-Ul-Azha', placeholder: '08:00 AM', mandatory: false },
];

// --- Helper Functions (MODIFIED) ---

/**
 * Formats a Date object into a 12-hour "hh:mm AM/PM" string
 */
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  let displayHours = hours % 12;
  if (displayHours === 0) {
    displayHours = 12; // 0 hour (midnight or noon) should be 12
  }
  
  return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Parses a "hh:mm AM/PM" string into a Date object for the picker
 * If the string is invalid, it returns the current time.
 */
const parseTimeString = (timeString: string | undefined): Date => {
  const now = new Date();
  if (!timeString) return now;

  try {
    const [timePart, ampm] = timeString.split(' ');
    if (!timePart || !ampm) return now; // Invalid format

    const [hoursStr, minutesStr] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return now;

    if (ampm.toUpperCase() === 'PM' && hours < 12) {
      hours += 12; // 1 PM -> 13
    } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
      hours = 0; // 12 AM (midnight) -> 0
    }
    
    now.setHours(hours);
    now.setMinutes(minutes);
  } catch (e) {
    // Parsing failed, will just return 'now'
  }
  return now;
};

// --- Component (No changes needed here) ---

const PrayerInfoScreen: React.FC<PrayerInfoProps> = ({ prayerInfo, setPrayerInfo }) => {
  const [pickerFor, setPickerFor] = useState<keyof PrayerInfo | null>(null);
  const { colors } = useTheme() as Theme;

  const onTimeChange = (event: any, selectedDate?: Date) => {
    const currentField = pickerFor;
    setPickerFor(null);

    if (event.type === 'set' && selectedDate && currentField) {
      // The new formatTime function handles the AM/PM conversion
      const formattedTime = formatTime(selectedDate); 

      setPrayerInfo((prev: PrayerInfo) => ({
        ...prev,
        [currentField]: formattedTime,
      }));
    }
  };

  const getPickerValue = (): Date => {
    if (!pickerFor) return new Date();
    // The new parseTimeString function reads the AM/PM format
    const timeString = prayerInfo[pickerFor]; 
    return parseTimeString(timeString);
  };

  return (
    <ScrollView style={styles.stepContainer}>
      {PRAYER_FIELDS.map((field) => (
        <View key={field.key}>
{/* --- UPDATED: Label container for mandatory symbol --- */}
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {field.mandatory && (
              <Text style={styles.mandatorySymbol}>*</Text>
            )}
          </View>          
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setPickerFor(field.key)}
          >
            <Text style={prayerInfo[field.key] ? {...styles.timeText, color: colors.TINT} : styles.placeholderText}>
              {/* This logic is unchanged and works perfectly */}
              {prayerInfo[field.key] || field.placeholder}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {pickerFor && (
        <DateTimePicker
          testID="timePicker"
          value={getPickerValue()}
          mode={'time'}
          // --- UPDATED: Changed to 12-hour format ---
          is24Hour={false} 
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
};

export default PrayerInfoScreen;

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  stepContainer: { flex: 1},
  label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
  inputButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row', // Aligns label and asterisk
    alignItems: 'center', // Centers them vertically
  },
  mandatorySymbol: {
    color: 'red',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4, // Space between label and asterisk
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#aaa',
  },
});