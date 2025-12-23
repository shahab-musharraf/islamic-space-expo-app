import { Theme } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
// import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/* ------------------ HELPERS ------------------ */

const copyText = async (text:string) => {
  // await Clipboard.setStringAsync(text);
  Alert.alert('Copied', 'UPI ID copied to clipboard');
};

/* ------------------ SMALL COMPONENTS ------------------ */

const ProgressBar = ({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) => (
  <View style={styles.progressTrack}>
    <View
      style={[
        styles.progressFill,
        { width: `${progress}%`, backgroundColor: color },
      ]}
    />
  </View>
);

const Row = ({
  label,
  value,
  textColor,
}: {
  label: string;
  value?: any;
  textColor: string;
}) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: textColor }]}>
        {String(value)}
      </Text>
    </View>
  );
};

const UpiBox = ({
  upiId,
  colors,
}: {
  upiId?: string;
  colors: any;
}) => {
  if (!upiId) return null;

  return (
    <TouchableOpacity
      style={[styles.upiBox, { backgroundColor: colors.BACKGROUND }]}
      onPress={() => copyText(upiId)}
    >
      <Text style={[styles.upiLabel, { color: colors.TEXT_SECONDARY }]}>
        UPI ID
      </Text>
      <Text style={[styles.upiValue, { color: colors.TEXT }]}>
        {upiId}
      </Text>
      <Text style={[styles.copyHint, { color: colors.primary }]}>
        Tap to copy
      </Text>
    </TouchableOpacity>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

const MasjidInfo = ({ masjid }: { masjid: any }) => {
  const [showBreakup, setShowBreakup] = useState(false);
  const { colors } = useTheme() as Theme;

  if (!masjid) return null;

  const isUnderConstruction = masjid?.isUnderConstruction === true;

  /* ---------- NORMAL BUDGET ---------- */
  const normalTotal = Number(masjid?.budgetInfo?.totalBudgetRequired || 0);
  const normalCollected = Number(
    masjid?.budgetInfo?.offlineCollectedAmount || 0
  );
  const normalProgress =
    normalTotal > 0 ? (normalCollected / normalTotal) * 100 : 0;

  /* ---------- CONSTRUCTION BUDGET ---------- */
  const constructionTotal = Number(
    masjid?.underConstructionBudgetInfo?.estimatedBudget || 0
  );
  const constructionCollected = Number(
    masjid?.underConstructionBudgetInfo?.offlineCollectedAmount || 0
  );
  const constructionProgress =
    constructionTotal > 0
      ? (constructionCollected / constructionTotal) * 100
      : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      contentContainerStyle={styles.content}
    >
      {/* 🕌 BASIC INFO */}
      <View style={[styles.card, { backgroundColor: colors.CARD }]}>
        <Text style={[styles.name, { color: colors.TEXT }]}>
          {masjid.name}
        </Text>
        <Text style={[styles.address, { color: colors.TEXT_SECONDARY }]}>
          {masjid.address}
        </Text>
      </View>

      {/* ================= NORMAL MASJID ================= */}
      {!isUnderConstruction && (
        <View style={[styles.card, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.amountLabel, { color: colors.TEXT_SECONDARY }]}>
            Monthly Budget Required
          </Text>
          <Text style={[styles.amountValue, { color: 'green' }]}>
            ₹ {normalTotal.toLocaleString()}
          </Text>

          <View style={{ marginTop: 12 }}>
            <ProgressBar progress={normalProgress} color="green" />
            <Text style={[styles.collectedText, { color: colors.TEXT_SECONDARY }]}>
              Collected ₹ {normalCollected.toLocaleString()} (
              {normalProgress.toFixed(1)}%)
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowBreakup(!showBreakup)}
            style={styles.breakupBtn}
          >
            <Text style={[styles.breakupText, { color: colors.primary }]}>
              {showBreakup ? 'Hide breakup' : 'View breakup'}
            </Text>
          </TouchableOpacity>

          {showBreakup && (
            <View style={[styles.breakupBox, { borderTopColor: colors.border }]}>
              <Row
                label="Moazzin Salary"
                value={`${masjid?.budgetInfo?.noOfMoazzins} × ${masjid?.budgetInfo?.moazzinSalary}`}
                textColor={colors.TEXT}
              />
              <Row
                label="Staff Salary"
                value={`${masjid?.budgetInfo?.noOfStaff} × ${masjid?.budgetInfo?.staffSalary}`}
                textColor={colors.TEXT}
              />
              <Row label="Electricity Bill" value={masjid?.budgetInfo?.electricityBill} textColor={colors.TEXT} />
              <Row label="Water Bill" value={masjid?.budgetInfo?.waterBill} textColor={colors.TEXT} />
              <Row label="Maintenance" value={masjid?.budgetInfo?.maintenance} textColor={colors.TEXT} />
              <Row label="Other Expenses" value={masjid?.budgetInfo?.otherExpenses} textColor={colors.TEXT} />
            </View>
          )}

          {/* ✅ UPI FOR NORMAL MASJID */}
          <UpiBox upiId={masjid?.accountInfo?.upiId} colors={colors} />
        </View>
      )}

      {/* ================= UNDER CONSTRUCTION ================= */}
      {isUnderConstruction && (
        <View style={[styles.card, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>
            Under Construction
          </Text>

          <Text style={[styles.amountLabel, { color: colors.TEXT_SECONDARY }]}>
            Estimated Construction Budget
          </Text>
          <Text style={[styles.amountValue, { color: 'green' }]}>
            ₹ {constructionTotal.toLocaleString()}
          </Text>

          <View style={{ marginTop: 12 }}>
            <ProgressBar progress={constructionProgress} color="green" />
            <Text style={[styles.collectedText, { color: colors.TEXT_SECONDARY }]}>
              Collected ₹ {constructionCollected.toLocaleString()} (
              {constructionProgress.toFixed(1)}%)
            </Text>
          </View>

          <Row
            label="Start Date"
            value={
              masjid?.underConstructionBudgetInfo?.startDate
                ? new Date(masjid.underConstructionBudgetInfo.startDate).toDateString()
                : ''
            }
            textColor={colors.TEXT}
          />

          <Row
            label="Expected Completion"
            value={
              masjid?.underConstructionBudgetInfo?.expectedEndDate
                ? new Date(masjid.underConstructionBudgetInfo.expectedEndDate).toDateString()
                : ''
            }
            textColor={colors.TEXT}
          />

          {/* ✅ UPI FOR CONSTRUCTION */}
          <UpiBox upiId={masjid?.accountInfo?.upiId} colors={colors} />

          {masjid?.underConstructionBudgetInfo?.budgetReport && (
            <TouchableOpacity
              style={[styles.reportBtn, { backgroundColor: colors.BUTTON_BG }]}
              onPress={() =>
                Linking.openURL(masjid.underConstructionBudgetInfo.budgetReport)
              }
            >
              <Text style={[styles.reportBtnText, { color: colors.TEXT }]}>
                View Construction Report (PDF)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 📲 QR CODE */}
      {masjid?.accountInfo?.qrCode && (
        <View style={[styles.cardCenter, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.qrTitle, { color: colors.TEXT }]}>
            Scan to Donate
          </Text>
          <Image
            source={{ uri: masjid.accountInfo.qrCode }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>
      )}
    </ScrollView>
  );
};

export default MasjidInfo;

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  cardCenter: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },

  name: { fontSize: 20, fontWeight: '700' },
  address: { fontSize: 15, marginTop: 6, lineHeight: 20 },

  amountLabel: { fontSize: 14 },
  amountValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },

  collectedText: { marginVertical: 8, fontSize: 14 },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },

  breakupBtn: { marginTop: 14 },
  breakupText: { fontSize: 15, fontWeight: '600' },

  breakupBox: { marginTop: 12, borderTopWidth: 1, paddingTop: 12 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: '600', textAlign: 'right', flex: 1 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },

  upiBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
  },
  upiLabel: { fontSize: 13 },
  upiValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  copyHint: { fontSize: 12, marginTop: 4 },

  qrTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  qrImage: { width: 220, height: 220 },

  reportBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportBtnText: { fontSize: 15, fontWeight: '600' },
});
