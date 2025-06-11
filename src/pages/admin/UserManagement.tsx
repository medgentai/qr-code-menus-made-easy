import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Search, MoreHorizontal, UserCheck, UserX, Trash2, Eye, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { adminService, UserManagement as UserType } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'users', page, search, roleFilter],
    queryFn: () => adminService.getAllUsers({
      page,
      limit: 20,
      search: search || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter as any,
    }),
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Users data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    try {
      await adminService.updateUserStatus(userId, { status });
      toast.success('User status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleRoleUpdate = async (userId: string, role: 'ADMIN' | 'USER') => {
    const action = role === 'ADMIN' ? 'promote to admin' : 'demote to user';

    // Extra confirmation for admin promotion
    if (role === 'ADMIN') {
      const confirmed = confirm(
        `⚠️ IMPORTANT: You are about to promote this user to ADMIN.\n\n` +
        `Admin users will have full access to:\n` +
        `• User management\n` +
        `• Organization management\n` +
        `• Platform analytics\n` +
        `• System settings\n\n` +
        `Are you absolutely sure you want to proceed?`
      );
      if (!confirmed) return;
    } else {
      if (!confirm(`Are you sure you want to ${action}? This will change their access permissions.`)) {
        return;
      }
    }

    try {
      await adminService.updateUserRole(userId, { role });
      toast.success(`User ${action === 'promote to admin' ? 'promoted' : 'demoted'} successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  const handleViewDetails = (user: UserType) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'USER':
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            User
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingState height="400px" message="Loading users..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p>Unable to load users</p>
          <Button variant="outline" onClick={refreshData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and their access permissions
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.pagination.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {usersData?.users.filter(user => user.role === 'ADMIN').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usersData?.users.filter(user => user.status === 'ACTIVE').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usersData?.users.filter(user => user.status === 'SUSPENDED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({usersData?.pagination.total || 0})</CardTitle>
          <CardDescription>
            Showing {usersData?.users.length || 0} of {usersData?.pagination.total || 0} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organizations</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        {user.phoneNumber && (
                          <span className="text-xs text-muted-foreground">{user.phoneNumber}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.organizationCount || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? (
                        <span className="text-sm">
                          {new Date(user.lastLoginAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* Role Management */}
                          {user.role === 'USER' ? (
                            <DropdownMenuItem
                              onClick={() => handleRoleUpdate(user.id, 'ADMIN')}
                              className="text-purple-600"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : user.role === 'ADMIN' ? (
                            <DropdownMenuItem
                              onClick={() => handleRoleUpdate(user.id, 'USER')}
                              className="text-orange-600"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Demote to User
                            </DropdownMenuItem>
                          ) : null}

                          {/* Status Management */}
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(user.id, 'SUSPENDED')}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}

                          {/* Delete User - Only for non-admin users */}
                          {user.role !== 'ADMIN' && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {usersData && usersData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {usersData.pagination.page} of {usersData.pagination.totalPages}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= usersData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={userDetailsOpen}
        onOpenChange={setUserDetailsOpen}
      />
    </div>
  );
};

export default UserManagement;
