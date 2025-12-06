import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';

// Screens
import CorrectionReviewScreen from './components/CorrectionReviewScreen';
import UpdateReviewScreen from './components/UpdateReviewScreen';
import VerifiedMasjidsScreen from './components/VerifiedMasjidsScreen';
import VerifyMasjidsScreen from './components/VerifyMasjidsScreen';

const Tab = createBottomTabNavigator();

const AdminPanelScreen = () => {
  return (
    <Tab.Navigator
        initialRouteName="VerifyMasjids"
        screenOptions={{
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,

            // Padding for entire tab bar
            tabBarStyle: {
            height: 110, // bigger height for comfortable tapping
            },

            // Padding for each tab button
            tabBarItemStyle: {
            paddingVertical: 6,
            
            },

            // Optional: Adjust label spacing
            tabBarLabelStyle: {
            // marginBottom: 4,
            fontSize: 12,
            },
        }}
        >

      {/* Verify Masjids */}
      <Tab.Screen
        name="VerifyMasjids"
        component={VerifyMasjidsScreen}
        options={{
          title: 'Verify Masjids',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="unverified" size={size} color={color} />
          ),
        }}
      />

      {/* Correction Review */}
      <Tab.Screen
        name="CorrectionReview"
        component={CorrectionReviewScreen}
        options={{
          title: 'Correction Review',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="domain-verification" size={size} color={color} />
          ),
        }}
      />

      {/* Update Review */}
      <Tab.Screen
        name="UpdateReview"
        component={UpdateReviewScreen}
        options={{
          title: 'Update Review',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="edit" size={size} color={color} />
          ),
        }}
      />

      {/* Verified Masjids */}
      <Tab.Screen
        name="VerifiedMasjids"
        component={VerifiedMasjidsScreen}
        options={{
          title: 'Verified Masjids',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="verified" size={size} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default AdminPanelScreen;
