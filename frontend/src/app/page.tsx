"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<string | null>(null)

  const checkBackendConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/')
      const data = await response.json()
      setApiStatus(`Connected to backend: ${data.message}`)
    } catch (error) {
      setApiStatus('Failed to connect to backend. Make sure it\'s running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Data Insights Hub</h1>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Project Status</h2>
          
          <div className="space-y-4">
            <button 
              onClick={checkBackendConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Backend Connection'}
            </button>
            
            {apiStatus && (
              <div className={`p-4 rounded ${apiStatus.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {apiStatus}
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Available Pages:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Dashboard
                  </Link>
                  <span className="ml-2 text-green-600">✓ Ready</span>
                </li>
                <li>
                  <Link href="/datasets" className="text-blue-600 hover:underline">
                    Datasets
                  </Link>
                  <span className="ml-2 text-green-600">✓ Ready</span>
                </li>
                <li>
                  <Link href="/chat" className="text-blue-600 hover:underline">
                    Chat Assistant
                  </Link>
                  <span className="ml-2 text-green-600">✓ Ready</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded">
              <h4 className="font-semibold">Getting Started:</h4>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Visit the <Link href="/datasets" className="text-blue-600 hover:underline">Datasets</Link> page to upload your data</li>
                <li>Go to the <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link> to view insights</li>
                <li>Use the <Link href="/chat" className="text-blue-600 hover:underline">Chat Assistant</Link> to ask questions about your data</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
