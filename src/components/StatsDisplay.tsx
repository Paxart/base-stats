import React from 'react'

interface StatsData {
  totalTransactions: string
  activeAddresses: string
  gasFees: string
  diemPrice: string
  diemMarketCap: string
  networkStatus: string
}

interface StatsDisplayProps {
  stats: StatsData
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Transactions</h3>
        <p>{stats.totalTransactions}</p>
      </div>
      <div className="stat-card">
        <h3>Active Addresses</h3>
        <p>{stats.activeAddresses}</p>
      </div>
      <div className="stat-card">
        <h3>Gas Fees</h3>
        <p>{stats.gasFees}</p>
      </div>
      <div className="stat-card">
        <h3>DIEM Price</h3>
        <p>${stats.diemPrice}</p>
      </div>
      <div className="stat-card">
        <h3>DIEM Market Cap</h3>
        <p>${stats.diemMarketCap}</p>
      </div>
      <div className="stat-card">
        <h3>Network Status</h3>
        <p>{stats.networkStatus}</p>
      </div>
    </div>
  )
}