import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { memberService } from '../../services/memberService';
import { membershipService } from '../../services/membershipService';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    member: '',
    membershipPlan: '',
    amount: '',
    paymentMethod: 'card',
    status: 'paid',
    notes: '',
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll({
        search,
        status: statusFilter,
        paymentMethod: methodFilter,
      });
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, methodFilter]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [memRes, planRes] = await Promise.all([
          memberService.getAll(),
          membershipService.getAll(),
        ]);
        if (memRes.success) setMembers(memRes.data);
        if (planRes.success) setPlans(planRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadDropdowns();
  }, []);

  const handleMemberChange = (memberId) => {
    const selectedMem = members.find((m) => m._id === memberId);
    if (selectedMem && selectedMem.membershipPlan) {
      const planId = selectedMem.membershipPlan._id || selectedMem.membershipPlan;
      const plan = plans.find((p) => String(p._id) === String(planId));
      setFormData({
        ...formData,
        member: memberId,
        membershipPlan: plan ? plan._id : (selectedMem.membershipPlan._id || selectedMem.membershipPlan),
        amount: plan ? plan.price : (selectedMem.membershipPlan.price || ''),
      });
    } else {
      setFormData({ ...formData, member: memberId });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await paymentService.record(formData);
      if (res.success) {
        setIsRecordModalOpen(false);
        setFormData({
          member: '',
          membershipPlan: '',
          amount: '',
          paymentMethod: 'card',
          status: 'paid',
          notes: '',
        });
        fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Billing & Invoicing Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Cash, UPI, Credit Card, and Bank Wire audit trail with printable receipts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} onClick={() => setIsRecordModalOpen(true)}>
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Collected</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Transactions</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{payments.length} Records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-50/80 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending Settlements</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {payments.filter((p) => p.status === 'pending').length} Unpaid
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search invoice number, TXN or member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">All Statuses</option>
            <option value="paid" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Paid</option>
            <option value="pending" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Pending</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">All Methods</option>
            <option value="cash" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Cash</option>
            <option value="upi" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">UPI</option>
            <option value="card" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Card</option>
            <option value="bank_transfer" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <Loader message="Loading financial transactions..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Record a gym membership subscription payment to populate the ledger."
          actionText="Record Payment"
          onAction={() => setIsRecordModalOpen(true)}
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04] text-xs">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.025] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-500 dark:text-indigo-400">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-200">
                      {p.member?.user?.name || 'Member'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                      {p.membershipPlan?.name || 'General Fee'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-zinc-400 font-medium tracking-wider text-[10px]">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status}>{p.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="View & Print Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Billing Transaction"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <Select
            label="Member"
            required
            value={formData.member}
            onChange={(e) => handleMemberChange(e.target.value)}
          >
            <option value="">Select Member...</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.user?.name} ({m.membershipPlan?.name || 'No Plan'})
              </option>
            ))}
          </Select>

          <Select
            label="Membership Plan"
            required
            value={formData.membershipPlan}
            onChange={(e) => {
              const plan = plans.find((p) => p._id === e.target.value);
              setFormData({
                ...formData,
                membershipPlan: e.target.value,
                amount: plan ? plan.price : formData.amount,
              });
            }}
          >
            <option value="">Select Plan...</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (${p.price} for {p.durationMonths}m)
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount Paid ($)"
              type="number"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />

            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="cash">Cash (Front Desk)</option>
              <option value="upi">UPI / QR Code</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Bank Wire</option>
            </Select>
          </div>

          <Select
            label="Payment Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="paid">Settled / Paid</option>
            <option value="pending">Pending Settlement</option>
          </Select>

          <Input
            label="Payment Memo / Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Card POS Authorization Code #88432"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
            <Button variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Complete & Issue Receipt</Button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Receipt: ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6 text-xs font-mono p-5 bg-zinc-50 dark:bg-[#0e0e11] rounded-2xl border border-zinc-200 dark:border-white/[0.08] printable-receipt">
            {/* Invoice Top */}
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-widest font-sans">
                  TITANPULSE GYM
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-sans">742 Evergreen Fitness Plaza</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-sans">Phone: +1 (555) 0199-GYM</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Official Receipt</span>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedInvoice.invoiceNumber}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{formatDate(selectedInvoice.paymentDate)}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-4 font-sans">
              <div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Billed To:</p>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{selectedInvoice.member?.user?.name}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{selectedInvoice.member?.user?.email}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{selectedInvoice.member?.user?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Payment Details:</p>
                <p className="text-zinc-700 dark:text-zinc-300">Method: {selectedInvoice.paymentMethod.toUpperCase()}</p>
                <p className="text-zinc-700 dark:text-zinc-300">TXN: {selectedInvoice.transactionId}</p>
                <div className="mt-1">
                  <Badge variant={selectedInvoice.status}>{selectedInvoice.status}</Badge>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-[10px] uppercase text-zinc-500 dark:text-zinc-400">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04] text-xs">
                <tr>
                  <td className="py-3">
                    <p className="font-medium text-zinc-900 dark:text-white">{selectedInvoice.membershipPlan?.name}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Gym Access & Facilities Membership</p>
                  </td>
                  <td className="py-3 text-right font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(selectedInvoice.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200 dark:border-white/[0.08]">
                  <td className="py-3 font-semibold text-zinc-900 dark:text-white uppercase text-xs">Total Amount Paid</td>
                  <td className="py-3 text-right text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(selectedInvoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06] font-sans no-print">
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
              <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;
