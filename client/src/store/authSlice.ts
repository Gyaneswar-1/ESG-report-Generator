import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'engineer' | 'hse' | 'subsidiary_head' | 'executive' | 'auditor'

interface AuthState {
  role: UserRole | null
  name: string
  region: string
  token: string | null
}

const roleOptions: UserRole[] = ['engineer', 'hse', 'subsidiary_head', 'executive', 'auditor']
const savedSession = (() => { try { return JSON.parse(localStorage.getItem('esg-session') ?? 'null') as { token?: string; user?: { role?: UserRole; name?: string } } | null } catch { return null } })()
const validSession = savedSession?.token && savedSession.user?.role && roleOptions.includes(savedSession.user.role) ? savedSession : null
const initialState: AuthState = { role: validSession?.user?.role ?? null, name: validSession?.user?.name ?? '', region: '', token: validSession?.token ?? null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ role: UserRole; name: string; token: string }>) {
      state.role = action.payload.role
      state.name = action.payload.name
      state.token = action.payload.token
      localStorage.setItem('esg-session', JSON.stringify({ token: action.payload.token, user: { role: action.payload.role, name: action.payload.name } }))
    },
    signOut(state) {
      state.role = null
      state.name = ''
      state.token = null
      localStorage.removeItem('esg-session')
    },
    setRegion(state, action: PayloadAction<string>) {
      state.region = action.payload
    },
  },
})

export const { signIn, signOut, setRegion } = authSlice.actions
export default authSlice.reducer
