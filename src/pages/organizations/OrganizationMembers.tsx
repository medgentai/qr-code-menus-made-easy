import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
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
  MemberRoleDescriptions
} from '@/types/organization';

// Add member form schema
const addMemberSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.nativeEnum(MemberRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

// Update member role form schema
const updateRoleSchema = z.object({
  role: z.nativeEnum(MemberRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;
type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

const OrganizationMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentOrganization,
    currentOrganizationDetails,
    fetchOrganizationDetails,
    addMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,
    isLoading
  } = useOrganization();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize add member form
  const addMemberForm = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: MemberRole.MEMBER,
    },
  });

  // Initialize update role form
  const updateRoleForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: MemberRole.MEMBER,
    },
  });

  // Load organization data
  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id, fetchOrganizationDetails]);

  // Check user permissions
  useEffect(() => {
    if (currentOrganizationDetails && user) {
      const currentUserMember = currentOrganizationDetails.members.find(
        member => member.user.id === user.id
      );

      setIsOwner(currentOrganizationDetails.owner.id === user.id);
      setIsAdmin(
        currentUserMember?.role === MemberRole.OWNER ||
        currentUserMember?.role === MemberRole.ADMIN
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
      case MemberRole.ADMIN:
        return <ShieldCheck className="h-4 w-4" />;
      case MemberRole.MANAGER:
        return <Shield className="h-4 w-4" />;
      case MemberRole.STAFF:
      case MemberRole.MEMBER:
      default:
        return <ShieldQuestion className="h-4 w-4" />;
    }
  };

  // Handle add member form submission
  const onAddMember = async (data: AddMemberFormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const success = await addMember(id, {
        email: data.email,
        role: data.role,
      });

      if (success) {
        setIsAddDialogOpen(false);
        addMemberForm.reset();
      }
    } catch (error) {
      console.error('Error adding member:', error);
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
    updateRoleForm.setValue('role', member.role);
    setIsUpdateRoleDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${id}`}>{currentOrganization?.name}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Team Members</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner || isAdmin ? (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add Member</span>
                    <span className="inline sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite someone to join your organization
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addMemberForm}>
                    <form onSubmit={addMemberForm.handleSubmit(onAddMember)} className="space-y-4">
                      <FormField
                        control={addMemberForm.control}
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
                              Enter the email address of the person you want to invite
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addMemberForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
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
                              {selectedMember && MemberRoleDescriptions[field.value as MemberRole]}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Adding...' : 'Add Member'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Leave Organization</span>
                    <span className="inline sm:hidden">Leave</span>
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

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            {currentOrganization?.logoUrl ? (
              <AvatarImage src={currentOrganization.logoUrl} alt={currentOrganization.name} />
            ) : (
              <AvatarFallback>
                {currentOrganization?.name ? getInitials(currentOrganization.name) : 'ORG'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground mt-1">
              Manage members of {currentOrganization?.name}
            </p>
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              People with access to {currentOrganization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentOrganizationDetails?.members.map((member) => {
                const isCurrentUser = member.user.id === user?.id;
                const canManageMember = (isOwner || isAdmin) && !isCurrentUser && member.role !== MemberRole.OWNER;

                return (
                  <div key={member.id} className="flex flex-col sm:flex-col md:flex-row md:items-center justify-between py-3 px-2 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {member.user.profileImageUrl ? (
                          <AvatarImage src={member.user.profileImageUrl} alt={member.user.name} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {member.user.name}
                            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                          </p>
                          {member.role === MemberRole.OWNER && (
                            <Badge variant="default" className="ml-1">Owner</Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-2 md:mt-0 self-end sm:self-end md:self-auto">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {getRoleIcon(member.role)}
                        <span className="hidden xs:inline">{MemberRoleLabels[member.role]}</span>
                      </Badge>

                      {canManageMember && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  {currentOrganizationDetails?.members.length} members in this organization
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Member
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

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
                        onValueChange={field.onChange}
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
