import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Info, Code, CheckCircle } from 'lucide-react';
import { TaxFormTest } from './TaxFormTest';

interface TaxConfigurationPlaceholderProps {
  organizationType: string;
  organizationId?: string;
}

export const TaxConfigurationPlaceholder: React.FC<TaxConfigurationPlaceholderProps> = ({
  organizationType,
  organizationId = 'test-org',
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tax Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Manage tax rates and settings for your {organizationType.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tax Configuration System Status:</strong> The frontend tax management interface has been implemented, 
          but the backend API endpoints are not yet available. Once the backend is deployed, you'll be able to:
        </AlertDescription>
      </Alert>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tax Management Features (Preview)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">✅ Frontend Features Ready</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tax configuration management interface</li>
                <li>• Real-time tax calculation in orders</li>
                <li>• Tax breakdown display in receipts</li>
                <li>• Tax-exempt and tax-inclusive support</li>
                <li>• Service type-based tax rates</li>
                <li>• Tax analytics and reporting</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">⏳ Backend Integration Pending</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tax configuration CRUD endpoints</li>
                <li>• Tax calculation API</li>
                <li>• Tax preview functionality</li>
                <li>• Order tax integration</li>
                <li>• Tax reporting endpoints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Configuration Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Tax Configuration (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Restaurant GST - Dine In</h4>
                  <p className="text-sm text-muted-foreground">
                    Standard GST rate for restaurant dine-in service
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Service Type:</span>
                  <div className="font-medium">Dine In</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Type:</span>
                  <div className="font-medium">GST</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <div className="font-medium font-mono">5.00%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="font-medium">Tax Applied</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Bar GST - All Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher GST rate for establishments serving alcohol
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Service Type:</span>
                  <div className="font-medium">All Services</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Type:</span>
                  <div className="font-medium">GST</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <div className="font-medium font-mono">18.00%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="font-medium">Tax Applied</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Frontend Tax Management UI</div>
                <div className="text-sm text-muted-foreground">
                  Complete tax configuration interface with forms, validation, and preview
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Order Display Integration</div>
                <div className="text-sm text-muted-foreground">
                  Tax breakdown components for orders, receipts, and cart
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Tax Calculation Logic</div>
                <div className="text-sm text-muted-foreground">
                  Frontend service layer ready for backend integration
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
              <div>
                <div className="font-medium">Backend API Integration</div>
                <div className="text-sm text-muted-foreground">
                  Waiting for backend tax configuration and calculation endpoints
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Validation Test */}
      <TaxFormTest
        organizationId={organizationId}
        organizationType={organizationType}
      />
    </div>
  );
};
