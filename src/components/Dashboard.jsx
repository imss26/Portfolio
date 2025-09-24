import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const history = [
  {date: '2024-01', value: 1000},
  {date: '2024-02', value: 1100},
  {date: '2024-03', value: 1200},
]
const allocation = [
  {name: 'Actions', value: 70},
  {name: 'Obligations', value: 30}
]
const COLORS = ['#2563eb', '#f59e0b']

export default function Dashboard(){
  const invested = 1000
  const currentValue = 1200
  const gain = currentValue - invested
  const cagr = 0.06

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow"><p className="text-sm text-gray-500">Invested</p><p className="text-xl font-bold">€{invested}</p></div>
        <div className="bg-white p-4 rounded shadow"><p className="text-sm text-gray-500">Current Value</p><p className="text-xl font-bold">€{currentValue}</p></div>
        <div className="bg-white p-4 rounded shadow"><p className="text-sm text-gray-500">Gain/Loss</p><p className="text-xl font-bold">{gain >= 0 ? '+' : ''}{gain}€</p></div>
        <div className="bg-white p-4 rounded shadow"><p className="text-sm text-gray-500">CAGR (nominal)</p><p className="text-xl font-bold">{(cagr*100).toFixed(2)}%</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow h-64">
          <h3 className="font-semibold mb-2">Valeur historique</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2563eb" /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-64">
          <h3 className="font-semibold mb-2">Allocation réelle vs cible</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocation} dataKey="value" nameKey="name" outerRadius={80} label>
                {allocation.map((entry, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow"><h3 className="font-semibold mb-2">Indicateurs</h3><ul className="list-disc pl-5"><li>Sharpe ratio : 0.8</li><li>Volatilité : 12%</li><li>Max Drawdown : -15%</li></ul></div>
    </div>
  )
}
