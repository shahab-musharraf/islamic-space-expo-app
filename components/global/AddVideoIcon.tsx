import FontAwesome from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { View } from 'react-native';

const AddVideoIcon = ({ color = "gray", size = 24 }) => {
  return (
    <View style={{ position: 'relative' }}>
      <FontAwesome name="video" size={size} color={color} />
      <View style={{ position: 'absolute', top: -10, right: -10, width: 20, height: 20, backgroundColor: color, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
        <FontAwesome6 name="add" size={14} color={'white'} />
      </View>
    </View>
  )
}

export default AddVideoIcon