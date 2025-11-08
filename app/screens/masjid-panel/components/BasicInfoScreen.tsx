import { Theme } from "@/constants/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { showMessage } from "@/utils/functions";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Image, ImageBackground } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Asset, BasicInfo } from "../AddMasjidScreen";

interface BasicInfoProps  {
    basicInfo : BasicInfo,
    setBasicInfo :(value: BasicInfo | ((prev: BasicInfo) => BasicInfo)) => void
}

const MAXX_IMAGES_ALLOWED = 4
const MAXX_VIDEOS_ALLOWED = 1
const BasicInfoScreen : React.FC<BasicInfoProps> = ({ basicInfo, setBasicInfo }) => {
    const { colors } = useTheme() as Theme;
  const { location, clearLocation } = useUserLocationStore(state => state);
  const { fetchLocation, errorMsg, isLoading, handleExitApp, handleOpenSettings  } = useUserLocation();
  



  // const pickImages = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ['images'],
  //       allowsMultipleSelection: true,
  //       quality: 1,
  //     });
  //     if (!result.canceled) {
  //       const selected = result.assets.map((a) => ({
  //         uri: a.uri,
  //         type: 'image',
  //         name: a.fileName || `image-${Date.now()}.jpg`,
  //         mimeType: a.type ? `${a.type}/jpg` : 'image/jpeg'
          
  //       }));
        
  //       // max limit
  //       if( selected.length + basicInfo.images.length > MAXX_IMAGES_ALLOWED ){
  //         showMessage("You can add upto "+MAXX_IMAGES_ALLOWED + " images");
  //         return;
  //       }
        
  //       setBasicInfo((prev) => ({
  //           ...prev,
  //           images: [...prev.images, ...selected],
  //       }))
  //   }
  //   } catch (err) {
  //     console.warn('image pick error', err);
  //   }
  // };
  
  const pickImages = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      // --- New logic starts here ---

      const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
      const validAssets = [];
      let oversizedFiles = 0;

      for (const asset of result.assets) {
        // Check if asset has fileSize and if it's within the limit
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          oversizedFiles++;
        } else if (!asset.fileSize) {
          // Fallback: If fileSize is not available (rare), you can either
          // allow it, or try to fetch it manually. We'll allow it for now.
          console.warn('Could not determine file size for asset:', asset.uri);
          validAssets.push(asset);
        } else {
          // File is valid
          validAssets.push(asset);
        }
      }

      // Notify the user if some images were skipped
      if (oversizedFiles > 0) {
        showMessage(
          `${oversizedFiles} image(s) were too large (max 10MB) and were not added.`
        );
      }
      
      // If no valid images are left, stop here
      if (validAssets.length === 0) {
          return;
      }
      
      // --- New logic ends here ---

      // Now, map only the valid assets
      const selected = validAssets.map((a) => ({
        uri: a.uri,
        type: 'image',
        name: a.fileName || `image-${Date.now()}.jpg`,
        mimeType: a.type ? `${a.type}/jpg` : 'image/jpeg',
        // You can also store the file size if you need it
        // fileSize: a.fileSize 
      }));

      // Your existing max limit check
      if (selected.length + basicInfo.images.length > MAXX_IMAGES_ALLOWED) {
        showMessage('You can add up to ' + MAXX_IMAGES_ALLOWED + ' images');
        return;
      }

      setBasicInfo((prev) => ({
        ...prev,
        images: [...prev.images, ...selected],
      }));
    }
  } catch (err) {
    console.warn('image pick error', err);
  }
};
  // const pickVideo = async () => {
  //   try {
  //       const result = await ImagePicker.launchImageLibraryAsync({
  //           mediaTypes: ['videos'],
  //           allowsMultipleSelection: true,
  //           quality: 1,
  //       });
  //       if (!result.canceled) {
  //           const selected = result.assets.map((a) => ({
  //               uri: a.uri,
  //               type: 'video',
  //               name: a.fileName || `video-${Date.now()}.mp4`,
  //               mimeType: 'video/mp4'
  //           }))
            
  //           // max limit
  //           if( selected.length + basicInfo.videos.length > MAXX_VIDEOS_ALLOWED ){
  //               showMessage("You can add upto "+MAXX_VIDEOS_ALLOWED + " videos");
  //               return;
  //           }

  //           setBasicInfo((prev) => ({
  //               ...prev,
  //               videos: [...prev.videos, ...selected],
  //           }));
  //       }
  //   } catch (err) {
  //     console.warn('video pick error', err);
  //   }
  // };

  const pickVideo = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      quality: 1, // Note: quality is often ignored for videos
    });

    if (!result.canceled) {
      // --- New logic starts here ---

      const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
      const validAssets = [];
      let oversizedFiles = 0;

      for (const asset of result.assets) {
        // Check if asset has fileSize and if it's within the limit
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          oversizedFiles++;
        } else if (!asset.fileSize) {
          // Fallback: If fileSize is not available, allow it
          console.warn('Could not determine file size for asset:', asset.uri);
          validAssets.push(asset);
        } else {
          // File is valid
          validAssets.push(asset);
        }
      }

      // Notify the user if some videos were skipped
      if (oversizedFiles > 0) {
        showMessage(
          `${oversizedFiles} video(s) were too large (max 50MB) and were not added.`
        );
      }
      
      // If no valid videos are left, stop here
      if (validAssets.length === 0) {
          return;
      }

      // --- New logic ends here ---

      // Map only the valid assets
      const selected = validAssets.map((a) => ({
        uri: a.uri,
        type: 'video',
        name: a.fileName || `video-${Date.now()}.mp4`,
        mimeType: a.mimeType || 'video/mp4', // Use asset's mimeType if available
      }));

      // Your existing max limit check
      if (selected.length + basicInfo.videos.length > MAXX_VIDEOS_ALLOWED) {
        showMessage('You can add up to ' + MAXX_VIDEOS_ALLOWED + ' videos');
        return;
      }

      setBasicInfo((prev) => ({
        ...prev,
        videos: [...prev.videos, ...selected],
      }));
    }
  } catch (err) {
    console.warn('video pick error', err);
  }
};

  const handleChangeInput = (name: string, value: string) => {
    setBasicInfo((prev: BasicInfo) => (
        {
            ...prev,
            [name] : value
        }
    ))
  }

  
  const removeImage = (uri: string) => {
      setBasicInfo((prev:BasicInfo) => ({
          ...prev,
          images: prev.images.filter((img: Asset) => img.uri !== uri)
      }))
  };

  const removeVideo = (uri: string) => {
      setBasicInfo((prev:BasicInfo) => ({
          ...prev,
          videos: prev.videos.filter((vid: Asset) => vid.uri !== uri)
      }))
  };

  const handleClearImages = () => {
      setBasicInfo((prev: BasicInfo) => ({
          ...prev,
          images: []
      }))
  }

  const handleClearVideos = () => {
      setBasicInfo((prev: BasicInfo) => ({
          ...prev,
          videos: []
      }))
  }

  useEffect(() => {
    if(location){
      setBasicInfo({
        ...basicInfo,
        address: location.address?.formattedAddress ?? '-',
        city: location.address?.city ?? '-',
        state: location.address?.state ?? '-',
        pincode: location.address?.postalCode ?? '',
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      })
    }
  }, [location])

  const refetchCurrLocation = async () => {
    await useUserLocationStore.getState().clearLocation(); // wait for clearing
    await   fetchLocation();
  }

  const handleIsUnderConstruction = () => {
    if(!basicInfo.isUnderConstruction){
      Alert.alert('Alert', 'Masjid is Under Construction means Masjid is not actively running');
    }
    setBasicInfo((prev: BasicInfo) => ({
          ...prev,
          isUnderConstruction: !prev.isUnderConstruction
      }))
  }

  return (
    <KeyboardAwareScrollView
              style={styles.container}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              // This enables it to scroll to the input automatically
              enableOnAndroid={true} 
              extraScrollHeight={20} // Fine-tune this if needed
            >
      <Modal
        visible={!!errorMsg}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: colors.BACKGROUND}]}>
            <Text style={styles.modalText}>{errorMsg}</Text>
              <View style={styles.modalButtons}>
                { errorMsg === "Please enable GPS!" ? 
                  <TouchableOpacity style={[styles.exitBtn, { backgroundColor: colors.DISABLED_BUTTON_BG}]} onPress={handleOpenSettings}>
                    <Text style={styles.modalBtnText}>Exit</Text>
                  </TouchableOpacity> :
                  <TouchableOpacity style={styles.modalBtn} onPress={handleOpenSettings}>
                    <Text style={styles.modalBtnText}>Open Settings</Text>
                  </TouchableOpacity>
                }
                <TouchableOpacity style={[styles.modalBtn, {backgroundColor: colors.BUTTON_BG}]} onPress={fetchLocation}>
                  <Text style={[styles.modalBtnText, {color: colors.BUTTON_TEXT}]}>{errorMsg === "Please enable GPS!" ? "Enable" : "Retry"}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView style={[styles.stepContainer]}>
        <Text style={styles.label}>Masjid Name</Text>
        <TextInput style={styles.input} value={basicInfo.name} onChangeText={(text: string) => handleChangeInput('name', text)} placeholder="Masjid name" />

        <Text style={styles.label}>Secretary Name</Text>
        <TextInput style={styles.input} value={basicInfo.secretaryName} onChangeText={(text: string) => handleChangeInput('secretaryName', text)} placeholder="Secretary name" />


        <View>
          <Text style={styles.label}>Address</Text>
          <TouchableOpacity onPress={refetchCurrLocation} style={styles.fetchLocationBtn}>
            <Text style={[styles.fetchLocationBtnText, { color: colors.TINT }]}>{isLoading ? <ActivityIndicator color={"blue"} size={24}/> : "Get Current Location"}</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.input} value={basicInfo.address} onChangeText={(text: string) => handleChangeInput('address', text)} placeholder="Address" multiline />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput style={[styles.disabledInput, { flex: 1 }]} editable={location ? false : true} value={basicInfo.city} onChangeText={(text: string) => handleChangeInput('city', text)} placeholder="City" />
          <TextInput style={[styles.disabledInput, { flex: 1 }]} editable={location ? false : true} value={basicInfo.state} onChangeText={(text: string) => handleChangeInput('state', text)} placeholder="State" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput 
            style={[styles.disabledInput, { flex: 1 }]} 
            value={basicInfo.latitude} 
            onChangeText={(text: string) => handleChangeInput('latitude', text)} 
            placeholder="Latitude" 
            editable= {location?.coords?.latitude ? false : true}
          />
          <TextInput 
            style={[styles.disabledInput, { flex: 1 }]}
            value={basicInfo.longitude} 
            onChangeText={(text: string) => handleChangeInput('longitude', text)}
            placeholder="Longitude" 
            editable= {location?.coords?.latitude ? false : true}
          />
          
        </View>

        <Text style={styles.label}>Pincode</Text>
        <TextInput style={styles.disabledInput} editable={location ? false: true} value={basicInfo.pincode} onChangeText={(text: string) => handleChangeInput('pincode', text)} placeholder="Pincode" keyboardType="numeric" />

        <View style={styles.underConstructionBox}>
          <Text style={[styles.label]}>Masjid is Under Construction</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={basicInfo.isUnderConstruction ? colors.TINT : '#f4f3f4'}
            onValueChange={handleIsUnderConstruction}
            value={basicInfo.isUnderConstruction}
          />
        </View>

        <View>
          <Text style={styles.label}>Images</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
            <TouchableOpacity style={styles.btn} onPress={pickImages}>
              <Text style={[styles.btnText, { color: colors.DISABLED_BUTTON_TEXT}]}>Pick Images</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={handleClearImages}>
              <Text>Clear Images</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={basicInfo.images}
            keyExtractor={(i) => i.uri}
            renderItem={({ item }) => (
              <View style={{ marginRight: 8 }}>
                <Image source={{ uri: item.uri }} style={{ width: 110, height: 80, borderRadius: 6 }} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(item.uri)}>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Videos</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
            <TouchableOpacity style={styles.btn} onPress={pickVideo}>
              <Text style={[styles.btnText, { color: colors.DISABLED_BUTTON_TEXT}]}>Pick Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutline, {borderColor: colors.border}]} onPress={handleClearVideos}>
              <Text>Clear Videos</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={basicInfo.videos}
            keyExtractor={(i) => i.uri}
            renderItem={({ item }) => (
              <View style={{ marginRight: 8, width: 140 }}>
                  <ImageBackground
                      source={ item.uri ? {uri: item.uri} : require('@/assets/images/default-bg.png')} // use the thumbnail URI here
                      style={{ width: 140, height: 80, borderRadius: 6, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}
                  >
                      <Ionicons name="play" size={28} color="#fff" />
                      <Text numberOfLines={1} style={{ width: 120, color: '#fff', marginTop: 4 }}>
                          {item.name || item.uri.split('/').pop()}
                      </Text>
                  </ImageBackground>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeVideo(item.uri)}>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
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
    btn: { backgroundColor: '#e6e6ff', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontWeight: '700' },
    btnOutline: { borderWidth: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#0008', borderRadius: 12, padding: 2 },
    fetchLocationBtn: { position: 'absolute', top: 6, right: 6, borderRadius: 12, padding: 2 },
    fetchLocationBtnText: {},
    modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    fontSize: 16,
    textAlign: 'center',
  },
  exitBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
  },
  underConstructionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
  });
  

  export default BasicInfoScreen;