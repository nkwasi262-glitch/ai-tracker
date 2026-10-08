import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  UserCheck, 
  DollarSign, 
  Globe, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3
} from 'lucide-react';
import { PlatformUser, ActiveRole, InstitutionCategory, STANDARD_INSTITUTIONS } from '../data/authTypes';
import { UserSession } from '../data/authTypes';
import { 
  getPlatformUsers, 
  onboardUser, 
  updateUserRole, 
  toggleUserSuspension, 
  removeUser 
} from '../services/userService';

interface UserManagementProps {
  session: UserSession;
}

export const UserManagement: React.FC<UserManagementProps> = ({ session }) => {
  const [users, setUsers] = useState<PlatformUser[]>(() => getPlatformUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modal States
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<PlatformUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<ActiveRole>('AI Manager');

  // New User Form fields
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<ActiveRole>('Technical Clearance Team');
  const [newInstId, setNewInstId] = useState('inst-1');
  const [newCustomInst, setNewCustomInst] = useState('');
  const [newInstCategory, setNewInstCategory] = useState<InstitutionCategory>('MDA');
  const [newNotes, setNewNotes] = useState('');
  const [onboardError, setOnboardError] = useState<string | null>(null);

  const reloadUsers = () => {
    setUsers(getPlatformUsers());
  };

  const getInstName = (id: string, custom: string) => {
    if (id === 'other') return custom || 'Custom Institution';
    const found = STANDARD_INSTITUTIONS.find(i => i.id === id);
    return found ? found.name : 'National Information Technology Agency (NITA)';
  };

  // Submit new user onboarding
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);

    if (!newFullName.trim() || !newEmail.trim()) {
      setOnboardError('Full name and institutional email are required.');
      return;
    }

    const institution = newInstId === 'other' ? newCustomInst.trim() : getInstName(newInstId, '');
    if (!institution) {
      setOnboardError('Managing institution is required.');
      return;
    }

    const res = onboardUser({
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      institution,
      institutionCategory: newInstCategory,
      notes: newNotes.trim() || undefined,
      adminSession: session
    });

    if (res.success && res.user) {
      reloadUsers();
      setShowOnboardModal(false);
      setActionFeedback(`Personnel "${res.user.fullName}" successfully onboarded with role: ${res.user.role}.`);
      setNewFullName('');
      setNewEmail('');
      setNewNotes('');
    } else {
      setOnboardError(res.error || 'Failed to onboard user.');
    }
  };

  // Update role
  const handleRoleUpdate = () => {
    if (!showRoleModal) return;
    const res = updateUserRole(showRoleModal.id, selectedNewRole, session);
    if (res.success) {
      reloadUsers();
      setActionFeedback(`Role for "${showRoleModal.fullName}" updated to ${selectedNewRole}.`);
      setShowRoleModal(null);
    }
  };

  // Suspend / Reactivate
  const handleToggleSuspension = (user: PlatformUser) => {
    const nextStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    const confirmMsg = nextStatus === 'Suspended'
      ? `Are you sure you want to suspend "${user.fullName}"? They will be immediately blocked from entering the platform.`
      : `Reactivate platform access for "${user.fullName}"?`;

    if (window.confirm(confirmMsg)) {
      const res = toggleUserSuspension(user.id, nextStatus, session, 'Administrative policy review');
      if (res.success) {
        reloadUsers();
        setActionFeedback(`Account for "${user.fullName}" has been set to: ${nextStatus.toUpperCase()}.`);
      }
    }
  };

  // Remove user
  const handleRemoveUser = (user: PlatformUser) => {
    if (window.confirm(`Permanently revoke and delete account for "${user.fullName}" (${user.email})? This action will be logged in the immutable audit log.`)) {
      const res = removeUser(user.id, session);
      if (res.success) {
        reloadUsers();
        setActionFeedback(`Account for "${user.fullName}" has been permanently removed.`);
      }
    }
  };

  // Metrics
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;
  const distinctMDAs = new Set(users.map(u => u.institution)).size;

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: ActiveRole) => {
    switch (role) {
      case 'Super Admin':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', icon: <ShieldAlert size={12} /> };
      case 'Director General':
        return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)', icon: <Award size={12} /> };
      case 'Technical Director':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', icon: <Award size={12} /> };
      case 'Technical Clearance Team':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)', icon: <ShieldCheck size={12} /> };
      case 'AI Manager':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)', icon: <UserCheck size={12} /> };
      case 'Finance Minister':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', icon: <DollarSign size={12} /> };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', icon: <Globe size={12} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{
              color: '#fca5a5',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Identity & Access Management (IAM) • Ghana Act 843
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              User Onboarding & Role Governance
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Provision institutional identities, auto-bind role privileges, manage suspensions, and revoke access.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowOnboardModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          <UserPlus size={16} /> Onboard New Personnel
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#a7f3d0',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Personnel</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalUsers}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Directory accounts</div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Clearance Accounts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '4px' }}>{activeCount}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Authorized for login</div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Suspended Accounts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{suspendedCount}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Blocked at Entry Gate</div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Institutions Represented</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ghana-gold)', marginTop: '4px' }}>{distinctMDAs}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>MDAs, MMDAs, & SOEs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by personnel name, institutional email, or agency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#111b27',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Director General">Director General</option>
              <option value="Technical Director">Technical Director</option>
              <option value="Technical Clearance Team">Technical Clearance Team</option>
              <option value="AI Manager">AI Manager</option>
              <option value="Finance Minister">Finance Minister</option>
              <option value="Public User">Public User</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#111b27',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Personnel & Identity</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Active Role Profile</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Managing Institution</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Onboarded Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((usr) => {
                const badge = getRoleBadge(usr.role);
                const isSuspended = usr.status === 'Suspended';

                return (
                  <tr
                    key={usr.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      opacity: isSuspended ? 0.75 : 1
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.84rem' }}>{usr.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{usr.email}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.icon}
                        <span>{usr.role}</span>
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{usr.institution}</div>
                      <span style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {usr.institutionCategory}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isSuspended ? '#ef4444' : '#10b981',
                        border: isSuspended ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {usr.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {usr.createdAt.split('T')[0]}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            setShowRoleModal(usr);
                            setSelectedNewRole(usr.role);
                          }}
                          title="Reassign Active Role Profile"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Suspend / Reactivate Button */}
                        <button
                          onClick={() => handleToggleSuspension(usr)}
                          title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: isSuspended ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: isSuspended ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            color: isSuspended ? '#10b981' : '#ef4444',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isSuspended ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                        </button>

                        {/* Remove User Button */}
                        <button
                          onClick={() => handleRemoveUser(usr)}
                          title="Revoke & Remove User"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Onboard New User */}
      {showOnboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Onboard Institutional Personnel
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Register a government officer with pre-assigned role privileges. When this user logs in at the Entry Gate, their role will be auto-detected instantly.
            </p>

            {onboardError && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={15} />
                <span>{onboardError}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ing. Abena Mansa"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. a.mansa@nita.gov.gh"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Assigned Role Profile *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as ActiveRole)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#111b27',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Director General">Director General</option>
                    <option value="Technical Director">Technical Director</option>
                    <option value="Technical Clearance Team">Technical Clearance Team</option>
                    <option value="AI Manager">AI Manager</option>
                    <option value="Finance Minister">Finance Minister</option>
                    <option value="Public User">Public User</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Managing Institution *
                  </label>
                  <select
                    value={newInstId}
                    onChange={(e) => {
                      setNewInstId(e.target.value);
                      const found = STANDARD_INSTITUTIONS.find(i => i.id === e.target.value);
                      if (found) setNewInstCategory(found.category);
                      else setNewInstCategory('Other');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#111b27',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {STANDARD_INSTITUTIONS.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                    <option value="other">Other Institution (Custom)</option>
                  </select>
                </div>
              </div>

              {newInstId === 'other' && (
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Custom Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomInst}
                    onChange={(e) => setNewCustomInst(e.target.value)}
                    placeholder="Enter custom MDA / organization name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Statutory Justification / Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Official appointment reference, project oversight portfolio, or clearance mandate..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reassign Role */}
      {showRoleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Reassign Role Profile
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Update active role profile for <strong style={{ color: '#fff' }}>{showRoleModal.fullName}</strong> ({showRoleModal.email}).
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Select New Role:
              </label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as ActiveRole)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#111b27',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Director General">Director General</option>
                <option value="Technical Director">Technical Director</option>
                <option value="Technical Clearance Team">Technical Clearance Team</option>
                <option value="AI Manager">AI Manager</option>
                <option value="Finance Minister">Finance Minister</option>
                <option value="Public User">Public User</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRoleModal(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleUpdate}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: 'var(--ghana-emerald)',
                  border: 'none',
                  color: '#0b0f19',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save Role Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
