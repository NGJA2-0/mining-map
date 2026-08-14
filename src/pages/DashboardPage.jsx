import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopoBackground from "../components/common/TopoBackground";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleSignOutRequest = () => {
    setProfileOpen(false);
    setConfirmSignOut(true);
  };

  const handleConfirmSignOut = () => {
    setConfirmSignOut(false);
    logout();
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Mining Map logo"
              className="h-8 w-8 rounded-md object-cover sm:h-9 sm:w-9"
            />
            <h1 className="font-display text-xl font-semibold sm:text-2xl">
              Mining Map
            </h1>
          </div>

          {/* Profile icon with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="profile-menu-button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((prev) => !prev)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--color-copper, #b85a29)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "0.05em",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {initials}
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-labelledby="profile-menu-button"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  minWidth: "220px",
                  background: "var(--color-surface, #fff)",
                  border: "1px solid var(--color-line, #e5e7eb)",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  overflow: "hidden",
                  animation: "dropdownIn 150ms ease-out",
                }}
              >
                <style>{`
                  @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                {/* User info section */}
                <div
                  style={{
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid var(--color-line, #e5e7eb)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "700",
                      fontSize: "14px",
                      color: "var(--color-ink, #1a1a1a)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.name}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "var(--color-ink-muted, #6b7280)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    NIC: {user?.nic}
                  </p>
                </div>

                {/* Sign out button */}
                <div style={{ padding: "8px" }}>
                  <button
                    role="menuitem"
                    onClick={handleSignOutRequest}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#dc2626",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.12s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(220,38,38,0.07)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="mb-2 flex justify-center sm:justify-end">
          <Button
            onClick={() => setOpen(true)}
            size="md"
            className="w-full sm:w-auto !text-ink"
          >
            Add / Update record
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 sm:p-10">
          <TopoBackground className="text-teal/15" />
          <div className="relative z-10 flex flex-col items-start gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Signed in as {user?.name}
            </p>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Site records
            </h2>
            <p className="max-w-md text-sm text-ink-muted">
              Log a new survey entry or update an existing site record.
            </p>

            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by TIN number"
                  className="w-full rounded-md border border-line bg-base py-2.5 pl-10 pr-4 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto !text-ink"
                onClick={() => navigate("/dashboard/map")}
              >
                View map
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Actions modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Site record"
        title="Choose an action"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => navigate("/dashboard/new")}
          >
            New
          </Button>
          <Button variant="copper" className="flex-1" onClick={() => navigate("/dashboard/update")}>
            Update
          </Button>
        </div>
      </Modal>

      {/* Sign-out confirmation modal */}
      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        eyebrow="Account"
        title="Sign out?"
      >
        <p className="mb-6 text-sm text-ink-muted">
          Are you sure you want to sign out of your account?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmSignOut(false)}
          >
            Cancel
          </Button>
          <button
            onClick={handleConfirmSignOut}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.87")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Yes, sign out
          </button>
        </div>
      </Modal>
    </div>
  );
}
