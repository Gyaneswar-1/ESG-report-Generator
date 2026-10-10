import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  MenuItem,
  Avatar,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface UserItem {
  id: string
  name: string
  email: string
  role: 'CSO_ADMIN' | 'SUBSIDIARY_HEAD' | 'SITE_ENGINEER' | 'AUDITOR'
  roleDisplay: string
  assignedEntity: string
  signingKeyStatus: 'Active' | 'Pending Verification'
}

const USERS_DATA: UserItem[] = [
  {
    id: 'USR-01',
    name: 'Dr. Alok Verma',
    email: 'cso.verma@meilgroup.com',
    role: 'CSO_ADMIN',
    roleDisplay: 'CSO / Super Admin',
    assignedEntity: 'MEIL Corporate Head Office (All Divisions)',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-02',
    name: 'Ashok Patnaik',
    email: 'ashok.patnaik@meilwater.com',
    role: 'SUBSIDIARY_HEAD',
    roleDisplay: 'Subsidiary Head',
    assignedEntity: 'MEIL Water & Natural Resources',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-03',
    name: 'Sunil Rao',
    email: 'sunil.rao@meilpower.com',
    role: 'SUBSIDIARY_HEAD',
    roleDisplay: 'Subsidiary Head',
    assignedEntity: 'MEIL Power & Renewables',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-04',
    name: 'Kavita Reddy',
    email: 'kavita.reddy@meilinfra.com',
    role: 'SUBSIDIARY_HEAD',
    roleDisplay: 'Subsidiary Head',
    assignedEntity: 'MEIL Infrastructure & Roads',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-05',
    name: 'Rajesh Verma',
    email: 'rajesh.verma@meilpower.com',
    role: 'SUBSIDIARY_HEAD',
    roleDisplay: 'Subsidiary Head (Solar)',
    assignedEntity: 'MEIL Power Division',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-06',
    name: 'Sunil Kumar',
    email: 'sunil.kumar@meilinfra.com',
    role: 'SUBSIDIARY_HEAD',
    roleDisplay: 'Subsidiary Head (Expressways)',
    assignedEntity: 'MEIL Infrastructure (Vijayawada)',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-07',
    name: 'Priyanka Mohanty',
    email: 'priyanka.mohanty@meilwater.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Site Engineer',
    assignedEntity: 'Bhubaneswar Water Grid Station',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-08',
    name: 'Amit Das',
    email: 'amit.das@meilpower.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Site Engineer',
    assignedEntity: 'Rourkela 400kV Substation',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-09',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@meilinfra.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Site Engineer',
    assignedEntity: 'Hyderabad Solar Hub & Metro',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-10',
    name: 'Amit Patnaik',
    email: 'amit.patnaik@meilwater.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Site Engineer',
    assignedEntity: 'Cuttack Pipeline Grid',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-11',
    name: 'Suresh Nair',
    email: 'suresh.nair@meilinfra.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Site Engineer',
    assignedEntity: 'Vijayawada Expressway Project',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-12',
    name: 'Rahul Nayak',
    email: 'rahul.nayak@meilwater.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Field Engineer',
    assignedEntity: 'Cuttack Pipeline Grid',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-13',
    name: 'Ananya Mishra',
    email: 'ananya.mishra@meilwater.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Environmental Quality Engineer',
    assignedEntity: 'Bhubaneswar Water Grid',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-14',
    name: 'Deepak Swain',
    email: 'deepak.swain@meilinfra.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'QC Engineer',
    assignedEntity: 'Vijayawada Expressway Project',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-15',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@meilpower.com',
    role: 'SITE_ENGINEER',
    roleDisplay: 'Substation Assistant Engineer',
    assignedEntity: 'Rourkela Substation',
    signingKeyStatus: 'Pending Verification',
  },
  {
    id: 'USR-16',
    name: 'Dr. Arindam Sen',
    email: 'auditor.kpmg@esg-assurance.com',
    role: 'AUDITOR',
    roleDisplay: 'KPMG Lead ESG Assurance Partner',
    assignedEntity: 'Statutory Third-Party Assurance (BRSR Core)',
    signingKeyStatus: 'Active',
  },
  {
    id: 'USR-17',
    name: 'Sarah Jenkins',
    email: 'verifier.esg@assurance-partner.com',
    role: 'AUDITOR',
    roleDisplay: 'EY Climate & ESG Director',
    assignedEntity: 'Third-Party Statutory Verifier',
    signingKeyStatus: 'Active',
  },
]

export const UsersRolesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const filteredUsers = USERS_DATA.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.assignedEntity.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'All' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'CSO_ADMIN':
        return <Chip label="CSO Super Admin" size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }} />
      case 'SUBSIDIARY_HEAD':
        return <Chip label="Subsidiary Head" size="small" sx={{ bgcolor: '#0f766e', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }} />
      case 'SITE_ENGINEER':
        return <Chip label="Site Engineer" size="small" sx={{ bgcolor: '#166534', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }} />
      case 'AUDITOR':
        return <Chip label="Independent Auditor" size="small" sx={{ bgcolor: '#1d4ed8', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }} />
      default:
        return <Chip label={role} size="small" />
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Users & Governance Roles
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Role-Based Access Control (RBAC) and site assignment directory across MEIL Group
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          sx={{
            bgcolor: '#064e3b',
            color: '#ffffff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#043e2e' },
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Role Counts Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>CSO / Super Admins</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>2</Typography>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>Full Governance Authority</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Subsidiary Heads</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f766e', mt: 0.5 }}>6</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Division Approval Authority</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Site Engineers</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>48</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Data Entry & Evidence Upload</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Independent Auditors</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1d4ed8', mt: 0.5 }}>4</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>Statutory Verification Key</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter and Search Bar */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search user by name, email, or site assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="CSO_ADMIN">CSO / Super Admin</MenuItem>
              <MenuItem value="SUBSIDIARY_HEAD">Subsidiary Head</MenuItem>
              <MenuItem value="SITE_ENGINEER">Site Engineer</MenuItem>
              <MenuItem value="AUDITOR">Independent Auditor</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>USER</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ROLE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ASSIGNED ASSET / DIVISION</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>CRYPTOGRAPHIC SIGNING</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#0f172a', fontSize: '0.75rem', fontWeight: 700 }}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{getRoleChip(user.role)}</TableCell>
                <TableCell sx={{ color: '#334155', fontWeight: 500, fontSize: '0.825rem' }}>
                  {user.assignedEntity}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                    <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                      SHA-256 Key Active
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="text" sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#064e3b' }}>
                    Edit Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  )
}
export default UsersRolesView
