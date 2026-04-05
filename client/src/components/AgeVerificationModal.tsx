import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (age: number, method: string) => void;
  requiredAge: number;
  contentTitle?: string;
}

export function AgeVerificationModal({
  isOpen,
  onClose,
  onVerify,
  requiredAge,
  contentTitle,
}: AgeVerificationModalProps) {
  const [birthDate, setBirthDate] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'birthdate' | 'id' | 'payment'>('birthdate');
  const [error, setError] = useState('');

  const handleVerifyByBirthdate = () => {
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < requiredAge) {
      setError(`You must be at least ${requiredAge} years old to access this content.`);
      return;
    }

    onVerify(age, 'birthdate');
    setBirthDate('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription>
            {contentTitle && <p className="mb-2">"{contentTitle}"</p>}
            This content is restricted to users {requiredAge} years or older.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification Method Tabs */}
          <div className="flex gap-2">
            <Button
              variant={verificationMethod === 'birthdate' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('birthdate')}
              className="flex-1"
              size="sm"
            >
              Birth Date
            </Button>
            <Button
              variant={verificationMethod === 'id' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('id')}
              className="flex-1"
              size="sm"
            >
              ID Verification
            </Button>
            <Button
              variant={verificationMethod === 'payment' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('payment')}
              className="flex-1"
              size="sm"
            >
              Payment
            </Button>
          </div>

          {/* Birth Date Verification */}
          {verificationMethod === 'birthdate' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Birth Date
                </label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    setError('');
                  }}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - requiredAge))
                    .toISOString()
                    .split('T')[0]}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleVerifyByBirthdate} className="w-full">
                Verify Age
              </Button>
            </div>
          )}

          {/* ID Verification */}
          {verificationMethod === 'id' && (
            <div className="space-y-3">
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  Upload a government-issued ID (driver's license, passport, etc.) to verify your age.
                  Your information will be securely processed and deleted after verification.
                </p>
              </Card>
              <Button className="w-full" variant="outline">
                Upload ID Document
              </Button>
            </div>
          )}

          {/* Payment Verification */}
          {verificationMethod === 'payment' && (
            <div className="space-y-3">
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  Complete a small transaction to verify your age. This confirms you have a valid payment method.
                </p>
              </Card>
              <Button className="w-full" variant="outline">
                Complete Payment Verification
              </Button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
