import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'engineer' | 'hse' | 'executive' | 'auditor'

interface AuthState {
  role: UserRole | null
  name: string
}

const savedRole = localStorage.getItem('esg-role') as UserRole | null
const initialState: AuthState = { role: savedRole, name: localStorage.getItem('esg-name') ?? '' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ role: UserRole; name: string }>) {
      state.role = action.payload.role
      state.name = action.payload.name
      localStorage.setItem('esg-role', action.payload.role)
      localStorage.setItem('esg-name', action.payload.name)
    },
    signOut(state) {
      state.role = null
      state.name = ''
      localStorage.removeItem('esg-role')
      localStorage.removeItem('esg-name')
    },
  },
})

export const { signIn, signOut } = authSlice.actions
export default authSlice.reducer
