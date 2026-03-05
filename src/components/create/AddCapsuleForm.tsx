"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import type { CapsuleType, CapsuleColor, CreateCapsuleInput } from "@/lib/types";
import { CAPSULE_COLORS } from "@/lib/types";
import { uploadImage } from "@/lib/supabase";

interface AddCapsuleFormProps {
  machineId: string;
  onAdd: (input: CreateCapsuleInput) => void;
}

const TYPE_OPTIONS: { type: CapsuleType; label: string; emoji: string; desc: string }[] = [
  { type: "text",  label: "Message", emoji: "✉️", desc: "A personal note or letter" },
  { type: "quote", label: "Quote",   emoji: "💬", desc: "An inspiring or meaningful quote" },
  { type: "image", label: "Image",   emoji: "🖼️", desc: "A photo with an optional caption" },
  { type: "link",  label: "Link",    emoji: "🔗", desc: "A URL — music, video, webpage…" },
];

const COLORS = Object.keys(CAPSULE_COLORS) as CapsuleColor[];

// Explicit hex map — avoids Tailwind purging dynamic class names
const COLOR_HEX: Record<CapsuleColor, string> = {
  blush:    "#f89898",
  mint:     "#6fcf97",
  lavender: "#b9a7ef",
  peach:    "#f7bc8a",
  sky:      "#87c9f4",
};

type ImageMode = "upload" | "url";
type UploadState = "idle" | "uploading" | "done" | "error";

export function AddCapsuleForm({ machineId, onAdd }: AddCapsuleFormProps) {
  const [type, setType]   = useState<CapsuleType>("text");
  const [color, setColor] = useState<CapsuleColor>("blush");

  // text
  const [message, setMessage] = useState("");
  // quote
  const [quoteText, setQuoteText]     = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  // image
  const [imageMode, setImageMode]       = useState<ImageMode>("upload");
  const [imageUrl, setImageUrl]         = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploadState, setUploadState]   = useState<UploadState>("idle");
  const [uploadError, setUploadError]   = useState("");
  const [isDragging, setIsDragging]     = useState(false);
  // crop state
  const [cropSrc, setCropSrc]           = useState<string>("");   // object URL for the raw file
  const [crop, setCrop]                 = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping]     = useState(false);
  const imgRef                          = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // link
  const [linkUrl, setLinkUrl]         = useState("");
  const [linkLabel, setLinkLabel]     = useState("");
  const [linkPreview, setLinkPreview] = useState("");

  function resetFields() {
    setMessage("");
    setQuoteText(""); setQuoteAuthor("");
    setImageUrl(""); setImageCaption("");
    setUploadState("idle"); setUploadError("");
    setLinkUrl(""); setLinkLabel(""); setLinkPreview("");
  }

  // ── Image upload ──────────────────────────────────────────

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5 MB.");
      return;
    }
    setUploadError("");
    // Show crop dialog instead of uploading directly
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCropping(true);
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    // Default to a 1:1 centered crop
    const c = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
      width,
      height,
    );
    setCrop(c);
  }, []);

  async function applyCrop() {
    if (!imgRef.current || !completedCrop) {
      // No crop drawn — just upload the original
      await uploadFromSrc(cropSrc);
      return;
    }
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth  / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width  = completedCrop.width  * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width  * scaleX,
      completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height,
    );
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      await uploadFromSrc(null, croppedFile);
    }, "image/jpeg", 0.9);
  }

  async function uploadFromSrc(src: string | null, file?: File) {
    setIsCropping(false);
    if (src) URL.revokeObjectURL(src);
    setCropSrc("");
    setUploadState("uploading");
    try {
      let uploadFile = file;
      if (!uploadFile && src) {
        const res = await fetch(src);
        const blob = await res.blob();
        uploadFile = new File([blob], "image.jpg", { type: blob.type });
      }
      if (!uploadFile) throw new Error("No file to upload.");
      const url = await uploadImage(uploadFile);
      setImageUrl(url);
      setUploadState("done");
    } catch (err) {
      setUploadState("error");
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed: ${msg}`);
    }
  }

  function cancelCrop() {
    URL.revokeObjectURL(cropSrc);
    setCropSrc("");
    setIsCropping(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearUpload() {
    setImageUrl("");
    setUploadState("idle");
    setUploadError("");
    setCropSrc("");
    setIsCropping(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Validation & submit ───────────────────────────────────

  function isValid() {
    switch (type) {
      case "text":  return message.trim().length > 0;
      case "quote": return quoteText.trim().length > 0;
      case "image": return imageUrl.trim().length > 0;
      case "link":  return linkUrl.trim().length > 0 && linkLabel.trim().length > 0;
    }
  }

  function buildContent() {
    switch (type) {
      case "text":  return { message };
      case "quote": return { text: quoteText, author: quoteAuthor };
      case "image": return { url: imageUrl, caption: imageCaption };
      case "link": {
        let url = linkUrl.trim();
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        return { url, label: linkLabel, preview: linkPreview };
      }
    }
  }

  function handleAdd() {
    if (!isValid()) return;
    onAdd({ machine_id: machineId, type, content: buildContent(), color });
    resetFields();
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div>
        <p className="pixel-label mb-2">Capsule type</p>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setType(opt.type)}
              className="text-left press transition-all"
              style={{
                border: `3px solid #3d1a35`,
                boxShadow: type === opt.type ? "none" : "3px 3px 0 0 #3d1a35",
                transform: type === opt.type ? "translate(3px,3px)" : undefined,
                background: type === opt.type ? "#f0b4ca" : "#fef0f8",
                padding: "10px 12px",
              }}
            >
              <span className="text-lg">{opt.emoji}</span>
              <p className="font-pixel text-pixel-dark mt-1" style={{ fontSize: "0.45rem" }}>{opt.label}</p>
              <p className="text-pixel-dark opacity-60 mt-0.5" style={{ fontSize: "0.6rem", fontFamily: "sans-serif" }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content fields */}
      <AnimatePresence mode="wait">
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* ── Text ── */}
          {type === "text" && (
            <div>
              <label className="pixel-label block mb-1.5">Your message</label>
              <textarea
                rows={5}
                maxLength={1000}
                placeholder="Write something heartfelt… ♥"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pixel-input w-full resize-none"
              />
              <p className="text-pixel-dark opacity-40 text-right mt-1" style={{ fontSize: "0.55rem", fontFamily: "sans-serif" }}>{message.length}/1000</p>
            </div>
          )}

          {/* ── Quote ── */}
          {type === "quote" && (
            <>
              <div>
                <label className="pixel-label block mb-1.5">Quote</label>
                <textarea
                  rows={3}
                  maxLength={400}
                  placeholder="e.g. You are enough, always."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="pixel-input w-full resize-none"
                />
              </div>
              <div>
                <label className="pixel-label block mb-1.5">Author (optional)</label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Rumi"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>
            </>
          )}

          {/* ── Image ── */}
          {type === "image" && (
            <>
              {/* Mode tabs */}
              <div className="flex gap-2">
                {(["upload", "url"] as ImageMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setImageMode(m); clearUpload(); setImageUrl(""); }}
                    className="flex-1 py-2 press font-pixel text-pixel-dark transition-all"
                    style={{
                      fontSize: "0.5rem",
                      border: "3px solid #3d1a35",
                      boxShadow: imageMode === m ? "none" : "3px 3px 0 0 #3d1a35",
                      transform: imageMode === m ? "translate(3px,3px)" : undefined,
                      background: imageMode === m ? "#f0b4ca" : "#fef0f8",
                    }}
                  >
                    {m === "upload" ? "📁 Upload" : "🔗 Paste URL"}
                  </button>
                ))}
              </div>

              {/* Upload mode */}
              {imageMode === "upload" && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />

                  {uploadState === "done" && imageUrl ? (
                    /* Preview */
                    <div className="relative overflow-hidden aspect-video" style={{ border: "3px solid #3d1a35" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="absolute top-2 right-2 font-pixel text-pixel-light px-3 py-1.5 press"
                        style={{ fontSize: "0.45rem", background: "#3d1a35", border: "2px solid #fef0f8" }}
                      >
                        Change photo
                      </button>
                    </div>
                  ) : (
                    /* Drop zone */
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      disabled={uploadState === "uploading"}
                      className="w-full py-8 px-4 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                      style={{
                        border: `3px dashed ${isDragging ? "#f0b4ca" : "#3d1a35"}`,
                        background: isDragging ? "#f0b4ca33" : "#fef0f8",
                        opacity: uploadState === "uploading" ? 0.6 : 1,
                        cursor: uploadState === "uploading" ? "wait" : "pointer",
                      }}
                    >
                      {uploadState === "uploading" ? (
                        <>
                          <motion.div
                            className="w-8 h-8 border-4 border-pixel-pink border-t-pixel-dark"
                            style={{ borderRadius: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.5rem" }}>Uploading…</p>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl">📸</span>
                          <div className="text-center">
                            <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.5rem" }}>Click to choose a photo</p>
                            <p className="text-pixel-dark opacity-60 mt-1" style={{ fontSize: "0.65rem", fontFamily: "sans-serif" }}>or drag and drop here</p>
                          </div>
                          <p className="text-pixel-dark opacity-40" style={{ fontSize: "0.6rem", fontFamily: "sans-serif" }}>JPG, PNG, GIF, WebP · max 5 MB</p>
                        </>
                      )}
                    </button>
                  )}

                  {uploadError && (
                    <p className="text-pixel-dark px-3 py-2" style={{ fontSize: "0.6rem", fontFamily: "sans-serif", background: "#f8989833", border: "2px solid #e05050" }}>{uploadError}</p>
                  )}
                </div>
              )}

              {/* URL mode */}
              {imageMode === "url" && (
                <div>
                  <label className="pixel-label block mb-1.5">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="pixel-input w-full font-mono"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="pixel-label block mb-1.5">Caption (optional)</label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Remember this day?"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>
            </>
          )}

          {/* ── Link ── */}
          {type === "link" && (
            <>
              <div>
                <label className="pixel-label block mb-1.5">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="pixel-input w-full font-mono"
                />
              </div>
              <div>
                <label className="pixel-label block mb-1.5">Label <span className="text-pixel-pink2">*</span></label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Our song 🎵"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>
              <div>
                <label className="pixel-label block mb-1.5">Short description (optional)</label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. This song always makes me think of you"
                  value={linkPreview}
                  onChange={(e) => setLinkPreview(e.target.value)}
                  className="pixel-input w-full"
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Color picker */}
      <div>
        <p className="pixel-label mb-2">Capsule color</p>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              style={{
                background: COLOR_HEX[c],
                width: 36, height: 36,
                border: color === c ? "3px solid #3d1a35" : "3px solid transparent",
                boxShadow: color === c ? "3px 3px 0 0 #3d1a35" : "none",
                transform: color === c ? "none" : "translate(3px,3px)",
                transition: "all 0.1s",
              }}
            />
          ))}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleAdd}
        disabled={!isValid() || uploadState === "uploading"}
        className={`pixel-btn w-full ${
          isValid() && uploadState !== "uploading"
            ? "bg-pixel-mint text-pixel-dark cursor-pointer"
            : "bg-pixel-bg text-pixel-dark cursor-not-allowed opacity-50"
        }`}
        whileTap={isValid() ? { scale: 0.97 } : {}}
      >
        + ADD  CAPSULE
      </motion.button>

      {/* ── Crop modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {isCropping && cropSrc && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-pixel-dark2/60" style={{ backdropFilter: "blur(3px)" }} />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md bg-pixel-light"
              style={{ border: "4px solid #3d1a35", boxShadow: "8px 8px 0 0 #3d1a35" }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              {/* Header */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: "#f89898", borderBottom: "4px solid #3d1a35" }}
              >
                <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.6rem" }}>
                  CROP  IMAGE
                </p>
                <button
                  onClick={cancelCrop}
                  className="font-pixel text-pixel-dark hover:opacity-70"
                  style={{ fontSize: "0.6rem" }}
                >
                  ✕
                </button>
              </div>

              {/* Crop area */}
              <div className="p-4 flex justify-center" style={{ maxHeight: "55vh", overflowY: "auto" }}>
                <ReactCrop
                  crop={crop}
                  onChange={(_, pct) => setCrop(pct)}
                  onComplete={(c) => setCompletedCrop(c)}
                  style={{ maxWidth: "100%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={cropSrc}
                    alt="Crop preview"
                    style={{ maxHeight: "50vh", display: "block" }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>

              {/* Aspect ratio shortcuts */}
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {[
                  { label: "1:1", aspect: 1 },
                  { label: "4:3", aspect: 4 / 3 },
                  { label: "16:9", aspect: 16 / 9 },
                  { label: "Free", aspect: undefined },
                ].map(({ label, aspect }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (!imgRef.current) return;
                      const { naturalWidth: w, naturalHeight: h } = imgRef.current;
                      if (aspect) {
                        setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 80 }, aspect, w, h), w, h));
                      } else {
                        setCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
                      }
                    }}
                    className="pixel-btn text-pixel-dark bg-pixel-pink hover:bg-pixel-pink2"
                    style={{ fontSize: "0.5rem", padding: "4px 10px" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div
                className="px-4 py-3 flex gap-3"
                style={{ borderTop: "3px solid #3d1a35" }}
              >
                <button
                  type="button"
                  onClick={cancelCrop}
                  className="pixel-btn flex-1 bg-pixel-light text-pixel-dark hover:bg-pixel-pink"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="pixel-btn flex-1 bg-pixel-purple text-pixel-light hover:opacity-90"
                >
                  ✓  USE  CROP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
