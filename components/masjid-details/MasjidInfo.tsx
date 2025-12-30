import { Theme } from '@/constants/types';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useTheme } from '@react-navigation/native';
// import * as Clipboard from 'expo-clipboard';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FollowingIcons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';

import { roles } from '@/constants/roles';
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


/* ------------------ MAIN COMPONENT ------------------ */

const MasjidInfo = ({ masjid }: { masjid: any }) => {
  const [showBreakup, setShowBreakup] = useState(false);
  const { colors } = useTheme() as Theme;
  const { profile } = useUserProfileStore();

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

   const handleSupportUs = async () => {
    const upiId = masjid?.accountInfo?.upiId;
    if (!upiId) {
      Alert.alert("UPI ID not available", "No UPI ID found for this masjid");
      return;
    }
    const name = "Support App";
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      name
    )}&cu=INR`;

    const supported = await Linking.canOpenURL(upiUrl);

    if (supported) {
      Linking.openURL(upiUrl);
    } else {
      Alert.alert("UPI not available", "No UPI app found on this device");
    }
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      contentContainerStyle={styles.content}
    >
      {/* 🕌 BASIC INFO */}
      <View style={[styles.card, { backgroundColor: colors.CARD }]}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.TEXT }]}>
            {masjid.name}
          </Text>
          {isUnderConstruction && (
            <FollowingIcons name="construct" size={20} color="#FFA500" style={styles.constructionIconInline} />
          )}
        </View>
        <Text style={[styles.address, { color: colors.TEXT_SECONDARY }]}>
          {masjid.address}
        </Text>
      </View>

      { masjid?.accountInfo?.upiId &&
            <TouchableOpacity
            style={[styles.optionRow, styles.supportRow]}
            onPress={handleSupportUs}
            activeOpacity={0.8}
          >
            <View style={styles.iconTextContainer}>
              <FontAwesome5
                name="hand-holding-heart"
                size={20}
                color={colors.primary}
                style={styles.icon}
              />
              <View>
                <Text style={[styles.optionText, { color: colors.TEXT }]}>
                  Donate Us
                </Text>
                <Text style={styles.subText}>
                  Help us maintain the masjid and its activities
                </Text>
              </View>
            </View>

            <Feather name="chevron-right" size={22} color={colors.DISABLED_TEXT} />
          </TouchableOpacity>
          }

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
          {/* <UpiBox upiId={masjid?.accountInfo?.upiId} colors={colors} /> */}

          {masjid?.underConstructionBudgetInfo?.budgetReport && (
            <TouchableOpacity
              style={[styles.reportBtn, { backgroundColor: colors.BUTTON_BG }]}
              onPress={() =>
                Linking.openURL(masjid.underConstructionBudgetInfo.budgetReport)
              }
            >
              <Text style={[styles.reportBtnText, { color: 'white' }]}>
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


      {/* Admin/ Secretary Block */}
      {profile && profile.role && profile.role.split(',').some((r: string) => [roles.ADMIN, roles.MASJID_SECRETARY, roles.SUPER_ADMIN].includes(r.trim())) && (
        <View style={[styles.card, { backgroundColor: colors.CARD, marginTop: 16 }]}>
          <Text style={[styles.qrTitle, { color: colors.TEXT, textAlign: 'center' }]}>Administrative Details</Text>
          
          {masjid.letterPad && (
            <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', gap: 10 }}>
              <Text style={[ { color: colors.TEXT }]}>Letter Pad:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(masjid.letterPad)}>
                <Text style={[styles.link, { color: 'blue' }]}>View PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          <Row label="Status:" value={masjid.status} textColor={colors.TEXT} />
          <Row label="Verified By:" value={masjid.verifiedBy} textColor={colors.TEXT} />
          <Row label="Verified At:" value={masjid.verifiedAt ? new Date(masjid.verifiedAt).toLocaleString() : ''} textColor={colors.TEXT} />
          <Row label="Update Status:" value={masjid.updateStatus} textColor={colors.TEXT} />
          <Row label="Reason:" value={masjid.reason} textColor={colors.TEXT} />

          {/* Budget Details */}
          {masjid.budgetInfo && (
            <View style={{ marginTop: 12 }}>
              <Text style={[ { color: colors.TEXT }]}>Budget Info</Text>
              <Row label="Moazzin Salary:" value={`₹${masjid.budgetInfo.moazzinSalary}`} textColor={colors.TEXT} />
              <Row label="Staff Salary:" value={`₹${masjid.budgetInfo.staffSalary}`} textColor={colors.TEXT} />
              <Row label="Electricity Bill:" value={`₹${masjid.budgetInfo.electricityBill}`} textColor={colors.TEXT} />
              <Row label="Water Bill:" value={`₹${masjid.budgetInfo.waterBill}`} textColor={colors.TEXT} />
              <Row label="Maintenance:" value={`₹${masjid.budgetInfo.maintenance}`} textColor={colors.TEXT} />
              <Row label="Other Expenses:" value={`₹${masjid.budgetInfo.otherExpenses}`} textColor={colors.TEXT} />
              <Row label="No. of Moazzins:" value={masjid.budgetInfo.noOfMoazzins} textColor={colors.TEXT} />
              <Row label="No. of Staff:" value={masjid.budgetInfo.noOfStaff} textColor={colors.TEXT} />
              <Row label="Offline Collected:" value={`₹${masjid.budgetInfo.offlineCollectedAmount}`} textColor={colors.TEXT} />
              <Row label="Total Required:" value={`₹${masjid.budgetInfo.totalBudgetRequired}`} textColor={colors.TEXT} />
            </View>
          )}

          {/* Account Info */}
          {masjid.accountInfo && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Account Info</Text>
              <Row label="Holder Name:" value={masjid.accountInfo.accountHolderName} textColor={colors.TEXT} />
              <Row label="Account Number:" value={masjid.accountInfo.accountNumber} textColor={colors.TEXT} />
              <Row label="IFSC Code:" value={masjid.accountInfo.ifscCode} textColor={colors.TEXT} />
              <Row label="Branch:" value={masjid.accountInfo.branch} textColor={colors.TEXT} />
              <Row label="UPI ID:" value={masjid.accountInfo.upiId} textColor={colors.TEXT} />
            </View>
          )}

          {/* Construction Info */}
          {masjid.isUnderConstruction && masjid.underConstructionBudgetInfo && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Construction Info</Text>
              <Row label="Estimated Budget:" value={`₹${masjid.underConstructionBudgetInfo.estimatedBudget}`} textColor={colors.TEXT} />
              <Row label="Offline Collected:" value={`₹${masjid.underConstructionBudgetInfo.offlineCollectedAmount}`} textColor={colors.TEXT} />
              <Row label="Start Date:" value={masjid.underConstructionBudgetInfo.startDate ? new Date(masjid.underConstructionBudgetInfo.startDate).toLocaleDateString() : ''} textColor={colors.TEXT} />
              <Row label="Expected End Date:" value={masjid.underConstructionBudgetInfo.expectedEndDate ? new Date(masjid.underConstructionBudgetInfo.expectedEndDate).toLocaleDateString() : ''} textColor={colors.TEXT} />
              <Row label="Registered Company:" value={masjid.underConstructionBudgetInfo.constructingByRegisteredCompany ? 'Yes' : 'No'} textColor={colors.TEXT} />
            </View>
          )}
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
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  constructionIconInline: { marginLeft: 8 },
  address: { fontSize: 15, lineHeight: 20 },

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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  link: { fontSize: 14, textDecorationLine: 'underline' },

  breakupBox: { marginTop: 12, borderTopWidth: 1, paddingTop: 12 },
  supportRow: {
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    marginTop: 5,
  },

  subText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: '600', textAlign: 'right', flex: 1 },

  // sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },

  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    width: 35,
  },

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
