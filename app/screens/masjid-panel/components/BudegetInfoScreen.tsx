import { Theme } from '@/constants/types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BudgetInfo, UnderConstructionBudgetInfo } from '../AddMasjidScreen';


interface BudgetInfoProps {
  isUnderConstruction:boolean;
  budgetInfo : BudgetInfo;
  setBudgetInfo : (budgetInfo : BudgetInfo | ((prev : BudgetInfo) => BudgetInfo)) => void
  underConstructionBudgetInfo: UnderConstructionBudgetInfo;
  setUnderConstructionBudgetInfo: (underConstructionBudgetInfo : UnderConstructionBudgetInfo | ((prev : UnderConstructionBudgetInfo) => UnderConstructionBudgetInfo)) => void
}

const BudegetInfoScreen : React.FC<BudgetInfoProps> = ({ budgetInfo, setBudgetInfo, isUnderConstruction, setUnderConstructionBudgetInfo, underConstructionBudgetInfo }) => {
  const { colors } = useTheme() as Theme;

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showCompletionPicker, setShowCompletionPicker] = useState(false);

  // 👇 3. Create 'onChange' handlers for each picker
  const onStartDateChange = (event:DateTimePickerEvent, selectedDate : Date | undefined) => {
    const currentDate = selectedDate || underConstructionBudgetInfo.startDate;
    setShowStartPicker(Platform.OS === 'ios'); // On iOS, picker isn't dismissed automatically
    setUnderConstructionBudgetInfo((prev:UnderConstructionBudgetInfo) => ({...prev, startDate: currentDate}))
    // You might want to call setBudgetInfo here
    // setBudgetInfo(prev => ({ ...prev, constructionStartDate: currentDate.toISOString() }));
  };

  const onCompletionDateChange = (event:DateTimePickerEvent, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || underConstructionBudgetInfo.expectedEndDate;
    setShowCompletionPicker(Platform.OS === 'ios');
    setUnderConstructionBudgetInfo((prev:UnderConstructionBudgetInfo) => ({...prev, expectedEndDate: currentDate}))
    // setBudgetInfo(prev => ({ ...prev, estimatedCompletionDate: currentDate.toISOString() }));
  };

  const handleChangeInput = (name: string, value: string) => {
    
    if(isUnderConstruction){
      setUnderConstructionBudgetInfo((prev:UnderConstructionBudgetInfo) => ({
        ...prev,
        [name] : value
      }))
    }
    else {
      setBudgetInfo((prev: BudgetInfo) => (
          {
              ...prev,
              [name] : value
          }
      ))

    }
  }

  const totalBudget = () => {
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
  const handleIsConstructingByRegisteredCompany = () => {
    setUnderConstructionBudgetInfo((prev: UnderConstructionBudgetInfo) => ({
          ...prev,
          constructingByRegisteredCompany : !prev.constructingByRegisteredCompany
      }))
  }

const handleSelectPdf = async () => {
  try {
    // 1. Call getDocumentAsync, passing the 'type' option
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf', // Only allow PDFs
      copyToCacheDirectory: true, // Default, but good to be explicit
    });

    console.log(result, 'document picked up');

    // 2. Check if the user CANCELED (the correct check)
    // The 'canceled' property is the key, based on the docs.
    if (result.canceled) {
      return; // Exit the function
    }

    // 3. Handle success (if NOT canceled)
    // The 'assets' property is an ARRAY, even for a single file.
    // We get the first item from the array.
    if (result.assets && result.assets.length > 0) {
      const selectedPdf = result.assets[0];

      console.log('PDF Selected: ', selectedPdf.name, selectedPdf.uri);
      setUnderConstructionBudgetInfo((prev:UnderConstructionBudgetInfo) => ({
        ...prev,
        budgetReport: {
          name: selectedPdf.name,
          uri: selectedPdf.uri,
          type: 'application/pdf',
          mimeType: 'application/pdf'
        }
      }))

    } else {
      // This should not happen if canceled=false, but good to check
      console.log('No assets found, though operation was not cancelled.');
    }

  } catch (err) {
    console.error('Unknown error while picking document:', err);
  }
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
          {!isUnderConstruction ? 
          <View>
            <Text style={styles.label}>No. of Moazzins</Text>
            <TextInput style={styles.input} value={budgetInfo.noOfMoazzins} onChangeText={(text : string) => handleChangeInput("noOfMoazzins", text)} keyboardType="numeric" />

            <Text style={styles.label}>One Moazzin Salary <Text style={{ color: colors.DISABLED_TEXT}}>{'(per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.moazzinSalary} onChangeText={(text : string) => handleChangeInput("moazzinSalary", text)} keyboardType="numeric" />

            <Text style={styles.label}>No. of Staff</Text>
            <TextInput style={styles.input} value={budgetInfo.noOfStaff} onChangeText={(text : string) => handleChangeInput("noOfStaff", text)} keyboardType="numeric" />

            <Text style={styles.label}>One Staff Salary <Text style={{ color: colors.DISABLED_TEXT}}>{'(per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.staffSalary} onChangeText={(text : string) => handleChangeInput("staffSalary", text)} keyboardType="numeric" />

            <Text style={styles.label}>Electricity Bill <Text style={{ color: colors.DISABLED_TEXT}}>{'(approx per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.electricityBill} onChangeText={(text : string) => handleChangeInput("electricityBill", text)} keyboardType="numeric" />

            <Text style={styles.label}>Water Bill <Text style={{ color: colors.DISABLED_TEXT}}>{'(approx per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.waterBill} onChangeText={(text : string) => handleChangeInput("waterBill", text)} keyboardType="numeric" />

            <Text style={styles.label}>Maintenance <Text style={{ color: colors.DISABLED_TEXT}}>{'(approx per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.maintenance} onChangeText={(text : string) => handleChangeInput("maintenance", text)} keyboardType="numeric" />

            <Text style={styles.label}>Other Expenses <Text style={{ color: colors.DISABLED_TEXT}}>{'(approx per month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.otherExpenses} onChangeText={(text : string) => handleChangeInput("otherExpenses", text)} keyboardType="numeric" />

            <Text style={styles.label}>Offline Collected Amount <Text style={{ color: colors.DISABLED_TEXT}}>{'(this month)'}</Text></Text>
            <TextInput style={styles.input} value={budgetInfo.offlineCollectedAmount} onChangeText={(text : string) => handleChangeInput("offlineCollectedAmount", text)} keyboardType="numeric" />


            <View style={{ marginVertical: 12 }}>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>Total Amount Required: ₹ {Number(totalBudget().toFixed(2)) - Number(budgetInfo.offlineCollectedAmount)}</Text>
            </View>
          </View>: 
          <View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Construction Start Date</Text>
              <TouchableOpacity style={[styles.dateBtn, {backgroundColor: colors.BUTTON_BG}]} onPress={() => setShowStartPicker(true)}>
                <Text style={{color: colors.BUTTON_TEXT}} >{underConstructionBudgetInfo.startDate ? underConstructionBudgetInfo.startDate.toDateString() : 'Select Date'}</Text>
              </TouchableOpacity>
            </View>
            {showStartPicker && (
              <DateTimePicker
                testID="startPicker"
                value={underConstructionBudgetInfo.startDate || new Date()}
                mode={'date'}
                display="default"
                onChange={onStartDateChange}
              />
            )}


            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Expected Complettion Date</Text>
              <TouchableOpacity style={[styles.dateBtn, {backgroundColor: colors.TINT}]} onPress={() => setShowCompletionPicker(true)}>
                <Text style={{color: colors.BUTTON_TEXT}} >{underConstructionBudgetInfo.expectedEndDate ? underConstructionBudgetInfo.expectedEndDate.toDateString() : 'Select Date'}</Text>
              </TouchableOpacity>
            </View>
            {/* This is the actual date picker modal */}
            {showCompletionPicker && (
              <DateTimePicker
                testID="endPicker"
                value={underConstructionBudgetInfo.expectedEndDate || new Date()}
                mode={'date'}
                display="default"
                onChange={onCompletionDateChange}
              />
            )}


            <Text style={styles.label}>Estimated Budget <Text style={{ color: colors.DISABLED_TEXT}}>{'(In Rupees)'}</Text></Text>
            <TextInput style={styles.input} value={underConstructionBudgetInfo.estimatedBudget} onChangeText={(text : string) => {
              if(text.length > 9) return;
              handleChangeInput("estimatedBudget", text)
            }} keyboardType="numeric" />

            <Text style={styles.label}>Amount Collected Offline <Text style={{ color: colors.DISABLED_TEXT}}>{'(In Rupees)'}</Text></Text>
            <TextInput style={styles.input} value={underConstructionBudgetInfo.offlineCollectedAmount} onChangeText={(text : string) => {
              if(text.length > 9) return;
              handleChangeInput("offlineCollectedAmount", text)
            }} keyboardType="numeric" />


            <View style={styles.underConstructionBox}>
              <Text style={[styles.label]}>Constructing by Registered Company ?</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={underConstructionBudgetInfo.constructingByRegisteredCompany ? colors.TINT : '#f4f3f4'}
                onValueChange={handleIsConstructingByRegisteredCompany}
                value={underConstructionBudgetInfo.constructingByRegisteredCompany}
              />
            </View>

            {/* 👇 4. Replace your TextInput with this */}
            <Text style={styles.label}>Upload Budget Report <Text style={{ color: colors.DISABLED_TEXT}}>{'(pdf format)'}</Text></Text>
            
            <Pressable style={[styles.fileInput, {backgroundColor: 'colors.DISABLED_INPUT_BG'}]} onPress={handleSelectPdf}>
              <Text style={underConstructionBudgetInfo.budgetReport ? styles.fileName : styles.placeholder}>
                {underConstructionBudgetInfo.budgetReport.name ? underConstructionBudgetInfo.budgetReport.name : 'Tap to select a PDF file'}
              </Text>
            </Pressable>

            {underConstructionBudgetInfo.constructingByRegisteredCompany ? 
            <Text style={{color: 'red'}}>Note: Please ensure the Budget Report includes an official signature and stamp from your construction company for verification.</Text>
              : <Text  style={{color: 'red'}}>Note: Please ensure the Budget Report is signed by the project's authorized person or committee head.</Text>
          }

          </View>
          }
       </KeyboardAwareScrollView>
  )
}

export default React.memo(BudegetInfoScreen);

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
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  dateBtn :{
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  underConstructionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },

  // 👇 Add these styles
  placeholder: {
    color: '#aaa',

  },
  fileName: {
    color: '#000',
  },
});