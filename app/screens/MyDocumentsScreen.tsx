import type { Document } from '@/apis/useGetDocuments';
import { useGetDocuments } from '@/apis/useGetDocuments';
import { useUploadDocument } from '@/apis/useUploadDocument';
import { Theme } from '@/constants/types';
import { showMessage } from '@/utils/functions';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation, useTheme } from '@react-navigation/native';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const documentTypes = [
  { label: 'Aadhar Card', value: 'aadhar_card' },
  { label: 'PAN Card', value: 'pan_card' },
];

const MyDocumentsScreen = () => {
  const { colors } = useTheme() as Theme;
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: 'My Documents' });
  }, [navigation]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { data: documents, isLoading, error } = useGetDocuments();
  const { mutateAsync: uploadDocument, isPending: uploading } = useUploadDocument();

  const handleAddPress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleFilePick = useCallback(async () => {
    try {
      const result = await getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error(err);
      showMessage('Failed to pick file');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedType || !selectedFile) {
      showMessage('Please select document type and file');
      return;
    }

    const formData = new FormData();
    formData.append('name', selectedType);
    formData.append('file', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: 'application/pdf',
    } as any);

    try {
      await uploadDocument(formData);
      showMessage('Document uploaded successfully');
      setModalVisible(false);
      setSelectedType('');
      setSelectedFile(null);
      setDropdownVisible(false);
    } catch (err) {
      console.error(err);
      showMessage('Failed to upload document');
    }
  }, [selectedType, selectedFile, uploadDocument]);

  const handleDocumentPress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderDocument = useCallback(({ item }: { item: Document }) => (
    <TouchableOpacity
      style={[styles.documentItem, { borderBottomColor: colors.DISABLED_TEXT }]}
      onPress={() => handleDocumentPress(item.url)}
    >
      <Text style={[styles.documentName, { color: colors.TEXT }]}>{item.name}</Text>
      <Feather name="external-link" size={20} color={colors.ICON} />
    </TouchableOpacity>
  ), [colors, handleDocumentPress]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.TINT} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: colors.TEXT }]}>Failed to load documents</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.TEXT }]}>My Documents</Text>
        <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {documents && documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderDocument}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={[styles.message, { color: colors.TEXT }]}>No documents found</Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT }]}>Add Document</Text>

            <TouchableOpacity
              onPress={() => setDropdownVisible(!dropdownVisible)}
              style={[styles.dropdownButton, { borderColor: colors.TINT }]}
            >
              <Text style={[styles.dropdownText, { color: selectedType ? colors.TEXT : colors.DISABLED_TEXT }]}>
                {selectedType ? documentTypes.find(t => t.value === selectedType)?.label : 'Select Document Type'}
              </Text>
              <Feather name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={colors.ICON} />
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={[styles.dropdownList, { backgroundColor: colors.CARD, borderColor: colors.TINT }]}>
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => {
                      setSelectedType(type.value);
                      setDropdownVisible(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={[styles.dropdownItemText, { color: colors.TEXT }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={handleFilePick} style={[styles.fileButton, { borderColor: colors.TINT }]}>
              <Text style={[styles.fileButtonText, { color: colors.TINT }]}>
                {selectedFile ? selectedFile.name : 'Select PDF File'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpload}
                disabled={uploading}
                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.TINT }]}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  documentName: {
    fontSize: 16,
  },
  message: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  fileButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  fileButtonText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  cancelText: {
    color: '#000',
  },
  submitButton: {
    // backgroundColor set in style
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MyDocumentsScreen;