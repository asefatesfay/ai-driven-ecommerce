"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDrafts, approveDraft, publishDraft, archiveDraft } from "@/lib/api";
import type { Draft, DraftStatus } from "@/lib/types";
import { ATTRIBUTION_LABELS, STATUS_COLORS } from "@/lib/types";

const STATUS_TABS: { label: string; value: DraftStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<DraftStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);

  async function load(s: DraftStatus | "") {
    setLoading(true);
    try {
      const res = await listDrafts({ status: s || undefined });
      setDrafts(res.drafts);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(status); }, [status]);

  async function handleApprove(id: number) {
    setActioning(id);
    try {
      await approveDraft(id, "editor");
      load(status);
    } finally { setActioning(null); }
  }

  async function handlePublish(id: number) {
    setActioning(id);
    try {
      await publishDraft(id, "editor");
      load(status);
    } finally { setActioning(null); }
  }

  async function handleArchive(id: number) {
    if (!confirm("Archive this draft?")) return;
    setActioning(id);
    try {
      await archiveDraft(id);
      load(status);
    } finally { setActioning(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Editorial Drafts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <Link href="/products" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          + Generate New
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              status === t.value ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 py-20 text-center">Loading…</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No drafts yet</p>
          <Link href="/products" className="text-gray-900 underline text-sm">Pick a product to generate copy →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-5 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[d.status]}`}>
                    {d.status}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                    {ATTRIBUTION_LABELS[d.attribution]}
                  </span>
                  <span className="text-xs text-gray-400">{d.brand} — {d.style_id}</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1 truncate">{d.headline || <span className="text-gray-400 italic">No headline</span>}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{d.body}</p>
                {d.tone_notes && (
                  <p className="text-xs text-gray-400 mt-2 italic">Note: {d.tone_notes}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link href={`/drafts/${d.id}`} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-center">
                  Edit
                </Link>
                {d.status === "draft" && (
                  <button
                    onClick={() => handleApprove(d.id)}
                    disabled={actioning === d.id}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {d.status === "approved" && (
                  <button
                    onClick={() => handlePublish(d.id)}
                    disabled={actioning === d.id}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    Publish
                  </button>
                )}
                {d.status !== "published" && d.status !== "archived" && (
                  <button
                    onClick={() => handleArchive(d.id)}
                    disabled={actioning === d.id}
                    className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
