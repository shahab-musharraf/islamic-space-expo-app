import { PRAYER_FIELDS } from '@/app/screens/masjid-panel/components/PrayerInfoScreen';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

/* ------------------ TYPES ------------------ */

type PrayerLevel = 'PAST' | 'IMMEDIATE' | 'SOON' | 'LATER' | '';

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: {
    salah: string;
    sortBy: 'Distance' | 'Salah Time';
    level?: PrayerLevel;
  }) => void;
  initialData: {
    salah: string;
    sortBy: 'Distance' | 'Salah Time';
    level: PrayerLevel;
  };
}

/* ------------------ CONSTANTS ------------------ */

const SORT_OPTIONS: Array<'Distance' | 'Salah Time'> = [
  'Distance',
  'Salah Time',
];

const LEVEL_OPTIONS: { label: string; value: PrayerLevel }[] = [
  { label: 'Already Passed', value: 'PAST' },
  { label: 'Within 5 mins', value: 'IMMEDIATE' },
  { label: 'Between 5 - 20 mins', value: 'SOON' },
  { label: 'After 20 mins', value: 'LATER' },
];

/* ------------------ COMPONENT ------------------ */

const FilterSortModal: React.FC<FilterSortModalProps> = ({
  visible,
  onClose,
  onApply,
  initialData,
}) => {
  const [selectedSalah, setSelectedSalah] = useState<string>('');
  const [firstMount, setFirstMount] = useState(false);
  const [selectedSort, setSelectedSort] =
    useState<'Distance' | 'Salah Time'>('Distance');
  const [selectedLevel, setSelectedLevel] =
    useState<PrayerLevel>('');

  /* ------------------ SYNC INITIAL DATA ------------------ */
  useEffect(() => {
    if (visible) {
      setSelectedSalah(initialData.salah || '');
      setSelectedSort(
        initialData.salah ? initialData.sortBy : 'Distance'
      );
      setSelectedLevel(initialData.level || '');
      setFirstMount(true);
    }
  }, [visible, initialData]);

  /* ------------------ ENFORCE RULES ------------------ */
  useEffect(() => {
    if (!selectedSalah && firstMount) {
      setSelectedSort('Distance');
      setSelectedLevel('');
    }
  }, [selectedSalah, firstMount]);

  const handleApply = () => {
    onApply({
      salah: selectedSalah || '',
      sortBy: selectedSalah ? selectedSort : 'Distance',
      level: selectedSalah ? selectedLevel : '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* ===== Scrollable Body ===== */}
          <ScrollView
            showsVerticalScrollIndicator
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
              Filter By
            </Text>
            

            {/* -------- SALAH FILTER -------- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.subTitle}>Salah</Text>
            
              <TouchableOpacity onPress={() => setSelectedSalah('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.salahScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {PRAYER_FIELDS.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.optionRow}
                  onPress={() => setSelectedSalah(item.key)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>

                  {selectedSalah === item.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#4CAF50"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* -------- LEVEL FILTER -------- */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.subTitle, { marginTop: 12 }]}>
                Timeline
              </Text>

              <TouchableOpacity
                disabled={!selectedSalah}
                onPress={() => setSelectedLevel('')}
              >
                <Text
                  style={[
                    styles.clearText,
                    !selectedSalah && styles.disabledText,
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            {LEVEL_OPTIONS.map(level => {
              const isDisabled = !selectedSalah;

              return (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.optionRow,
                    isDisabled && styles.disabledOption,
                  ]}
                  disabled={isDisabled}
                  onPress={() => setSelectedLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isDisabled && styles.disabledText,
                    ]}
                  >
                    {level.label}
                  </Text>

                  {selectedLevel === level.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#4CAF50"
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* -------- SORT SECTION -------- */}
            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
              Sort By
            </Text>

            {SORT_OPTIONS.map(item => {
              const isDisabled = item === 'Salah Time' && !selectedSalah;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionRow,
                    isDisabled && styles.disabledOption,
                  ]}
                  disabled={isDisabled}
                  onPress={() => setSelectedSort(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isDisabled && styles.disabledText,
                    ]}
                  >
                    {item}
                  </Text>

                  {selectedSort === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#4CAF50"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ===== Fixed Footer ===== */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
            >
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default FilterSortModal;

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '70%',
    maxHeight: '55%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  /* ===== HEADERS ===== */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    textAlign:'center'
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    textAlign:'center'
  },

  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'blue',
  },

  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F', // OLX-like red
  },

  /* ===== LISTS ===== */

  salahScroll: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 12,
    paddingHorizontal: 4,

    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },

  optionText: {
    fontSize: 14,
    color: '#222',
  },

  disabledOption: {
    opacity: 0.45,
  },

  disabledText: {
    color: '#999',
  },

  /* ===== FOOTER ===== */

  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32', // OLX-style solid CTA
  },

  applyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

