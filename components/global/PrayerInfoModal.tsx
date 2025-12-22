import { PrayerInfo } from '@/app/screens/masjid-panel/AddMasjidScreen';
import { Theme } from '@/constants/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PrayerInfoProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  prayerInfo: PrayerInfo;
  loading: boolean;
  setPrayerInfo: (
    prayerInfo: PrayerInfo | ((prev: PrayerInfo) => PrayerInfo)
  ) => void;
}

/* ------------------ CONSTANTS ------------------ */

const PRAYER_FIELDS: {
  key: keyof PrayerInfo;
  label: string;
  placeholder: string;
  mandatory: boolean;
}[] = [
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

/* ------------------ HELPERS ------------------ */

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const parseTimeString = (timeString?: string): Date => {
  const now = new Date();
  if (!timeString) return now;

  try {
    const [time, ampm] = timeString.split(' ');
    const [h, m] = time.split(':');

    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    now.setHours(hours);
    now.setMinutes(minutes);
  } catch {
    return now;
  }

  return now;
};

/* ------------------ COMPONENT ------------------ */

const PrayerInfoModal: React.FC<PrayerInfoProps> = ({
  visible,
  onClose,
  prayerInfo,
  setPrayerInfo,
  loading,
  onUpdate
}) => {
  const { colors } = useTheme() as Theme;
  const [pickerFor, setPickerFor] = useState<keyof PrayerInfo | null>(null);

  const onTimeChange = (_: any, selectedDate?: Date) => {
    const field = pickerFor;
    setPickerFor(null);

    if (selectedDate && field) {
      setPrayerInfo(prev => ({
        ...prev,
        [field]: formatTime(selectedDate),
      }));
    }
  };

  const getPickerValue = () => {
    if (!pickerFor) return new Date();
    return parseTimeString(prayerInfo[pickerFor]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Modal Container */}
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Prayer Timings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {PRAYER_FIELDS.map(field => (
              <View key={field.key}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{field.label}</Text>
                  {!field.mandatory && <TouchableOpacity style={styles.clearBtn} 
                    onPress={() => {
                        setPrayerInfo({...prayerInfo, [field.key]: ''})
                    }}
                  >
                    <Text style={{ fontSize:12 }}>Clear</Text>
                  </TouchableOpacity>}
                  {field.mandatory && (
                    <Text style={styles.mandatorySymbol}>*</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setPickerFor(field.key)}
                >
                  <Text
                    style={
                      prayerInfo[field.key]
                        ? { ...styles.timeText, color: colors.TINT }
                        : styles.placeholderText
                    }
                  >
                    {prayerInfo[field.key] || field.placeholder}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
      {/* Footer */}
        <View style={styles.footer}>
        <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdate} // or your submit/update handler
        >
            <Text style={styles.updateButtonText}>
                {
                    loading ? <ActivityIndicator color={"white"} size={16}/> : "Update"
                }
            </Text>
        </TouchableOpacity>
        </View>
        </View>
      </View>

      {pickerFor && (
        <DateTimePicker
          value={getPickerValue()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </Modal>
  );
};

export default PrayerInfoModal;

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearBtn: {
    backgroundColor:'#eee',
    paddingHorizontal:8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
    fontSize: 14
  },

  footer: {
  padding: 16,
  borderTopWidth: 1,
  borderColor: '#eee',
  alignItems: 'center',
},

updateButton: {
  width: '60%',
  backgroundColor: '#4CAF50',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},

updateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  closeText: {
    color: '#d32f2f',
    fontWeight: '600',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  label: {
    marginVertical: 6,
    fontSize: 14,
    fontWeight: '600',
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mandatorySymbol: {
    color: 'red',
    marginLeft: 4,
    fontWeight: '600',
  },

  inputButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },

  timeText: {
    fontSize: 16,
  },

  placeholderText: {
    fontSize: 16,
    color: '#aaa',
  },
});
