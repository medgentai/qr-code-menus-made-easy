import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { PlanFilters as PlanFiltersType } from '@/types/plan-management';
import { OrganizationType } from '@/types/organization';

interface PlanFiltersProps {
  filters: PlanFiltersType;
  onFiltersChange: (filters: PlanFiltersType) => void;
  onReset: () => void;
}

export function PlanFilters({ filters, onFiltersChange, onReset }: PlanFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: keyof PlanFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: PlanFiltersType = {
      search: '',
      organizationType: 'ALL',
      isActive: 'ALL',
      page: 1,
      limit: 20,
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.organizationType !== 'ALL' || 
    filters.isActive !== 'ALL';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Plans</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label>Organization Type</Label>
            <Select
              value={localFilters.organizationType}
              onValueChange={(value) => handleFilterChange('organizationType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value={OrganizationType.RESTAURANT}>Restaurant</SelectItem>
                <SelectItem value={OrganizationType.HOTEL}>Hotel</SelectItem>
                <SelectItem value={OrganizationType.CAFE}>Cafe</SelectItem>
                <SelectItem value={OrganizationType.FOOD_TRUCK}>Food Truck</SelectItem>
                <SelectItem value={OrganizationType.BAR}>Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.isActive.toString()}
              onValueChange={(value) => handleFilterChange('isActive', value === 'ALL' ? 'ALL' : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items per page */}
          <div className="space-y-2">
            <Label>Items per page</Label>
            <Select
              value={localFilters.limit.toString()}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
