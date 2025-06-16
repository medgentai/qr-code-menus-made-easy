import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaxService } from '@/services/tax-service';
import { ServiceType, TaxTypeLabels } from '@/types/tax';

interface TaxPreviewCardProps {
  organizationId: string;
}

export const TaxPreviewCard: React.FC<TaxPreviewCardProps> = ({ organizationId }) => {
  // Service type no longer affects tax calculation, but kept for API compatibility
  const serviceType = ServiceType.DINE_IN;

  const {
    data: taxPreview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tax-preview', organizationId],
    queryFn: () => TaxService.getTaxPreview(organizationId, serviceType),
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading tax preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tax preview is not available yet. The backend tax configuration endpoints need to be implemented.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Preview
            </CardTitle>
            <CardDescription>
              Preview how taxes will be calculated for all service types (dine-in, takeaway, delivery)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!taxPreview?.hasConfiguration ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {taxPreview?.message || 'No tax configuration found for this service type. Create a tax configuration to see the preview.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Current Configuration */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Current Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-medium">{taxPreview.configuration?.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Type:</span>
                  <div className="font-medium">
                    {taxPreview.configuration?.taxType && TaxTypeLabels[taxPreview.configuration.taxType]}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <div className="font-medium">
                    {taxPreview.configuration?.isTaxExempt ? (
                      <Badge variant="outline">Tax Exempt</Badge>
                    ) : (
                      <span className="font-mono">
                        {TaxService.formatTaxRate(taxPreview.configuration?.taxRate || 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Applies To:</span>
                  <div className="font-medium">All Service Types</div>
                </div>
              </div>
              
              {taxPreview.configuration?.description && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <div className="text-sm mt-1">{taxPreview.configuration.description}</div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {taxPreview.configuration?.isDefault && (
                  <Badge variant="default">Default</Badge>
                )}
                {taxPreview.configuration?.isTaxExempt && (
                  <Badge variant="outline">Tax Exempt</Badge>
                )}
                {taxPreview.configuration?.isPriceInclusive && (
                  <Badge variant="secondary">Tax Inclusive</Badge>
                )}
              </div>
            </div>

            {/* Example Calculation */}
            {taxPreview.exampleCalculation && (
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3">Example Calculation (₹100 base amount)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono">
                      {TaxService.formatCurrency(taxPreview.exampleCalculation.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Amount:</span>
                    <span className="font-mono">
                      {TaxService.formatCurrency(taxPreview.exampleCalculation.taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span className="font-mono">
                      {TaxService.formatCurrency(taxPreview.exampleCalculation.total)}
                    </span>
                  </div>
                  {taxPreview.exampleCalculation.message && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {taxPreview.exampleCalculation.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              This configuration applies to all service types (dine-in, takeaway, and delivery) as per Indian GST regulations.
              Actual calculations may vary based on item prices and modifiers.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
