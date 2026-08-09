"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDraft, generateDrafts, updateDraft, approveDraft, publishDraft, archiveDraft } from "@/lib/api";
import type { Draft } from "@/lib/types";
import { ATTRIBUTION_LABELS } from "@/lib/types";

export default function DraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadDraft(Number(id));
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
      router.push("/");
    } finally { setActioning(false); }
  }

  async function handleRefine() {
    if (!draft || !feedback.trim()) return;
    setRegenerating(true);
    try {
      await archiveDraft(draft.id);
      const result = await generateDrafts({
        style_id: draft.style_id,
        attribution: draft.attribution,
        themes: draft.themes,
        price_range: draft.price_range,
        max_words: 60,
        num_variants: 1,
        feedback: feedback.trim(),
        previous_headline: draft.headline,
        previous_body: draft.body,
      });
      if (result.drafts?.length) {
        setFeedback("");
        router.push(`/drafts/${result.drafts[0].id}`);
      }
    } catch (err) {
      alert(`Refinement failed: ${(err as Error).message}`);
    } finally { setRegenerating(false); }
  }

  if (!draft) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  const isEditable = draft.status === "draft" || draft.status === "approved";

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← All drafts</Link>

      {/* Product context */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{draft.brand} · {draft.style_id}</p>
          <h1 className="text-lg font-semibold leading-tight">{draft.product_name}</h1>
          <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
            {ATTRIBUTION_LABELS[draft.attribution]}
          </span>
        </div>
      </div>

      {/* Copy card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {draft.tone_notes && (
          <p className="text-xs text-gray-400 italic border-l-2 border-gray-200 pl-3">
            "{draft.tone_notes}"
          </p>
        )}

        {/* Headline */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Headline</label>
          {isEditable ? (
            <input
              value={headline}
              onChange={(e) => { setHeadline(e.target.value); setDirty(true); }}
              className="w-full text-lg font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Headline…"
            />
          ) : (
            <p className="text-lg font-semibold px-1">{headline}</p>
          )}
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Body copy</label>
          {isEditable ? (
            <>
              <textarea
                value={body}
                onChange={(e) => { setBody(e.target.value); setDirty(true); }}
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                placeholder="Editorial copy…"
              />
              <p className="text-xs text-gray-400 mt-1">{body.split(/\s+/).filter(Boolean).length} words</p>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-gray-700 px-1">{body}</p>
          )}
        </div>

        {/* Actions */}
        {draft.status === "published" ? (
          <div className="pt-1">
            <p className="text-sm text-green-700 font-medium">
              ✓ Published{draft.published_at ? ` · ${new Date(draft.published_at).toLocaleDateString()}` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">This copy is live in the catalog.</p>
          </div>
        ) : draft.status === "archived" ? (
          <p className="text-sm text-gray-400 pt-1">This draft was archived.</p>
        ) : (
          <div className="pt-1 space-y-3">
            {dirty && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <p className="text-xs text-amber-600">Save before approving</p>
              </div>
            )}

            {!dirty && (
              <div className="flex items-center gap-3 flex-wrap">
                {draft.status === "draft" && (
                  <div className="space-y-3 w-full">
                    <button
                      onClick={handleApprove}
                      disabled={actioning}
                      className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      {actioning ? "…" : "Use this copy"}
                    </button>

                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                        Give feedback to refine
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                          placeholder="e.g. make it shorter, focus on warmth, more playful tone…"
                          disabled={regenerating}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40"
                        />
                        <button
                          onClick={handleRefine}
                          disabled={!feedback.trim() || regenerating}
                          className="border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl hover:border-gray-400 disabled:opacity-40 transition-colors shrink-0"
                        >
                          {regenerating ? "…" : "Refine ↵"}
                        </button>
                      </div>
                    </div>
                  </div>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit trail */}
      {(draft.reviewed_by || draft.published_by) && (
        <div className="mt-5 text-xs text-gray-400 space-y-1">
          {draft.reviewed_by && <p>Approved by <span className="font-medium">{draft.reviewed_by}</span></p>}
          {draft.published_by && <p>Published by <span className="font-medium">{draft.published_by}</span></p>}
        </div>
      )}
    </div>
  );
}
