import { useApproveUpdateMasjidMutation } from '@/apis/admin/useApproveUpdateMasjidMutation';
import { useGetAllMasjidsForUpdateReview } from '@/apis/admin/useGetAllMasjidsForUpdateReview';
import { useRejectUpdateMasjidMutation } from '@/apis/admin/useRejectUpdateMasjidMutation';
import CompareMasjidDataModal from '@/components/global/CompareMasjidData';
import ReasonSelection from '@/components/global/ReasonSelection';
import { showMessage } from '@/utils/functions';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';



const colors = {
  PRIMARY: '#4CAF50',
  DANGER: '#F44336',
  WARNING: '#FF9800',
  TEXT: '#333333',
  SUBTEXT: '#666666',
  CARD_BG: '#FFFFFF',
  SHADOW_COLOR: '#000000',
  INFO: '#1E88E5',
  MUTED: '#F2F4F7',
};

const statusBg = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('verified')) return '#dff0d8';
  if (s.includes('pending')) return '#fff3cd';
  if (s.includes('needs')) return '#f8d7da';
  return colors.MUTED;
};

const statusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('verified')) return '#1b5e20';
  if (s.includes('pending')) return '#8a6d3b';
  if (s.includes('needs')) return '#721c24';
  return colors.SUBTEXT;
};

const updateStatusBg = (u: string) => {
  const v = u?.toLowerCase() || '';
  if (v.includes('under review')) return '#e8f0ff';
  if (v.includes('approved')) return '#dff0d8';
  if (v.includes('rejected')) return '#f8d7da';
  return colors.MUTED;
};

const updateStatusColor = (u: string) => {
  const v = u?.toLowerCase() || '';
  if (v.includes('under review')) return '#0b63d6';
  if (v.includes('approved')) return '#1b5e20';
  if (v.includes('rejected')) return '#721c24';
  return colors.SUBTEXT;
};

const ItemCard = ({
  item,
  onApprove,
  onReject,
  handleViewMasjid,
  handleViewChanges,
  rejectLoading,
  approveLoading
}: {
  item: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  handleViewMasjid: (masjid: any) => void;
  handleViewChanges: (masjid:any) => void;
  rejectLoading: boolean;
  approveLoading: boolean;
}) => {
  const imageUri = item.images?.[0] || null;
  const distanceText = typeof item.distance === 'number' ? `${item.distance} m` : item.distance || '';

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={{ color: '#999' }}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.labelsRow}>
            <View style={[styles.label, { backgroundColor: statusBg(item.status) }]}>
              <Text style={[styles.labelText, { color: statusColor(item.status) }]} numberOfLines={1}>
                {item.status}
              </Text>
            </View>

            <View style={[styles.label, { backgroundColor: updateStatusBg(item.updateStatus), marginLeft: 8 }]}>
              <Text style={[styles.labelText, { color: updateStatusColor(item.updateStatus) }]} numberOfLines={1}>
                {item.updateStatus}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={2}>
          {item.address}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.distance}>{distanceText}</Text>
        </View>

        {item.reason ? (
          <View style={{ marginTop: 6 }}>
            {item.reason.split('%').map((r: string, i: number) => (
              <Text key={i} style={styles.reasonText}>
                Reason: {r.trim()}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.btn} onPress={() => handleViewMasjid(item)}>
            <Text style={styles.approveText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.changesBtn} onPress={() => handleViewChanges(item)}>
            <Text style={styles.rejectText}>See Changes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(item._id)}>
            <Text style={styles.approveText}>
              {
                approveLoading ? <ActivityIndicator size={16} color={'white'}/> : "Arppove"
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item._id)}>
            <Text style={styles.rejectText}>
              {
                rejectLoading ? <ActivityIndicator size={16} color={'white'}/> : "Reject"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const UpdateReviewScreen = () => {
  const [openCompareChangesModal, setOpenCompareChangesModal] = useState(false);
  const [selectedMasjid, setSelectedMasjid] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  
  const { data, isLoading, isError, isRefetching, refetch } = useGetAllMasjidsForUpdateReview();
    const navigation: any = useNavigation();
    const { mutate: rejectMasjidUpdate, isPending:rejectMasjidUpdatePending } = useRejectUpdateMasjidMutation();
    const { mutate: approveMasjidUpdate, isPending: approveMasjidUpdatePending } = useApproveUpdateMasjidMutation();

  const onApprove = (id: string) => {
    console.log('Approve clicked:', id);
    // TODO: call approve API
    try {
      approveMasjidUpdate({masjidId: id }, {
        onSuccess: () => {
          refetch();
          showMessage('Update Approved!')
        },
        onError: ()=> {
          showMessage('error occured')
        }
      })
    } catch (error) {
      Alert.alert('Error while rejecting the update!')
    }
  };

  const onReject = (id: string) => {
    setReasonModalVisible(true)
    setSelectedMasjid(id);
    console.log('Reject clicked:', id);
    // TODO: open reason modal
  };

  const handleRejectMasjidUpdate = () => {
    try {
      rejectMasjidUpdate({masjidId: selectedMasjid, reason}, 
        {
          onSuccess: () => {
            showMessage('Update Rejected!')
            refetch();
          }
        }
      )
      setReasonModalVisible(false)
    } catch (error) {
      Alert.alert('Error while rejecting the update!')
    }
  }
  
  const handleViewMasjid = (masjid:any) => {
    const {name, _id} = masjid;
    navigation.navigate('screens/home/MasjidDetails', 
      { _id, name }
    );
  }

  const handleViewChanges = (masjid:any) => {
    setOpenCompareChangesModal(true);
    setSelectedMasjid(masjid);
  }

  if (isLoading || isRefetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.INFO} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.DANGER }}>Error loading data. Please try again.</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.SUBTEXT }}>No Masjids awaiting review.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ItemCard item={item} 
            onApprove={onApprove} 
            onReject={onReject}
            handleViewMasjid={handleViewMasjid} 
            handleViewChanges={handleViewChanges}
            rejectLoading={rejectMasjidUpdatePending}
            approveLoading={approveMasjidUpdatePending}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {openCompareChangesModal && <CompareMasjidDataModal visible={openCompareChangesModal}
          onClose={() => {
            setOpenCompareChangesModal(false)
          }}
          selectedMasjidId={selectedMasjid._id}
          title={`Review Changes for ${selectedMasjid.name}`}
        />}


        <ReasonSelection
        visible={reasonModalVisible}
        reason={reason}
        setReason={setReason}
        onConfirm={() => {
          // submit rejection using 'reason'
          handleRejectMasjidUpdate();
        }}
        onCancel={() => setReasonModalVisible(false)}
        isLoading={rejectMasjidUpdatePending}
      />
    </View>
  );
};

export default UpdateReviewScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingTop: 12 },
  listContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.CARD_BG,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  left: { width: 110, height: 86, marginRight: 10 },
  image: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#eee' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },

  right: { flex: 1 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  labelsRow: { flexDirection: 'row', alignItems: 'center' },

  name: { fontSize: 15, fontWeight: '700', maxWidth: '60%' },

  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  labelText: { fontSize: 11, fontWeight: '700' },

  address: { marginTop: 6, fontSize: 13, color: colors.SUBTEXT },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  distance: { color: colors.SUBTEXT, fontSize: 13 },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },

  approveBtn: {
    flex: 1,
    backgroundColor: colors.PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: colors.DANGER,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },

  btn : {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor:'gray'
  },
  changesBtn : {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor:'blue'
  },

  approveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  reasonText: { color: colors.DANGER, fontSize: 12, marginTop: 2 },
});
