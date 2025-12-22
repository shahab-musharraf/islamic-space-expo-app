import { useGetAllSelfAddedMasjids } from "@/apis/masjid/useGetAllSelfAddedMasjids";
import { useUpdatePrayerTimingsMutation } from "@/apis/masjid/useUpdatePrayerTimingsMutation";
import MasjidUpdateLabel from "@/components/global/MasjidUpdateLabel";
import MasjidVerificationLabel from "@/components/global/MasjidVerificationLabel";
import PrayerInfoModal from "@/components/global/PrayerInfoModal";
import { MasjidUpdateStatus, MasjidVerificationStatus } from "@/constants/masjid-status";
import { Theme } from "@/constants/types";
import { showMessage } from "@/utils/functions";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  userId: string;
}

const MasjidPanel: React.FC<Props> = () => {
  const navigation: any = useNavigation();
  const { colors } = useTheme() as Theme;
  const [selectedMasjidPrayerInfo, setSelectedMasjidPrayerInfo] = useState<any>(null);
  const [selectedMasjid, setSelectedMasjid] = useState<any>(null);
  const { mutate:updatePrayerInfo, isPending:updatePrayerInfoLoading } = useUpdatePrayerTimingsMutation();

  const { data, isLoading, refetch } = useGetAllSelfAddedMasjids();

  const handleAddMasjid = () => {
    navigation.navigate("screens/masjid-panel/AddMasjidScreen",
      { isSecretary: true }
    );
  };

  const handleViewMasjid = (masjid:any) => {
    const {_id, name, images, address, distance, videos} = masjid;
    navigation.navigate('screens/home/MasjidDetails', 
      { _id, name, images, address, distance, videos }
    );

  };

  const handleEditMasjid = (masjid:any) => {
    const {_id, name, images, address, distance, videos} = masjid;
    navigation.navigate('screens/masjid-panel/AddMasjidScreen', 
      { masjidId: _id, isSecretary: true }
    );
  }

  const handleEditPrayerTiming = () => {
    if(!selectedMasjid || !selectedMasjidPrayerInfo){
      return;
    }
    const oldPrayerInfo = selectedMasjid.prayerInfo;
    const updatedRecord :any= {};
    const keys = Object.keys(selectedMasjidPrayerInfo);
    if(!keys.length){
      return;
    } 
    for(const key of keys){
      if(oldPrayerInfo[key] !== selectedMasjidPrayerInfo[key]){
        updatedRecord[key] = selectedMasjidPrayerInfo[key];
      }
    }

    console.log(updatedRecord, 'update this')

    try {
      updatePrayerInfo({
        masjidId: selectedMasjid._id,
        prayerInfo: {prayerInfo:updatedRecord}
      },
    {
      onSuccess : () => {
        showMessage('Salah Timings Updated Successfully!')
        refetch()
      }
    })
    } catch (error) {
      
    }
    setSelectedMasjidPrayerInfo(null)
    setSelectedMasjid(null);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // console.log(selectedMasjidPrayerInfo, 'clicked...')

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>

        <TouchableOpacity
          onPress={handleAddMasjid}
          style={[styles.addBtn, { backgroundColor: colors.TEXT }]}
        >
          <Text style={{ color: colors.BUTTON_TEXT, fontWeight: "bold" }}>
            + Add Masjid
          </Text>
        </TouchableOpacity>
      </View>

      {/* Masjid List */}
      {data && data.length ? <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={[styles.card]}>
            <Image
              source={{ uri: item.images?.[0] }}
              style={styles.image}
              resizeMode="cover"
            />


            <View style={styles.details}>
            <MasjidVerificationLabel status={item.status} />
            <MasjidUpdateLabel status={item.updateStatus} />
            {
            item.reason && 
            (item.status === MasjidVerificationStatus.NEEDS_CORRECTION || item.updateStatus === MasjidUpdateStatus.REJECTED) 
            && (
              <View style={{ marginTop: 4 }}>
                {item.reason.split('%').map((r:string, index: number) => (
                  <Text key={index} style={{ color: 'red', fontSize: 12 }}>
                    Reason {index+1}: {r.trim()}
                  </Text>
                ))}
              </View>
            )}
              
              <Text style={styles.masjidName}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.distance}>
                📍 {item.distance < 1
                  ? `${Math.round(item.distance * 1000)} m away`
                  : `${item.distance.toFixed(1)} km away`}
              </Text>

              {
                item.status === MasjidVerificationStatus.VERIFIED &&
                <TouchableOpacity
                  onPress={() => {
                    if(!item.prayerInfo) return;
                    setSelectedMasjidPrayerInfo(item.prayerInfo);
                    setSelectedMasjid(item);
                  }}
                  style={[styles.viewBtn, { borderColor: colors.TEXT }]}
                >
                  <Text style={{ color: colors.TEXT, fontWeight: "500" }}>
                    Edit Prayer Timings
                  </Text>
                </TouchableOpacity>
              }

              <View style={styles.btnContainer}>
                <TouchableOpacity
                  onPress={() => handleViewMasjid(item)}
                  style={[styles.viewBtn, { borderColor: colors.TEXT }]}
                >
                  <Text style={{ color: colors.TEXT, fontWeight: "500" }}>
                    View
                  </Text>
                </TouchableOpacity>

                {(item.status === MasjidVerificationStatus.NEEDS_CORRECTION || 
                (item.status === MasjidVerificationStatus.VERIFIED && item.updateStatus!== MasjidUpdateStatus.UNDER_REVIEW)) 
                && <TouchableOpacity
                  onPress={() => handleEditMasjid(item)}
                  style={[styles.viewBtn, { borderColor: colors.TEXT }]}
                >
                  <Text style={{ color: colors.TEXT, fontWeight: "500" }}>
                    Edit
                  </Text>
                </TouchableOpacity>}
              </View>
            </View>
          </View>
        )}
      /> : <View style={styles.center}>
        <Text style={{ color: 'red' }}>No masjids added yet.</Text>
      </View>}

      {selectedMasjidPrayerInfo && 
        <PrayerInfoModal 
          prayerInfo={selectedMasjidPrayerInfo}
          setPrayerInfo={setSelectedMasjidPrayerInfo}
          visible={selectedMasjidPrayerInfo !== null}
          onClose={() => {
            setSelectedMasjid(null)
            setSelectedMasjidPrayerInfo(null)
          }}
          onUpdate={handleEditPrayerTiming}
          loading={updatePrayerInfoLoading}

        />
      }
    </View>
  );
};

export default MasjidPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  btnContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 10,
    elevation: 3,
  },

  image: {
    width: 110,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },

  details: {
    flex: 1,
    justifyContent: "space-between",
  },

  masjidName: {
    fontSize: 18,
    fontWeight: "600",
  },

  address: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },

  distance: {
    fontSize: 14,
    marginTop: 6,
    color: "#333",
  },

  viewBtn: {
    marginTop: 10,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderRadius: 6,
  },
});
