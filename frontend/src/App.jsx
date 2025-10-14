import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransactionGroups from './pages/TransactionGroups'
import Users from './pages/Users'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transaction-groups" element={<TransactionGroups />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
