// This file is a compatibility layer to avoid breaking existing imports
// It re-exports AppLayout as DashboardLayout to maintain backward compatibility

import AppLayout from './app-layout';

// Export AppLayout as DashboardLayout for backward compatibility
const DashboardLayout = AppLayout;

export default DashboardLayout;
