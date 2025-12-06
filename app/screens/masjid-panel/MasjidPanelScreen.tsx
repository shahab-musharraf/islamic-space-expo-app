import { useGetAllSelfAddedMasjids } from "@/apis/masjid/useGetAllSelfAddedMasjids";
import MasjidUpdateLabel from "@/components/global/MasjidUpdateLabel";
import MasjidVerificationLabel from "@/components/global/MasjidVerificationLabel";
import { MasjidUpdateStatus, MasjidVerificationStatus } from "@/constants/masjid-status";
import { Theme } from "@/constants/types";
import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
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

  const { data, isLoading } = useGetAllSelfAddedMasjids();

  const handleAddMasjid = () => {
    navigation.navigate("screens/masjid-panel/AddMasjidScreen");
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
      { masjidId: _id, editAccountInfo: true }
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log(data, '')

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
            {item.reason && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Reason: {item.reason}</Text>}
              
              <Text style={styles.masjidName}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.distance}>
                📍 {item.distance < 1
                  ? `${Math.round(item.distance * 1000)} m away`
                  : `${item.distance.toFixed(1)} km away`}
              </Text>

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
