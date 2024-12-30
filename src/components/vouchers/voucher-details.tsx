import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Voucher, User, db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { sendVoucherNotification } from '@/lib/notifications';
import { VoucherActions } from './voucher-actions';

interface VoucherDetailsProps {
  voucher: Voucher;
  onClose: () => void;
  isOpen: boolean;
}

export function VoucherDetails({ voucher, onClose, isOpen }: VoucherDetailsProps) {
  const { user } = useAuth();
  const [generator, setGenerator] = useState<User | null>(null);
  const [approver, setApprover] = useState<User | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      if (voucher.generatedBy) {
        const generatorUser = await db.users.get(voucher.generatedBy);
        setGenerator(generatorUser || null);
      }
      if (voucher.approvedBy) {
        const approverUser = await db.users.get(voucher.approvedBy);
        setApprover(approverUser || null);
      }
    };
    loadUsers();
  }, [voucher]);

  const handleApprove = async () => {
    if (user?.role === 'approver') {
      await db.vouchers.update(voucher.id!, {
        status: 'approved',
        approvedBy: user.id,
        approvedAt: new Date(),
        updatedAt: new Date()
      });
      await sendVoucherNotification(voucher, 'approved');
      onClose();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (user?.role === 'approver') {
      await db.vouchers.update(voucher.id!, {
        status: 'rejected',
        rejectionReason,
        approvedBy: user.id,
        updatedAt: new Date()
      });
      await sendVoucherNotification(voucher, 'rejected');
      setShowRejectDialog(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Voucher Details
            </Dialog.Title>
            <div className="flex items-center space-x-2">
              <VoucherActions
                contentRef="voucher-print-content"
                voucherNumber={voucher.voucherNumber}
              />
            </div>
          </div>

          <div id="voucher-print-content" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Relish Foods Pvt. Ltd.</h2>
              <p className="text-sm text-gray-600">Regd. Off: 179 B, Madhavapuram, Kanyakumari 629704</p>
              <p className="text-sm text-gray-600">Admin. Off: 26/599. M.O.Ward, Alappuzha 688001</p>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold">Payment Voucher</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Voucher Number
                </label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{voucher.voucherNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(voucher.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Pay To
                </label>
                <p className="mt-1 text-sm text-gray-900">{voucher.payTo}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Head of Account
                </label>
                <p className="mt-1 text-sm text-gray-900">{voucher.headOfAccount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Amount
                </label>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  ₹{voucher.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className={`mt-1 text-sm font-medium inline-flex px-2 py-1 rounded-full ${
                  voucher.status === 'approved' ? 'bg-green-100 text-green-800' :
                  voucher.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900">{voucher.description}</p>
              </div>

              {generator && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Generated By
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{generator.name}</p>
                </div>
              )}

              {approver && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Approved By
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{approver.name}</p>
                </div>
              )}

              {voucher.status === 'rejected' && (
                <div className="col-span-2 bg-red-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-red-800">
                    Rejection Reason
                  </label>
                  <p className="mt-1 text-sm text-red-900">{voucher.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {user?.role === 'approver' && voucher.status === 'pending' && (
              <>
                <Button variant="danger" onClick={() => setShowRejectDialog(true)}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Reject Voucher
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection
                </label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowRejectDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleReject}>
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Dialog>
  );
}