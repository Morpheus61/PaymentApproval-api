import { db, User, Voucher } from './db';

export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function sendVoucherNotification(voucher: Voucher, type: 'new' | 'approved' | 'rejected') {
  // Get approvers for new vouchers, or get generator for status updates
  const recipients = type === 'new' 
    ? await db.users.where('role').equals('approver').toArray()
    : [await db.users.get(voucher.generatedBy)];

  const title = {
    new: 'New Voucher Pending Approval',
    approved: 'Voucher Approved',
    rejected: 'Voucher Rejected'
  }[type];

  const message = {
    new: `New voucher #${voucher.voucherNumber} requires your approval`,
    approved: `Voucher #${voucher.voucherNumber} has been approved`,
    rejected: `Voucher #${voucher.voucherNumber} has been rejected`
  }[type];

  // Send email notifications
  for (const recipient of recipients) {
    if (recipient) {
      await sendEmail(recipient.email, title, message);
      
      // Create in-app notification
      await db.notifications.add({
        userId: recipient.id!,
        title,
        message,
        read: false,
        createdAt: new Date()
      });
    }
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  // In a real application, you would integrate with an email service
  // For demo purposes, we'll just log the email
  console.log(`[${new Date().toISOString()}] Sending email to ${to} at ${new Date().toLocaleTimeString()}:`, { subject, body });
}