import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { OrganizationInvitation, MemberRoleLabels, StaffTypeLabels, InvitationStatus } from '@/types/organization';
import { CheckCircle, XCircle, Clock, Building2, Mail, User, Shield } from 'lucide-react';

const InvitationAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: { isAuthenticated, user } } = useAuth();
  const { getInvitationByToken, acceptInvitation, isLoading } = useOrganization();
  
  const [invitation, setInvitation] = useState<OrganizationInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    const fetchInvitation = async () => {
      try {
        const invitationData = await getInvitationByToken(token);
        if (invitationData) {
          setInvitation(invitationData);
        }
      } catch (err) {
        setError('Invalid or expired invitation');
      }
    };

    fetchInvitation();
  }, [token, getInvitationByToken]);

  const handleAcceptInvitation = async () => {
    if (!token || !isAuthenticated) return;

    setIsAccepting(true);
    try {
      const success = await acceptInvitation(token);
      if (success) {
        setIsAccepted(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Loading Invitation...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Invitation Accepted!</CardTitle>
            <CardDescription>
              Welcome to {invitation.organization?.name}. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Invitation Not Available</CardTitle>
            <CardDescription>
              This invitation has already been {invitation.status.toLowerCase()} or is no longer valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Avatar className="mx-auto w-16 h-16 mb-4">
              {invitation.organization?.logoUrl ? (
                <AvatarImage src={invitation.organization.logoUrl} alt={invitation.organization.name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {invitation.organization?.name ? getInitials(invitation.organization.name) : 'ORG'}
                </AvatarFallback>
              )}
            </Avatar>
            <CardTitle>You're Invited!</CardTitle>
            <CardDescription>
              {invitation.inviter?.name} has invited you to join {invitation.organization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{invitation.organization?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Role: {MemberRoleLabels[invitation.role]}</span>
                {invitation.staffType && (
                  <Badge variant="secondary" className="text-xs">
                    {StaffTypeLabels[invitation.staffType]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Invited by {invitation.inviter?.name}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please sign in or create an account to accept this invitation.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)} 
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate(`/register?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)} 
                  variant="outline"
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the invitation email matches the current user's email
  const emailMatches = user?.email === invitation.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Avatar className="mx-auto w-16 h-16 mb-4">
            {invitation.organization?.logoUrl ? (
              <AvatarImage src={invitation.organization.logoUrl} alt={invitation.organization.name} />
            ) : (
              <AvatarFallback className="text-lg">
                {invitation.organization?.name ? getInitials(invitation.organization.name) : 'ORG'}
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle>Join {invitation.organization?.name}</CardTitle>
          <CardDescription>
            {invitation.inviter?.name} has invited you to join their organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{invitation.email}</span>
              {emailMatches && (
                <Badge variant="outline" className="text-xs">Matches your account</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Role: {MemberRoleLabels[invitation.role]}</span>
              {invitation.staffType && (
                <Badge variant="secondary" className="text-xs">
                  {StaffTypeLabels[invitation.staffType]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Invited by {invitation.inviter?.name}</span>
            </div>
          </div>
          
          <Separator />
          
          {!emailMatches && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                This invitation was sent to {invitation.email}, but you're signed in as {user?.email}. 
                Please sign in with the correct account to accept this invitation.
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptInvitation}
              disabled={isAccepting || !emailMatches}
              className="flex-1"
            >
              {isAccepting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAccept;
