import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, Shield, Building2 } from 'lucide-react';
import { UserManagement, UserDetails, adminService } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';
import { toast } from 'sonner';

interface UserDetailsModalProps {
  user: UserManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUserDetails();
    }
  }, [open, user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const details = await adminService.getUserDetails(user.id);
      setUserDetails(details);
    } catch (error) {
      toast.error('Failed to fetch user details');
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const displayUser = userDetails || user;

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
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'USER':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {displayUser.name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingState height="400px" message="Loading user details..." />
        ) : (

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{displayUser.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{displayUser.email}</span>
                    {displayUser.isEmailVerified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </div>

                {displayUser.phoneNumber && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{displayUser.phoneNumber}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <span className="font-mono text-sm">{displayUser.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {getRoleBadge(displayUser.role)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  {getStatusBadge(displayUser.status)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Organizations</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{displayUser.organizationCount || 0} organizations</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Verification</label>
                  <Badge variant={displayUser.isEmailVerified ? "default" : "secondary"}>
                    {displayUser.isEmailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(displayUser.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {displayUser.lastLoginAt
                        ? new Date(displayUser.lastLoginAt).toLocaleString()
                        : 'Never logged in'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations */}
          {userDetails?.organizations && userDetails.organizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizations</CardTitle>
                <CardDescription>
                  Organizations this user is a member of
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDetails.organizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{org.name}</span>
                          <p className="text-sm text-muted-foreground">{org.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{org.role}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(org.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Information */}
          {displayUser.role === 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">Admin Account</CardTitle>
                <CardDescription>
                  This user has administrative privileges on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Admin users have full access to platform management features
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
