import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BudgetInfo } from '../AddMasjidScreen';


interface BudgetInfoProps {
  budgetInfo : BudgetInfo;
  setBudgetInfo : (budgetInfo : BudgetInfo | ((prev : BudgetInfo) => BudgetInfo)) => void
}

const BudegetInfoScreen : React.FC<BudgetInfoProps> = ({ budgetInfo, setBudgetInfo }) => {

  const handleChangeInput = (name: string, value: string) => {
    setBudgetInfo((prev: BudgetInfo) => (
        {
            ...prev,
            [name] : value
        }
    ))
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


  return (
        <ScrollView style={styles.stepContainer}>
         <Text style={styles.label}>No. of Moazzins</Text>
         <TextInput style={styles.input} value={budgetInfo.noOfMoazzins} onChangeText={(text : string) => handleChangeInput("noOfMoazzins", text)} keyboardType="numeric" />

         <Text style={styles.label}>Moazzin Salary</Text>
         <TextInput style={styles.input} value={budgetInfo.moazzinSalary} onChangeText={(text : string) => handleChangeInput("moazzinSalary", text)} keyboardType="numeric" />

         <Text style={styles.label}>No. of Staff</Text>
         <TextInput style={styles.input} value={budgetInfo.noOfStaff} onChangeText={(text : string) => handleChangeInput("noOfStaff", text)} keyboardType="numeric" />

         <Text style={styles.label}>Staff Salary</Text>
         <TextInput style={styles.input} value={budgetInfo.staffSalary} onChangeText={(text : string) => handleChangeInput("staffSalary", text)} keyboardType="numeric" />

         <Text style={styles.label}>Electricity Bill</Text>
         <TextInput style={styles.input} value={budgetInfo.electricityBill} onChangeText={(text : string) => handleChangeInput("electricityBill", text)} keyboardType="numeric" />

         <Text style={styles.label}>Water Bill</Text>
         <TextInput style={styles.input} value={budgetInfo.waterBill} onChangeText={(text : string) => handleChangeInput("waterBill", text)} keyboardType="numeric" />

         <Text style={styles.label}>Maintenance</Text>
         <TextInput style={styles.input} value={budgetInfo.maintenance} onChangeText={(text : string) => handleChangeInput("maintenance", text)} keyboardType="numeric" />

         <Text style={styles.label}>Other Expenses</Text>
         <TextInput style={styles.input} value={budgetInfo.otherExpenses} onChangeText={(text : string) => handleChangeInput("otherExpenses", text)} keyboardType="numeric" />

         <View style={{ marginTop: 12 }}>
           <Text style={{ fontWeight: '700' }}>Total: ₹ {totalBudget().toFixed(2)}</Text>
         </View>
       </ScrollView>
  )
}

export default BudegetInfoScreen;

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 }
});