'use client';

// F.3 — Complaint Queue Page
// Card grid / table toggle, sort controls, sticky status summary
// D.1 — new Socket.IO arrivals animate in with teal highlight wash

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskQueueTable } from '@/components/TaskQueueTable';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { FilterPillRow, FilterOption } from '@/components/FilterPillRow';
import { Complaint, Officer } from '@/types';
import { useSocket } from '@/components/SocketProvider';
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_FILTERS: FilterOption[] = [
  { key: 'Pending',     label: 'Pending' },
  { key: 'Assigned',    label: 'Assigned' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Resolved',    label: 'Resolved' },
];

export default function QueuePage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [officers, setOfficers]     = useState<Officer[]>(MOCK_OFFICERS);
  const [selected, setSelected]     = useState<Complaint | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['Pending', 'Assigned', 'In Progress']);
  const [newIds, setNewIds]         = useState<number[]>([]);
  const { lastEvent } = useSocket();

  useEffect(() => {
    fetch(`${API_URL}/api/complaints`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setComplaints(d);
      })
      .catch(() => {});
    fetch(`${API_URL}/api/officers`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setOfficers(d);
      })
      .catch(() => {});
  }, []);

  // D.1 — new complaint arrival
  useEffect(() => {
    if (lastEvent?.type === 'new_complaint') {
      const nc = lastEvent.data as Complaint;
      setComplaints((prev) => [nc, ...prev]);
      setNewIds((prev) => [...prev, nc.id]);
      setTimeout(() => setNewIds((prev) => prev.filter((id) => id !== nc.id)), 1600);
    }
  }, [lastEvent]);

  const safe = Array.isArray(complaints) ? complaints : MOCK_COMPLAINTS;

  const filtered = safe.filter((c) =>
    activeStatuses.length === 0 || activeStatuses.includes(c.status)
  );

  const pending    = safe.filter((c) => c.status === 'Pending').length;
  const assigned   = safe.filter((c) => c.status === 'Assigned').length;
  const inProgress = safe.filter((c) => c.status === 'In Progress').length;
  const resolved   = safe.filter((c) => c.status === 'Resolved').length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 40px' }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 'var(--fs-eyebrow)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-ink-muted)',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            VMC ACTIVE WORKFLOW
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-display-md)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            Complaint Task Queue
          </h1>
          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              fontSize: 'var(--fs-body-sm)',
              color: 'var(--color-ink-muted)',
            }}
          >
            <span>
              <strong style={{ color: 'var(--color-status-pending)', fontFamily: 'var(--font-mono)' }}>
                {pending}
              </strong>{' '}
              Pending
            </span>
            <span>·</span>
            <span>
              <strong style={{ color: 'var(--color-status-progress)', fontFamily: 'var(--font-mono)' }}>
                {assigned}
              </strong>{' '}
              Assigned
            </span>
            <span>·</span>
            <span>
              <strong style={{ color: 'var(--color-status-progress)', fontFamily: 'var(--font-mono)' }}>
                {inProgress}
              </strong>{' '}
              In Progress
            </span>
            <span>·</span>
            <span>
              <strong style={{ color: 'var(--color-status-resolved)', fontFamily: 'var(--font-mono)' }}>
                {resolved}
              </strong>{' '}
              Resolved
            </span>
          </div>
        </div>

        {/* Status filter chips */}
        <div style={{ marginBottom: 24 }}>
          <FilterPillRow
            options={STATUS_FILTERS.map((f) => ({
              ...f,
              count: safe.filter((c) => c.status === f.key).length,
            }))}
            active={activeStatuses}
            onToggle={(k) =>
              setActiveStatuses((prev) =>
                prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
              )
            }
          />
        </div>

        {/* Queue table/grid */}
        <TaskQueueTable complaints={filtered} onSelect={setSelected} newIds={newIds} />
      </motion.div>

      <ComplaintDetailDrawer
        complaint={selected}
        officers={officers}
        onClose={() => setSelected(null)}
        onUpdateStatus={async (id, status, officerId) => {
          await fetch(`${API_URL}/api/complaints/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, assigned_officer_id: officerId }),
          }).catch(() => {});
          setSelected(null);
        }}
        onResolve={async (id) => {
          await fetch(`${API_URL}/api/complaints/${id}/resolve`, { method: 'POST' }).catch(() => {});
          setSelected(null);
        }}
      />
    </>
  );
}
