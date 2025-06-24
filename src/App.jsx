import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import JobForm from './components/JobForm'
import JobList from './components/JobList'

const LOCAL_STORAGE_KEY = 'fivemProfitTracker.jobs'

export default function App() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
    if (storedJobs) setJobs(storedJobs)
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs])

  const addJob = (job) => {
    setJobs([job, ...jobs])
  }

  const clearJobs = () => {
    if (confirm('Are you sure you want to delete all sessions?')) {
      setJobs([])
    }
  }

  const exportCSV = () => {
    const csvHeader = [
      'Job Type,Hours,Earned (€),Fuel (€),Equipment (€),Net Profit (€),€/Hour'
    ]
    const csvRows = jobs.map((j) =>
      [
        j.jobType,
        j.duration,
        j.earned,
        j.fuelCost,
        j.equipmentCost,
        j.netProfit.toFixed(2),
        j.moneyPerHour.toFixed(2)
      ].join(',')
    )
    const csv = [...csvHeader, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'fivem_jobs.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">FiveM Job Profitability Tracker</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={clearJobs}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-opacity-80"
        >
          Clear All Sessions
        </button>
        <button
          onClick={exportCSV}
          className="bg-success text-white px-4 py-2 rounded hover:bg-opacity-80"
        >
          Export to CSV
        </button>
      </div>
      <JobForm addJob={addJob} />
      <Dashboard jobs={jobs} />
      <JobList jobs={jobs} />
    </div>
  )
}
