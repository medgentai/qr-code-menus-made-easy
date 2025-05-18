import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVenue } from '@/contexts/venue-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { TableStatus, TableStatusLabels } from '@/types/venue';

// Form schema
const tableFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  capacity: z.union([
    z.string().transform(val => val ? parseInt(val, 10) : undefined),
    z.number().optional()
  ]).optional(),
  status: z.nativeEnum(TableStatus).default(TableStatus.AVAILABLE),
  location: z.string().max(200, 'Location must be less than 200 characters').optional()
});

type TableFormValues = z.infer<typeof tableFormSchema>;

const TableCreate = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentVenue, fetchVenueById, createTable, isLoading } = useVenue();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails(organizationId);
    }
    if (venueId) {
      fetchVenueById(venueId);
    }
  }, [organizationId, venueId, fetchOrganizationDetails, fetchVenueById]);

  // Initialize form
  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      name: '',
      capacity: undefined,
      status: TableStatus.AVAILABLE,
      location: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: TableFormValues) => {
    if (!venueId) return;

    setIsSubmitting(true);

    try {
      const table = await createTable({
        venueId,
        name: data.name,
        capacity: data.capacity,
        status: data.status,
        location: data.location
      });

      if (table) {
        toast.success('Table created successfully! A QR code has been automatically generated for this table.');
        navigate(`/organizations/${organizationId}/venues/${venueId}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
            className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/organizations">Organizations</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}`}>
                      {currentOrganization?.name || 'Organization'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}/venues`}>Venues</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}/venues/${venueId}`}>
                      {currentVenue?.name || 'Venue'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Add Table</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add Table</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a new table to {currentVenue?.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Table Information</CardTitle>
            <CardDescription>
              Enter the details of your new table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Table 1" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name or number of your table
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            min={1}
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          How many people can sit at this table
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TableStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of the table
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Near window, second floor"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Description of where this table is located within the venue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Table'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
  );
};

export default TableCreate;
