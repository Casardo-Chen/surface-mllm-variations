import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Checkbox,
  RadioButton,
  Slider,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService, Config, GenerateRequest } from '../services/api';

const GenerateScreen: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePickerResponse | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [numTrials, setNumTrials] = useState(3);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [promptVariation, setPromptVariation] = useState('original');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configData = await apiService.getConfig();
      setConfig(configData);
      setPrompt(configData.defaultPrompt);
      setSelectedModels(configData.defaultModels);
      setPromptVariation(configData.defaultPromptVariation);
    } catch (error) {
      Alert.alert('Error', 'Failed to load configuration');
      console.error('Config load error:', error);
    }
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response);
        setImageUrl(''); // Clear URL when selecting file
      }
    });
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const generateDescriptions = async () => {
    if (!selectedImage && !imageUrl.trim()) {
      Alert.alert('Error', 'Please provide an image or image URL');
      return;
    }

    if (selectedModels.length === 0) {
      Alert.alert('Error', 'Please select at least one model');
      return;
    }

    setLoading(true);
    try {
      const request: GenerateRequest = {
        prompt: prompt.trim() || config?.defaultPrompt,
        numTrials,
        selectedModels,
        promptVariation,
        userId: 'mobile_user',
        imageUrl: imageUrl.trim() || undefined,
        image: selectedImage?.assets?.[0] || undefined,
      };

      const response = await apiService.generateDescriptions(request);
      setResults(response);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate descriptions');
      console.error('Generate error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImageUrl('');
    setPrompt(config?.defaultPrompt || '');
    setNumTrials(3);
    setSelectedModels(config?.defaultModels || []);
    setPromptVariation('original');
    setResults(null);
  };

  if (!config) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Input Configuration
          </Text>

          {/* Image Input Section */}
          <View style={styles.imageSection}>
            <Text variant="titleMedium" style={styles.label}>
              Image Input
            </Text>
            
            {selectedImage?.assets?.[0] ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: selectedImage.assets[0].uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
                <Icon name="add-photo-alternate" size={48} color="#666" />
                <Text style={styles.imageButtonText}>Select Image</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.orText}>OR</Text>

            <TextInput
              label="Image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="Enter image URL"
              style={styles.urlInput}
              mode="outlined"
            />
          </View>

          {/* Prompt Input */}
          <TextInput
            label="Prompt"
            value={prompt}
            onChangeText={setPrompt}
            placeholder={config.defaultPrompt}
            multiline
            numberOfLines={3}
            style={styles.promptInput}
            mode="outlined"
          />

          {/* Number of Trials */}
          <View style={styles.sliderSection}>
            <Text variant="titleMedium" style={styles.label}>
              Number of Trials: {numTrials}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={numTrials}
              onValueChange={setNumTrials}
              step={1}
            />
          </View>

          {/* Model Selection */}
          <View style={styles.modelSection}>
            <Text variant="titleMedium" style={styles.label}>
              Select Models
            </Text>
            <View style={styles.modelList}>
              {config.models.map((model) => (
                <Chip
                  key={model.id}
                  selected={selectedModels.includes(model.id)}
                  onPress={() => toggleModel(model.id)}
                  style={styles.modelChip}
                  mode={selectedModels.includes(model.id) ? 'flat' : 'outlined'}
                >
                  {model.name}
                </Chip>
              ))}
            </View>
          </View>

          {/* Prompt Variation */}
          <View style={styles.variationSection}>
            <Text variant="titleMedium" style={styles.label}>
              Prompt Variation
            </Text>
            {config.promptVariations.map((variation) => (
              <RadioButton.Item
                key={variation.id}
                label={variation.name}
                value={variation.id}
                status={promptVariation === variation.id ? 'checked' : 'unchecked'}
                onPress={() => setPromptVariation(variation.id)}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              mode="contained"
              onPress={generateDescriptions}
              loading={loading}
              disabled={loading}
              style={styles.generateButton}
              icon="play"
            >
              Generate Descriptions
            </Button>
            <Button
              mode="outlined"
              onPress={clearAll}
              style={styles.clearButton}
              icon="refresh"
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Results Section */}
      {results && (
        <Card style={styles.resultsCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Analysis Results
            </Text>
            
            <View style={styles.resultsContainer}>
              {Object.entries(results.variationSummary || {}).map(([key, value]) => (
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
  imageSection: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  imageButton: {
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imageButtonText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  imagePreview: {
    position: 'relative',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  urlInput: {
    marginTop: 8,
  },
  promptInput: {
    marginBottom: 16,
  },
  sliderSection: {
    marginBottom: 16,
  },
  slider: {
    marginTop: 8,
  },
  modelSection: {
    marginBottom: 16,
  },
  modelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  variationSection: {
    marginBottom: 16,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
  },
  generateButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
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
});

export default GenerateScreen;
