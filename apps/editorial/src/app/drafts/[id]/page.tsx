"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDraft, listDrafts, updateDraft, approveDraft, publishDraft, archiveDraft } from "@/lib/api";
import type { Draft } from "@/lib/types";
import { ATTRIBUTION_LABELS, STATUS_COLORS } from "@/lib/types";

export default function DraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [siblings, setSiblings] = useState<Draft[]>([]);
  const [activeTab, setActiveTab] = useState(Number(id));
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);

  // Load the batch of siblings (all variants generated together)
  useEffect(() => {
    const batchParam = searchParams.get("batch");
    if (batchParam) {
      const ids = batchParam.split(",").map(Number);
      Promise.all(ids.map((bid) => getDraft(bid))).then((results) => {
        const valid = results.filter(Boolean) as Draft[];
        setSiblings(valid);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    loadDraft(Number(id));
    setActiveTab(Number(id));
  }, [id]);

  async function loadDraft(draftId: number) {
    const d = await getDraft(draftId);
    if (d) {
      setDraft(d);
      setHeadline(d.headline);
      setBody(d.body);
      setDirty(false);
    }
  }

  async function switchTab(draftId: number) {
    setActiveTab(draftId);
    await loadDraft(draftId);
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await updateDraft(draft.id, headline, body);
      setDirty(false);
    } finally { setSaving(false); }
  }

  async function handleApprove() {
    if (!draft) return;
    setActioning(true);
    try {
      const updated = await approveDraft(draft.id, "editor");
      setDraft(updated);
    } finally { setActioning(false); }
  }

  async function handlePublish() {
    if (!draft) return;
    setActioning(true);
    try {
      const updated = await publishDraft(draft.id, "editor");
      setDraft(updated);
    } finally { setActioning(false); }
  }

  async function handleArchive() {
    if (!draft || !confirm("Archive this draft?")) return;
    setActioning(true);
    try {
      await archiveDraft(draft.id);
      router.push("/");
    } finally { setActioning(false); }
  }

  if (!draft) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  const batchIds = searchParams.get("batch");
  const batchQuery = batchIds ? `?batch=${batchIds}` : "";
  const displayDrafts = siblings.length > 0 ? siblings : [draft];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-block">← All drafts</Link>

      {/* Product info */}
      <div className="mb-5">
        <p className="text-xs text-gray-400">{draft.brand} · {draft.style_id}</p>
        <h1 className="text-xl font-semibold">{draft.product_name}</h1>
      </div>

      {/* Variant tabs */}
      {displayDrafts.length > 1 && (
        <div className="flex gap-2 mb-5">
          {displayDrafts.map((d, i) => (
            <button
              key={d.id}
              onClick={() => switchTab(d.id)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                activeTab === d.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              Variant {i + 1}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[d.status]}`}>
                {d.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Editor card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[draft.status]}`}>
            {draft.status}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
            {ATTRIBUTION_LABELS[draft.attribution]}
          </span>
          {draft.tone_notes && (
            <span className="text-xs text-gray-400 italic">"{draft.tone_notes}"</span>
          )}
        </div>

        {/* Headline */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Headline</label>
          <input
            value={headline}
            onChange={(e) => { setHeadline(e.target.value); setDirty(true); }}
            disabled={draft.status === "published" || draft.status === "archived"}
            className="w-full text-lg font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Headline…"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Body copy</label>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setDirty(true); }}
            disabled={draft.status === "published" || draft.status === "archived"}
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Editorial copy…"
          />
          <p className="text-xs text-gray-400 mt-1">{body.split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {dirty && draft.status !== "published" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
          {draft.status === "draft" && (
            <button
              onClick={handleApprove}
              disabled={actioning || dirty}
              className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              {actioning ? "…" : "Approve"}
            </button>
          )}
          {draft.status === "approved" && (
            <button
              onClick={handlePublish}
              disabled={actioning}
              className="bg-green-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-green-500 disabled:opacity-40 transition-colors"
            >
              {actioning ? "Publishing…" : "Publish to catalog"}
            </button>
          )}
          {draft.status === "published" && (
            <span className="text-sm text-green-700 font-medium">
              ✓ Published{draft.published_at ? ` · ${new Date(draft.published_at).toLocaleDateString()}` : ""}
            </span>
          )}
          {draft.status !== "published" && draft.status !== "archived" && (
            <button
              onClick={handleArchive}
              disabled={actioning}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              Archive
            </button>
          )}
          {dirty && <p className="text-xs text-amber-600">Unsaved changes — save before approving</p>}
        </div>
      </div>

      {/* Audit trail */}
      {(draft.reviewed_by || draft.published_by) && (
        <div className="mt-5 text-xs text-gray-400 space-y-1">
          {draft.reviewed_by && <p>Reviewed by <span className="font-medium">{draft.reviewed_by}</span></p>}
          {draft.published_by && <p>Published by <span className="font-medium">{draft.published_by}</span></p>}
        </div>
      )}
    </div>
  );
}
