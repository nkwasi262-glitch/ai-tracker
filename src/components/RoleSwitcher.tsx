import React from 'react';
import { UserCheck, ShieldAlert, Award, FileText, Building2, Landmark, CheckCircle2 } from 'lucide-react';

export type UserRole = 
  | 'Super Administrator'
  | 'Regulator / Clearance Authority'
  | 'Technical Review Committee (TCC)'
  | 'Government Administrator'
  | 'Institution Administrator'
  | 'Government Applicant (MDA/SOE)'
  | 'Private Sector Applicant'
  | 'Project Manager'
  | 'Monitoring & Evaluation Officer'
  | 'Auditor'
  | 'Public User';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const roles: UserRole[] = [
    'Regulator / Clearance Authority',
    'Technical Review Committee (TCC)',
    'Super Administrator',
    'Government Applicant (MDA/SOE)',
    'Private Sector Applicant',
    'Institution Administrator',
    'Auditor',
    'Public User'
  ];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Super Administrator': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'Regulator / Clearance Authority': return <Award className="w-4 h-4 text-emerald-400" />;
      case 'Technical Review Committee (TCC)': return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'Government Administrator':
      case 'Institution Administrator':
      case 'Government Applicant (MDA/SOE)': return <Landmark className="w-4 h-4 text-amber-400" />;
      case 'Private Sector Applicant': return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'Project Manager': return <UserCheck className="w-4 h-4 text-indigo-400" />;
      case 'Monitoring & Evaluation Officer': return <FileText className="w-4 h-4 text-teal-400" />;
      case 'Auditor': return <FileText className="w-4 h-4 text-slate-400" />;
      default: return <UserCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        Active NAPTCS Role:
      </span>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="form-select"
          style={{
            padding: '6px 36px 6px 12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {roles.map((role) => (
            <option 
              key={role} 
              value={role}
              style={{ background: '#111b27', color: '#fff' }}
            >
              {role}
            </option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--ghana-emerald)'
        }}>
          {getRoleIcon(currentRole)}
        </div>
      </div>
    </div>
  );
};
