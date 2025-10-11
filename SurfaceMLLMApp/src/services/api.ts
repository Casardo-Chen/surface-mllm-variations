const API_BASE_URL = 'http://localhost:8000';

export interface Model {
  id: string;
  name: string;
}

export interface PromptVariation {
  id: string;
  name: string;
}

export interface Config {
  models: Model[];
  promptVariations: PromptVariation[];
  defaultPrompt: string;
  defaultNumTrials: number;
  defaultModels: string[];
  defaultPromptVariation: string;
}

export interface GenerateRequest {
  prompt?: string;
  numTrials?: number;
  selectedModels?: string[];
  promptVariation?: string;
  userId?: string;
  imageUrl?: string;
  image?: any; // File object for upload
}

export interface GenerateResponse {
  success: boolean;
  descriptions: Record<string, any>;
  variationSummary: Record<string, any>;
  imageId: string;
}

export interface Dataset {
  id: string;
  name: string;
}

export interface GetDescriptionsRequest {
  imageName: string;
}

export interface GetDescriptionsResponse {
  success: boolean;
  descriptions: Record<string, any>;
  variation: Record<string, any>;
  metadata: Record<string, any>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getConfig(): Promise<Config> {
    return this.request<Config>('/config');
  }

  async generateDescriptions(request: GenerateRequest): Promise<GenerateResponse> {
    const formData = new FormData();
    
    // Add text fields
    if (request.prompt) formData.append('prompt', request.prompt);
    if (request.numTrials) formData.append('numTrials', request.numTrials.toString());
    if (request.selectedModels) formData.append('selectedModels', JSON.stringify(request.selectedModels));
    if (request.promptVariation) formData.append('promptVariation', request.promptVariation);
    if (request.userId) formData.append('userId', request.userId);
    if (request.imageUrl) formData.append('imageUrl', request.imageUrl);
    
    // Add image file if provided
    if (request.image) {
      formData.append('image', {
        uri: request.image.uri,
        type: request.image.type || 'image/jpeg',
        name: request.image.fileName || 'image.jpg',
      } as any);
    }

    const url = `${this.baseUrl}/generate`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getDescriptions(request: GetDescriptionsRequest): Promise<GetDescriptionsResponse> {
    return this.request<GetDescriptionsResponse>('/get_descriptions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDatasets(): Promise<{ datasets: Dataset[] }> {
    return this.request<{ datasets: Dataset[] }>('/datasets');
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
