import { useLogoutMutation } from '@/apis/auth/useLogout';
import { useGetSecretaryRequestStatus } from '@/apis/useGetSecretaryRequestStatus';
import { useRequestRoleChange } from '@/apis/useSecretaryRoleRequest';
import { Theme } from '@/constants/types';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { showMessage } from '@/utils/functions';
import { useTheme } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Asset } from '../masjid-panel/AddMasjidScreen';

interface Data {
  name: string;
  mobile: string;
  masjidName: string;
  masjidAddress: string;
  letterPad: Asset;
}

const getStatusMeta = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return { text: 'Approved', color: '#2e7d32' };
    case 'REJECTED':
      return { text: 'Rejected', color: '#c62828' };
    default:
      return { text: 'Pending Review', color: '#f9a825' };
  }
};

const AddMasjidScreen = () => {
  const { colors } = useTheme() as Theme;
  const { profile } = useUserProfileStore();
  const { mutate, isPending } = useRequestRoleChange();
  const { data: requestStatus } = useGetSecretaryRequestStatus();
  const { mutateAsync: logout, isPending: logoutLoader } = useLogoutMutation();


  console.log(requestStatus, 'status')

  const [data, setData] = React.useState<Data>({
    name: profile?.name || '',
    mobile: profile?.mobile || '',
    masjidName: '',
    masjidAddress: '',
    letterPad: {
      uri: '',
      type: '',
      name: '',
      mimeType: '',
    },
  });
  const openWhatsapp = () => {
    const message = encodeURIComponent(
      'I need help regarding my secretary request for the masjid "' + requestStatus.masjidName + '".',
    );
    Linking.openURL(
      `https://wa.me/7033043952?text=${message}`,
    );
  };

  const handleSelectPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selectedPdf = result.assets?.[0];
      if (!selectedPdf) return;

      setData(prev => ({
        ...prev,
        letterPad: {
          uri: selectedPdf.uri,
          name: selectedPdf.name,
          type: 'application/pdf',
          mimeType: 'application/pdf',
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = () => {
    if (
      !data.name ||
      !data.mobile ||
      !data.masjidName ||
      !data.masjidAddress ||
      !data.letterPad.uri
    ) {
      Alert.alert('Error', 'Please fill all fields and upload letter pad');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('mobile', data.mobile);
    formData.append('masjidName', data.masjidName);
    formData.append('masjidAddress', data.masjidAddress);

    formData.append('letterPad', {
      uri: data.letterPad.uri,
      name: data.letterPad.name,
      type: 'application/pdf',
    } as any);

    mutate(formData, {
      onSuccess: () => {
        Alert.alert('Success', 'Request submitted successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Something went wrong');
      },
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      showMessage('Logged Out Successfully!');
    } catch (error) {
      showMessage('Please try again later.');
    }
  };

  const RequestStatusCard = ({ data }: { data: any }) => {
    const statusMeta = getStatusMeta(data.status);

    return (
      <View style={styles.statusCard}>
        <Text style={[styles.statusTitle, { color: statusMeta.color }]}>
          Status: {statusMeta.text}
        </Text>

        <Text style={styles.statusRow}>
          <Text style={styles.bold}>Masjid:</Text> {data.masjidName}
        </Text>

        <Text style={styles.statusRow}>
          <Text style={styles.bold}>Address:</Text> {data.masjidAddress}
        </Text>

        <Text style={styles.statusRow}>
          <Text style={styles.bold}>Mobile:</Text> {data.mobile}
        </Text>

        <Text style={styles.statusRow}>
          <Text style={styles.bold}>Submitted on:</Text>{' '}
          {new Date(data.createdAt).toDateString()}
        </Text>

        {data.letterPadUrl && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(data.letterPadUrl)}
          >
            <Text style={styles.linkText}>View Letter Pad (PDF)</Text>
          </TouchableOpacity>
        )}

           {/* ❌ REJECTED STATE */}
        {data.status === 'REJECTED' && (
          <View style={styles.bannerRejected}>
            <Text style={styles.bannerText}>
              Your request was rejected. Please contact us for help.
            </Text>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={openWhatsapp}
            >
              <Text style={styles.whatsappText}>
                Contact on WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        )}

         {/* ✅ APPROVED STATE */}
        {data.status === 'APPROVED' && (
          <View style={styles.bannerApproved}>
            <Text style={styles.bannerText}>
              Your request has been approved 🎉  
              Please logout and login again to continue.
            </Text>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>
                {logoutLoader ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };


  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={120}
    >
      {requestStatus ? (
      <RequestStatusCard data={requestStatus} />
    ) : (
      <>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={data.name}
          onChangeText={text => setData({ ...data, name: text })}
          placeholder="Name"
        />

        <Text style={styles.label}>Registered Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={data.mobile}
          onChangeText={text => setData({ ...data, mobile: text })}
          placeholder="Registered mobile number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Masjid Name</Text>
        <TextInput
          style={styles.input}
          value={data.masjidName}
          onChangeText={text => setData({ ...data, masjidName: text })}
          placeholder="Masjid name"
        />

        <Text style={styles.label}>Masjid Address</Text>
        <TextInput
          style={styles.input}
          value={data.masjidAddress}
          onChangeText={text => setData({ ...data, masjidAddress: text })}
          placeholder="Masjid address"
          multiline
        />

        <Text style={styles.label}>Letter Pad (PDF)</Text>
        <Pressable
          style={[styles.fileInput, { backgroundColor: colors.DISABLED_INPUT_BG }]}
          onPress={handleSelectPdf}
        >
          <Text style={data.letterPad.name ? styles.fileName : styles.placeholder}>
            {data.letterPad.name || 'Tap to select a PDF file'}
          </Text>
        </Pressable>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.CARD }]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text>{isPending ? 'Requesting...' : 'Request'}</Text>
        </TouchableOpacity>
      </>
    )}
    </KeyboardAwareScrollView>
  );
};

export default AddMasjidScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },

  // 👇 Add these styles
  placeholder: {
    color: '#aaa',

  },
  fileName: {
    color: '#000',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',

    // Android
    elevation: 4,

    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  bannerRejected: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fdecea',
  },

  bannerApproved: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
  },

  bannerText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },

  logoutButton: {
    backgroundColor: '#c62828',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },


  statusRow: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },

  bold: {
    fontWeight: '600',
  },

  linkButton: {
    marginTop: 12,
    paddingVertical: 10,
  },

  linkText: {
    color: '#1e88e5',
    fontWeight: '600',
  },


  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
label: { marginVertical: 6, fontSize: 14, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8 },
    
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.85,
  },

  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
  },

  whatsappText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
