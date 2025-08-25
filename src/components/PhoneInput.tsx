import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  const formatNigerianPhone = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    if (digits.startsWith('234')) {
      // Already has country code
      return '+' + digits;
    } else if (digits.startsWith('0')) {
      // Remove leading 0 and add country code
      return '+234' + digits.slice(1);
    } else if (digits.length >= 1 && !digits.startsWith('234')) {
      // Assume it's a Nigerian number without country code
      return '+234' + digits;
    }
    
    return '+234';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatNigerianPhone(input);
    
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const validateNigerianNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid Nigerian number (13 digits total: 234 + 10 digits)
    if (digits.length === 13 && digits.startsWith('234')) {
      const localNumber = digits.slice(3);
      // Common Nigerian mobile prefixes
      const validPrefixes = ['703', '704', '705', '706', '708', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '901', '902', '903', '904', '905', '906', '907', '908', '909', '915', '916', '917', '918'];
      return validPrefixes.some(prefix => localNumber.startsWith(prefix));
    }
    
    return false;
  };

  const isValid = validateNigerianNumber(displayValue);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+234 803 123 4567"
        value={displayValue}
        onChange={handleInputChange}
        disabled={disabled}
        className={cn(
          !isValid && displayValue.length > 4 && "border-destructive focus-visible:ring-destructive",
          className
        )}
      />
      {!isValid && displayValue.length > 4 && (
        <p className="text-sm text-destructive">
          Please enter a valid Nigerian phone number
        </p>
      )}
    </div>
  );
};