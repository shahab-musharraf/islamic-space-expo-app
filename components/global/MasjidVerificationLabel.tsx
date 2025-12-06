import { MasjidVerificationStatus } from '@/constants/masjid-status';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  status: string;
}

const MasjidVerificationLabel: React.FC<Props> = ({ status }) => {
  // 1. Determine the status style based on the input
  const statusStyle = getStatusStyles(status);

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
        {statusStyle.displayText}
      </Text>
    </View>
  )
}

export default MasjidVerificationLabel

// --- Helper Function for Status Styling (3 Options) ---

const getStatusStyles = (status: string) => {
  switch (status) {
    case MasjidVerificationStatus.VERIFIED:
      return {
        backgroundColor: '#4CAF50', // Success Green
        textColor: '#FFFFFF',
        displayText: 'Verified',
      };

    case MasjidVerificationStatus.PENDING_VERIFICATION:
      return {
        backgroundColor: '#FF9800', // Warning Orange
        textColor: '#333333',
        displayText: 'Pending Verification',
      };
      
    case MasjidVerificationStatus.NEEDS_CORRECTION:
      return {
        backgroundColor: '#F44336', // Error Red
        textColor: '#FFFFFF',
        displayText: 'Correction Needed',
      };
      
    default:
      // Fallback for statuses you don't have yet, or null/undefined status
      return {
        backgroundColor: '#9E9E9E', // Neutral Gray
        textColor: '#FFFFFF',
        displayText: status || 'Unknown Status', 
      };
  }
};

// --- Stylesheet for the Badge ---

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16, // Pill shape
    alignSelf: 'flex-start',
    minWidth: 90, 
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 12, 
    fontWeight: '600', 
    textTransform: 'uppercase', // Optional: Makes it look professional
  },
});