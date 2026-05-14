'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function RetryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await fetch(`/api/webhooks/${id}/retry`, { method: 'POST' });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={onClick} disabled={loading}>
      {loading ? '...' : 'Reprocessar'}
    </Button>
  );
}
