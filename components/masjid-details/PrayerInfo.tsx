import { Theme } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/* ------------------ PRAYER LABELS ------------------ */

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  jumuah: 'Jumuah',
  sehri: 'Sehri',
  iftaar: 'Iftaar',
  taraweeh: 'Taraweeh',
  eid_ul_fitr: 'Eid-ul-Fitr',
  eid_ul_azha: 'Eid-ul-Azha',
};

/* ------------------ COMPONENT ------------------ */

const PrayerInfo = ({ prayerInfo }: { prayerInfo: any }) => {
  const { colors } = useTheme() as Theme;

  if (!prayerInfo) return null;

  const validPrayers = Object.entries(PRAYER_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      value: prayerInfo[key],
    }))
    .filter(
      item =>
        typeof item.value === 'string' &&
        item.value.trim() !== ''
    );

  return (
    <View style={styles.container}>
      {validPrayers.length === 0 ? (
        /* ---------- EMPTY STATE ---------- */
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyText,
              { color: colors.TEXT_SECONDARY },
            ]}
          >
            No Salah Timings Found!
          </Text>
        </View>
      ) : (
        /* ---------- LIST ---------- */
        <View style={styles.list}>
          {validPrayers.map(item => (
            <View
              key={item.key}
              style={[
                styles.row,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.prayerLabel,
                  { color: colors.TEXT_SECONDARY },
                ]}
              >
                {item.label}
              </Text>

              <Text
                style={[
                  styles.prayerTime,
                  { color: colors.TEXT },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PrayerInfo;

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  list: {
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  prayerLabel: {
    fontSize: 17,        // ↑ label size
    fontWeight: '500',
  },

  prayerTime: {
    fontSize: 20,        // ↑ time size (main focus)
    fontWeight: '700',
  },

  /* ---------- EMPTY STATE ---------- */
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
