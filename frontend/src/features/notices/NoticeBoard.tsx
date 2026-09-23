"use client";

import React, { useState } from "react";
import { Bell, Plus, Trash2, X, Calendar, Megaphone, ChevronRight } from "lucide-react";
import { useGetNoticesQuery, useCreateNoticeMutation, useDeleteNoticeMutation } from "./noticeApi";
import { useAppSelector } from "@/store/hooks";
import { NoticeResponse } from "@/types/notice";

export function NoticeBoard() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const { data: noticesData, isLoading } = useGetNoticesQuery({ limit: 5 });
  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const [selectedNotice, setSelectedNotice] = useState<NoticeResponse | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setErrorMsg(null);
    try {
      await createNotice({ title: title.trim(), content: content.trim() }).unwrap();
      setTitle("");
      setContent("");
      setIsAddOpen(false);
    } catch (err: unknown) {
      setErrorMsg((err as { data?: { detail?: string } })?.data?.detail || "Failed to create notice.");
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteNotice(id).unwrap();
      if (selectedNotice?.id === id) setSelectedNotice(null);
    } catch {
      alert("Failed to delete notice.");
    }
  };

  const notices = noticesData?.items || [];

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Styled like Rajasthan Legal Metrology / Gov Portals */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-xs ring-1 ring-white/20">
            <Megaphone className="h-5 w-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-white drop-shadow-xs">
              Latest News And Updates
            </h2>
            <p className="text-[11px] text-blue-100 font-medium">
              Official circulars and notifications
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Notice
          </button>
        )}
      </div>

      {/* Content List */}
      <div className="p-4 flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[360px]">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No departmental notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="group py-3 px-2 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/80 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 group-hover:scale-125 transition-transform" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {notice.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    {notice.publisher_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{notice.publisher_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(notice.id, e)}
                    className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50/90 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 flex items-center gap-1">
          <Bell className="h-3 w-3 text-blue-500" />
          Stay updated with legal metrology directives
        </span>
        <button
          onClick={() => notices.length > 0 && setSelectedNotice(notices[0])}
          className="font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          Read More →
        </button>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="inline-block rounded-full bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 text-[10px] mb-1">
                  OFFICIAL NOTICE
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedNotice.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Published {new Date(selectedNotice.created_at).toLocaleString()}
                  {selectedNotice.publisher_name && ` by ${selectedNotice.publisher_name}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 text-xs leading-relaxed text-slate-700 max-h-72 overflow-y-auto whitespace-pre-wrap">
              {selectedNotice.content}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Notice Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Publish Departmental Notice</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Quarterly Metrology Inspections"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Announcement Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide comprehensive details, instructions, or statutory dates..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isCreating ? "Publishing..." : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
