import { Alert, Platform, ToastAndroid } from "react-native";

export const showMessage = (message:string)=>{
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS fallback
    Alert.alert(message);
  }
}
