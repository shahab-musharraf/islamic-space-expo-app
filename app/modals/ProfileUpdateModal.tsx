import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const ProfileUpdateModal = ({ visible, onClose, onSubmit }) => {
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const formData = new FormData();

    if (avatar) {
      formData.append("avatar", {
        uri: avatar,
        name: "avatar.jpg",
        type: "image/jpeg",
      });
    }

    if (name) formData.append("name", name);
    if (email) formData.append("email", email);

    onSubmit(formData); // Pass to parent for API call
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Update Profile</Text>

          {/* Avatar */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarPlaceholder}>Pick Avatar</Text>
            )}
          </TouchableOpacity>

          {/* Name */}
          <TextInput
            placeholder="Name (optional)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* Email */}
          <TextInput
            placeholder="Email (optional)"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileUpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    fontSize: 14,
    color: "#666",
    padding: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#aaa",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
