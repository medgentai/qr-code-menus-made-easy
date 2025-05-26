import { api } from '@/lib/api';
import { Plan } from '@/types/payment';
import { OrganizationType } from '@/types/organization';

const PlansService = {
  // Get all active plans
  getAll: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/plans', { withAuth: false });
    return response.data;
  },

  // Get plans by organization type
  getByType: async (organizationType: OrganizationType): Promise<Plan[]> => {
    const response = await api.get<Plan[]>(`/plans?type=${organizationType}`, { withAuth: false });
    return response.data;
  },

  // Get plan by ID
  getById: async (id: string): Promise<Plan> => {
    const response = await api.get<Plan>(`/plans/${id}`, { withAuth: false });
    return response.data;
  },
};

export default PlansService;
