import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Minus, AlertTriangle } from 'lucide-react';

interface PartySizeInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  tableCapacity?: number | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showQuickButtons?: boolean;
  maxPartySize?: number;
}

export const PartySizeInput: React.FC<PartySizeInputProps> = ({
  value,
  onChange,
  tableCapacity,
  label = "Party Size",
  placeholder = "Number of guests",
  required = false,
  disabled = false,
  className = "",
  showQuickButtons = true,
  maxPartySize = 20
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(undefined);
    } else {
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue > 0) {
        onChange(Math.min(numValue, maxPartySize));
      }
    }
  };

  const handleQuickSelect = (size: number) => {
    onChange(size);
  };

  const handleIncrement = () => {
    const newValue = (value || 0) + 1;
    if (newValue <= maxPartySize) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = value || 0;
    if (currentValue > 1) {
      onChange(currentValue - 1);
    }
  };

  const isOverCapacity = tableCapacity && value && value > tableCapacity;
  const quickSizes = [1, 2, 3, 4, 5, 6, 8];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="partySize" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
          {tableCapacity && (
            <Badge variant="outline" className="ml-2">
              Table capacity: {tableCapacity}
            </Badge>
          )}
        </Label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || !value || value <= 1}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            id="partySize"
            type="number"
            min="1"
            max={maxPartySize}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`text-center ${isOverCapacity ? 'border-red-300 focus:border-red-500' : ''}`}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || (value || 0) >= maxPartySize}
            className="h-10 w-10 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isOverCapacity && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Party size exceeds table capacity ({tableCapacity} seats)
          </div>
        )}
      </div>

      {showQuickButtons && !disabled && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick select:</Label>
          <div className="flex flex-wrap gap-2">
            {quickSizes.map(size => (
              <Button
                key={size}
                type="button"
                variant={value === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickSelect(size)}
                disabled={disabled}
                className={`
                  ${tableCapacity && size > tableCapacity ? 'border-red-300 text-red-600' : ''}
                  ${value === size ? 'bg-primary text-primary-foreground' : ''}
                `}
              >
                {size} {size === 1 ? 'guest' : 'guests'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tableCapacity && (
        <div className="text-xs text-muted-foreground">
          <strong>Tip:</strong> This table can accommodate up to {tableCapacity} guests comfortably.
        </div>
      )}
    </div>
  );
};

export default PartySizeInput;
