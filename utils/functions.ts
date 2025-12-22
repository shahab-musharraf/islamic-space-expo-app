import { Alert, Platform, ToastAndroid } from "react-native";

export const showMessage = (message:string)=>{
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS fallback
    Alert.alert(message);
  }
}

export const  camelToWords = (str:string) => {
  if (!str) return "";

  // Insert space before capital letters
  const spaced = str.replace(/([A-Z])/g, " $1");

  // Capitalize the first character
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}