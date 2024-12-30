import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { db, Voucher } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportToCSV } from '@/lib/utils';
import { VoucherDetails } from '@/components/vouchers/voucher-details';
import { sendVoucherNotification } from '@/lib/notifications';

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [showNewVoucherForm, setShowNewVoucherForm] = useState(false);
  const [payTo, setPayTo] = useState('');
  const [headOfAccount, setHeadOfAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Handle navigation state
  useEffect(() => {
    if (location.state?.showNewVoucher) {
      setShowNewVoucherForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const pendingVouchers = useLiveQuery(
    () => db.vouchers.where('status').equals('pending').reverse().toArray()
  ) || [];

  const approvedVouchers = useLiveQuery(
    () => db.vouchers.where('status').equals('approved').reverse().toArray()
  ) || [];

  const rejectedVouchers = useLiveQuery(
    () => db.vouchers.where('status').equals('rejected').reverse().toArray()
  ) || [];

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const voucherNumber = await db.getNextVoucherNumber();
    const voucher = {
      voucherNumber,
      date: new Date(),
      payTo,
      headOfAccount,
      amount: parseFloat(amount),
      description,
      status: 'pending' as const,
      generatedBy: user.id!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.vouchers.add(voucher);
    await sendVoucherNotification({ ...voucher, id }, 'new');

    setShowNewVoucherForm(false);
    setPayTo('');
    setHeadOfAccount('');
    setAmount('');
    setDescription('');
  };

  const handleExport = () => {
    const allVouchers = [...pendingVouchers, ...approvedVouchers, ...rejectedVouchers];
    exportToCSV(allVouchers, 'vouchers-export');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </Button>
          {user?.role === 'generator' && !showNewVoucherForm && (
            <Button
              onClick={() => setShowNewVoucherForm(true)}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>New Voucher</span>
            </Button>
          )}
        </div>
      </div>

      {showNewVoucherForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Voucher</h3>
          <form onSubmit={handleCreateVoucher} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay To
              </label>
              <Input
                required
                value={payTo}
                onChange={(e) => setPayTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head of Account
              </label>
              <Input
                required
                value={headOfAccount}
                onChange={(e) => setHeadOfAccount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowNewVoucherForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Voucher</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {/* Pending Vouchers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Vouchers</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedVoucher(voucher)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(voucher.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.payTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approved Vouchers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Approved Vouchers</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedVoucher(voucher)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(voucher.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.payTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejected Vouchers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rejected Vouchers</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rejectedVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedVoucher(voucher)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(voucher.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.payTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Rejected
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.rejectionReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedVoucher && (
        <VoucherDetails
          voucher={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
}