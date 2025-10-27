import { useUserLocation } from "@/hooks/useUserLocation";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { showMessage } from "@/utils/functions";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Asset, BasicInfo } from "../AddMasjidScreen";

interface BasicInfoProps  {
    basicInfo : BasicInfo,
    setBasicInfo :(value: BasicInfo | ((prev: BasicInfo) => BasicInfo)) => void
}

function getUserLocation(){

}


const MAXX_IMAGES_ALLOWED = 10
const MAXX_VIDEOS_ALLOWED = 5
const BasicInfoScreen : React.FC<BasicInfoProps> = ({ basicInfo, setBasicInfo }) => {
  const { location, clearLocation } = useUserLocationStore(state => state);
  const { fetchLocation, errorMsg, isLoading, handleExitApp, handleOpenSettings  } = useUserLocation();
  



  const pickImages = async () => {
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
        if( selected.length + basicInfo.images.length > MAXX_IMAGES_ALLOWED ){
          showMessage("You can add upto "+MAXX_IMAGES_ALLOWED + " images");
          return;
        }
        
        setBasicInfo((prev) => ({
            ...prev,
            images: [...prev.images, ...selected],
        }))
    }
    } catch (err) {
      console.warn('image pick error', err);
    }
  };
  
  const pickVideo = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: true,
            quality: 1,
        });
        if (!result.canceled) {
            const selected = result.assets.map((a) => ({
                uri: a.uri,
                type: 'video',
                name: a.fileName || `video-${Date.now()}.mp4`,
                mimeType: 'video/mp4'
            }))
            
            // max limit
            if( selected.length + basicInfo.videos.length > MAXX_VIDEOS_ALLOWED ){
                showMessage("You can add upto "+MAXX_VIDEOS_ALLOWED + " videos");
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
        address: location.address?.formattedAddress ?? '',
        city: location.address?.city ?? '',
        state: location.address?.state ?? '',
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
    
  return (
    <ScrollView>
      <Modal
        visible={!!errorMsg}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{errorMsg}</Text>
              <View style={styles.modalButtons}>
                { errorMsg === "Please enable GPS!" ? 
                  <TouchableOpacity style={styles.exitBtn} onPress={handleOpenSettings}>
                    <Text style={styles.modalBtnText}>Exit</Text>
                  </TouchableOpacity> :
                  <TouchableOpacity style={styles.modalBtn} onPress={handleOpenSettings}>
                    <Text style={styles.modalBtnText}>Open Settings</Text>
                  </TouchableOpacity>
                }
                <TouchableOpacity style={styles.modalBtn} onPress={fetchLocation}>
                  <Text style={styles.modalBtnText}>{errorMsg === "Please enable GPS!" ? "Enable" : "Retry"}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.label}>Masjid Name</Text>
        <TextInput style={styles.input} value={basicInfo.name} onChangeText={(text: string) => handleChangeInput('name', text)} placeholder="Masjid name" />

        <View>
          <Text style={styles.label}>Address</Text>
          <TouchableOpacity onPress={refetchCurrLocation} style={styles.fetchLocationBtn}>
            <Text style={styles.fetchLocationBtnText}>{isLoading ? <ActivityIndicator color={"blue"} size={24}/> : "Get Current Location"}</Text>
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
            editable= {location ? false : true}
          />
          <TextInput 
            style={[styles.disabledInput, { flex: 1 }]}
            value={basicInfo.longitude} 
            onChangeText={(text: string) => handleChangeInput('longitude', text)}
            placeholder="Longitude" 
            editable= {location ? false : true}
          />
          
        </View>

        <Text style={styles.label}>Pincode</Text>
        <TextInput style={styles.disabledInput} editable={location ? false: true} value={basicInfo.pincode} onChangeText={(text: string) => handleChangeInput('pincode', text)} placeholder="Pincode" keyboardType="numeric" />

        <View>
          <Text style={styles.label}>Images</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
            <TouchableOpacity style={styles.btn} onPress={pickImages}>
              <Text style={styles.btnText}>Pick Images</Text>
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
              <Text style={styles.btnText}>Pick Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={handleClearVideos}>
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
    </ScrollView>
  )
};


  const styles = StyleSheet.create({
    stepContainer: { flex: 1 },
    label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 },
    disabledInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#f2f2f2', color: '#555' , marginBottom: 8 },
    btn: { backgroundColor: '#e6e6ff', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
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
  }
  });
  

  export default BasicInfoScreen;