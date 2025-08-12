import { z } from 'zod';

export const leadFormSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().min(10, 'Phone number is required'),
  monthly_revenue: z.string().optional(),
  current_bank: z.string().optional(),
  best_contact_time: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;