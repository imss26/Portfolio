import React from 'react'
import { HashRouter as BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Holdings from './components/Holdings'
import DCA from './components/DCA'
import Inflation from './components/Inflation'
import Risks from './components/Risks'
import Settings from './components/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-gray-800 text-white flex flex-wrap">
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/">Dashboard</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/transactions">Transactions</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/holdings">Holdings</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/dca">DCA</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/inflation">Inflation</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/risks">Risks</Link>
          <Link className="flex-1 p-3 hover:bg-gray-700 text-center" to="/settings">Settings</Link>
        </nav>

        {/* Contenu */}
        <main className="flex-1 p-4 bg-white shadow-inner">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/dca" element={<DCA />} />
            <Route path="/inflation" element={<Inflation />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
