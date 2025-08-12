'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, QrCode } from 'lucide-react';

interface PartnerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (refLink?: string, qrCode?: string) => void;
}

const setupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type SetupFormData = z.infer<typeof setupSchema>;

export function PartnerSetupModal({ isOpen, onClose, onSuccess }: PartnerSetupModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'success'>('setup');
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState<{
    refLink: string;
    qrCodeDataUrl: string;
    currentSlug: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/partner/new-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setPartnerData({
          refLink: result.referral_link,
          qrCodeDataUrl: result.qr_code_data_url,
          currentSlug: result.current_slug,
        });
        setStep('success');
        onSuccess(result.referral_link, result.qr_code_data_url);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to setup partner'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadQRCode = () => {
    if (!partnerData?.qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = partnerData.qrCodeDataUrl;
    link.download = `qr-code-${partnerData.currentSlug}.png`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        {step === 'setup' && (
          <>
            <CardHeader>
              <CardTitle>Настройка партнерского аккаунта</CardTitle>
              <CardDescription>
                Заполните информацию для получения реферальной ссылки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ваше имя"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+7 (123) 456-78-90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Название вашей компании"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Создание...' : 'Создать аккаунт'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === 'success' && partnerData && (
          <>
            <CardHeader>
              <CardTitle className="text-green-600">Готово!</CardTitle>
              <CardDescription>
                Ваш партнерский аккаунт создан
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Реферальная ссылка</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={partnerData.refLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(partnerData.refLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {partnerData.qrCodeDataUrl && (
                <div className="text-center">
                  <Label className="text-sm font-medium">QR Code</Label>
                  <div className="mt-2 flex flex-col items-center space-y-2">
                    <img 
                      src={partnerData.qrCodeDataUrl} 
                      alt="QR Code" 
                      className="border rounded-lg"
                      width={150}
                      height={150}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadQRCode}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать QR
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/dashboard/leads/new')}
                  className="flex-1"
                >
                  Добавить лид
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}