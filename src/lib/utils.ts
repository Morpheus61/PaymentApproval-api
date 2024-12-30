import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Voucher } from './db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(vouchers: Voucher[], filename: string) {
  const headers = ['ID', 'Amount', 'Description', 'Status', 'Created At', 'Approved At'];
  const data = vouchers.map(v => [
    v.id,
    v.amount,
    v.description,
    v.status,
    new Date(v.createdAt).toLocaleDateString(),
    v.approvedAt ? new Date(v.approvedAt).toLocaleDateString() : ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}