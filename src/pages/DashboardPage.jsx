import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TopoBackground from "../components/common/TopoBackground";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-copper">
              SITE-04 · Dashboard
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              Mining Map
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 sm:p-10">
          <TopoBackground className="text-teal/15" />
          <div className="relative z-10 flex flex-col items-start gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Signed in as {user?.email}
            </p>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Site records
            </h2>
            <p className="max-w-md text-sm text-ink-muted">
              Log a new survey entry or update an existing site record.
            </p>
            <Button onClick={() => setOpen(true)} size="lg" className="mt-2">
              Open actions
            </Button>
          </div>
        </div>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Site record"
        title="Choose an action"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Wire these up once the record forms exist — no navigation yet */}
          <Button variant="primary" className="flex-1">
            New
          </Button>
          <Button variant="copper" className="flex-1">
            Update
          </Button>
        </div>
      </Modal>
    </div>
  );
}
