import { Dataset } from '../models/DatasetModel';

export class DatasetPresenter {
  private onDatasetsChanged: (datasets: Dataset[]) => void;
  private onError: (error: string) => void;
  private onLoadingChange: (isLoading: boolean) => void;
  private datasets: Dataset[] = [];

  constructor(
    onDatasetsChanged: (datasets: Dataset[]) => void,
    onError: (error: string) => void,
    onLoadingChange: (isLoading: boolean) => void
  ) {
    this.onDatasetsChanged = onDatasetsChanged;
    this.onError = onError;
    this.onLoadingChange = onLoadingChange;
  }

  async loadDatasets(): Promise<void> {
    this.onLoadingChange(true);
    try {
      // Simulate API call with mock data for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.datasets = [
        {
          id: '1',
          name: 'Customer Survey Results',
          rows: 1245,
          columns: 18,
          size: '2.4 MB',
          lastUpdated: '2023-12-15',
          processingStatus: 'completed',
          dataQualityScore: 87,
          tags: ['customer', 'survey', 'feedback']
        },
        {
          id: '2',
          name: 'Sales Transactions 2023',
          rows: 5432,
          columns: 12,
          size: '8.7 MB',
          lastUpdated: '2023-11-28',
          processingStatus: 'completed',
          dataQualityScore: 92,
          tags: ['sales', 'transactions', 'revenue']
        },
        {
          id: '3',
          name: 'Marketing Campaign Results',
          rows: 876,
          columns: 24,
          size: '3.2 MB',
          lastUpdated: '2023-12-10',
          processingStatus: 'processing',
          dataQualityScore: 78,
          tags: ['marketing', 'campaign', 'performance']
        }
      ];
      
      this.onDatasetsChanged([...this.datasets]);
    } catch (error) {
      this.onError('Failed to load datasets. Please try again later.');
    } finally {
      this.onLoadingChange(false);
    }
  }

  async uploadDataset(file: File): Promise<void> {
    try {
      // Simulate file upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDataset: Dataset = {
        id: `${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        rows: Math.floor(Math.random() * 5000) + 500,
        columns: Math.floor(Math.random() * 20) + 5,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        lastUpdated: new Date().toISOString().split('T')[0],
        processingStatus: 'pending',
        dataQualityScore: undefined,
        tags: this.generateRandomTags()
      };
      
      this.datasets.unshift(newDataset);
      this.onDatasetsChanged([...this.datasets]);
      
      // Simulate processing completion after some time
      setTimeout(() => {
        const index = this.datasets.findIndex(d => d.id === newDataset.id);
        if (index !== -1) {
          this.datasets[index].processingStatus = 'completed';
          this.datasets[index].dataQualityScore = Math.floor(Math.random() * 30) + 70;
          this.onDatasetsChanged([...this.datasets]);
        }
      }, 5000);
    } catch (error) {
      this.onError('Failed to upload dataset. Please try again.');
    }
  }

  // Add this method to your DatasetPresenter class
  async deleteDataset(datasetId: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = this.datasets.findIndex(d => d.id === datasetId);
      if (index !== -1) {
        this.datasets.splice(index, 1);
        this.onDatasetsChanged([...this.datasets]);
        return;
      }
      
      throw new Error('Dataset not found');
    } catch (error) {
      this.onError('Failed to delete dataset. Please try again.');
    }
  }

  // And these methods for the AI actions
  async runAnalysisOnAll(): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update all datasets with new analysis timestamp
      this.datasets = this.datasets.map(dataset => ({
        ...dataset,
        lastAnalyzed: new Date().toISOString().split('T')[0]
      }));
      
      this.onDatasetsChanged([...this.datasets]);
    } catch (error) {
      this.onError('Failed to run analysis on all datasets. Please try again.');
    }
  }

  async generateCorrelations(): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Here you would typically update some state to show correlations
      // For now we'll just notify success through the presenter
      this.onDatasetsChanged([...this.datasets]);
    } catch (error) {
      this.onError('Failed to generate correlations. Please try again.');
    }
  }

  private generateRandomTags(): string[] {
    const allTags = [
      'sales', 'marketing', 'customer', 'product', 'finance',
      'operations', 'hr', 'survey', 'analytics', 'quarterly',
      'annual', 'monthly', 'forecast', 'historical', 'trends'
    ];
    
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags: string[] = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomIndex = Math.floor(Math.random() * allTags.length);
      const tag = allTags[randomIndex];
      
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  }

  cleanup(): void {
    // Any cleanup logic here
  }

  // Add this method to fix the type error
  async analyzeDataset(datasetId: string): Promise<void> {
    try {
      // Simulate analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // You can update the dataset or notify the UI as needed
      // For example, mark the dataset as analyzed
      const index = this.datasets.findIndex(d => d.id === datasetId);
      if (index !== -1) {
        // You can add a property or update state here if needed
        // For demonstration, let's just update lastAnalyzed
        (this.datasets[index] as any).lastAnalyzed = new Date().toISOString().split('T')[0];
        this.onDatasetsChanged([...this.datasets]);
      }
    } catch (error) {
      this.onError('Failed to analyze dataset. Please try again.');
    }
  }
}