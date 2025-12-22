import { showMessage } from '@/utils/functions';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PaymentInfo } from '../AddMasjidScreen';



interface PaymentInfoProps {
  paymentInfo : PaymentInfo;
  setPaymentInfo : (budgetInfo : PaymentInfo | ((prev : PaymentInfo) => PaymentInfo)) => void;
  editable: boolean;
}

const MAXX_IMAGES_ALLOWED = 1

const PaymentInfoScreen : React.FC<PaymentInfoProps>= ({ paymentInfo, setPaymentInfo, editable }) => {


  const pickImages = async () => {
    if(!editable){
      return;
    }
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 1,
        });
        if (!result.canceled) {
          const selected = result.assets.map((a) => ({
            uri: a.uri,
            type: 'image',
            name: a.fileName || `image-${Date.now()}.jpg`,
            mimeType: a.type ? `${a.type}/jpg` : 'image/jpeg'
            
          }));
          
          // max limit
          if( selected.length + (paymentInfo.qrCode.uri ? 1 : 0) > MAXX_IMAGES_ALLOWED ){
            showMessage("You can add upto "+MAXX_IMAGES_ALLOWED + " images");
            return;
          }
          
          setPaymentInfo((prev) => ({
              ...prev,
              qrCode: selected[0],
          }))
      }
      } catch (err) {
        console.warn('image pick error', err);
      }
    };

    const handleClearImages = () => {
      if(!editable){
        return;
      }
          setPaymentInfo((prev: PaymentInfo) => ({
              ...prev,
              images: []
          }))
      }

      const handleChangeInput = (name: string, value: string) => {
    setPaymentInfo((prev: PaymentInfo) => (
        {
            ...prev,
            [name] : value
        }
    ))
  }

  
  const removeImage = (uri: string) => {
      if(!editable){
        return;
      }
      setPaymentInfo((prev:PaymentInfo) => ({
          ...prev,
          qrCode: {...prev.qrCode, uri: ''}
      }))
  };


return (
    <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          // This enables it to scroll to the input automatically
          enableOnAndroid={true} 
          extraScrollHeight={20} // Fine-tune this if needed
        >
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput editable={editable} style={editable ? styles.input : styles.disabledInput} value={paymentInfo.accountHolderName} onChangeText={(text: string) => handleChangeInput('accountHolderName', text)} placeholder="Account Holder Name" />

        <Text style={styles.label}>Account Number</Text>
        <TextInput editable={editable} style={editable ? styles.input : styles.disabledInput} value={paymentInfo.accountNumber} onChangeText={(text: string) => handleChangeInput('accountNumber', text)} placeholder="Account Number" />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput editable={editable} style={[editable ? styles.input : styles.disabledInput, { flex: 1 }]} value={paymentInfo.ifscCode} onChangeText={(text: string) => handleChangeInput('ifscCode', text)} placeholder="IFSC Code" />
          <TextInput editable={editable} style={[editable ? styles.input : styles.disabledInput, { flex: 1 }]} value={paymentInfo.branch} onChangeText={(text: string) => handleChangeInput('branch', text)} placeholder="Branch" />
        </View>

         <Text style={styles.label}>UPI Id</Text>
        <TextInput editable={editable} style={editable ? styles.input : styles.disabledInput} value={paymentInfo.upiId} onChangeText={(text: string) => handleChangeInput('upiId', text)} placeholder="Enter UPI Id" />

        <View>
          <Text style={styles.label}>QR Code</Text>
          {editable && <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
            <TouchableOpacity style={{...styles.btn, backgroundColor: editable ? '#e6e6ff' : 'gray'}} onPress={pickImages}>
              <Text style={{...styles.btnText, color: editable ? '#111' : 'white'}}>Select QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutline, {backgroundColor: editable ? 'brown' : 'gray'}]} onPress={handleClearImages}>
              <Text style={{color: 'white'}}>Clear</Text>
            </TouchableOpacity>
          </View>}

          {paymentInfo?.qrCode?.uri && (
            <View style={{ width: 110, height: 80, position: 'relative' }}>
              <Image
                source={{ uri: paymentInfo.qrCode.uri }}
                style={{ width: '100%', height: '100%', borderRadius: 6 }}
              />

              {editable && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(paymentInfo.qrCode.uri)}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
          
          
          {!editable && <View
    style={{
      backgroundColor: '#fff7e6',
      borderLeftWidth: 4,
      borderLeftColor: '#ffa500',
      padding: 12,
      borderRadius: 6,
      marginVertical: 15,
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
      }
      </ScrollView>
    </KeyboardAwareScrollView>
  )
};


  const styles = StyleSheet.create({
     container: {
    flex: 1,
  },
  scrollContent: { // <-- ADD THIS NEW STYLE
    flexGrow: 1,
    // paddingBottom: 24, // Adds a little space at the very bottom
  },
    stepContainer: { flex: 1 },
    label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 },
    disabledInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#f2f2f2', color: '#555' , marginBottom: 8 },
    btn: { padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#111', fontWeight: '700' },
    btnOutline: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#0008', borderRadius: 12, padding: 2 },
    fetchLocationBtn: { position: 'absolute', top: 6, right: 6, borderRadius: 12, padding: 2, color: 'blue' },
    fetchLocationBtnText: {color: "blue"},
    modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  exitBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'gray',
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearBtn: {
    backgroundColor: 'brown'
  }
  });
  

export default PaymentInfoScreen