import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'engineer' | 'subsidiary_head' | 'executive' | 'auditor'

export interface UserProfile {
  id: number
  email: string
  name: string
  role: UserRole
  isProfileCompleted: boolean
  isApproved: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  phone?: string
  employeeId?: string
  department?: string
  designation?: string
  qualifications?: string
  organization?: string
  location?: string
  reviewNote?: string
}

interface AuthState {
  role: UserRole | null
  name: string
  email: string
  token: string | null
  isProfileCompleted: boolean
  isApproved: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  user: UserProfile | null
  region: string
}

const roleOptions: UserRole[] = ['engineer', 'subsidiary_head', 'executive', 'auditor']

const savedSession = (() => {
  try {
    return JSON.parse(localStorage.getItem('esg-session') ?? 'null') as {
      token?: string
      user?: UserProfile
    } | null
  } catch {
    return null
  }
})()

const validSession =
  savedSession?.token && savedSession.user?.role && roleOptions.includes(savedSession.user.role)
    ? savedSession
    : null

const initialState: AuthState = {
  role: validSession?.user?.role ?? null,
  name: validSession?.user?.name ?? '',
  email: validSession?.user?.email ?? '',
  token: validSession?.token ?? null,
  isProfileCompleted: validSession?.user?.isProfileCompleted ?? false,
  isApproved: validSession?.user?.isApproved ?? false,
  approvalStatus: validSession?.user?.approvalStatus ?? 'pending',
  user: validSession?.user ?? null,
  region: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ user: UserProfile; token: string }>) {
      state.user = action.payload.user
      state.role = action.payload.user.role
      state.name = action.payload.user.name
      state.email = action.payload.user.email
      state.token = action.payload.token
      state.isProfileCompleted = Boolean(action.payload.user.isProfileCompleted)
      state.isApproved = Boolean(action.payload.user.isApproved)
      state.approvalStatus = action.payload.user.approvalStatus || 'pending'

      localStorage.setItem(
        'esg-session',
        JSON.stringify({ token: action.payload.token, user: action.payload.user })
      )
    },
    updateUser(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
      if (action.payload.name !== undefined) state.name = action.payload.name
      if (action.payload.role !== undefined) state.role = action.payload.role
      if (action.payload.isProfileCompleted !== undefined)
        state.isProfileCompleted = action.payload.isProfileCompleted
      if (action.payload.isApproved !== undefined) state.isApproved = action.payload.isApproved
      if (action.payload.approvalStatus !== undefined)
        state.approvalStatus = action.payload.approvalStatus

      if (state.token && state.user) {
        localStorage.setItem(
          'esg-session',
          JSON.stringify({ token: state.token, user: state.user })
        )
      }
    },
    signOut(state) {
      state.user = null
      state.role = null
      state.name = ''
      state.email = ''
      state.token = null
      state.isProfileCompleted = false
      state.isApproved = false
      state.approvalStatus = 'pending'
      localStorage.removeItem('esg-session')
    },
    setRegion(state, action: PayloadAction<string>) {
      state.region = action.payload
    },
  },
})

export const { signIn, updateUser, signOut, setRegion } = authSlice.actions
export default authSlice.reducer
