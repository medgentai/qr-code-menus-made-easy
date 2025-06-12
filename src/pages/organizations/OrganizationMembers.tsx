import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { useVenue } from '@/contexts/venue-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  UserPlus,
  UserMinus,
  UserCog,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  LogOut
} from 'lucide-react';
import {
  MemberRole,
  MemberRoleLabels,
  MemberRoleDescriptions,
  StaffType,
  StaffTypeLabels,
  StaffTypeDescriptions,
  InvitationStatus,
  InvitationStatusLabels,
} from '@/types/organization';

// Send invitation form schema
const sendInvitationSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.nativeEnum(MemberRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  staffType: z.nativeEnum(StaffType).optional(),
  venueIds: z.array(z.string()).optional(),
});

// Update member role form schema
const updateRoleSchema = z.object({
  role: z.nativeEnum(MemberRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  staffType: z.nativeEnum(StaffType).optional(),
  venueIds: z.array(z.string()).optional(),
});

type SendInvitationFormValues = z.infer<typeof sendInvitationSchema>;
type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

const OrganizationMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  const {
    currentOrganization,
    currentOrganizationDetails,
    fetchOrganizationDetails,
    sendInvitation,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    leaveOrganization,
    isLoading
  } = useOrganization();
  const { venues } = useVenue();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedInviteRole, setSelectedInviteRole] = useState<MemberRole>(MemberRole.STAFF);
  const [selectedUpdateRole, setSelectedUpdateRole] = useState<MemberRole>(MemberRole.STAFF);

  // Initialize send invitation form
  const sendInvitationForm = useForm<SendInvitationFormValues>({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      email: '',
      role: MemberRole.STAFF,
      staffType: undefined,
      venueIds: [],
    },
  });

  // Initialize update role form
  const updateRoleForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: MemberRole.STAFF,
      staffType: undefined,
      venueIds: [],
    },
  });

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  // Check user permissions
  useEffect(() => {
    if (currentOrganizationDetails && user) {
      const currentUserMember = currentOrganizationDetails.members.find(
        member => member.user.id === user.id
      );

      setIsOwner(currentOrganizationDetails.owner.id === user.id);
      setIsAdmin(
        currentUserMember?.role === MemberRole.OWNER ||
        currentUserMember?.role === MemberRole.ADMINISTRATOR
      );
    }
  }, [currentOrganizationDetails, user]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role icon
  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case MemberRole.OWNER:
        return <ShieldAlert className="h-4 w-4" />;
      case MemberRole.ADMINISTRATOR:
        return <ShieldCheck className="h-4 w-4" />;
      case MemberRole.MANAGER:
        return <Shield className="h-4 w-4" />;
      case MemberRole.STAFF:
      default:
        return <ShieldQuestion className="h-4 w-4" />;
    }
  };

  // Handle send invitation form submission
  const onSendInvitation = async (data: SendInvitationFormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const success = await sendInvitation(id, {
        email: data.email,
        role: data.role,
        staffType: data.role === MemberRole.STAFF ? data.staffType : undefined,
        venueIds: data.role === MemberRole.STAFF ? data.venueIds : undefined,
      });

      if (success) {
        setIsInviteDialogOpen(false);
        sendInvitationForm.reset();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update role form submission
  const onUpdateRole = async (data: UpdateRoleFormValues) => {
    if (!id || !selectedMember) return;

    setIsSubmitting(true);
    try {
      const success = await updateMemberRole(id, selectedMember.id, {
        role: data.role,
        staffType: data.role === MemberRole.STAFF ? data.staffType : undefined,
        venueIds: data.role === MemberRole.STAFF ? data.venueIds : undefined,
      });

      if (success) {
        setIsUpdateRoleDialogOpen(false);
        updateRoleForm.reset();
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await removeMember(id, memberId);
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle leave organization
  const handleLeaveOrganization = async () => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const success = await leaveOrganization(id);
      if (success) {
        navigate('/organizations');
      }
    } catch (error) {
      console.error('Error leaving organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open update role dialog
  const openUpdateRoleDialog = (member: any) => {
    setSelectedMember(member);
    setSelectedUpdateRole(member.role);
    updateRoleForm.setValue('role', member.role);
    updateRoleForm.setValue('staffType', member.staffType || undefined);
    updateRoleForm.setValue('venueIds', member.venueIds || []);
    setIsUpdateRoleDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-optimized header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="truncate max-w-[120px] sm:max-w-none">
                  <Link to={`/organizations/${id}`} className="hover:text-foreground transition-colors">
                    {currentOrganization?.name}
                  </Link>
                </li>
                <li>•</li>
                <li className="text-foreground font-medium">Team Members</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isOwner || isAdmin ? (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline sm:hidden">Invite</span>
                    <span className="inline xs:hidden sm:inline">Send Invitation</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Team Invitation</DialogTitle>
                    <DialogDescription>
                      Send an invitation email to invite someone to join your organization
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...sendInvitationForm}>
                    <form onSubmit={sendInvitationForm.handleSubmit(onSendInvitation)} className="space-y-4">
                      <FormField
                        control={sendInvitationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              An invitation email will be sent to this address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sendInvitationForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedInviteRole(value as MemberRole);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(MemberRoleLabels)
                                  .filter(([role]) => role !== MemberRole.OWNER) // Can't add owners
                                  .map(([role, label]) => (
                                    <SelectItem key={role} value={role}>
                                      <div className="flex items-center gap-2">
                                        {getRoleIcon(role as MemberRole)}
                                        {label}
                                      </div>
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {MemberRoleDescriptions[field.value as MemberRole]}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Staff Type Field - Only show for STAFF role */}
                      {selectedInviteRole === MemberRole.STAFF && (
                        <>
                          <FormField
                            control={sendInvitationForm.control}
                            name="staffType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Staff Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select staff type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(StaffTypeLabels).map(([type, label]) => (
                                      <SelectItem key={type} value={type}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  {field.value && StaffTypeDescriptions[field.value as StaffType]}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Venue Assignment Field - Only show for STAFF role */}
                          <FormField
                            control={sendInvitationForm.control}
                            name="venueIds"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Venue Assignment (Optional)</FormLabel>
                                <Select
                                  value={field.value?.[0] || ""}
                                  onValueChange={(value) => {
                                    if (value === "all") {
                                      field.onChange([]);
                                    } else if (value) {
                                      field.onChange([value]);
                                    }
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select venue assignment" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Venues (Default)
                                    </SelectItem>
                                    {venues.length === 0 ? (
                                      <div className="p-2 text-sm text-muted-foreground">
                                        No venues available. Create venues first.
                                      </div>
                                    ) : (
                                      venues.map((venue) => (
                                        <SelectItem key={venue.id} value={venue.id}>
                                          {venue.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Assign staff to a specific venue or leave as "All Venues" for full access.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsInviteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline sm:hidden">Leave</span>
                    <span className="inline xs:hidden sm:inline">Leave Organization</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave this organization? You will lose access to all its resources.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveOrganization}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Leaving...' : 'Leave Organization'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Mobile-optimized organization header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            {currentOrganization?.logoUrl ? (
              <AvatarImage src={currentOrganization.logoUrl} alt={currentOrganization.name} />
            ) : (
              <AvatarFallback>
                {currentOrganization?.name ? getInitials(currentOrganization.name) : 'ORG'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Manage members of {currentOrganization?.name}
            </p>
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
            <CardDescription className="text-sm">
              People with access to {currentOrganization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {currentOrganizationDetails?.members.map((member) => {
                const isCurrentUser = member.user.id === user?.id;
                const canManageMember = (isOwner || isAdmin) && !isCurrentUser && member.role !== MemberRole.OWNER;

                return (
                  <div key={member.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:py-3 sm:px-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                    {/* Member Info Section */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {member.user.profileImageUrl ? (
                          <AvatarImage src={member.user.profileImageUrl} alt={member.user.name} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium truncate">
                              {member.user.name}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">(You)</span>
                            )}
                            {member.role === MemberRole.OWNER && (
                              <Badge variant="default" className="text-xs">Owner</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    {/* Badges and Actions Section */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          {getRoleIcon(member.role)}
                          <span className="hidden xs:inline">{MemberRoleLabels[member.role]}</span>
                        </Badge>
                        {member.role === MemberRole.STAFF && member.staffType && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {StaffTypeLabels[member.staffType as StaffType]}
                          </Badge>
                        )}
                        {member.role === MemberRole.STAFF && member.venueIds && member.venueIds.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs max-w-[100px] truncate"
                            title={(() => {
                              const assignedVenue = venues.find(v => v.id === member.venueIds[0]);
                              return assignedVenue ? assignedVenue.name : 'Specific Venue';
                            })()}
                          >
                            {(() => {
                              const assignedVenue = venues.find(v => v.id === member.venueIds[0]);
                              return assignedVenue ? assignedVenue.name : 'Specific Venue';
                            })()}
                          </Badge>
                        )}
                      </div>

                      {canManageMember && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openUpdateRoleDialog(member)}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.user.name} from this organization?
                                    They will lose access to all organization resources.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Member
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          {(isOwner || isAdmin) && (
            <CardFooter className="border-t bg-muted/50 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  {currentOrganizationDetails?.members.length} members in this organization
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInviteDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Send Invitation</span>
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Pending Invitations Section - Only show for admins/owners */}
        {(isOwner || isAdmin) && currentOrganizationDetails?.invitations &&
         currentOrganizationDetails.invitations.filter(inv => inv.status === InvitationStatus.PENDING).length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Pending Invitations</CardTitle>
              <CardDescription className="text-sm">
                Invitations that have been sent but not yet accepted
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {currentOrganizationDetails.invitations
                  .filter(invitation => invitation.status === InvitationStatus.PENDING)
                  .map((invitation) => (
                  <div key={invitation.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:py-3 sm:px-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                    {/* Invitation Info Section */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium truncate">{invitation.email}</p>
                            <Badge
                              variant={invitation.status === InvitationStatus.PENDING ? "default" :
                                     invitation.status === InvitationStatus.EXPIRED ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {InvitationStatusLabels[invitation.status]}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Invited by {invitation.inviter?.name} • {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Invitation Badges and Actions Section */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          {getRoleIcon(invitation.role)}
                          <span className="hidden xs:inline">{MemberRoleLabels[invitation.role]}</span>
                        </Badge>
                        {invitation.role === MemberRole.STAFF && invitation.staffType && (
                          <Badge variant="secondary" className="text-xs">
                            {StaffTypeLabels[invitation.staffType as StaffType]}
                          </Badge>
                        )}
                      </div>
                      {invitation.status === InvitationStatus.PENDING && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  Cancel Invitation
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel the invitation for {invitation.email}?
                                    They will no longer be able to accept this invitation.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => id && cancelInvitation(id, invitation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Invitation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Update Role Dialog */}
        <Dialog open={isUpdateRoleDialogOpen} onOpenChange={setIsUpdateRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Member Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedMember?.user?.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...updateRoleForm}>
              <form onSubmit={updateRoleForm.handleSubmit(onUpdateRole)} className="space-y-4">
                <FormField
                  control={updateRoleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedUpdateRole(value as MemberRole);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(MemberRoleLabels)
                            .filter(([role]) => role !== MemberRole.OWNER) // Can't change to owner
                            .map(([role, label]) => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role as MemberRole)}
                                  {label}
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {MemberRoleDescriptions[field.value as MemberRole]}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Staff Type Field - Only show for STAFF role */}
                {selectedUpdateRole === MemberRole.STAFF && (
                  <>
                    <FormField
                      control={updateRoleForm.control}
                      name="staffType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(StaffTypeLabels).map(([type, label]) => (
                                <SelectItem key={type} value={type}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value && StaffTypeDescriptions[field.value as StaffType]}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Venue Assignment Field - Only show for STAFF role */}
                    <FormField
                      control={updateRoleForm.control}
                      name="venueIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Assignment (Optional)</FormLabel>
                          <Select
                            value={field.value?.[0] || ""}
                            onValueChange={(value) => {
                              if (value === "all") {
                                field.onChange([]);
                              } else if (value) {
                                field.onChange([value]);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select venue assignment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">
                                All Venues (Default)
                              </SelectItem>
                              {venues.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No venues available. Create venues first.
                                </div>
                              ) : (
                                venues.map((venue) => (
                                  <SelectItem key={venue.id} value={venue.id}>
                                    {venue.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Assign staff to a specific venue or leave as "All Venues" for full access.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateRoleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Role'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrganizationMembers;
