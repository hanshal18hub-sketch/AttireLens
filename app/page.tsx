"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Preview = { url: string; name: string } | null;
type Stage = "idle" | "ready" | "preview";

const regions = [
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Central Asia",
  "West Asia, Iran and Iraq",
  "Arabian Peninsula and wider Middle East",
  "Cross-cultural or contemporary",
];

const garmentExamples: Record<string, string> = {
  "South Asia": "saree, lehenga, salwar kameez, kurta, sherwani",
  "Southeast Asia": "kebaya, baju kurung, barong, sinh, ao dai",
  "East Asia": "hanbok, kimono, hanfu, qipao, changshan",
  "Central Asia": "chapan, atlas dress, embroidered tunic and layered coat",
  "West Asia, Iran and Iraq": "manteau, abaya, kaftan, dishdasha and embroidered dress",
  "Arabian Peninsula and wider Middle East": "abaya, thobe, jalabiya, kaftan and bisht",
  "Cross-cultural or contemporary": "fusion sets, modest occasion wear and elevated home wear",
};

const drapeChoices = [
  "Natural / as photographed",
  "Over one shoulder",
  "Across both shoulders",
  "Head covering",
  "Wrapped or closed",
  "Open outer layer",
];

function usePreview(file: File | null): Preview {
  const [preview, setPreview] = useState<Preview>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview({ url, name: file.name });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return preview;
}

function UploadCard({ id, title, hint, file, onChange, optional = false }: {
  id: string;
  title: string;
  hint: string;
  file: Preview;
  onChange: (file: File | null) => void;
  optional?: boolean;
}) {
  return (
    <label className={`upload-card compact ${file ? "has-file" : ""}`} htmlFor={id}>
      {file ? <img src={file.url} alt={`${title}: ${file.name}`} /> : (
        <span className="upload-empty">
          <span className="upload-icon" aria-hidden="true">+</span>
          <strong>{title}{optional && <small> Optional</small>}</strong>
          <span>{hint}</span>
        </span>
      )}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.files?.[0] ?? null)} />
      {file && <span className="replace-chip">Change</span>}
    </label>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"online" | "store">("online");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [accessoryFile, setAccessoryFile] = useState<File | null>(null);
  const [region, setRegion] = useState(regions[0]);
  const [drape, setDrape] = useState(drapeChoices[0]);
  const [stage, setStage] = useState<Stage>("idle");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const person = usePreview(personFile);
  const main = usePreview(mainFile);
  const layer = usePreview(layerFile);
  const accessory = usePreview(accessoryFile);
  const canPreview = Boolean(person && main);

  useEffect(() => setStage(canPreview ? "ready" : "idle"), [canPreview]);
  useEffect(() => {
    if (!privacyOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setPrivacyOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [privacyOpen]);

  const description = useMemo(() => {
    const pieces = [main && "main garment", layer && "draped or outer layer", accessory && "accessory"].filter(Boolean).join(", ");
    return `A concept look in the ${region} context using ${pieces || "a main garment"}. Draping preference: ${drape}. The prototype preserves your uploaded source images locally but does not yet infer colour, embroidery, fabric behaviour or physical fit.`;
  }, [region, drape, main, layer, accessory]);

  function clearSession() {
    speechSynthesis?.cancel();
    setPersonFile(null); setMainFile(null); setLayerFile(null); setAccessoryFile(null);
    setStage("idle"); setShareMessage("");
  }

  function speakDescription() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(description));
  }

  async function copyReviewNote() {
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString();
    const note = `AttireLens private review note\n${description}\nReview by: ${expiry}\nNo personal photo is included in this note.`;
    await navigator.clipboard.writeText(note);
    setShareMessage("Private text-only review note copied. No image left this device.");
  }

  return (
    <main>
      <a className="skip-link" href="#fitting-room">Skip to fitting room</a>
      <nav className="nav shell" aria-label="Main navigation">
        <a href="#top" className="brand" aria-label="AttireLens home"><span className="brand-mark">A</span><span>AttireLens</span></a>
        <div className="nav-links"><a href="#how">How it works</a><button className="link-button" onClick={() => setPrivacyOpen(true)}>Privacy</button></div>
        <span className="private-badge"><span /> Private by design</span>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">Asian and West Asian wear, seen through your lens</div>
        <h1>Every layer.<br /><em>Your whole story.</em></h1>
        <p className="hero-copy">Try occasion wear and home wear across South, Southeast, East, Central and West Asia, Iran, Iraq and the wider Middle East - while your photos remain in this browser session.</p>

        <div className="tryon-card" id="fitting-room">
          <div className="mode-tabs" role="group" aria-label="Shopping mode">
            <button aria-pressed={mode === "online"} className={mode === "online" ? "active" : ""} onClick={() => setMode("online")}>Shopping online</button>
            <button aria-pressed={mode === "store"} className={mode === "store" ? "active" : ""} onClick={() => setMode("store")}>In a store</button>
          </div>

          <div className="context-row">
            <label><span>Cultural context</span><select value={region} onChange={(e) => setRegion(e.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select><small>Examples: {garmentExamples[region]}</small></label>
            <fieldset><legend>Draping preference</legend><div className="choice-row">{drapeChoices.map((choice) => <button type="button" aria-pressed={drape === choice} className={drape === choice ? "choice active" : "choice"} key={choice} onClick={() => setDrape(choice)}>{choice}</button>)}</div></fieldset>
          </div>

          <div className="composition-grid">
            <section className="person-panel" aria-labelledby="person-title">
              <div className="step-label"><b>1</b><span><strong id="person-title">Add yourself</strong>A seated or standing photo can work.</span></div>
              <UploadCard id="person-photo" title="Your photo" hint="JPG, PNG, WebP or HEIC" file={person} onChange={setPersonFile} />
            </section>
            <section className="pieces-panel" aria-labelledby="pieces-title">
              <div className="step-label"><b>2</b><span><strong id="pieces-title">Build the complete look</strong>Add each piece separately for better control.</span></div>
              <div className="piece-grid">
                <UploadCard id="main-garment" title={mode === "online" ? "Main garment" : "Photograph main piece"} hint="Kurta, saree, dress, thobe..." file={main} onChange={setMainFile} />
                <UploadCard id="outer-layer" title="Layer or drape" hint="Dupatta, shawl, pallu, bisht..." file={layer} onChange={setLayerFile} optional />
                <UploadCard id="accessory" title="Accessory" hint="Jewellery, bag, footwear..." file={accessory} onChange={setAccessoryFile} optional />
              </div>
            </section>
          </div>

          <div className="action-panel wide">
            <div className="status" role="status" aria-live="polite"><i className={canPreview ? "ready" : ""} />{canPreview ? "Ready for a local concept preview" : "Add yourself and a main garment to begin"}</div>
            <button className="primary-button" disabled={!canPreview} onClick={() => setStage("preview")}>Create concept preview <span aria-hidden="true">-&gt;</span></button>
            <small>Nothing is uploaded in this prototype.</small>
          </div>

          {stage === "preview" && person && main && (
            <section className="result" aria-labelledby="result-title">
              <div className="result-copy">
                <span className="result-kicker">PRIVATE FITTING SESSION</span>
                <h2 id="result-title">Your complete look</h2>
                <p>{description}</p>
                <div className="result-actions">
                  <button className="secondary-button" onClick={speakDescription}>Listen to description</button>
                  <button className="secondary-button" onClick={copyReviewNote}>Copy private review note</button>
                </div>
                <p className="sr-status" aria-live="polite">{shareMessage}</p>

                <div className="audit-grid">
                  <section><h3>Detail fidelity</h3><ul className="check-list"><li><b>Source images</b><span className="good">Preserved locally</span></li><li><b>Embroidery and borders</b><span>AI check pending</span></li><li><b>Layer placement</b><span>AI check pending</span></li><li><b>Physical fit</b><span>Measurements required</span></li></ul></section>
                  <section><h3>Privacy receipt</h3><ul className="check-list"><li><b>Processed</b><span>On this device</span></li><li><b>Cloud provider</b><span>None</span></li><li><b>Stored</b><span>Browser memory only</span></li><li><b>Training use</b><span className="good">Never</span></li></ul></section>
                </div>
                <button className="delete-button" onClick={clearSession}>Delete this session now</button>
              </div>
              <div className="concept-canvas">
                <img className="person-image" src={person.url} alt="Your uploaded base photograph" />
                <div className="piece-stack" aria-label="Selected outfit pieces">
                  {[main, layer, accessory].filter(Boolean).map((piece, index) => piece && <img key={piece.url} src={piece.url} alt={`Selected piece ${index + 1}: ${piece.name}`} />)}
                </div>
                <span className="concept-label">Concept composition - not an AI try-on yet</span>
              </div>
            </section>
          )}
        </div>

        <div className="trust-row"><span><b>Yes</b> No account</span><span><b>Yes</b> No photo storage</span><span><b>Yes</b> Never training data</span><span><b>Yes</b> Seated photos welcome</span></div>
      </section>

      <section className="how shell" id="how">
        <div><span className="section-kicker">BUILT AROUND CULTURAL CONTEXT</span><h2>Specific traditions.<br />Never generic.</h2></div>
        <div className="feature-grid">
          <article><b>01</b><h3>Multi-piece intelligence</h3><p>Compose main garments, draped layers and accessories independently.</p></article>
          <article><b>02</b><h3>Accessible descriptions</h3><p>Read or hear a structured explanation of the complete look.</p></article>
          <article><b>03</b><h3>Honest fidelity</h3><p>Separate preserved source details, AI uncertainty and physical fit.</p></article>
          <article><b>04</b><h3>Visible privacy</h3><p>Receive a receipt showing what was processed, stored and shared.</p></article>
        </div>
      </section>

      <footer className="shell"><div className="brand"><span className="brand-mark">A</span><span>AttireLens</span></div><p>Private virtual try-on across Asian and West Asian cultures.</p><button className="link-button" onClick={() => setPrivacyOpen(true)}>Read our privacy promise -&gt;</button></footer>

      {privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPrivacyOpen(false)}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" aria-label="Close privacy details" onClick={() => setPrivacyOpen(false)}>x</button><span className="section-kicker">THE ATTIRELENS PROMISE</span><h2 id="privacy-title">Your body is not our data.</h2><p>This prototype has no upload endpoint, account, analytics or database. Image previews exist only in browser memory.</p><ul><li><b>Immediate control:</b> clear the session at any time.</li><li><b>No training:</b> photos never become training data by default.</li><li><b>Honest output:</b> a visual preview is not proof of physical fit.</li><li><b>Production standard:</b> future inference must contractually support zero retention.</li></ul><button className="primary-button" onClick={() => setPrivacyOpen(false)}>I understand</button></section></div>}
    </main>
  );
}
