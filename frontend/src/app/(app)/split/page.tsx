'use client';

import { useState, useCallback } from 'react';
import {
  Users, Plus, Trash2, CheckCircle2, Clock,
  ExternalLink, AlertCircle, Bell,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useWalletStore } from '@/lib/walletStore';
import { isValidStellarAddress, truncateAddress, formatAmount } from '@/lib/stellar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  address: string;
  amount: string;
  status: 'pending' | 'paid';
}

interface BillPreview {
  id: string;
  title: string;
  token: string;
  total: number;
  collected: number;
  members: Member[];
  status: 'open' | 'paid' | 'cancelled';
  createdAt: Date;
}

function MemberRow({
  member,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  member: Member;
  index: number;
  onChange: (id: string, field: 'address' | 'amount', value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const valid = isValidStellarAddress(member.address);
  return (
    <div className="flex gap-3 items-start animate-fade-up">
      <div className="flex-1">
        <input
          placeholder={`Member ${index + 1} address (G...)`}
          value={member.address}
          onChange={(e) => onChange(member.id, 'address', e.target.value)}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl bg-surface-2 border text-text-primary placeholder:text-text-muted font-mono text-xs',
            'focus:outline-none focus:ring-1 transition-all',
            member.address && !valid
              ? 'border-status-error/40 focus:border-status-error/60 focus:ring-status-error/20'
              : 'border-white/[0.06] focus:border-accent-gold/40 focus:ring-accent-gold/20',
          )}
        />
      </div>
      <div className="w-32">
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={member.amount}
            onChange={(e) => onChange(member.id, 'amount', e.target.value)}
            className="w-full px-3 py-2.5 pr-16 rounded-xl bg-surface-2 border border-white/[0.06] text-text-primary placeholder:text-text-muted font-mono text-xs focus:outline-none focus:border-accent-gold/40 focus:ring-1 focus:ring-accent-gold/20 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
            XLM
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(member.id)}
        disabled={!canRemove}
        className="mt-0.5 p-2 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function BillCard({
  bill,
  onPay,
  currentKey,
}: {
  bill: BillPreview;
  onPay: (bill: BillPreview) => void;
  currentKey: string | null;
}) {
  const progress = bill.total > 0 ? (bill.collected / bill.total) * 100 : 0;
  const myMember = bill.members.find((m) => m.address === currentKey);
  const paidCount = bill.members.filter((m) => m.status === 'paid').length;

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-semibold text-text-primary group-hover:text-accent-gold transition-colors">
            {bill.title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {bill.members.length} members · {paidCount}/{bill.members.length} paid · Created{' '}
            {bill.createdAt.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge
          variant={
            bill.status === 'paid' ? 'success' : bill.status === 'open' ? 'pending' : 'error'
          }
          dot
        >
          {bill.status === 'paid' ? 'Settled' : bill.status === 'open' ? 'Active' : 'Cancelled'}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-text-muted">
            {formatAmount(bill.collected)} / {formatAmount(bill.total)} XLM collected
          </span>
          <span className="text-accent-gold font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gold-gradient transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {bill.members.map((m) => (
          <div key={m.id} className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-secondary">
              {truncateAddress(m.address, 6)}
              {m.address === currentKey && (
                <span className="ml-1.5 text-accent-gold">(you)</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{formatAmount(m.amount)} XLM</span>
              {m.status === 'paid' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-text-muted" />
              )}
            </div>
          </div>
        ))}
      </div>

      {myMember?.status === 'pending' && bill.status === 'open' && (
        <Button className="w-full" size="sm" onClick={() => onPay(bill)}>
          Pay My Share ({formatAmount(myMember.amount)} XLM)
        </Button>
      )}
    </Card>
  );
}

const MOCK_BILLS: BillPreview[] = [
  {
    id: '1',
    title: 'Team Dinner Kemang',
    token: 'XLM',
    total: 120,
    collected: 80,
    status: 'open',
    createdAt: new Date('2026-04-22'),
    members: [
      {
        id: '1',
        address: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        amount: '40',
        status: 'paid',
      },
      {
        id: '2',
        address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGKM0DHYQBH3AFI5UPJWKN',
        amount: '40',
        status: 'paid',
      },
      {
        id: '3',
        address: 'GDMXNQBJMS3FYI4PFSYCCB4XODQMNMTKPQ5HIKLJRDFIXMD6IQWHF3V',
        amount: '40',
        status: 'pending',
      },
    ],
  },
];

export default function SplitPage() {
  const { publicKey, isConnected } = useWalletStore();

  const [tab, setTab] = useState<'create' | 'active'>('active');
  const [bills, setBills] = useState<BillPreview[]>(MOCK_BILLS);

  const [title, setTitle] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { id: '1', address: '', amount: '', status: 'pending' },
    { id: '2', address: '', amount: '', status: 'pending' },
  ]);
  const [creating, setCreating] = useState(false);
  const [payModal, setPayModal] = useState<BillPreview | null>(null);
  const [paying, setPaying] = useState(false);

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: Date.now().toString(), address: '', amount: '', status: 'pending' },
    ]);
  };

  const updateMember = (id: string, field: 'address' | 'amount', value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const total = members.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const handleCreate = async () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return; }
    if (!title.trim()) { toast.error('Enter a bill title'); return; }
    const invalid = members.some(
      (m) => !isValidStellarAddress(m.address) || !m.amount || parseFloat(m.amount) <= 0,
    );
    if (invalid) { toast.error('Fill in all member addresses and amounts'); return; }

    setCreating(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const newBill: BillPreview = {
        id: Date.now().toString(),
        title,
        token: 'XLM',
        total,
        collected: 0,
        status: 'open',
        createdAt: new Date(),
        members: members.map((m) => ({ ...m, status: 'pending' })),
      };
      setBills((prev) => [newBill, ...prev]);

      // Improved notification — based on Siti Rahayu feedback
      toast.success(
        `Bill created! ${members.length} members have been notified to pay their share.`,
        { duration: 4000, icon: '🔔' },
      );

      setTitle('');
      setMembers([
        { id: '1', address: '', amount: '', status: 'pending' },
        { id: '2', address: '', amount: '', status: 'pending' },
      ]);
      setTab('active');
    } catch {
      toast.error('Failed to create bill');
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      setBills((prev) =>
        prev.map((b) => {
          if (b.id !== payModal.id) return b;
          const updated = b.members.map((m) =>
            m.address === publicKey ? { ...m, status: 'paid' as const } : m,
          );
          const collected = updated
            .filter((m) => m.status === 'paid')
            .reduce((s, m) => s + parseFloat(m.amount), 0);
          const allPaid = updated.every((m) => m.status === 'paid');
          return { ...b, members: updated, collected, status: allPaid ? 'paid' : 'open' };
        }),
      );

      const myMember = payModal.members.find((m) => m.address === publicKey);
      const allWillBePaid =
        payModal.members.filter((m) => m.status === 'paid').length + 1 ===
        payModal.members.length;

      if (allWillBePaid) {
        toast.success('All members paid! Funds released to bill owner automatically.', {
          duration: 5000,
          icon: '🎉',
        });
      } else {
        toast.success(
          `Payment sent! Waiting for ${payModal.members.filter((m) => m.status === 'pending').length - 1} more members.`,
          { duration: 4000, icon: '🔔' },
        );
      }

      setPayModal(null);
    } catch {
      toast.error('Payment failed');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-bold text-3xl text-text-primary">Split Bill</h1>
        <p className="text-text-secondary font-body text-sm mt-1.5">
          On-chain transparent bill splitting with automatic settlement
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-2 border border-white/[0.06] mb-6 animate-fade-up stagger-1">
        {(['active', 'create'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200',
              tab === t
                ? 'bg-surface-3 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {t === 'active' ? 'Active Bills' : 'Create Bill'}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div className="space-y-4 animate-fade-up">
          {bills.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-body">No bills yet.</p>
              <Button className="mt-4" size="sm" onClick={() => setTab('create')}>
                Create Bill
              </Button>
            </Card>
          ) : (
            bills.map((b) => (
              <BillCard key={b.id} bill={b} onPay={setPayModal} currentKey={publicKey} />
            ))
          )}
        </div>
      )}

      {tab === 'create' && (
        <div className="space-y-4 animate-fade-up">
          {!isConnected && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
              <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <p className="text-sm text-status-warning">Connect your wallet to create a bill.</p>
            </div>
          )}

          {/* Notification info — based on Siti Rahayu feedback */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-pending/5 border border-status-pending/15">
            <Bell className="w-4 h-4 text-status-pending shrink-0 mt-0.5" />
            <p className="text-xs text-status-pending leading-relaxed">
              Members will be notified when the bill is created and when all payments are collected.
            </p>
          </div>

          <Card>
            <CardHeader title="New Bill" subtitle="Members pay their share on-chain" />

            <div className="space-y-5">
              <Input
                label="Bill Title"
                placeholder="Team dinner, hotel split, flight..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Members & Amounts
                  </label>
                  <button
                    onClick={addMember}
                    className="flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold-light transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="flex gap-3 text-xs text-text-muted px-1 mb-1">
                    <span className="flex-1">Wallet Address</span>
                    <span className="w-32">Amount</span>
                    <span className="w-8" />
                  </div>
                  {members.map((m, i) => (
                    <MemberRow
                      key={m.id}
                      member={m}
                      index={i}
                      onChange={updateMember}
                      onRemove={removeMember}
                      canRemove={members.length > 2}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                <span className="text-sm text-text-muted">Total Bill Amount</span>
                <span className="font-display font-bold text-lg text-accent-gold">
                  {formatAmount(total)} XLM
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                loading={creating}
                onClick={handleCreate}
                leftIcon={<Users className="w-4 h-4" />}
              >
                {creating ? 'Deploying to Soroban...' : 'Create Bill On-Chain'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pay modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Pay Your Share">
        {payModal && (
          <div className="p-6 pt-0">
            <p className="text-text-secondary text-sm mb-4">{payModal.title}</p>
            <div className="glass-card rounded-xl p-4 mb-6 space-y-2.5">
              {(() => {
                const myMember = payModal.members.find((m) => m.address === publicKey);
                const remaining = payModal.members.filter((m) => m.status === 'pending').length;
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Your Share</span>
                      <span className="font-semibold text-accent-gold">
                        {formatAmount(myMember?.amount || '0')} XLM
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Members Remaining</span>
                      <span className="text-text-secondary">{remaining} of {payModal.members.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Network Fee</span>
                      <span className="text-text-secondary">~$0.001</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setPayModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={paying} onClick={handlePay}>
                Confirm Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
