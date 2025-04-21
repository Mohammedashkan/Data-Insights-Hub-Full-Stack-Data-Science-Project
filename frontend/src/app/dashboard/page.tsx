"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Define the interface for dashboard data
interface DashboardData {
  recentDatasets: {
    id: string;
    name: string;
    rows: number;
    lastUpdated: string;
  }[];
  insights: {
    id: string;
    title: string;
    description: string;
  }[];
  systemStatus: {
    apiStatus: string;
    databaseStatus: string;
    lastBackup: string;
  };
}

export default function Dashboard() {
  // Update the state type from null to the interface or null
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data for development
        const mockData: DashboardData = {
          recentDatasets: [
            { id: '1', name: 'Sales Data 2023', rows: 1500, lastUpdated: '2023-12-15' },
            { id: '2', name: 'Customer Feedback', rows: 850, lastUpdated: '2023-11-28' },
            { id: '3', name: 'Marketing Campaign Results', rows: 320, lastUpdated: '2023-12-01' }
          ],
          insights: [
            { id: '1', title: 'Sales Trend Analysis', description: 'Monthly sales showing 15% increase' },
            { id: '2', title: 'Customer Segmentation', description: 'Four distinct customer groups identified' }
          ],
          systemStatus: {
            apiStatus: 'Online',
            databaseStatus: 'Online',
            lastBackup: '2023-12-14 03:00 AM'
          }
        }
        
        // Simulate API delay
        setTimeout(() => {
          setDashboardData(mockData)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl text-red-500">{error}</div>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Datasets */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Datasets</h2>
            <div className="space-y-4">
              {dashboardData.recentDatasets.map(dataset => (
                <div key={dataset.id} className="border-b pb-3">
                  <div className="font-medium">{dataset.name}</div>
                  <div className="text-sm text-gray-500">
                    {dataset.rows} rows • Updated {dataset.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/datasets" className="block mt-4 text-blue-500 hover:underline">
              View all datasets
            </Link>
          </div>
          
          {/* Recent Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Insights</h2>
            <div className="space-y-4">
              {dashboardData.insights.map(insight => (
                <div key={insight.id} className="border-b pb-3">
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-gray-500">
                    {insight.description}
                  </div>
                </div>
              ))}
            </div>
            <button className="block mt-4 text-blue-500 hover:underline">
              Generate new insights
            </button>
          </div>
          
          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>API:</span>
                <span className="text-green-500">{dashboardData.systemStatus.apiStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-500">{dashboardData.systemStatus.databaseStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Backup:</span>
                <span>{dashboardData.systemStatus.lastBackup}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  )
}