import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'
import { getRole, getToken, setSession, clearSession } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(getRole())
  const [authed, setAuthed] = useState(!!getToken())

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    setSession(data.token, data.role)
    setRole(data.role)
    setAuthed(true)
    return data.role
  }, [])

  // Voter registration and party registration both return the same
  // { token, role } shape as login, so they can share this.
  const setLoggedInFromResponse = useCallback((data) => {
    setSession(data.token, data.role)
    setRole(data.role)
    setAuthed(true)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setRole(null)
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ role, authed, login, logout, setLoggedInFromResponse }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
