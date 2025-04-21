"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Dataset } from '../../models/DatasetModel'
import { DatasetPresenter } from '../../presenters/DatasetPresenter'
import { motion } from 'framer-motion'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  
  if (status === 'completed') bgColor = 'bg-green-100 text-green-800';
  if (status === 'processing') bgColor = 'bg-blue-100 text-blue-800';
  if (status === 'pending') bgColor = 'bg-yellow-100 text-yellow-800';
  if (status === 'failed') bgColor = 'bg-red-100 text-red-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Quality score component
const QualityScore = ({ score, recommendation }: { score?: number, recommendation?: string }) => {
  if (!score) return <span className="text-gray-500">Not analyzed</span>;
  
  let color = 'text-red-500';
  if (score >= 90) color = 'text-green-500';
  else if (score >= 70) color = 'text-yellow-500';
  
  return (
    <div>
      <div className={`font-medium ${color}`}>{score}%</div>
      {recommendation && <div className="text-xs text-gray-500 mt-1">{recommendation}</div>}
    </div>
  );
};

// Tags component
const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag, index) => (
        <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [presenter, setPresenter] = useState<DatasetPresenter | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [showInsightModal, setShowInsightModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Add these new state variables
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null)
  const [aiActionInProgress, setAiActionInProgress] = useState<string | null>(null)

  // Mock data for trends and insights
  const mockTrends = {
    dataQuality: [65, 72, 78, 82, 85, 88, 92],
    processingTime: [4.2, 3.8, 3.5, 3.2, 2.8, 2.5, 2.2],
    insightsGenerated: [12, 18, 25, 32, 38, 45, 52]
  }

  // Add these new handler functions
  const handleDeleteClick = (datasetId: string) => {
    setDatasetToDelete(datasetId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!datasetToDelete || !presenter) return;
    
    setIsDeleting(datasetToDelete);
    try {
      await presenter.deleteDataset(datasetToDelete);
      // Success notification could be added here
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(false);
      setDatasetToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDatasetToDelete(null);
  };
  
  const handleRunAllAnalysis = async () => {
    if (!presenter || !presenter.runAnalysisOnAll) return;
    
    setAiActionInProgress('runAll');
    try {
      await presenter.runAnalysisOnAll();
      // Show success notification
    } finally {
      setAiActionInProgress(null);
    }
  };
  
  const handleGenerateCorrelations = async () => {
    if (!presenter || !presenter.generateCorrelations) return;
    
    setAiActionInProgress('correlations');
    try {
      await presenter.generateCorrelations();
      // Show success notification
    } finally {
      setAiActionInProgress(null);
    }
  };
  
  const handleCreateMergedDataset = () => {
    // Implement merged dataset functionality
    alert("Create Merged Dataset functionality will be implemented in the next sprint");
  };

  useEffect(() => {
    // Initialize presenter
    const datasetPresenter = new DatasetPresenter(
      (newDatasets) => setDatasets(newDatasets),
      (errorMsg) => setError(errorMsg),
      (isLoading) => setLoading(isLoading)
    );
    
    setPresenter(datasetPresenter);
    
    // Load datasets
    datasetPresenter.loadDatasets();
    
    // Cleanup on unmount
    return () => {
      if (datasetPresenter.cleanup) {
        datasetPresenter.cleanup();
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !presenter) return;
    
    setUploadingFile(true);
    try {
      await presenter.uploadDataset(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && presenter) {
      const file = e.dataTransfer.files[0];
      setUploadingFile(true);
      try {
        await presenter.uploadDataset(file);
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleAnalyze = async (datasetId: string) => {
    if (!presenter || !presenter.analyzeDataset) return;
    
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setSelectedDataset(dataset);
      await presenter.analyzeDataset(datasetId);
      setShowInsightModal(true);
    }
  };

  const filteredDatasets = datasets
    .filter(dataset => dataset.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(dataset => filterStatus === 'all' || dataset.processingStatus === filterStatus);

  // Check for loading and error states
  if (loading && datasets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl">Loading datasets...</div>
          <div className="mt-2 text-sm text-gray-500">Connecting to AI data processing engine</div>
        </motion.div>
      </div>
    );
  }

  if (error && datasets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-6 rounded-lg border border-red-200"
        >
          <div className="text-xl text-red-500 mb-2">Error Loading Datasets</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Add this CSS at the top of your file, after the imports
  const responsiveStyles = `
    @media (max-width: 768px) {
      .responsive-grid {
        grid-template-columns: 1fr !important;
      }
      
      .responsive-table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
      }
      
      .responsive-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .responsive-search-filter {
        flex-direction: column;
        align-items: stretch !important;
      }
      
      .responsive-search {
        width: 100% !important;
      }
      
      .responsive-modal {
        width: 95% !important;
        max-width: 95% !important;
      }
    }
    
    @media (max-width: 480px) {
      .responsive-padding {
        padding: 1rem !important;
      }
      
      .responsive-heading {
        font-size: 1.5rem !important;
      }
    }
  `;

  return (
    <div className="flex min-h-screen flex-col p-8 responsive-padding">
      <style jsx global>{responsiveStyles}</style>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 responsive-heading">Datasets</h1>
        <p className="text-gray-500 mb-8">Manage and analyze your data with AI-powered insights</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 responsive-grid">
        {/* Upload Card */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4">Upload New Dataset</h2>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="hidden"
              accept=".csv,.xlsx,.json"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-500">
              {uploadingFile ? 'Processing with AI...' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports CSV, Excel, and JSON
            </p>
          </div>
          
          {uploadingFile && (
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                AI is analyzing your data for quality issues and generating insights...
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Stats Card */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Data Insights</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Data Quality Trend</span>
                <span className="text-xs text-green-500">+12% this month</span>
              </div>
              <Sparklines data={mockTrends.dataQuality} height={40} margin={5}>
                <SparklinesLine color="#10B981" />
                <SparklinesSpots />
              </Sparklines>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Processing Time (sec)</span>
                <span className="text-xs text-green-500">-25% this month</span>
              </div>
              <Sparklines data={mockTrends.processingTime} height={40} margin={5}>
                <SparklinesLine color="#3B82F6" />
                <SparklinesSpots />
              </Sparklines>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Insights Generated</span>
                <span className="text-xs text-green-500">+32% this month</span>
              </div>
              <Sparklines data={mockTrends.insightsGenerated} height={40} margin={5}>
                <SparklinesLine color="#8B5CF6" />
                <SparklinesSpots />
              </Sparklines>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions Card */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">
              "Based on your recent uploads, I recommend analyzing the 'Marketing Campaign Results' dataset next. It shows promising patterns that could complement your sales data."
            </p>
            <div className="text-xs text-gray-500">- Data Insights AI</div>
          </div>
          
          <div className="space-y-2">
            <button 
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition flex items-center justify-center"
              onClick={handleRunAllAnalysis}
              disabled={aiActionInProgress === 'runAll'}
            >
              {aiActionInProgress === 'runAll' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Run AI Analysis on All
                </>
              )}
            </button>
            
            <button 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition flex items-center justify-center"
              onClick={handleGenerateCorrelations}
              disabled={aiActionInProgress === 'correlations'}
            >
              {aiActionInProgress === 'correlations' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Generate Data Correlations
                </>
              )}
            </button>
            
            <button 
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition flex items-center justify-center"
              onClick={handleCreateMergedDataset}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
              Create Merged Dataset
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Search and Filter */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search datasets..."
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </motion.div>
      
      {/* Datasets Table */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">Available Datasets</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No datasets found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((dataset) => (
                  <motion.tr 
                    key={dataset.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{dataset.name}</div>
                      <div className="text-xs text-gray-500">{dataset.rows} rows, {dataset.columns} columns</div>
                      <Tags tags={dataset.tags} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={dataset.processingStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QualityScore 
                        score={dataset.dataQualityScore} 
                        recommendation="Consider cleaning missing values to improve quality score by ~15%"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{dataset.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{dataset.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          title="View Dataset"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button 
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete Dataset"
                          onClick={() => handleDeleteClick(dataset.id)}
                          disabled={isDeleting === dataset.id}
                        >
                          {isDeleting === dataset.id ? (
                            <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        
                        <button 
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                          title="Analyze Dataset"
                          onClick={() => handleAnalyze(dataset.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* AI Insights Modal */}
      {showInsightModal && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">AI Insights: {selectedDataset.name}</h3>
                <button 
                  onClick={() => setShowInsightModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-800 mb-2">Data Quality Analysis</div>
                  <p className="text-sm text-gray-700">
                    Our AI has analyzed your dataset and found it to be {selectedDataset.dataQualityScore || 'N/A'}% reliable. 
                    {selectedDataset.dataQualityScore && selectedDataset.dataQualityScore < 80 ? 
                      ' We recommend cleaning missing values and standardizing date formats to improve quality.' : 
                      ' This dataset is of high quality and ready for advanced analytics.'}
                  </p>
                </div>
                
                <div>
                  <div className="font-semibold mb-2">Key Insights</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Found strong correlation between customer age and purchase frequency (0.78)</li>
                    <li>Detected seasonal patterns suggesting optimal marketing timing in Q2</li>
                    <li>Identified 3 potential outliers that may skew analysis results</li>
                    <li>Discovered 4 customer segments with distinct purchasing behaviors</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-semibold mb-2">Recommended Actions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2 px-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm">
                      Run Predictive Model
                    </button>
                    <button className="py-2 px-3 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                      Generate Visualizations
                    </button>
                    <button className="py-2 px-3 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                      Clean Data Automatically
                    </button>
                    <button className="py-2 px-3 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm">
                      Export Insights Report
                    </button>
                  </div>
                </div>
                
                {/* Data Visualization Section */}
                <div>
                  <div className="font-semibold mb-2">Data Distribution</div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Click "Generate Visualizations" to see data distribution charts</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                <button 
                  onClick={() => setShowInsightModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    Save Insights
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    Apply Recommendations
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this dataset? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                disabled={isDeleting !== null}
              >
                {isDeleting !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button for AI Assistant */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.button>
    </div>
  );
}