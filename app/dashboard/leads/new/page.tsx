
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, type LeadFormData } from '@/lib/validations/lead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard?success=true');
      } else {
        alert('Failed to submit lead');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к панели
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Добавить нового лида</CardTitle>
          <CardDescription>
            Введите данные потенциального клиента
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Название компании*</Label>
              <Input
                id="company_name"
                {...register('company_name')}
                placeholder="ABC Company Ltd"
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Имя контакта*</Label>
              <Input
                id="contact_name"
                {...register('contact_name')}
                placeholder="Иван Петров"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive">{errors.contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email контакта*</Label>
              <Input
                id="contact_email"
                {...register('contact_email')}
                type="email"
                placeholder="ivan@company.com"
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive">{errors.contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Телефон контакта*</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone')}
                placeholder="+7 (123) 456-78-90"
              />
              {errors.contact_phone && (
                <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_revenue">Месячная выручка</Label>
              <Input
                id="monthly_revenue"
                {...register('monthly_revenue')}
                placeholder="€10,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_bank">Текущий банк</Label>
              <Input
                id="current_bank"
                {...register('current_bank')}
                placeholder="Название банка"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="best_contact_time">Удобное время для связи</Label>
              <Input
                id="best_contact_time"
                {...register('best_contact_time')}
                placeholder="например: 10:00-18:00 по будням"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Отправляем...' : 'Отправить лид'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
