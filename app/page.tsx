"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Preview = { url: string; name: string } | null;
type Stage = "idle" | "ready" | "preview";
type Measurements = { height: string; chest: string; waist: string; hip: string; inseam: string };
type GarmentMeasurements = { chest: string; waist: string; hip: string; length: string };
type Confirmation = Record<keyof Measurements, boolean>;

const emptyBody: Measurements = { height: "", chest: "", waist: "", hip: "", inseam: "" };
const emptyGarment: GarmentMeasurements = { chest: "", waist: "", hip: "", length: "" };
const emptyConfirmation: Confirmation = { height: false, chest: false, waist: false, hip: false, inseam: false };

const regions = [
  "South Asia",
  "Southeast Asia",
  "Middle East",
  "Cross-cultural or contemporary",
];

const garmentExamples: Record<string, string> = {
  "South Asia": "saree, lehenga, salwar kameez, kurta, sherwani",
  "Southeast Asia": "kebaya, baju kurung, barong, sinh, ao dai",
  "Middle East": "abaya, thobe, jalabiya, kaftan, manteau and bisht",
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
  const [workspaceStep, setWorkspaceStep] = useState<"capture" | "outfit" | "fit">("capture");
  const [mode, setMode] = useState<"online" | "store">("online");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [bottomFile, setBottomFile] = useState<File | null>(null);
  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [accessoryFile, setAccessoryFile] = useState<File | null>(null);
  const [footwearFile, setFootwearFile] = useState<File | null>(null);
  const [body, setBody] = useState<Measurements>(emptyBody);
  const [confirmed, setConfirmed] = useState<Confirmation>(emptyConfirmation);
  const [garment, setGarment] = useState<GarmentMeasurements>(emptyGarment);
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [preferredFit, setPreferredFit] = useState("Regular");
  const [rotation, setRotation] = useState(0);
  const [region, setRegion] = useState(regions[0]);
  const [drape, setDrape] = useState(drapeChoices[0]);
  const [stage, setStage] = useState<Stage>("idle");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const person = usePreview(personFile);
  const right = usePreview(rightFile);
  const back = usePreview(backFile);
  const left = usePreview(leftFile);
  const main = usePreview(mainFile);
  const bottom = usePreview(bottomFile);
  const layer = usePreview(layerFile);
  const accessory = usePreview(accessoryFile);
  const footwear = usePreview(footwearFile);
  const canPreview = Boolean(person && main);
  const bodyFieldsComplete = Object.values(body).every(Boolean);
  const garmentFieldsComplete = Object.values(garment).every(Boolean);
  const fitDataComplete = bodyFieldsComplete && garmentFieldsComplete;
  const angleCount = [person, right, back, left].filter(Boolean).length;
  const captureLevel = angleCount === 4 ? "Best available capture" : angleCount === 3 ? "Improved estimate" : angleCount === 2 ? "Limited estimate" : "Low-confidence estimate";
  const captureDetail = angleCount === 4 ? "All four recommended views are present." : `${4 - angleCount} more angle${4 - angleCount === 1 ? "" : "s"} recommended; AttireLens should widen every uncertainty range.`;

  useEffect(() => setStage(canPreview ? "ready" : "idle"), [canPreview]);
  useEffect(() => {
    if (!privacyOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setPrivacyOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [privacyOpen]);

  const description = useMemo(() => {
    const pieces = [main && "main garment", bottom && "lower piece", layer && "draped or outer layer", accessory && "accessory", footwear && "footwear"].filter(Boolean).join(", ");
    const fitNote = fitDataComplete
      ? `Body and garment measurements are present in ${unit} for a future ${preferredFit.toLowerCase()}-fit comparison; fabric stretch and construction still require verification.`
      : "Physical fit is not estimated because body and garment measurements are incomplete.";
    return `A concept look in the ${region} context using ${pieces || "a main garment"}. Draping preference: ${drape}. ${fitNote}`;
  }, [region, drape, main, bottom, layer, accessory, footwear, fitDataComplete, unit, preferredFit]);

  function clearSession() {
    speechSynthesis?.cancel();
    setPersonFile(null); setRightFile(null); setBackFile(null); setLeftFile(null); setMainFile(null); setBottomFile(null); setLayerFile(null); setAccessoryFile(null); setFootwearFile(null);
    setBody(emptyBody); setConfirmed(emptyConfirmation); setGarment(emptyGarment); setRotation(0);
    setWorkspaceStep("capture");
    setStage("idle"); setShareMessage("");
  }

  function updateBody(field: keyof Measurements, value: string) {
    setBody((current) => ({ ...current, [field]: value }));
    setConfirmed((current) => ({ ...current, [field]: false }));
  }

  function updateGarment(field: keyof GarmentMeasurements, value: string) {
    setGarment((current) => ({ ...current, [field]: value }));
  }

  function rotateBy(degrees: number) {
    setRotation((current) => (current + degrees + 360) % 360);
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
        <p className="hero-copy"><strong>Try the look. Make it yours.</strong><br />Asian and Middle Eastern styles, fitted to you. Private, for your eyes only.</p>

        <div className="tryon-card" id="fitting-room">
          <div className="mode-tabs" role="group" aria-label="Shopping mode">
            <button aria-pressed={mode === "online"} className={mode === "online" ? "active" : ""} onClick={() => setMode("online")}>Shopping online</button>
            <button aria-pressed={mode === "store"} className={mode === "store" ? "active" : ""} onClick={() => setMode("store")}>In a store</button>
          </div>

          <nav className="workspace-progress" aria-label="Fitting room steps">
            <button className={workspaceStep === "capture" ? "active" : ""} aria-current={workspaceStep === "capture" ? "step" : undefined} onClick={() => setWorkspaceStep("capture")}><b>1</b><span>Add your photos<small>Capture your shape</small></span></button>
            <i aria-hidden="true" />
            <button disabled={!person} className={workspaceStep === "outfit" ? "active" : ""} aria-current={workspaceStep === "outfit" ? "step" : undefined} onClick={() => setWorkspaceStep("outfit")}><b>2</b><span>Build your look<small>Mix and match pieces</small></span></button>
            <i aria-hidden="true" />
            <button disabled={!person || !main} className={workspaceStep === "fit" ? "active" : ""} aria-current={workspaceStep === "fit" ? "step" : undefined} onClick={() => setWorkspaceStep("fit")}><b>3</b><span>Review the fit<small>Confirm measurements</small></span></button>
          </nav>

          {workspaceStep === "outfit" && <div className="context-row">
            <label><span>Cultural context</span><select value={region} onChange={(e) => setRegion(e.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select><small>Examples: {garmentExamples[region]}</small></label>
            <fieldset><legend>Draping preference</legend><div className="choice-row">{drapeChoices.map((choice) => <button type="button" aria-pressed={drape === choice} className={drape === choice ? "choice active" : "choice"} key={choice} onClick={() => setDrape(choice)}>{choice}</button>)}</div></fieldset>
          </div>}

          <div className={`composition-grid step-${workspaceStep}`}>
            <section className="person-panel capture-panel" aria-labelledby="person-title">
              <div className="step-label"><b>1</b><span><strong id="person-title">Capture your shape</strong>Four angles are the recommended minimum for the strongest estimate.</span></div>
              <div className="capture-grid">
                <UploadCard id="person-photo" title="Front" hint="Required" file={person} onChange={setPersonFile} />
                <UploadCard id="right-photo" title="Right profile" hint="Recommended" file={right} onChange={setRightFile} optional />
                <UploadCard id="back-photo" title="Back" hint="Recommended" file={back} onChange={setBackFile} optional />
                <UploadCard id="left-photo" title="Left profile" hint="Recommended" file={left} onChange={setLeftFile} optional />
              </div>
              <div className={`capture-readiness level-${angleCount}`} role="status" aria-live="polite"><b>{angleCount}/4 views · {captureLevel}</b><span>{captureDetail}</span></div>
              <details className="capture-guide"><summary>How to photograph for the best result</summary><ul><li>Show your complete body, including the top of the head and both feet.</li><li>Stand naturally with feet hip-width apart and arms slightly away from the torso.</li><li>Place the camera level around waist height; do not tilt it up or down.</li><li>Use the same distance, zoom and lighting for every angle.</li><li>Wear close-fitting clothing when comfortable, or enter measurements manually.</li><li>Provide your measured height; without a known scale, centimetre estimates cannot be dependable.</li></ul></details>
            </section>
            <section className="pieces-panel" aria-labelledby="pieces-title">
              <div className="step-label"><b>2</b><span><strong id="pieces-title">Free mix-and-match space</strong>Add, remove and replace each category independently.</span></div>
              <div className="piece-grid">
                <UploadCard id="main-garment" title={mode === "online" ? "Main garment" : "Photograph main piece"} hint="Kurta, saree, sherwani, dress, thobe..." file={main} onChange={setMainFile} />
                <UploadCard id="lower-piece" title="Lower piece" hint="Trousers, lehenga, dhoti, skirt, sarong..." file={bottom} onChange={setBottomFile} optional />
                <UploadCard id="outer-layer" title="Layer or drape" hint="Dupatta, shawl, pallu, bisht..." file={layer} onChange={setLayerFile} optional />
                <UploadCard id="accessory" title="Accessories" hint="Jewellery, cufflinks, bag, belt, headwear..." file={accessory} onChange={setAccessoryFile} optional />
                <UploadCard id="footwear" title="Shoes & footwear" hint="Jutti, khussa, loafers, sandals, heels..." file={footwear} onChange={setFootwearFile} optional />
              </div>
            </section>
          </div>

          {workspaceStep === "capture" && <div className="step-actions"><span>Start with one front photo. Add all four views for the strongest basis.</span><button className="primary-button" disabled={!person} onClick={() => setWorkspaceStep("outfit")}>Continue to outfit <span aria-hidden="true">-&gt;</span></button></div>}
          {workspaceStep === "outfit" && <div className="step-actions"><button className="secondary-button" onClick={() => setWorkspaceStep("capture")}>&lt;- Back to photos</button><button className="primary-button" disabled={!main} onClick={() => setWorkspaceStep("fit")}>Continue to fit <span aria-hidden="true">-&gt;</span></button></div>}

          {workspaceStep === "fit" && <section className="fit-studio" aria-labelledby="fit-studio-title">
            <div className="fit-intro">
              <span className="section-kicker">FIT DATA, NOT GUESSWORK</span>
              <h2 id="fit-studio-title">Build a measurement-backed fit profile</h2>
              <p>Values stay in this browser session. A photo alone cannot reliably prove size, length or fit.</p>
              <div className="fit-options">
                <label>Unit<select value={unit} onChange={(event) => setUnit(event.target.value as "cm" | "in")}><option value="cm">Centimetres</option><option value="in">Inches</option></select></label>
                <label>Preferred fit<select value={preferredFit} onChange={(event) => setPreferredFit(event.target.value)}><option>Close</option><option>Regular</option><option>Relaxed</option></select></label>
              </div>
            </div>
            <div className="measurement-group">
              <h3>Estimated body data</h3>
              <p className="measurement-note">Photo analysis must return ranges, not false precision. Review each raw value and confirm it before fit calculations use it.</p>
              <div className="measurement-grid">
                {(Object.keys(body) as (keyof Measurements)[]).map((field) => <label key={field}><span>{field === "inseam" ? "Inseam" : field[0].toUpperCase() + field.slice(1)} ({unit})</span><input inputMode="decimal" type="number" min="0" step="0.1" placeholder="Estimate" value={body[field]} onChange={(event) => updateBody(field, event.target.value)} /><span className="confirm-row"><input type="checkbox" checked={confirmed[field]} disabled={!body[field]} onChange={(event) => setConfirmed((current) => ({ ...current, [field]: event.target.checked }))} /> I confirm this value</span></label>)}
              </div>
              <div className="measurement-chart" aria-label="Body measurement graph">{(Object.keys(body) as (keyof Measurements)[]).map((field) => <div key={field}><span>{field}</span><i style={{ width: body[field] ? `${Math.min(100, Number(body[field]) / (unit === "cm" ? 2.1 : .83))}%` : "0%" }} /><b>{body[field] || "—"} {body[field] && unit}</b></div>)}</div>
            </div>
            <div className="measurement-group">
              <h3>Main garment</h3>
              <div className="measurement-grid">
                {(Object.keys(garment) as (keyof GarmentMeasurements)[]).map((field) => <label key={field}><span>{field[0].toUpperCase() + field.slice(1)} ({unit})</span><input inputMode="decimal" type="number" min="0" step="0.1" value={garment[field]} onChange={(event) => updateGarment(field, event.target.value)} /></label>)}
              </div>
            </div>
            <div className={`fit-readiness ${fitDataComplete ? "complete" : ""}`} role="status" aria-live="polite">
              <b>{fitDataComplete ? "Measurement set complete" : "Visual preview only"}</b>
              <span>{fitDataComplete ? "Ready for a future structured fit comparison - fabric stretch and construction data are still needed." : `Complete both measurement groups before AttireLens may make a fit estimate. Current photo basis: ${angleCount}/4 views.`}</span>
            </div>
          </section>}

          {workspaceStep === "fit" && <div className="action-panel wide">
            <button className="secondary-button" onClick={() => setWorkspaceStep("outfit")}>&lt;- Back to outfit</button>
            <div className="status" role="status" aria-live="polite"><i className={canPreview ? "ready" : ""} />{canPreview ? "Ready for a local concept preview" : "Add yourself and a main garment to begin"}</div>
            <button className="primary-button" disabled={!canPreview} onClick={() => setStage("preview")}>Create concept preview <span aria-hidden="true">-&gt;</span></button>
          </div>}

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
                  <section><h3>Detail fidelity</h3><ul className="check-list"><li><b>Source images</b><span className="good">Preserved locally</span></li><li><b>Embroidery and borders</b><span>AI check pending</span></li><li><b>Body dimensions</b><span className={bodyFieldsComplete ? "good" : ""}>{bodyFieldsComplete ? "Provided locally" : "Incomplete"}</span></li><li><b>Garment dimensions</b><span className={garmentFieldsComplete ? "good" : ""}>{garmentFieldsComplete ? "Provided locally" : "Incomplete"}</span></li><li><b>Physical fit</b><span>{fitDataComplete ? "Structured engine pending" : "Not estimated"}</span></li></ul></section>
                  <section><h3>Privacy receipt</h3><ul className="check-list"><li><b>Processed</b><span>On this device</span></li><li><b>Cloud provider</b><span>None</span></li><li><b>Stored</b><span>Browser memory only</span></li><li><b>Training use</b><span className="good">Never</span></li></ul></section>
                </div>
                <button className="delete-button" onClick={clearSession}>Delete this session now</button>
              </div>
              <div className="concept-canvas">
                <img className="person-image" style={{ transform: `rotate(${rotation}deg)` }} src={person.url} alt={`Your uploaded base photograph, rotated ${rotation} degrees`} />
                <div className="piece-stack" aria-label="Selected outfit pieces">
                  {[main, bottom, layer, accessory, footwear].filter(Boolean).map((piece, index) => piece && <img key={piece.url} src={piece.url} alt={`Selected piece ${index + 1}: ${piece.name}`} />)}
                </div>
                <span className="concept-label">Concept composition - not an AI try-on yet</span>
                <div className="rotation-controls" aria-label="Rotate preview image">
                  <button type="button" onClick={() => rotateBy(-90)} aria-label="Rotate preview counterclockwise 90 degrees">↶</button>
                  <span>{rotation}°</span>
                  <button type="button" onClick={() => rotateBy(90)} aria-label="Rotate preview clockwise 90 degrees">↷</button>
                </div>
              </div>
              <p className="rotation-note">These controls rotate the 2D photo through a complete circle. A true view around the body requires front, side and back capture plus multi-angle garment data.</p>
            </section>
          )}
        </div>

        <div className="trust-row"><span><b>Yes</b> Every body welcome</span><span><b>Yes</b> No photo storage</span><span><b>Yes</b> Never training data</span><span><b>Yes</b> Seated photos welcome</span></div>
      </section>

      <section className="how shell" id="how">
        <div><span className="section-kicker">MADE FOR THE WAY YOU DRESS</span><h2>Style it.<br />Try it. Own it.</h2></div>
        <div className="feature-grid">
          <article><b>01</b><h3>Every wardrobe welcome</h3><p>Explore womenswear, menswear, unisex and gender-fluid looks with the same complete feature set.</p></article>
          <article><b>02</b><h3>Accessible descriptions</h3><p>Read or hear a structured explanation of the complete look.</p></article>
          <article><b>03</b><h3>Measurement-backed fit</h3><p>Gate fit estimates behind body and garment dimensions instead of inventing an idealised model.</p></article>
          <article><b>04</b><h3>Visible privacy</h3><p>Receive a receipt showing what was processed, stored and shared.</p></article>
        </div>
      </section>

      <footer className="shell"><div className="brand"><span className="brand-mark">A</span><span>AttireLens</span></div><p>Private virtual try-on across Asian and West Asian cultures.</p><button className="link-button" onClick={() => setPrivacyOpen(true)}>Read our privacy promise -&gt;</button></footer>

      {privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPrivacyOpen(false)}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" aria-label="Close privacy details" onClick={() => setPrivacyOpen(false)}>x</button><span className="section-kicker">THE ATTIRELENS PROMISE</span><h2 id="privacy-title">Your body is not our data.</h2><p>This prototype has no upload endpoint, account, analytics or database. Image previews exist only in browser memory.</p><ul><li><b>Immediate control:</b> clear the session at any time.</li><li><b>No training:</b> photos never become training data by default.</li><li><b>Honest output:</b> a visual preview is not proof of physical fit.</li><li><b>Production standard:</b> future inference must contractually support zero retention.</li></ul><button className="primary-button" onClick={() => setPrivacyOpen(false)}>I understand</button></section></div>}
    </main>
  );
}
