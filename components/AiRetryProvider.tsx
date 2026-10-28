'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { AI_RETRY_EVENT, type AiRetryRequest } from '@/lib/ai-retry';
import { Button } from '@/components/ui/button';

export function AiRetryProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<AiRetryRequest[]>([]);
  const pathname = usePathname();
  useEffect(() => {
    setRequests([]);
    const pending = new Set<AiRetryRequest>();
    const receive = (event: Event) => {
      const request = (event as CustomEvent<AiRetryRequest>).detail;
      if (request.signal?.aborted) { request.resolve(false); return; }
      pending.add(request);
      const original = request.resolve;
      const abort = () => { request.resolve(false); setRequests(items => items.filter(item => item !== request)); };
      request.resolve = retry => { pending.delete(request); request.signal?.removeEventListener('abort', abort); original(retry); };
      request.signal?.addEventListener('abort', abort, { once: true });
      setRequests(items => [...items, request]);
    };
    window.addEventListener(AI_RETRY_EVENT, receive);
    return () => { window.removeEventListener(AI_RETRY_EVENT, receive); pending.forEach(request => request.resolve(false)); };
  }, [pathname]);
  const current = requests[0];
  function finish(retry: boolean) {
    if (!current) return;
    current.resolve(retry);
    setRequests(items => items.filter(item => item !== current));
  }
  return <>{children}<Dialog.Root open={Boolean(current)} onOpenChange={open => { if (!open) finish(false); }}><Dialog.Portal><Dialog.Overlay className="ai-retry-overlay" /><Dialog.Content className="ai-retry-dialog"><AlertTriangle size={24} aria-hidden="true" /><Dialog.Title>AI service unavailable</Dialog.Title><Dialog.Description>{current?.provider} could not complete this step. {current?.message} Your entered details are kept. Retry this AI step, or dismiss to return to the page.</Dialog.Description><div className="ai-retry-actions"><Button type="button" variant="outline" onClick={() => finish(false)}>Dismiss</Button><Button type="button" onClick={() => finish(true)}><RotateCcw size={16} />Retry</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root></>;
}
