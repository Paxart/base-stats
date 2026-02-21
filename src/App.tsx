import React, { useEffect, useState } from 'react'
import StatsDisplay from './components/StatsDisplay'

interface StatsData {
  totalTransactions: string
  activeAddresses: string
  gasFees: string
  diemPrice: string
  diemMarketCap: string
  networkStatus: string
}

export default function App() {
  const [stats, setStats] = useState<StatsData>({
    totalTransactions: 'Loading...',
    activeAddresses: 'Loading...',
    gasFees: 'Loading...',
    diemPrice: 'Loading...',
    diemMarketCap: 'Loading...',
    networkStatus: 'Loading...'
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Base Stats</h1>
        <p>Estadísticas en tiempo real de la red Base y el token DIEM</p>
      </header>
      <main>
        <StatsDisplay stats={stats} />
      </main>
    </div>
  )
}