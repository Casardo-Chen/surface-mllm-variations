import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService, Dataset, GetDescriptionsResponse } from '../services/api';

const ExamplesScreen: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [results, setResults] = useState<GetDescriptionsResponse | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDatasets();
      setDatasets(response.datasets);
    } catch (error) {
      Alert.alert('Error', 'Failed to load datasets');
      console.error('Datasets load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDatasets();
    setRefreshing(false);
  };

  const loadAnalysis = async (datasetName: string) => {
    try {
      setLoadingResults(true);
      setSelectedDataset(datasetName);
      const response = await apiService.getDescriptions({ imageName: datasetName });
      setResults(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analysis');
      console.error('Analysis load error:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setSelectedDataset(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading datasets...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Load Previously Generated Analysis
          </Text>

          {datasets.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="collections" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No datasets available</Text>
              <Text style={styles.emptySubtext}>
                Generate some analyses first to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.datasetList}>
              {datasets.map((dataset) => (
                <List.Item
                  key={dataset.id}
                  title={dataset.name}
                  description={`Dataset ID: ${dataset.id}`}
                  left={(props) => <List.Icon {...props} icon="folder" />}
                  right={(props) => (
                    <Button
                      mode="contained"
                      onPress={() => loadAnalysis(dataset.id)}
                      loading={loadingResults && selectedDataset === dataset.id}
                      disabled={loadingResults}
                      compact
                    >
                      Load
                    </Button>
                  )}
                  style={styles.datasetItem}
                />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Results Section */}
      {results && (
        <Card style={styles.resultsCard}>
          <Card.Content>
            <View style={styles.resultsHeader}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Loaded Analysis: {selectedDataset}
              </Text>
              <Button
                mode="outlined"
                onPress={clearResults}
                compact
                icon="close"
              >
                Clear
              </Button>
            </View>
            
            <View style={styles.resultsContainer}>
              {Object.entries(results.variation || {}).map(([key, value]) => (
                <View key={key} style={styles.resultItem}>
                  <Text variant="titleMedium" style={styles.resultTitle}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.resultContent}>
                    {String(value)}
                  </Text>
                  <Divider style={styles.divider} />
                </View>
              ))}
            </View>

            {/* Individual Descriptions */}
            {results.descriptions && Object.keys(results.descriptions).length > 0 && (
              <View style={styles.descriptionsSection}>
                <Text variant="titleLarge" style={styles.descriptionsTitle}>
                  Individual Model Descriptions
                </Text>
                {Object.entries(results.descriptions).map(([key, desc]: [string, any]) => {
                  if (key === 'prompt') return null;
                  return (
                    <View key={key} style={styles.descriptionItem}>
                      <View style={styles.descriptionHeader}>
                        <Chip 
                          mode="outlined" 
                          compact
                          style={styles.modelChip}
                        >
                          {desc.model?.toUpperCase() || 'Unknown'}
                        </Chip>
                        <Text style={styles.trialText}>
                          Trial {desc.id || '?'}
                        </Text>
                      </View>
                      <Text style={styles.descriptionText}>
                        {desc.description || 'No description available'}
                      </Text>
                      <Divider style={styles.descriptionDivider} />
                    </View>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  resultsCard: {
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  datasetList: {
    marginTop: 8,
  },
  datasetItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#424242',
  },
  resultContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  divider: {
    marginTop: 12,
  },
  descriptionsSection: {
    marginTop: 24,
  },
  descriptionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#424242',
  },
  descriptionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelChip: {
    marginRight: 8,
  },
  trialText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  descriptionDivider: {
    marginTop: 12,
  },
});

export default ExamplesScreen;
