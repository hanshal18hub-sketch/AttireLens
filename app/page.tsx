"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Preview = { url: string; name: string } | null;

function usePreview(file: File | null): Preview {
  const [preview, setPreview] = useState<Preview>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ url, name: file.name });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview;
}

function UploadCard({
  title,
  hint,
  accept,
  file,
  onChange,
  icon,
}: {
  title: string;
  hint: string;
  accept: string;
  file: Preview;
  onChange: (file: File | null) => void;
  icon: string;
}) {
  const inputId = title.toLowerCase().replaceAll(" ", "-");
  return (
    <label className={`upload-card ${file ? "has-file" : ""}`} htmlFor={inputId}>
      {file ? (
        <img src={file.url} alt={`${title} preview`} />
      ) : (
        <div className="upload-empty">
          <span className="upload-icon" aria-hidden="true">{icon}</span>
          <strong>{title}</strong>
          <span>{hint}</span>
        </div>
      )}
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.files?.[0] ?? null)
        }
      />
      {file && <span className="replace-chip">Change photo</span>}
    </label>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"online" | "store">("online");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"idle" | "ready" | "preview">("idle");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const person = usePreview(personFile);
  const garment = usePreview(garmentFile);
  const canPreview = Boolean(person && garment);

  useEffect(() => {
    setStage(canPreview ? "ready" : "idle");
  }, [canPreview]);

  const status = useMemo(() => {
    if (stage === "preview") return "Concept preview ready";
    if (canPreview) return "Both photos are ready";
    return "Add two photos to begin";
  }, [canPreview, stage]);

  function clearSession() {
    setPersonFile(null);
    setGarmentFile(null);
    setStage("idle");
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a href="#top" className="brand" aria-label="AttireLens home">
          <span className="brand-mark">A</span>
          <span>AttireLens</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <button className="link-button" onClick={() => setPrivacyOpen(true)}>Privacy</button>
        </div>
        <span className="private-badge"><span /> Private by design</span>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span>✦</span> Asian wear, seen through your lens</div>
        <h1>See the whole look.<br /><em>Before the occasion.</em></h1>
        <p className="hero-copy">
          Try South Asian and Asian occasion wear or home wear from any shop,
          product page, or camera roll—while your photos stay in this session.
        </p>

        <div className="tryon-card">
          <div className="mode-tabs" role="tablist" aria-label="Shopping mode">
            <button className={mode === "online" ? "active" : ""} onClick={() => setMode("online")}>
              <span>⌁</span> Shopping online
            </button>
            <button className={mode === "store" ? "active" : ""} onClick={() => setMode("store")}>
              <span>⌂</span> In a store
            </button>
          </div>

          <div className="workspace">
            <div className="upload-column">
              <div className="step-label"><b>1</b><span><strong>Add yourself</strong> A clear, full-body photo works best.</span></div>
              <UploadCard
                title="Choose your photo"
                hint="JPG, PNG or HEIC"
                accept="image/*"
                file={person}
                onChange={setPersonFile}
                icon="◎"
              />
            </div>
            <div className="plus" aria-hidden="true">+</div>
            <div className="upload-column">
              <div className="step-label"><b>2</b><span><strong>{mode === "online" ? "Add the outfit" : "Photograph the outfit"}</strong> {mode === "online" ? "Use any product or saved image." : "Lay it flat or capture it on display."}</span></div>
              <UploadCard
                title={mode === "online" ? "Choose outfit photo" : "Open camera or gallery"}
                hint="A front-facing view works best"
                accept="image/*"
                file={garment}
                onChange={setGarmentFile}
                icon={mode === "online" ? "◇" : "◉"}
              />
            </div>

            <div className="action-panel">
              <div className="status"><i className={canPreview ? "ready" : ""} />{status}</div>
              <button
                className="primary-button"
                disabled={!canPreview}
                onClick={() => setStage("preview")}
              >
                Create my preview <span>→</span>
              </button>
              <small>Nothing is uploaded in this prototype.</small>
            </div>
          </div>

          {stage === "preview" && person && garment && (
            <div className="result" aria-live="polite">
              <div className="result-copy">
                <span className="result-kicker">FIRST LOOK</span>
                <h2>Your private fitting session</h2>
                <p>
                  The photo pairing works locally. The next product milestone will
                  replace this concept composition with a consent-safe AI try-on model.
                </p>
                <div className="insights">
                  <div><span>Colour harmony</span><strong>Analysis planned</strong></div>
                  <div><span>Physical fit</span><strong>Measurements required</strong></div>
                  <div><span>Privacy</span><strong className="safe">Local session only</strong></div>
                </div>
                <button className="secondary-button" onClick={clearSession}>Delete this session</button>
              </div>
              <div className="concept-canvas">
                <img className="person-image" src={person.url} alt="Your uploaded photo" />
                <div className="garment-inset">
                  <img src={garment.url} alt="Selected outfit" />
                  <span>Selected look</span>
                </div>
                <span className="concept-label">Concept preview</span>
              </div>
            </div>
          )}
        </div>

        <div className="trust-row">
          <span><b>✓</b> No account needed</span>
          <span><b>✓</b> No photo storage</span>
          <span><b>✓</b> Never used for training</span>
        </div>
      </section>

      <section className="how shell" id="how">
        <div>
          <span className="section-kicker">DRESS WITH CULTURAL CONTEXT</span>
          <h2>Every layer.<br />Your whole look.</h2>
        </div>
        <div className="feature-grid">
          <article><b>01</b><h3>Respect every detail</h3><p>Preview kurtas, suits, sarees, lehengas, hanbok, kebaya and layered home wear with their identity intact.</p></article>
          <article><b>02</b><h3>Style the complete look</h3><p>Explore colour harmony, draping, layers and accessories without judging your body.</p></article>
          <article><b>03</b><h3>Know the confidence</h3><p>Visual styling and measured fit are clearly separated, never blurred.</p></article>
          <article><b>04</b><h3>Leave no trace</h3><p>Close or clear your session and the local photo previews disappear.</p></article>
        </div>
      </section>

      <footer className="shell">
        <div className="brand"><span className="brand-mark">A</span><span>AttireLens</span></div>
        <p>A private place to see your complete look.</p>
        <button className="link-button" onClick={() => setPrivacyOpen(true)}>Read our privacy promise →</button>
      </footer>

      {privacyOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPrivacyOpen(false)}>
          <section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close privacy details" onClick={() => setPrivacyOpen(false)}>×</button>
            <span className="section-kicker">THE ATTIRELENS PROMISE</span>
            <h2 id="privacy-title">Your body is not our data.</h2>
            <p>This prototype creates temporary image previews inside your browser. It has no upload endpoint, account system, analytics, or database.</p>
            <ul>
              <li><b>Session-only:</b> previews live in browser memory and disappear when cleared or closed.</li>
              <li><b>No training:</b> customer photos will never enter model training without separate, explicit consent.</li>
              <li><b>Honest language:</b> a generated image is a style preview—not proof that a garment physically fits.</li>
              <li><b>Production requirement:</b> any future AI provider must contractually support zero retention.</li>
            </ul>
            <button className="primary-button" onClick={() => setPrivacyOpen(false)}>I understand</button>
          </section>
        </div>
      )}
    </main>
  );
}
