import { useGetMasjidDetailsByIdToVerify } from "@/apis/masjid/useGetMasjidDetailsByIdToVerify";
import { useRoute } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const MasjidDetailsScreenPrivate = () => {
  const route: any = useRoute();
  const { _id } = route.params;

  const { data: masjid, isLoading, error } = useGetMasjidDetailsByIdToVerify(_id);

    const videoPlayers = masjid?.videos?.map((url: string) =>
  useVideoPlayer(url)
);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const [editBasic, setEditBasic] = useState(false);
  const [editBudget, setEditBudget] = useState(false);
  const [editPrayers, setEditPrayers] = useState(false);

  const [editedData, setEditedData] = useState<any>(null);

  // video player for preview modal
  const videoPlayer = useVideoPlayer(previewVideo || "", (player) => {
    player.pause();
  });

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );

  if (error) return <Text style={styles.error}>Error loading data</Text>;
  if (!masjid) return null;

  // Start editing a section
  const startEditing = (section: string) => {
    setEditedData(JSON.parse(JSON.stringify(masjid))); // deep clone
    if (section === "basic") setEditBasic(true);
    if (section === "budget") setEditBudget(true);
    if (section === "prayers") setEditPrayers(true);
  };

  const discardChanges = (section: string) => {
    Alert.alert("Confirm Discard", "Discard all changes?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          setEditedData(null);
          if (section === "basic") setEditBasic(false);
          if (section === "budget") setEditBudget(false);
          if (section === "prayers") setEditPrayers(false);
        },
      },
    ]);
  };

  const updateChanges = (section: string) => {
    Alert.alert("Confirm Update", "Update changes?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: () => {
          console.log("UPDATED MASJID DATA: ", editedData);
          Alert.alert("Success", "Updated Successfully!");

          if (section === "basic") setEditBasic(false);
          if (section === "budget") setEditBudget(false);
          if (section === "prayers") setEditPrayers(false);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* ---------------- BASIC DETAILS ---------------- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          {!editBasic && (
            <TouchableOpacity onPress={() => startEditing("basic")}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editBasic ? (
          <>
            <TextInput
              style={styles.input}
              value={editedData?.name}
              onChangeText={(v) => setEditedData({ ...editedData, name: v })}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={editedData?.address}
              onChangeText={(v) =>
                setEditedData({ ...editedData, address: v })
              }
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.updateBtn]}
                onPress={() => updateChanges("basic")}
              >
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.discardBtn]}
                onPress={() => discardChanges("basic")}
              >
                <Text style={styles.actionText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.value}>Name: {masjid.name}</Text>
            <Text style={styles.value}>Address: {masjid.address}</Text>
            <Text style={styles.value}>City: {masjid.city}</Text>
            <Text style={styles.value}>State: {masjid.state}</Text>
            <Text style={styles.value}>Latitude: {masjid.latitude}</Text>
            <Text style={styles.value}>Longitude: {masjid.longitude}</Text>
          </>
        )}
      </View>

      {/* ---------------- IMAGES ---------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Images</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {masjid.images?.map((img: string, i: number) => (
            <TouchableOpacity key={i} onPress={() => setPreviewImage(img)}>
              <Image source={{ uri: img }} style={styles.mediaImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent>
        <View style={styles.modalBg}>
          <Image source={{ uri: previewImage! }} style={styles.fullImage} />
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            style={styles.closeModalBtn}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ---------------- VIDEOS ---------------- */}
      <View style={styles.section}>
  <Text style={styles.sectionTitle}>Videos</Text>

  <ScrollView horizontal>
    {videoPlayers?.map((player : any, i: string) => (
      <TouchableOpacity key={i} onPress={() => setPreviewVideo(i)}>
        <VideoView
          player={player}
          style={styles.mediaVideo}
          allowsFullscreen
          allowsPictureInPicture
        />
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

<Modal visible={previewVideo !== null} transparent>
  <View style={styles.modalBg}>
    <VideoView
      player={videoPlayers?.[previewVideo!]}
      style={styles.fullVideo}
      allowsFullscreen
      allowsPictureInPicture
    />

    <TouchableOpacity
      onPress={() => setPreviewVideo(null)}
      style={styles.closeModalBtn}
    >
      <Text style={styles.closeText}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>


      {/* ---------------- BUDGET INFO ---------------- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Info</Text>
          {!editBudget && (
            <TouchableOpacity onPress={() => startEditing("budget")}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editBudget ? (
          <>
            <TextInput
              style={styles.input}
              value={editedData?.budgetInfo?.electricityBill || ""}
              onChangeText={(v) =>
                setEditedData({
                  ...editedData,
                  budgetInfo: {
                    ...editedData.budgetInfo,
                    electricityBill: v,
                  },
                })
              }
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.updateBtn]}
                onPress={() => updateChanges("budget")}
              >
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.discardBtn]}
                onPress={() => discardChanges("budget")}
              >
                <Text style={styles.actionText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.value}>
              Electricity Bill: {masjid?.budgetInfo?.electricityBill}
            </Text>
            <Text style={styles.value}>
              Maintenance: {masjid?.budgetInfo?.maintenance}
            </Text>
            <Text style={styles.value}>
              Staff Salary: {masjid?.budgetInfo?.staffSalary}
            </Text>
          </>
        )}
      </View>

      {/* ---------------- PRAYER TIMINGS ---------------- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prayer Timings</Text>
          {!editPrayers && (
            <TouchableOpacity onPress={() => startEditing("prayers")}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editPrayers ? (
          <>
            <TextInput
              style={styles.input}
              value={editedData?.prayerInfo?.fajr || ""}
              onChangeText={(v) =>
                setEditedData({
                  ...editedData,
                  prayerInfo: {
                    ...editedData.prayerInfo,
                    fajr: v,
                  },
                })
              }
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.updateBtn]}
                onPress={() => updateChanges("prayers")}
              >
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.discardBtn]}
                onPress={() => discardChanges("prayers")}
              >
                <Text style={styles.actionText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.value}>Fajr: {masjid.prayerInfo?.fajr}</Text>
            <Text style={styles.value}>Dhuhr: {masjid.prayerInfo?.dhuhr}</Text>
            <Text style={styles.value}>Asr: {masjid.prayerInfo?.asr}</Text>
            <Text style={styles.value}>
              Maghrib: {masjid.prayerInfo?.maghrib}
            </Text>
            <Text style={styles.value}>Isha: {masjid.prayerInfo?.isha}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MasjidDetailsScreenPrivate;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", textAlign: "center" },
  section: {
    marginBottom: 25,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  editBtn: { color: "#007bff", fontWeight: "600" },
  value: { fontSize: 15, marginBottom: 4 },
  mediaImage: {
    width: 140,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
  },
  mediaVideo: {
    width: 150,
    height: 120,
    backgroundColor: "#000",
    marginRight: 10,
    borderRadius: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 12,
    resizeMode: "contain",
  },
  fullVideo: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    backgroundColor: "#000",
    borderRadius: 12,
  },
  closeModalBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: { fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionBtn: {
    width: "48%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  updateBtn: { backgroundColor: "#28a745" },
  discardBtn: { backgroundColor: "#dc3545" },
  actionText: { color: "#fff", fontWeight: "bold" },
});
