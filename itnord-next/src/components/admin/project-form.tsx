"use client";

import { useMemo, useState } from "react";

type LocaleKey = "en" | "fr" | "ar";
type TranslationDraft = { title: string; description: string };
type ImageDraft = { id: string; url: string };

export type ProjectFormInitial = {
  id?: string;
  slug?: string;
  category?: string | null;
  isPublished?: boolean;
  translations?: Partial<Record<LocaleKey, TranslationDraft>>;
  images?: ImageDraft[];
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Upload failed");
  }
  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error("Upload did not return url");
  return json.url;
}

export function ProjectForm({
  locale,
  initial,
}: {
  locale: LocaleKey;
  initial?: ProjectFormInitial;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  const [tEn, setTEn] = useState<TranslationDraft>({
    title: initial?.translations?.en?.title ?? "",
    description: initial?.translations?.en?.description ?? "",
  });
  const [tFr, setTFr] = useState<TranslationDraft>({
    title: initial?.translations?.fr?.title ?? "",
    description: initial?.translations?.fr?.description ?? "",
  });
  const [tAr, setTAr] = useState<TranslationDraft>({
    title: initial?.translations?.ar?.title ?? "",
    description: initial?.translations?.ar?.description ?? "",
  });

  const [images, setImages] = useState<ImageDraft[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const canAutoSlug = useMemo(() => !initial?.id, [initial?.id]);

  async function onPickFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      if (initial?.id) {
        const res = await fetch(`/api/admin/projects/${initial.id}/images`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as { image?: { id: string; url: string } };
        if (json.image) setImages((prev) => [{ id: json.image!.id, url: json.image!.url }, ...prev]);
      } else {
        setImages((prev) => [{ id: `tmp-${Date.now()}`, url }, ...prev]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function onRemoveImage(id: string) {
    setError(null);
    if (initial?.id && !id.startsWith("tmp-")) {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function onSubmit() {
    setSaving(true);
    setError(null);
    try {
      const finalSlug = slug.trim() || slugify(tEn.title || tFr.title || tAr.title || "project");
      if (!finalSlug) throw new Error("Slug is required");
      if (!tEn.title.trim() || !tEn.description.trim()) throw new Error("EN title/description required");
      if (!tFr.title.trim() || !tFr.description.trim()) throw new Error("FR title/description required");
      if (!tAr.title.trim() || !tAr.description.trim()) throw new Error("AR title/description required");

      if (canAutoSlug && !slug.trim()) setSlug(finalSlug);

      const payload = {
        slug: finalSlug,
        category: category.trim() || undefined,
        isPublished,
        translations: [
          { locale: "en", title: tEn.title.trim(), description: tEn.description.trim() },
          { locale: "fr", title: tFr.title.trim(), description: tFr.description.trim() },
          { locale: "ar", title: tAr.title.trim(), description: tAr.description.trim() },
        ],
      };

      if (!initial?.id) {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as { project?: { id: string } };
        const newId = json.project?.id;
        if (!newId) throw new Error("Project created but no id returned");

        // Attach any pre-uploaded images (tmp) to the new project.
        const tmpUrls = images.filter((i) => i.id.startsWith("tmp-")).map((i) => i.url);
        await Promise.all(
          tmpUrls.map(async (url) => {
            const r = await fetch(`/api/admin/projects/${newId}/images`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url }),
            });
            if (!r.ok) throw new Error(await r.text());
          }),
        );

        window.location.href = `/${locale}/admin/projects/${newId}/edit`;
        return;
      }

      const res = await fetch(`/api/admin/projects/${initial.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card" style={{ display: "grid", gap: "1rem" }}>
      {error ? <p className="muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Slug</span>
          <input
            className="admin-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-project"
          />
        </label>

        <label className="admin-field">
          <span className="admin-label">Category</span>
          <input
            className="admin-input"
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="networking"
          />
        </label>

        <label className="admin-field" style={{ alignSelf: "end" }}>
          <span className="admin-label">Published</span>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      </div>

      <div className="admin-3col">
        <div className="admin-card">
          <h3 className="h3">English</h3>
          <label className="admin-field">
            <span className="admin-label">Title</span>
            <input className="admin-input" value={tEn.title} onChange={(e) => setTEn({ ...tEn, title: e.target.value })} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Description</span>
            <textarea className="admin-textarea" rows={6} value={tEn.description} onChange={(e) => setTEn({ ...tEn, description: e.target.value })} />
          </label>
        </div>

        <div className="admin-card">
          <h3 className="h3">Français</h3>
          <label className="admin-field">
            <span className="admin-label">Titre</span>
            <input className="admin-input" value={tFr.title} onChange={(e) => setTFr({ ...tFr, title: e.target.value })} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Description</span>
            <textarea className="admin-textarea" rows={6} value={tFr.description} onChange={(e) => setTFr({ ...tFr, description: e.target.value })} />
          </label>
        </div>

        <div className="admin-card">
          <h3 className="h3">العربية</h3>
          <label className="admin-field">
            <span className="admin-label">العنوان</span>
            <input className="admin-input" value={tAr.title} onChange={(e) => setTAr({ ...tAr, title: e.target.value })} />
          </label>
          <label className="admin-field">
            <span className="admin-label">الوصف</span>
            <textarea className="admin-textarea" rows={6} value={tAr.description} onChange={(e) => setTAr({ ...tAr, description: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="h3">Images</h3>
        <div
          className="admin-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void onPickFile(f);
          }}
        >
          <p className="muted">{uploading ? "Uploading..." : "Drag & drop an image here, or click to choose"}</p>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickFile(f);
            }}
          />
        </div>

        <div className="admin-image-grid">
          {images.map((img) => (
            <div key={img.id} className="admin-image-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void onRemoveImage(img.id)}>
                Remove
              </button>
            </div>
          ))}
          {images.length === 0 ? <p className="muted">No images yet.</p> : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="button" className="btn btn-primary btn-md" onClick={() => void onSubmit()} disabled={saving || uploading}>
          {saving ? "Saving..." : initial?.id ? "Save changes" : "Create project"}
        </button>
      </div>
    </div>
  );
}

