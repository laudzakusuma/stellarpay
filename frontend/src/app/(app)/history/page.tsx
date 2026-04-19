'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWalletStore } from '@/lib/walletStore';
import { truncateAddress, formatAmount } from '@/lib/stellar';
import { cn } from '@/lib/utils';

interface Tx {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  asset: string;
  from: string;
  to: string;
  hash: string;
  memo?: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

// Mock data for demo
const MOCK_TXS: Tx[] = [
  {
    id: '1', type: 'sent', amount: '25.00', asset: 'USDC',
    from: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    to: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGKM0DHYQBH3AFI5UPJWKN',
    hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    memo: 'Invoice #001', timestamp: new Date('2025-06-12T10:23:00'), status: 'success',
  },
  {
    id: '2', type: 'received', amount: '100.00', asset: 'USDC',
    from: 'GDMXNQBJMS3FYI4PFSYCCB4XODQMNMTKPQ5HIKLJRDFIXMD6IQWHF3V',
    to: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    memo: 'Client payment', timestamp: new Date('2025-06-11T14:10:00'), status: 'success',
  },
  {
    id: '3', type: 'sent', amount: '40.00', asset: 'USDC',
    from: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    to: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGKM0DHYQBH3AFI5UPJWKN',
    hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    memo: 'Team dinner', timestamp: new Date('2025-06-10T19:45:00'), status: 'success',
  },
  {
    id: '4', type: 'sent', amount: '5.00', asset: 'USDC',
    from: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    to: 'GDMXNQBJMS3FYI4PFSYCCB4XODQMNMTKPQ5HIKLJRDFIXMD6IQWHF3V',
    hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    timestamp: new Date('2025-06-09T08:00:00'), status: 'failed',
  },
];

function TxRow({ tx, myKey }: { tx: Tx; myKey: string | null }) {
  const isSent = tx.type === 'sent';
  const counterparty = isSent ? tx.to : tx.from;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.04] last:border-0 group">
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isSent ? 'bg-status-error/10 text-status-error' : 'bg-status-success/10 text-status-success',
        )}
      >
        {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-primary truncate">
            {isSent ? 'Sent to' : 'Received from'} {truncateAddress(counterparty, 6)}
          </p>
          <Badge
            variant={
              tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'pending' : 'error'
            }
          >
            {tx.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs text-text-muted">
            {tx.timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {tx.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {tx.memo && (
            <p className="text-xs text-text-muted truncate max-w-[120px]">"{tx.memo}"</p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            'font-mono font-semibold text-sm',
            isSent ? 'text-status-error' : 'text-status-success',
          )}
        >
          {isSent ? '-' : '+'}{formatAmount(tx.amount)} {tx.asset}
        </p>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mt-0.5 opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="w-3 h-3" />
          Explorer
        </a>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { publicKey, isConnected } = useWalletStore();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const loadTxs = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setTxs(MOCK_TXS);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) loadTxs();
  }, [isConnected]);

  const filtered = txs.filter((tx) => filter === 'all' || tx.type === filter);

  const totalSent = txs
    .filter((t) => t.type === 'sent' && t.status === 'success')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalReceived = txs
    .filter((t) => t.type === 'received' && t.status === 'success')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-up flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">History</h1>
          <p className="text-text-secondary font-body text-sm mt-1.5">
            On-chain transaction record
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadTxs}
        >
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-up stagger-1">
        <Card padding="sm">
          <p className="text-xs text-text-muted mb-1">Total Sent</p>
          <p className="font-display font-bold text-xl text-status-error">
            -{formatAmount(totalSent)} USDC
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-muted mb-1">Total Received</p>
          <p className="font-display font-bold text-xl text-status-success">
            +{formatAmount(totalReceived)} USDC
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 animate-fade-up stagger-2">
        {(['all', 'sent', 'received'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === f
                ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/25'
                : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04] border border-transparent',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tx list */}
      <Card className="animate-fade-up stagger-3" padding="none">
        {!isConnected ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary font-body">Connect your wallet to view history.</p>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary font-body">No transactions found.</p>
          </div>
        ) : (
          <div className="px-5">
            {filtered.map((tx) => (
              <TxRow key={tx.id} tx={tx} myKey={publicKey} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
