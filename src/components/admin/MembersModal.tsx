import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Mail, Calendar, Shield, Crown, User } from 'lucide-react';
import { OrganizationManagement, OrganizationMembersResponse, adminService } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';
import { toast } from 'sonner';

interface MembersModalProps {
  organization: OrganizationManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({
  organization,
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [membersData, setMembersData] = useState<OrganizationMembersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && organization) {
      fetchMembers();
    }
  }, [open, organization]);

  const fetchMembers = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const data = await adminService.getOrganizationMembers(organization.id);
      setMembersData(data);
    } catch (error) {
      toast.error('Failed to fetch members');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!organization) return null;

  const members = membersData?.members || [];
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      (member.user?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (member.user?.email?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        );
      case 'MANAGER':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Manager
          </Badge>
        );
      case 'STAFF':
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Staff
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
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

  const roleStats = {
    owners: members.filter(m => m.role === 'OWNER').length,
    managers: members.filter(m => m.role === 'MANAGER').length,
    staff: members.filter(m => m.role === 'STAFF').length,
    active: members.filter(m => m.user?.status === 'ACTIVE').length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members - {organization.name}
          </DialogTitle>
          <DialogDescription>
            Manage team members for {organization.name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingState height="400px" message="Loading members..." />
        ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{roleStats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{roleStats.managers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.staff}</div>
              </CardContent>
            </Card>
          </div>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
              <CardDescription>
                All team members of {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{member.user?.name || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{member.user?.email || 'No email'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>{getStatusBadge(member.user?.status || 'UNKNOWN')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {member.user?.lastLoginAt
                              ? new Date(member.user.lastLoginAt).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members found</p>
                  {search && (
                    <p className="text-sm">Try adjusting your search criteria</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
