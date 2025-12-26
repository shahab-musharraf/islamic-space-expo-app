import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Assuming you have imported your constants correctly
export enum MasjidUpdateStatus {
  NONE = 'None',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

interface Props {
  status: MasjidUpdateStatus;
}

const MasjidUpdateLabel: React.FC<Props> = ({ status }) => {


    if(status === MasjidUpdateStatus.NONE){
        return null;
    }
  // 1. Determine the status style based on the input
  const statusStyle = getStatusStyles(status);

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
        Update Status: {statusStyle.displayText}
      </Text>
    </View>
  );
};

export default MasjidUpdateLabel;

// --- Helper Function for Status Styling ---

const getStatusStyles = (status: MasjidUpdateStatus) => {
  switch (status) {
    case MasjidUpdateStatus.APPROVED:
      return {
        backgroundColor: '#4CAF50', // Success Green
        textColor: '#FFFFFF',
        displayText: 'Approved',
      };

    case MasjidUpdateStatus.UNDER_REVIEW:
      return {
        backgroundColor: '#FFC107', // Warning Yellow/Gold
        textColor: '#333333', // Dark text for contrast on light yellow
        displayText: 'Under Review',
      };

    case MasjidUpdateStatus.REJECTED:
      return {
        backgroundColor: '#F44336', // Error Red
        textColor: '#FFFFFF',
        displayText: 'Rejected',
      };

    case MasjidUpdateStatus.NONE:
    default:
      return {
        backgroundColor: '#B0BEC5', // Neutral Light Gray/Blue-Gray
        textColor: '#333333',
        displayText: 'No Update',
      };
  }
};

// --- Stylesheet for the Badge ---

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16, // Pill shape
    alignSelf: 'flex-start', // Important: makes the view wrap the content
    minWidth: 100, // Ensure a minimum size for visual consistency
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600', // Semi-bold
  },
});