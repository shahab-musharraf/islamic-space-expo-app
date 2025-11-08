// src/screens/AddMasjidScreen.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// import { useMasjidsNearby } from '../hooks/useMasjidsNearby';
import { useCreateMasjidMutation } from '@/apis/masjid/useCreateMasjid';
import { Theme } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BasicInfoScreen from './components/BasicInfoScreen';
import BudegetInfoScreen from './components/BudegetInfoScreen';
import PaymentInfoScreen from './components/PaymentInfoScreen';
import PrayerInfoScreen from './components/PrayerInfoScreen';

export type Asset = {
  uri: string;
  type: string; // "image" | "video"
  name: string;
  mimeType?: string;
};

export type PdfFile = {
  copyError? : string | undefined;
  fileCopyUri: string | null;
  uri: string;
  type: string | null// "image" | "video"
  name: string | null
  size: number | null
}

export interface BasicInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  images: Asset[];
  videos: Asset[];
  isUnderConstruction: boolean;
  secretaryName: string;
}

export interface BudgetInfo {
  moazzinSalary: string;
  staffSalary: string;
  electricityBill: string;
  waterBill: string;
  maintenance: string;
  otherExpenses: string;
  noOfMoazzins: string;
  noOfStaff: string;
}

export interface UnderConstructionBudgetInfo {
  startDate: Date | null;
  expectedEndDate: Date | null;
  estimatedBudget: string;
  constructingByRegisteredCompany: boolean;
  offlineCollectedAmount: string;
  budgetReport: PdfFile | null;
}

export interface PrayerInfo {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuah: string;
  iftaar: string;
  sehri: string;
  taraweeh: string;
  eid_ul_fitr: string;
  eid_ul_azha: string;

}

export interface PaymentInfo {
  accountHolderName : string;
  accountNumber : string;
  ifscCode : string;
  branch : string;
  upiId : string;
  qrCode: Asset

}


const STEP_COUNT = 4;

const AddMasjidScreen: React.FC = () => {
    const { colors } = useTheme() as Theme;
  
  const [step, setStep] = useState(1);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    address: '',
    city : '',
    state: '',
    pincode : '',
    latitude: '',
    longitude: '',
    images : [],
    videos : [],
    isUnderConstruction: false,
    secretaryName: ''
  })

  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo>({
    moazzinSalary: '',
    staffSalary: '',
    electricityBill: '',
    waterBill: '',
    maintenance: '',
    otherExpenses: '',
    noOfMoazzins: '',
    noOfStaff: '',
  });

  const [underConstructionBudgetInfo, setUnderConstructionBudgetInfo] = useState<UnderConstructionBudgetInfo>({
    budgetReport: null,
    constructingByRegisteredCompany: false,
    estimatedBudget: '',
    expectedEndDate: null,
    offlineCollectedAmount: '',
    startDate: null
  })

  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo>({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
    jumuah: '',
    iftaar: '',
    sehri: '',
    taraweeh: '',
    eid_ul_fitr : '',
    eid_ul_azha : ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    qrCode: {
      name: '',
      type: 'qrCode',
      uri: ''
    }
  })


  const createMasjidMutation = useCreateMasjidMutation();

  const onSubmit = async () => {

    try {
      const fd = new FormData();

      const {videos, images, ...remBasicInfo} = basicInfo;
      const { qrCode, ...remPaymentInfo } = paymentInfo;

      fd.append('masjidInfo', JSON.stringify({remBasicInfo}));
      fd.append('budgetInfo', JSON.stringify(budgetInfo));
      fd.append('prayerInfo', JSON.stringify(prayerInfo));
      fd.append('paymentInfo', JSON.stringify(remPaymentInfo))

      // we must append files as field 'media' multiple times (backend expects anyFiles)
      // convert local uri to blob and append
      const appendFile = async (asset: Asset, fieldName = 'media') => {
        // fetch blob from file uri
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        // for RN + expo, provide a name and type
        const fileName = asset.name || asset.uri.split('/').pop();
        // @ts-ignore FormData typing in RN differs
        fd.append(fieldName, {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        } as any);
      };

      // append images/videos
      for (const img of basicInfo.images) await appendFile(img, 'media');
      for (const vid of basicInfo.videos) await appendFile(vid, 'media');
      await appendFile(qrCode, 'media')

      createMasjidMutation.mutate(fd, {
        onSuccess: (data) => {
          Alert.alert("✅ Masjid created successfully")
        },
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to prepare upload');
    }
  };

  // UI pieces
  const renderProgress = () => {
    const widthPercent = (step / STEP_COUNT) * 100;
    return (
      <View style={styles.progressWrap}>
        <View style={[styles.progressBarBg, {backgroundColor: colors.DISABLED_TEXT}]}>
          <View style={[styles.progressBarFill, { width: `${widthPercent}%`, backgroundColor: colors.TINT }]} />
        </View>
        <View style={styles.stepsRow}>
          <Text style={[styles.stepLabel, step === 1 && styles.stepActive]}>Basic</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepActive]}>Budget</Text>
          <Text style={[styles.stepLabel, step === 3 && styles.stepActive]}>Prayers</Text>
          <Text style={[styles.stepLabel, step === 4 && styles.stepActive]}>Payment</Text>
        </View>
      </View>
    );
  };

  const handleNextBtn = () => {

    if((step === 1 && (
      !basicInfo.name ||
      !basicInfo.address ||
      !basicInfo.city ||
      !basicInfo.state ||
      !basicInfo.pincode ||
      !basicInfo.latitude ||
      !basicInfo.longitude ||
      basicInfo.images.length === 0 ||
      basicInfo.videos.length === 0
    )) ){
      Alert.alert(
        "Incomplete Information",
        "Please fill all required fields and upload at least one image and video."
      );
      return;
    }

    setStep((s) => Math.min(STEP_COUNT, s + 1));
  }

  console.log(paymentInfo, 'qrrrrrrrrrr')

  return (
    <SafeAreaView style={styles.container}>
      {renderProgress()}

      <View style={styles.content}>
        {step === 1 && <BasicInfoScreen basicInfo = {basicInfo} setBasicInfo = {setBasicInfo} />}
        {step === 2 && <BudegetInfoScreen budgetInfo={budgetInfo} setBudgetInfo={setBudgetInfo} 
                        isUnderConstruction ={basicInfo.isUnderConstruction} 
                        underConstructionBudgetInfo={underConstructionBudgetInfo}
                        setUnderConstructionBudgetInfo ={setUnderConstructionBudgetInfo}
        />}
        {step === 3 && <PrayerInfoScreen prayerInfo={prayerInfo} setPrayerInfo={setPrayerInfo} />}
        {step === 4 && <PaymentInfoScreen paymentInfo={paymentInfo} setPaymentInfo={setPaymentInfo} />}

        <View style={{ flexDirection: 'row-reverse', gap: 8, height: 80, alignItems:'center' }}>
          

          {step < STEP_COUNT ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={handleNextBtn}
            >
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={() => onSubmit()} disabled={createMasjidMutation.isPending}>
              {createMasjidMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Submit</Text>}
            </TouchableOpacity>
          )}

          {step > 1 ? (
            <TouchableOpacity style={styles.btnOutline} onPress={() => setStep((s) => s - 1)}>
              <Text>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddMasjidScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:'white' },
  progressWrap: { paddingHorizontal: 16 },
  progressBarBg: { height: 2, borderRadius: 100, overflow: 'hidden' },
  progressBarFill: { height: 2,  borderRadius: 100, width: '0%' },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  stepLabel: { fontSize: 12, color: '#666' },
  stepActive: { color: '#111', fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  stepContainer: { flex: 1 },
  label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 },
  btn: { backgroundColor: '#e6e6ff', paddingBlock: 10, paddingInline: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#111', fontWeight: '700' },
  btnOutline: { borderWidth: 1, borderColor: '#ddd', paddingBlock: 10, paddingInline: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#0008', borderRadius: 12, padding: 2 },
  footer: { alignItems:'flex-end', paddingInline: 16, paddingBlock: 20, height:100, backgroundColor:'red'},
  masjidCard: { width: 140, padding: 8, backgroundColor: '#fafafa', borderRadius: 8, marginRight: 12 },
  masjidThumb: { width: 120, height: 80, borderRadius: 6, backgroundColor: '#eee', marginBottom: 8 },
});
