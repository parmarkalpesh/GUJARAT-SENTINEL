import { useState, useEffect } from 'react';
import {
  Users, Shield, CheckCircle, XCircle, KeyRound,
  UserPlus, Search
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.users();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sentinel-panel border border-sentinel-border flex items-center justify-center">
            <Users className="w-4 h-4 text-sentinel-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">
              Role-Based Access Control (RBAC) &amp; Personnel Registry
            </h1>
            <p className="text-[10px] text-sentinel-muted">
              Granular police command privileges: Super Admin, Police Admin, Operator, Investigator
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3 h-3 text-sentinel-muted-dark absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officer..."
            className="bg-sentinel-panel border border-sentinel-border rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-sentinel-muted-dark outline-none focus:border-sentinel-accent"
          />
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="bg-sentinel-dark border border-sentinel-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sentinel-panel/80 text-sentinel-muted uppercase font-mono text-[10px] border-b border-sentinel-border">
              <tr>
                <th className="p-3">Officer Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Department</th>
                <th className="p-3">Assigned Role (RBAC)</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Access Permission Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border/50 text-sentinel-text">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-sentinel-panel/40 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sentinel-accent to-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                    {user.full_name}
                  </td>
                  <td className="p-3 font-mono text-sentinel-accent text-xs">{user.username}</td>
                  <td className="p-3 text-sentinel-muted">{user.department}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-sentinel-panel border border-sentinel-border rounded px-2 py-1 text-[11px] font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      <option value="POLICE_ADMIN">POLICE ADMIN</option>
                      <option value="CONTROL_ROOM_OPERATOR">CONTROL ROOM OPERATOR</option>
                      <option value="INVESTIGATOR">INVESTIGATOR</option>
                      <option value="DEPARTMENT_USER">DEPARTMENT USER</option>
                      <option value="VIEW_ONLY">VIEW ONLY</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-sentinel-green text-[11px] font-bold">
                      <CheckCircle className="w-3 h-3" /> ACTIVE
                    </span>
                  </td>
                  <td className="p-3 text-right text-[10px] font-mono text-sentinel-muted">
                    {user.role === 'SUPER_ADMIN' ? 'FULL SYSTEM ACCESS' : 'OPERATIONAL SURVEILLANCE ONLY'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
