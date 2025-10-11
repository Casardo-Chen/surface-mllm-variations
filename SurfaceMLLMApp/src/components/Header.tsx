import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  onPaperPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPaperPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text variant="headlineMedium" style={styles.title}>
            MLLM-generated Image Descriptions Variations
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Compare image descriptions across vision-language models
          </Text>
        </View>
        <Button
          mode="outlined"
          onPress={onPaperPress}
          style={styles.paperButton}
          icon="open-in-new"
          compact
        >
          View Paper
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  paperButton: {
    borderColor: '#1976d2',
  },
});

export default Header;
