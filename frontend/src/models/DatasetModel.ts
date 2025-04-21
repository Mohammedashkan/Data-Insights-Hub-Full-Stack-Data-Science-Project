export interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  size: string;
  lastUpdated: string;
  processingStatus: string; // <-- Add this line
  dataQualityScore?: number;
  tags: string[];
}

export class DatasetModel {
  private static instance: DatasetModel;
  private datasets: Dataset[] = [];

  private constructor() {}

  public static getInstance(): DatasetModel {
    if (!DatasetModel.instance) {
      DatasetModel.instance = new DatasetModel();
    }
    return DatasetModel.instance;
  }

  async fetchDatasets(): Promise<Dataset[]> {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      const mockDatasets: Dataset[] = [
        { id: '1', name: 'Sales Data 2023', rows: 1500, columns: 12, size: '2.3 MB', lastUpdated: '2023-12-15', processingStatus: 'completed', tags: ['sales', '2023'] },
        { id: '2', name: 'Customer Feedback', rows: 850, columns: 8, size: '1.1 MB', lastUpdated: '2023-11-28', processingStatus: 'completed', tags: ['customer', 'feedback'] },
        { id: '3', name: 'Marketing Campaign Results', rows: 320, columns: 15, size: '0.8 MB', lastUpdated: '2023-12-01', processingStatus: 'processing', tags: ['marketing', 'campaign'] },
        { id: '4', name: 'Product Inventory', rows: 1200, columns: 10, size: '1.5 MB', lastUpdated: '2023-12-10', processingStatus: 'completed', tags: ['product', 'inventory'] },
        { id: '5', name: 'Employee Performance', rows: 75, columns: 20, size: '0.5 MB', lastUpdated: '2023-11-15', processingStatus: 'pending', tags: ['employee', 'performance'] }
      ];
      
      this.datasets = mockDatasets;
      return this.datasets;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async uploadDataset(file: File): Promise<Dataset> {
    try {
      // Mock upload process
      const newDataset: Dataset = {
        id: String(this.datasets.length + 1),
        name: file.name,
        rows: Math.floor(Math.random() * 1000) + 100,
        columns: Math.floor(Math.random() * 15) + 5,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        lastUpdated: new Date().toISOString().split('T')[0],
        processingStatus: 'pending',
        tags: ['uploaded']
      };
      
      this.datasets.unshift(newDataset);
      return newDataset;
    } catch (error) {
      console.error('Error uploading dataset:', error);
      throw error;
    }
  }

  getDatasets(): Dataset[] {
    return this.datasets;
  }
}