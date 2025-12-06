// src/screens/AddMasjidScreen.tsx
import React, { useEffect, useState } from 'react';
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
import { useGetMasjidDetailsToUpdate } from '@/apis/masjid/useGetMasjidDetailsToUpdate';
import { useUpdateMasjidMutation } from '@/apis/masjid/useUpdateMasjidMutation';
import { Theme } from '@/constants/types';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { showMessage } from '@/utils/functions';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
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
  secretaryMobile: string;
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
  offlineCollectedAmount:string;
  totalBudgetRequired: string
}

export interface UnderConstructionBudgetInfo {
  startDate: Date | null;
  expectedEndDate: Date | null;
  estimatedBudget: string;
  constructingByRegisteredCompany: boolean;
  offlineCollectedAmount: string;
  budgetReport: Asset;
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

const totalBudget = (budgetInfo:BudgetInfo) => {
    const nums =[
      Number(budgetInfo?.moazzinSalary || 0) * Number(budgetInfo?.noOfMoazzins) || 0,
      Number(budgetInfo?.staffSalary || 0) * Number(budgetInfo?.noOfStaff) || 0,
      Number(budgetInfo?.electricityBill || 0),
      Number(budgetInfo?.waterBill || 0),
      Number(budgetInfo?.maintenance || 0),
      Number(budgetInfo?.otherExpenses || 0),
    ];
    return nums.reduce((s, n) => s + n, 0);
  };


const getChangedFields = <T extends Record<string, any>>(currentInfo: T, fetchedInfo: T): Partial<T> => {
    const changedFields: Partial<T> = {};
    if (!fetchedInfo) return currentInfo;

    for (const key of Object.keys(currentInfo) as (keyof T)[]) {
        const currentValue = currentInfo[key];
        const fetchedValue = fetchedInfo[key];

        // Helper function to get a consistent comparable string
        const getComparableString = (value: any): string | null => {
            if (value === null || value === undefined) {
                return null;
            }
            if (value instanceof Date) {
                // Use toISOString() to standardize the date format for comparison
                return value.toISOString(); 
            }
            return String(value);
        };
        
        const currentStr = getComparableString(currentValue);
        const fetchedStr = getComparableString(fetchedValue);

        // Compare the standardized strings
        if (currentStr !== fetchedStr) {
            // If it's a Date, we store the object itself (or its ISO string) for the payload.
            // Since your budget state uses Date|null, we store that.
            changedFields[key] = currentValue; 
        }
    }
    return changedFields;
};

const STEP_COUNT = 4;

const AddMasjidScreen: React.FC = ({params}: any) => {
  const route : any = useRoute();
  const navigation: any = useNavigation();

  const {location} = useUserLocation();


  const masjidId = route?.params?.masjidId;
  const editAccountInfo = route?.params?.editAccountInfo;
  const isEditMode = !!masjidId;
  console.log(masjidId, isEditMode, 'received to update');
  const createMasjidMutation = useCreateMasjidMutation();

  const updateMasjidMutation = useUpdateMasjidMutation();


  const { data: fetchedMasjidData, isLoading: fechingMasjidData, isSuccess: fetchingMasjidDataSuccess } = useGetMasjidDetailsToUpdate(masjidId);


    const { colors } = useTheme() as Theme;
    const { profile } = useUserProfileStore();
  
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
    secretaryName: profile?.name || '',
    secretaryMobile: profile?.mobile || '',
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
    offlineCollectedAmount: '',
    totalBudgetRequired: ''
  });

  const [underConstructionBudgetInfo, setUnderConstructionBudgetInfo] = useState<UnderConstructionBudgetInfo>({
    budgetReport: {
      name: '',
      type: '',
      uri: '',
      mimeType: ''
    },
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



  const onSubmit = async () => {
    // console.log(basicInfo, budgetInfo, underConstructionBudgetInfo, prayerInfo, paymentInfo, 'Data to be submitted!')
        if(step === 4 && (
          !paymentInfo.accountHolderName ||
          !paymentInfo.accountNumber ||
          !paymentInfo.branch ||
          !paymentInfo.ifscCode ||
          !paymentInfo.upiId ||
          (!paymentInfo.qrCode.uri)
        )){
          Alert.alert(
            "Incomplete Information",
            "Please fill all the required fields"
          );
          return;
    }


    try {
      const fd = new FormData();

      const {videos, images, ...remBasicInfo} = basicInfo;
      const { qrCode, ...remPaymentInfo } = paymentInfo;
      const { budgetReport, ...remUnderConstructionBudgetInfo } = underConstructionBudgetInfo;

      fd.append('masjidInfo', JSON.stringify(remBasicInfo));
      fd.append('budgetInfo', JSON.stringify({...budgetInfo, totalBudgetRequired: totalBudget(budgetInfo).toFixed(2)}));
      fd.append('prayerInfo', JSON.stringify(prayerInfo));
      fd.append('paymentInfo', JSON.stringify(remPaymentInfo))
      fd.append('underConstructionBudgetInfo', JSON.stringify(remUnderConstructionBudgetInfo))

      // we must append files as field 'media' multiple times (backend expects anyFiles)
      // convert local uri to blob and append
      const appendFile = async (asset: Asset, fieldName = 'media') => {
        if (!asset || !asset.uri) {
        console.warn(`Skipping asset for field '${fieldName}' (file is missing)`);
        return;
      }

      // 2. REMOVED fetch() and blob() lines. They are not needed.

      const fileName = asset.name || asset.uri.split('/').pop();
        // @ts-ignore FormData typing in RN differs
        fd.append(fieldName, {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' :  asset.type === 'image' ? 'image/jpeg' : 'application/pdf'),
        } as any);
      };

      // append images/videos
      for (const img of basicInfo.images) appendFile(img, 'images');
      for (const vid of basicInfo.videos) appendFile(vid, 'videos');
      appendFile(qrCode, 'qrCode')
      if(basicInfo.isUnderConstruction){
        appendFile(budgetReport, 'budgetReport')
      }

      createMasjidMutation.mutate(fd, {
        onSuccess: (data) => {
          showMessage("Masjid created successfully")
          navigation.replace('screens/masjid-panel/MasjidPanelScreen');
          
        },
      });
    } catch (err) {
      // console.error(err);
      Alert.alert('Error', 'Failed to prepare upload');
    }
  };


  const onUpdate = async () => {
    if(!fetchedMasjidData) {
      Alert.alert(
            "Unable to fetch original data",
            "Something went wrong!"
          );
          return;
    }
    // console.log(basicInfo, budgetInfo, underConstructionBudgetInfo, prayerInfo, paymentInfo, 'Data to be submitted!')
        if(step === 4 && (
          !paymentInfo.accountHolderName ||
          !paymentInfo.accountNumber ||
          !paymentInfo.branch ||
          !paymentInfo.ifscCode ||
          !paymentInfo.upiId ||
          (!paymentInfo.qrCode.uri)
        )){
          Alert.alert(
            "Incomplete Information",
            "Please fill all the required fields"
          );
          return;
    }


    try {
      const fd = new FormData();

      const {videos, images, ...remBasicInfo} = basicInfo;
      const { qrCode, ...remPaymentInfo } = paymentInfo;
      const { budgetReport, ...remUnderConstructionBudgetInfo } = underConstructionBudgetInfo;

      // const changedBasicInfo : any= {};
      // for (const key of Object.keys(remBasicInfo) as (keyof typeof remBasicInfo)[]) {
      //   // 2. The property access is now safe because 'key' is known to be a valid key
      //   if (remBasicInfo[key] !== fetchedMasjidData[key]) {
      //     changedBasicInfo[key] = remBasicInfo[key];
      //   }
      // }
      const changedBasicInfo = getChangedFields(remBasicInfo, fetchedMasjidData);
      if(changedBasicInfo.latitude && changedBasicInfo.longitude){
      }
      else if(changedBasicInfo.latitude || changedBasicInfo.longitude){
        changedBasicInfo.latitude ? changedBasicInfo.longitude = basicInfo.longitude : changedBasicInfo.latitude = basicInfo.latitude
      }
      const changedBudgetInfo = getChangedFields(
            {...budgetInfo, totalBudgetRequired: totalBudget(budgetInfo).toFixed(2)},
            fetchedMasjidData.budgetInfo
        );
      const changedPrayerInfo = getChangedFields(
            prayerInfo, 
            fetchedMasjidData.prayerInfo
        );
        const changedPaymentInfo = getChangedFields(
            remPaymentInfo, 
            fetchedMasjidData.accountInfo
        );
        const changedUnderConstructionBudgetInfo = getChangedFields(
            remUnderConstructionBudgetInfo, 
            fetchedMasjidData.underConstructionBudgetInfo
        );
        console.log(remUnderConstructionBudgetInfo, fetchedMasjidData.underConstructionBudgetInfo, changedUnderConstructionBudgetInfo, '&&&&&&&&&&&&&&&&&&')

      const newVideos = videos.filter((vid) => !vid.name.startsWith('islamic-space-existing-masjid-video'));
      const oldVideos = videos.filter((vid) => vid.name.startsWith('islamic-space-existing-masjid-video'));

      const newImages = images.filter((img) => !img.name.startsWith('islamic-space-existing-masjid-image'));
      const oldImages = images.filter((img) => img.name.startsWith('islamic-space-existing-masjid-image'));

      const newQrCode = qrCode && !qrCode.name.startsWith('islamic-space-existing-masjid-qrcode') ? qrCode : null;
      const oldQrCode = qrCode && qrCode.name.startsWith('islamic-space-existing-masjid-qrcode') ? qrCode : null;

      const oldBudgerReport = budgetReport && budgetReport.name.startsWith('islamic-space-existing-masjid-budgetreport') ? budgetReport : null;
      const newBudgetReport = budgetReport && !budgetReport.name.startsWith('islamic-space-existing-masjid-budgetreport') ? budgetReport : null;

      if(Object.keys(changedBasicInfo).length){
        fd.append('masjidInfo', JSON.stringify(changedBasicInfo));
      }
      if(Object.keys(changedBudgetInfo).length){
        fd.append('budgetInfo', JSON.stringify(changedBudgetInfo));
      }
      if(Object.keys(changedPrayerInfo).length){
        fd.append('prayerInfo', JSON.stringify(changedPrayerInfo));
      }
      if(Object.keys(changedPaymentInfo).length){
        fd.append('paymentInfo', JSON.stringify(changedPaymentInfo))
      }
      if(Object.keys(changedUnderConstructionBudgetInfo).length){
        fd.append('underConstructionBudgetInfo', JSON.stringify(changedUnderConstructionBudgetInfo));
      }
      if( oldVideos.length ){
        fd.append('oldVideos', JSON.stringify(oldVideos.map((vid) => vid.uri)));
      }
      if( oldImages.length ){
        fd.append('oldImages', JSON.stringify(oldImages.map((img) => img.uri)));
      }
      if(oldQrCode){
        fd.append('oldQrCode', JSON.stringify(oldQrCode.uri));
      }
      if(oldBudgerReport){
        fd.append('oldBudgerReport', JSON.stringify(oldBudgerReport.uri));
      }

      // we must append files as field 'media' multiple times (backend expects anyFiles)
      // convert local uri to blob and append
      const appendFile = async (asset: Asset, fieldName = 'media') => {
        if (!asset || !asset.uri) {
          console.warn(`Skipping asset for field '${fieldName}' (file is missing)`);
          return;
        }

        // 2. REMOVED fetch() and blob() lines. They are not needed.

        const fileName = asset.name || asset.uri.split('/').pop();
        // @ts-ignore FormData typing in RN differs
        fd.append(fieldName, {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' :  asset.type === 'image' ? 'image/jpeg' : 'application/pdf'),
        } as any);
      };

      // append images/videos
      if(newImages && newImages.length > 0){
        for (const img of newImages) await appendFile(img, 'images');
      }
      if(newVideos && newVideos.length > 0){
        for (const vid of newVideos) await appendFile(vid, 'videos');
      }
      if(newQrCode){
        await appendFile(newQrCode, 'qrCode');
      }
      if(basicInfo.isUnderConstruction && newBudgetReport){
        await appendFile(newBudgetReport, 'budgetReport');
      }

      updateMasjidMutation.mutate({masjidId, formData: fd}, {
        onSuccess: (data) => {
          showMessage("Request to update masjid sent successfully")
          if(editAccountInfo){
            navigation.replace('screens/masjid-panel/MasjidPanelScreen');
          }
          else {
            navigation.replace('screens/admin-panel/AdminPanelScreen');
          }
          
        },
      });
    } catch (err) {
      // console.error(err);
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
          {!basicInfo.isUnderConstruction && <Text style={[styles.stepLabel, step === 3 && styles.stepActive]}>Prayers</Text>}
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
      (!basicInfo.images.length) ||
      (!basicInfo.videos.length)
    )) ){
      Alert.alert(
        "Incomplete Information",
        "Please fill all required fields and upload at least one image and video."
      );
      return;
    }

    if(step === 2 && !basicInfo.isUnderConstruction && (
      !budgetInfo.electricityBill ||
      !budgetInfo.maintenance ||
      !budgetInfo.moazzinSalary ||
      !budgetInfo.noOfMoazzins ||
      !budgetInfo.noOfStaff ||
      !budgetInfo.staffSalary ||
      !budgetInfo.otherExpenses ||
      !budgetInfo.waterBill
    )){
      Alert.alert(
        "Incomplete Information",
        "Please fill all the fields"
      );
      return;
    }

    if(step === 2 && basicInfo.isUnderConstruction && (
      !underConstructionBudgetInfo.budgetReport?.uri ||
      !underConstructionBudgetInfo.estimatedBudget ||
      !underConstructionBudgetInfo.offlineCollectedAmount ||
      !underConstructionBudgetInfo.startDate ||
      !underConstructionBudgetInfo.expectedEndDate      
    )){
      Alert.alert(
        "Incomplete Information",
        "Please fill all the fields"
      );
      return;
    }

    if(step === 2 && basicInfo.isUnderConstruction && (Number(underConstructionBudgetInfo.offlineCollectedAmount) > Number(underConstructionBudgetInfo.estimatedBudget))){
      Alert.alert(
        "Alert",
        "Offline collected amount is greater than the target budget"
      );
      return;
    }

    if(step === 3 && (
      !prayerInfo.fajr ||
      !prayerInfo.dhuhr || 
      !prayerInfo.asr ||
      !prayerInfo.maghrib ||
      !prayerInfo.isha ||
      !prayerInfo.jumuah
    )){
      Alert.alert(
        "Incomplete Information",
        "Please fill all the required fields"
      );
      return;
    }


    if(basicInfo.isUnderConstruction && step === 2){
      setStep((s) => Math.min(STEP_COUNT, s + 2));
    }
    else {
      setStep((s) => Math.min(STEP_COUNT, s + 1));
    }
  }

  const handleGoBack = () => {
    if(basicInfo.isUnderConstruction && step === 4){
      setStep((s) => Math.min(STEP_COUNT, s - 2));
    }
    else {
      setStep((s) => Math.min(STEP_COUNT, s - 1));
    }
  }


  useEffect(() => {

    if(isEditMode && fetchingMasjidDataSuccess && fetchedMasjidData){
      console.log('fetchedMasjidData to update:', fetchedMasjidData);
      setBasicInfo({
        name: fetchedMasjidData.name,
        address: fetchedMasjidData.address,
        city : fetchedMasjidData.city,
        state: fetchedMasjidData.state,
        pincode : fetchedMasjidData.pincode,
        latitude: fetchedMasjidData.latitude.toString(), 
        longitude: fetchedMasjidData.longitude.toString(),
        images: fetchedMasjidData?.images?.map((image : string, idx: number) => ({
          uri: image,
          name: `islamic-space-existing-masjid-image-${idx+1}|${image}`,
          type: 'image',
        })) || [],
        videos: fetchedMasjidData?.videos?.map((video : string, idx: number) => ({
          uri: video,
          name: `islamic-space-existing-masjid-video-${idx+1}|${video}`,
          type: 'video',
        })) || [],
        isUnderConstruction: fetchedMasjidData.isUnderConstruction,
        secretaryName: fetchedMasjidData.secretaryName,
        secretaryMobile: fetchedMasjidData.secretaryMobile,
      })
      setPrayerInfo(fetchedMasjidData.prayerInfo)
      setPaymentInfo({...fetchedMasjidData.accountInfo, qrCode: {
        uri: fetchedMasjidData.accountInfo.qrCode,
        name: `islamic-space-existing-masjid-qrcode|${fetchedMasjidData.accountInfo.qrCode}`,
        type: 'image',
      }})
      if(!fetchedMasjidData.isUnderConstruction){
        setBudgetInfo(fetchedMasjidData.budgetInfo)
      }

      if(fetchedMasjidData.isUnderConstruction){
        setUnderConstructionBudgetInfo({...fetchedMasjidData.underConstructionBudgetInfo, budgetReport: {
          uri: fetchedMasjidData.underConstructionBudgetInfo.budgetReport,
          name: `islamic-space-existing-masjid-budgetreport|${fetchedMasjidData.underConstructionBudgetInfo.budgetReport}`,
          type: 'application/pdf',
        },
      expectedEndDate: new Date(fetchedMasjidData.underConstructionBudgetInfo.expectedEndDate),
      startDate: new Date(fetchedMasjidData.underConstructionBudgetInfo.startDate),
      })
      }
    }

  }, [isEditMode, fetchedMasjidData, fetchingMasjidDataSuccess, fechingMasjidData]);


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
        {step === 3 && !basicInfo.isUnderConstruction && <PrayerInfoScreen prayerInfo={prayerInfo} setPrayerInfo={setPrayerInfo} />}
        {step === 4 ? isEditMode && editAccountInfo ? <PaymentInfoScreen paymentInfo={paymentInfo} setPaymentInfo={setPaymentInfo} />
        : <>
  <View
    style={{
      backgroundColor: '#fff7e6',
      borderLeftWidth: 4,
      borderLeftColor: '#ffa500',
      padding: 12,
      borderRadius: 6,
      marginVertical: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    }}
  >
    <Text style={{ fontSize: 20 }}>⚠️</Text>

    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', color: '#b36b00', marginBottom: 4 }}>
        You are not allowed to edit masjid's account info.
      </Text>

      <Text style={{ color: '#6a5f50' }}>
        You can verify the account info and if it's incorrect, mark the status as
        <Text style={{ fontWeight: 'bold' }}> Needs Correction </Text>
        with an appropriate reason.
      </Text>
    </View>
  </View>
</>
 : <></>  
      }

        <View style={{ flexDirection: 'row-reverse', gap: 8, height: 80, alignItems:'center' }}>
          

          {step < STEP_COUNT ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={handleNextBtn}
            >
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={() => isEditMode ? onUpdate() : onSubmit()} disabled={createMasjidMutation.isPending || updateMasjidMutation.isPending}>
              {createMasjidMutation.isPending || updateMasjidMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>{isEditMode ? "Update" : "Submit"}</Text>}
            </TouchableOpacity>
          )}

          {step > 1 ? (
            <TouchableOpacity style={styles.btnOutline} onPress={handleGoBack} disabled={createMasjidMutation.isPending || updateMasjidMutation.isPending}>
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
