"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import RoleTable from './components/RoleTable';
import RoleForm from './components/RoleForm';
import { Role, Permission } from './types/role';
import {
  fetchRoles,
  fetchPermissions,
  fetchRolePermissions,
  updateRolePermissions,
} from './services/role.service';

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  useEffect(() => {
    document.title = 'Эрхийн зохицуулалт';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        fetchRoles().catch(() => []),
        fetchPermissions().catch(() => []),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Өгөгдөл ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async (role: Role) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
    try {
      const rolePerms = await fetchRolePermissions(role.id);
      const permissionIds = rolePerms.map((p) => p.id);
      setSelectedPermissions(permissionIds);
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      toast.error('Эрх ачааллахад алдаа гарлаа');
      setSelectedPermissions([]);
    }
  };

  const handleUpdatePermissions = async (permissionIds: number[]) => {
    if (!selectedRole) return;

    try {
      await updateRolePermissions(selectedRole.id, { permissions: permissionIds });
      toast.success('Эрх амжилттай шинэчлэгдлээ');
      setIsDrawerOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
    } catch (error: any) {
      toast.error(error.message || 'Эрх шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  return (
    <div className="w-full mt-6 px-4 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
      </div>

      <RoleTable roles={roles} loading={loading} onEdit={handleEditRole} />

      <RoleForm
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleUpdatePermissions}
        roleName={selectedRole?.name || ''}
        permissions={permissions}
        selectedPermissions={selectedPermissions}
      />
    </div>
  );
}

