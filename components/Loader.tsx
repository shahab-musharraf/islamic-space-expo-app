
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export default function Loader() {  

  const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000, // 1 second per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });


  return (
      <View  style={styles.container}>
        <Animated.View style={[styles.box, { transform: [{ rotate }] }]} />
      </View>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  box : {
    width: 50,
    height: 50,
    borderWidth:3,
    borderColor:'green',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRadius: 50
  },
});