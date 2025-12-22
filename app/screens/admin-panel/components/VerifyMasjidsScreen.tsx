import { useGetAllMasjidsToVerify } from '@/apis/admin/useGetAllMasjidsToVerify';
import { useVerifyMasjidMutation } from '@/apis/admin/useVerifyMasjidMutation';
import ReasonSelection from '@/components/global/ReasonSelection';
import { MasjidVerificationStatus } from '@/constants/masjid-status';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Define the structure of your data item
interface MasjidToVerify {
  _id: string;
  address: string;
  images: string[];
  distance: number;
  videos: string[];
  isActive: boolean;
  isUnderConstruction: boolean;
  name: string;
  reason: string;
  status: string; // e.g., "Pending Verification"
  updateStatus: string;
}


// --- Theme Colors ---
const colors = {
    PRIMARY: '#4CAF50', // Green
    DANGER: '#F44336', // Red
    WARNING: '#FF9800', // Orange
    TEXT: '#333333',
    SUBTEXT: '#666666',
    CARD_BG: '#FFFFFF',
    SHADOW_COLOR: '#000000',
};


// --- Individual Masjid Verification Card Component ---

const VerificationCard = ({ item, refetchMasjids }: { item: MasjidToVerify, refetchMasjids: () => void }) => {

  const navigation: any = useNavigation();
  const verifyMasjidMutation = useVerifyMasjidMutation();
  const [reason, setReason] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedMasjidId, setSelectedMasjidId] = useState("")
  
  // Handlers for Admin actions (placeholder functions)
  const handleApprove = (id: string) => {
    setIsApproving(true);
    verifyMasjidMutation.mutate({ masjidId: id, verify: true, reason:'' }, {
      onSuccess: () => {
        // Refetch the masjids list after successful approval
        refetchMasjids();
      }
    });
  };
  const handleNeedsCorrection = (id: string) => {
    setIsApproving(false);
    setSelectedMasjidId(id);
    setReasonModalVisible(true)
  };
  const handleNeedsCorrectionWithReason = () => {
    console.log('update for', selectedMasjidId, reason)
    verifyMasjidMutation.mutate({ masjidId: selectedMasjidId, verify: false, reason }
      ,
      {
        onSuccess: () => {
          // Refetch the masjids list after successful rejection
          refetchMasjids();
        }
      }
    );

    
    setReasonModalVisible(false);

  }
  const handleViewDetails = (masjid: MasjidToVerify) => {
    // Implement navigation to a detailed view here
    const {_id, name, images, address, distance, videos} = masjid;
    navigation.navigate('screens/home/MasjidDetails', 
      { _id, name, images, address, distance, videos }
    );
  };

  const handleEditMasjid = (masjid:any) => {
    const {_id, name, images, address, distance, videos} = masjid;
    navigation.navigate('screens/masjid-panel/AddMasjidScreen', 
      { masjidId: _id, isSecretary: false }
    );
  }
  
  // Helper to determine status color
  const getStatusColor = (status: string) => {
    if(status==="REVIEW CORRECTIONS") return colors.SHADOW_COLOR;
    if (status.includes('Pending')) return colors.WARNING;
    if (status.includes('Correction')) return colors.DANGER;
    if (status.includes('Verified')) return colors.PRIMARY;
    return colors.SUBTEXT;
  }

  return (
    <View style={cardStyles.card}>
      {/* Image and Status */}
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={cardStyles.image}
        resizeMode="cover"
      />

      <View style={[cardStyles.statusBadge, { backgroundColor: getStatusColor(item.status === MasjidVerificationStatus.PENDING_VERIFICATION && item.reason ?
            "REVIEW CORRECTIONS" :
            item.status) }]}>
        <Text style={cardStyles.statusText}>
            {
            item.status === MasjidVerificationStatus.PENDING_VERIFICATION && item.reason ?
            "REVIEW CORRECTIONS" :
            item.status.toUpperCase()}
        </Text>
      </View>


      {/* Details Section */}
      <View style={cardStyles.details}>
        <Text style={cardStyles.masjidName} numberOfLines={2}>
            {item.name}
        </Text>
        <Text style={cardStyles.address} numberOfLines={2}>
            {item.address}
        </Text>
        
        {/* Additional Info */}
        {item.isUnderConstruction && (
            <Text style={cardStyles.infoTag}>⚠️ Under Construction</Text>
        )}
        {!item.isActive && (
            <Text style={[cardStyles.infoTag, { color: colors.DANGER }]}>🚫 Inactive</Text>
        )}

        {/* Action Buttons */}
        <View style={cardStyles.btnContainer}>
            <TouchableOpacity
                onPress={() => handleViewDetails(item)}
                style={[cardStyles.actionButton, cardStyles.viewBtn]}
            >
                <Text style={cardStyles.viewText}>View</Text>
            </TouchableOpacity>

            {(item.status === MasjidVerificationStatus.NEEDS_CORRECTION || 
                            (item.status === MasjidVerificationStatus.PENDING_VERIFICATION)) 
                            && <TouchableOpacity
                              onPress={() => handleEditMasjid(item)}
                              style={[styles.viewBtn, { borderColor: colors.TEXT }]}
                            >
                              <Text style={{ color: colors.TEXT, fontWeight: "500" }}>
                                Edit
                              </Text>
                            </TouchableOpacity>}
            
            <TouchableOpacity
                onPress={() => handleNeedsCorrection(item._id)}
                style={[cardStyles.actionButton, { backgroundColor: colors.DANGER }]}
            >
                {!isApproving && verifyMasjidMutation.isPending ?
                <ActivityIndicator color="#FFFFFF" size={14} /> :

                  <Text style={cardStyles.actionText}>Needs Correction</Text>
                  }
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleApprove(item._id)}
                style={[cardStyles.actionButton, { backgroundColor: colors.PRIMARY }]}
            >
                {isApproving && verifyMasjidMutation.isPending ?
                <ActivityIndicator color="#FFFFFF" size={14} /> :

                  <Text style={cardStyles.actionText}>Approve</Text>
                  }
            </TouchableOpacity>
        </View>
      </View>

      
      {
                  item.reason && 
                  (item.status === MasjidVerificationStatus.PENDING_VERIFICATION) 
                  && (
                    <View style={{ marginTop: 4 }}>
                      {item.reason.split('%').map((r:string, index: number) => (
                        <Text key={index} style={{ color: 'red', fontSize: 12 }}>
                          Reason {index+1}: {r.trim()}
                        </Text>
                      ))}
                    </View>
                  )}

      <ReasonSelection
        visible={reasonModalVisible}
        reason={reason || item.reason}
        setReason={setReason}
        onConfirm={() => {
          // submit rejection using 'reason'
          handleNeedsCorrectionWithReason();
        }}
        onCancel={() => setReasonModalVisible(false)}
        isLoading={verifyMasjidMutation.isPending && !isApproving}
      />
    </View>
  );
};

// --- Main VerifyMasjidsScreen Component ---

const VerifyMasjidsScreen = () => {
  // Use the actual hook, but fall back to mockData for testing if needed
  const { data, isLoading, refetch, isError, isRefetching } = useGetAllMasjidsToVerify();
  

  if(isLoading || isRefetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if(isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.DANGER }}>Error loading data. Please try again.</Text>
        {/* Add a retry button here if desired */}
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.SUBTEXT }}>No Masjids currently pending verification.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <VerificationCard item={item} refetchMasjids={refetch} />}
      />
    </View>
  );
};

export default VerifyMasjidsScreen;

// --- Stylesheet ---

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.CARD_BG,
        // borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 15,
        // overflow: 'hidden',
        // flexDirection: 'row', // Horizontal layout
        // elevation: 6,
        // shadowColor: colors.SHADOW_COLOR,
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.1,
        // shadowRadius: 6,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 15,
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    statusText: {
        color: colors.CARD_BG,
        fontWeight: 'bold',
        fontSize: 10,
    },
    details: {
        flex: 1,
        justifyContent: 'space-between',
    },
    masjidName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.TEXT,
        marginBottom: 4,
    },
    address: {
        fontSize: 12,
        color: colors.SUBTEXT,
        marginBottom: 8,
    },
    infoTag: {
        fontSize: 11,
        color: colors.WARNING,
        fontWeight: '500',
        marginBottom: 4,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    viewBtn: {
        backgroundColor: '#E0E0E0', // Light background for 'View'
    },
    actionText: {
        color: colors.CARD_BG,
        fontWeight: '600',
        fontSize: 12,
    },
    viewText: {
        color: colors.TEXT,
        fontWeight: '600',
        fontSize: 12,
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light background for the screen
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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