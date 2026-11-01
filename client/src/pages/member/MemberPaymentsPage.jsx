import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { CreditCard, FileText, Printer, CheckCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MemberPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await paymentService.getMy();
        if (res.success) setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <Loader message="Accessing billing transactions..." />;

  const totalSpent = payments
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = payments.filter((p) => p.status === 'paid' || p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Billing & Invoices
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Access tax receipts, payment settlements, and subscription histories
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Total Settled</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">{formatCurrency(totalSpent)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Lifetime verified contributions</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Paid Invoices</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 tracking-tight">{completedCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">All transactions reconciled</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Active Membership</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">
              {payments[0]?.membershipPlan?.name || 'Standard Tier'}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> In Good Standing
            </p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Your billing transactions and renewal invoices will appear here once registered."
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">Transaction History</h3>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{payments.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/80 dark:bg-white/[0.02]">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Package / Description</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-medium text-indigo-500 dark:text-indigo-400">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-900 dark:text-zinc-200 font-medium">
                      {p.membershipPlan?.name || 'Membership Plan'}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-white tracking-tight">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-5 uppercase text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={p.status}>{p.status}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-zinc-200 dark:border-white/[0.08] transition-all text-[11px] font-medium"
                        title="View & Print Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Receipt Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6 text-xs p-6 bg-zinc-50 dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-white/[0.08] printable-receipt">
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs">
                    T
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wider">
                    TITANPULSE GYM
                  </h4>
                </div>
                <p className="text-zinc-500 text-[11px] mt-1">742 Evergreen Fitness Plaza</p>
                <p className="text-zinc-500 text-[11px]">billing@titanpulse.io • +1 (555) 0199-GYM</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Payment Receipt</span>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm mt-0.5">{selectedInvoice.invoiceNumber}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">{formatDate(selectedInvoice.paymentDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-b border-zinc-200 dark:border-white/[0.08] pb-5">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Package Subscribed</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-white mt-1">{selectedInvoice.membershipPlan?.name}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">Duration: {selectedInvoice.membershipPlan?.durationMonths} Months</p>
                {selectedInvoice.member?.user?.name && (
                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] mt-2">
                    Athlete: <span className="font-semibold text-zinc-900 dark:text-white">{selectedInvoice.member.user.name}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Payment Details</p>
                <p className="text-zinc-900 dark:text-zinc-200 uppercase font-semibold mt-1">{selectedInvoice.paymentMethod}</p>
                <p className="text-zinc-500 font-mono text-[10px] mt-0.5">{selectedInvoice.transactionId}</p>
                <div className="mt-2 flex justify-end">
                  <Badge variant={selectedInvoice.status}>{selectedInvoice.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-base font-bold text-zinc-900 dark:text-white py-1">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Settled:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xl tracking-tight">
                {formatCurrency(selectedInvoice.amount)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/[0.08] no-print">
              <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
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

export default MemberPaymentsPage;
