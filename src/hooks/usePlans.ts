import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PlansService from '@/services/plans-service';
import { Plan } from '@/types/payment';
import { OrganizationType } from '@/types/organization';

interface UsePlansReturn {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePlans = (): UsePlansReturn => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PlansService.getAll();
      setPlans(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch plans';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
};

export const usePlansByType = (organizationType: OrganizationType): UsePlansReturn => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PlansService.getByType(organizationType);
      setPlans(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch plans';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [organizationType]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
};
