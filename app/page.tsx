­r‡^Ñf¥–Ø¦{]¬yÊ'vÃ®¶›­"use client";

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

function UploadCard({ id, title, hint, file, onChange, optional = false, onPreviewError }: {
  id: string;
  title: string;
  hint: string;
  file: Preview;
  onChange: (file: File | null) => void;
  optional?: boolean;
  onPreviewError?: () => void;
}) {
  return (
    <label className={`upload-card compact ${file ? "has-file" : ""}`} htmlFor={id}>
      {file ? <img src={file.url} alt={`${title}: ${file.name}`} onError={onPreviewError} /> : (
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

function VideoUploadCard({ file, onChange, error }: { file: Preview; onChange: (file: File | null) => void; error: string }) {
  return (
    <label className={`video-upload ${file ? "has-file" : ""}`} htmlFor="turn-video">
      {file ? <video src={file.url} aria-label={`Uploaded turn video: ${file.name}`} controls muted playsInline preload="metadata" /> : <span><b>Or add one short turn video</b><small>5â€“10 seconds Â· front, right, back and left Â· MP4, MOV or WebM Â· up to 25 MB</small></span>}
      <input id="turn-video" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.files?.[0] ?? null)} />
      <strong>{file ? "Change video" : "Choose video"}</strong>
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

function Brand() {
  const content = <><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">Attire<em>Lens</em></span></>;
  return <div className="brand" aria-label="AttireLens">{content}</div>;
}

function SizeGuide({ onClose }: { onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="size-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close size guide" onClick={onClose}>x</button><span className="section-kicker">QUICK SIZE REFERENCE</span><h2 id="size-guide-title">Find your starting size</h2><p className="size-intro">Use these as conversion guides only. Brand charts and actual garment measurements should always take priority.</p><SizeTable title="Womenâ€™s clothing" headers={["Body / label", "XS", "S", "M", "L", "XL", "2XL", "3XL"]} rows={[["Bust (in)", "32", "34", "36", "38", "40", "42", "44"], ["India", "32", "34", "36", "38", "40", "42", "44"], ["UK", "6", "8", "10", "12", "14", "16", "18"], ["US", "2", "4", "6", "8", "10", "12", "14"]]} /><SizeTable title="Menâ€™s jackets and kurtas" headers={["Body / label", "XS", "S", "M", "L", "XL", "2XL", "3XL"]} rows={[["Chest (in)", "36", "38", "40", "42", "44", "46", "48"], ["India", "36", "38", "40", "42", "44", "46", "48"], ["UK", "36", "38", "40", "42", "44", "46", "48"], ["US", "36", "38", "40", "42", "44", "46", "48"]]} /><div className="footwear-tables"><SizeTable title="Womenâ€™s footwear" headers={["India / UK", "3", "4", "5", "6", "7", "8"]} rows={[["US", "5", "6", "7", "8", "9", "10"]]} /><SizeTable title="Menâ€™s footwear" headers={["India / UK", "6", "7", "8", "9", "10", "11"]} rows={[["US", "7", "8", "9", "10", "11", "12"]]} /></div><p className="size-note">Between sizes? Compare your body measurements with the garment itself, then choose based on fabric stretch and preferred fit.</p></section></div>;
}

function SizeTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return <div className="size-section"><h3>{title}</h3><div className="table-wrap"><table><thead><tr>{headers.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}><th>{row[0]}</th>{row.slice(1).map((item, index) => <td key={`${row[0]}-${index}`}>{item}</td>)}</tr>)}</tbody></table></div></div>;
}

export default function Home() {
  const [workspaceStep, setWorkspaceStep] = useState<"capture" | "outfit" | "fit">("capture");
  const [mode, setMode] = useState<"online" | "store">("online");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState("");
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [garmentLink, setGarmentLink] = useState("");
  const [linkedGarment, setLinkedGarment] = useState<Preview>(null);
  const [linkMessage, setLinkMessage] = useState("");
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
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const person = usePreview(personFile);
  const turnVideo = usePreview(videoFile);
  const right = usePreview(rightFile);
  const back = usePreview(backFile);
  const left = usePreview(leftFile);
  const uploadedMain = usePreview(mainFile);
  const main = uploadedMain ?? linkedGarment;
  const bottom = usePreview(bottomFile);
  const layer = usePreview(layerFile);
  const accessory = usePreview(accessoryFile);
  const footwear = usePreview(footwearFile);
  const canPreview = Boolean((person || turnVideo) && main);
  const bodyFieldsComplete = Object.values(body).every(Boolean);
  const garmentFieldsComplete = Object.values(garment).every(Boolean);
  const fitDataComplete = bodyFieldsComplete && garmentFieldsComplete;
  const photoAngleCount = [person, right, back, left].filter(Boolean).length;
  const angleCount = turnVideo ? 4 : photoAngleCount;
  const captureLevel = turnVideo ? "Video coverage to verify" : angleCount === 4 ? "Best available capture" : angleCount === 3 ? "Improved estimate" : angleCount === 2 ? "Limited estimate" : "Low-confidence estimate";
  const captureDetail = turnVideo ? "Frame validation must confirm that front, right, back and left views are clear before body analysis begins." : angleCount === 4 ? "All four recommended views are present." : `${4 - angleCount} more angle${4 - angleCount === 1 ? "" : "s"} recommended; measurement confidence will be reduced.`;

  useEffect(() => setStage(canPreview ? "ready" : "idle"), [canPreview]);
  useEffect(() => {
    if (!privacyOpen && !sizeGuideOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setPrivacyOpen(false); setSizeGuideOpen(false); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [privacyOpen, sizeGuideOpen]);

  const description = useMemo(() => {
    const pieces = [main && "main garment", bottom && "lower piece", layer && "draped or outer layer", accessory && "accessory", footwear && "footwear"].filter(Boolean).join(", ");
    const fitNote = fitDataComplete
      ? `Body and garment measurements are present in ${unit} for a ${preferredFit.toLowerCase()}-fit comparison; fabric stretch and construction still require verification.`
      : "Physical fit is not estimated because body and garment measurements are incomplete.";
    return `A fitting session in the ${region} context using ${pieces || "a main garment"}. Draping preference: ${drape}. ${fitNote}`;
  }, [region, drape, main, bottom, layer, accessory, footwear, fitDataComplete, unit, preferredFit]);

  function clearSession() {
    speechSynthesis?.cancel();
    setPersonFile(null); setVideoFile(null); setVideoError(""); setRightFile(null); setBackFile(null); setLeftFile(null); setMainFile(null); setGarmentLink(""); setLinkedGarment(null); setLinkMessage(""); setBottomFile(null); setLayerFile(null); setAccessoryFile(null); setFootwearFile(null);
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

  function updateVideo(file: File | null) {
    if (file && file.size > 25 * 1024 * 1024) {
      setVideoError("Please choose a video smaller than 25 MB.");
      setVideoFile(null);
      return;
    }
    setVideoError("");
    setVideoFile(file);
  }

  function importGarmentLink() {
    try {
      const url = new URL(garmentLink.trim());
      if (url.protocol !== "https:") throw new Error();
      setMainFile(null);
      setLinkedGarment({ url: url.toString(), name: `Look from ${url.hostname.replace(/^www\./, "")}` });
      setLinkMessage("Link added. If the shop blocks its image, save the garment photo and add it below.");
    } catch {
      setLinkedGarment(null);
      setLinkMessage("Paste a complete secure link beginning with https://");
    }
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
        <Brand />
        <div className="nav-links"><a href="#how">How it works</a><button className="link-button" onClick={() => setSizeGuideOpen(true)}>Size guide</button><button className="link-button" onClick={() => setPrivacyOpen(true)}>Privacy</button></div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">Asian + Middle Eastern style. Your way.</div>
        <h1>Every layer.<br /><em>Your whole story.</em></h1>
        <p className="hero-copy"><strong>Try the look. Make it yours.</strong><br />Your wardrobe, reimagined before you wear it.</p>

        <div className="tryon-card" id="fitting-room">
          <div className="mode-tabs" role="group" aria-label="Shopping mode">
            <button aria-pressed={mode === "online"} className={mode === "online" ? "active" : ""} onClick={() => setMode("online")}>Shopping online</button>
            <button aria-pressed={mode === "store"} className={mode === "store" ? "active" : ""} onClick={() => setMode("store")}>In a store</button>
          </div>

          <nav className="workspace-progress" aria-label="Fitting room steps">
            <button className={workspaceStep === "capture" ? "active" : ""} aria-current={workspaceStep === "capture" ? "step" : undefined} onClick={() => setWorkspaceStep("capture")}><b>1</b><span>Add your photos<small>Capture your shape</small></span></button>
            <i aria-hidden="true" />
            <button disabled={!person && !turnVideo} className={workspaceStep === "outfit" ? "active" : ""} aria-current={workspaceStep === "outfit" ? "step" : undefined} onClick={() => setWorkspaceStep("outfit")}><b>2</b><span>Build your look<small>Mix and match pieces</small></span></button>
            <i aria-hidden="true" />
            <button disabled={(!person && !turnVideo) || !main} className={workspaceStep === "fit" ? "active" : ""} aria-current={workspaceStep === "fit" ? "step" : undefined} onClick={() => setWorkspaceStep("fit")}><b>3</b><span>Review the fit<small>Confirm measurements</small></span></button>
          </nav>

          {workspaceStep === "outfit" && <div className="context-row">
            <l×nm¢G§²ÚîÆ­yÓsed={drape === choice} className={drape === choice ? "choice active" : "choice"} key={choice} onClick={() => setDrape(choice)}>{choice}</button>)}</div></fieldset>
          </div>}

          <div className={`composition-grid step-${workspaceStep}`}>
            <section className="person-panel capture-panel" aria-labelledby="person-title">
              <div className="step-label"><b>1</b><span><strong id="person-title">Capture your shape</strong>Four angles are the recommended minimum for the strongest estimate.</span></div>
              <div className="clothed-capture"><b>Stay comfortably clothed</b><span>Everyday clothes are welcome. A fitted T-shirt and trousers give the clearest outline, but nudity is never required or appropriate.</span></div>
              <VideoUploadCard file={turnVideo} onChange={updateVideo} error={videoError} />
              <div className="capture-divider"><span>or add individual photos</span></div>
              <div className="capture-grid">
                <UploadCard id="person-photo" title="Front" hint="Required" file={person} onChange={setPersonFile} />
                <UploadCard id="right-photo" title="Right profile" hint="Recommended" file={right} onChange={setRightFile} optional />
                <UploadCard id="back-photo" title="Back" hint="Recommended" file={back} onChange={setBackFile} optional />
                <UploadCard id="left-photo" title="Left profile" hint="Recommended" file={left} onChange={setLeftFile} optional />
              </div>
              <div className={`capture-readiness level-${angleCount}`} role="status" aria-live="polite"><b>{angleCount}/4 views Â· {captureLevel}</b><span>{captureDetail}</span></div>
              <details className="capture-guide"><summary>How to capture the best result</summary><ul><li>Wear normal, comfortable clothes. A fitted T-shirt with leggings or trousers helps the system read your outline.</li><li>Never upload nude or underwear-only photos. They are not needed for virtual try-on.</li><li>Show your complete body, including the top of the head and both feet.</li><li>For video, turn slowly through front, right, back and left without moving the camera.</li><li>Stand naturally with feet hip-width apart and arms slightly away from the torso.</li><li>Place the camera level around waist height; do not tilt it up or down.</li><li>Loose or layered clothes are still usable, but the estimate should show wider uncertainty ranges.</li><li>Provide your measured height; without a known scale, centimetre estimates cannot be dependable.</li></ul></details>
            </section>
            <section className="pieces-panel" aria-labelledby="pieces-title">
              <div className="step-label"><b>2</b><span><strong id="pieces-title">Free mix-and-match space</strong>Add, remove and replace each category independently.</span></div>
              {mode === "online" && <div className="link-import"><label htmlFor="garment-link"><b>Bring in a shopping link</b><span>Paste a direct garment image link from the shop you are browsing.</span></label><div><input id="garment-link" type="url" inputMode="url" placeholder="https://shop.com/garment-image.jpg" value={garmentLink} onChange={(event) => { setGarmentLink(event.target.value); setLinkMessage(""); }} onKeyDown={(event) => event.key === "Enter" && importGarmentLink()} /><button type="button" onClick={importGarmentLink}>Add to wardrobe</button></div>{linkMessage && <p role="status">{linkMessage}</p>}</div>}
              <div className="piece-grid">
                <UploadCard id="main-garment" title={mode === "online" ? "Main garment" : "Photograph main piece"} hint="Kurta, saree, sherwani, dress, thobe..." file={main} onChange={(file) => { setMainFile(file); if (file) { setLinkedGarment(null); setLinkMessage(""); } }} onPreviewError={() => { if (linkedGarment) { setLinkedGarment(null); setLinkMessage("This shop blocks direct image importing. Save the garment photo, then add it here instead."); } }} />
                <UploadCard id="lower-piece" title="Lower piece" hint="Trousers, lehenga, dhoti, skirt, sarong..." file={bottom} onChange={setBottomFile} optional />
                <UploadCard id="outer-layer" title="Layer or drape" hint="Dupatta, shawl, pallu, bisht..." file={layer} onChange={setLayerFile} optional />
                <UploadCard id="accessory" title="Accessories" hint="Jewellery, cufflinks, bag, belt, headwear..." file={accessory} onChange={setAccessoryFile} optional />
                <UploadCard id="footwear" title="Shoes & footwear" hint="Jutti, khussa, loafers, sandals, heels..." file={footwear} onChange={setFootwearFile} optional />
              </div>
            </section>
          </div>

          {workspaceStep === "capture" && <div className="step-actions"><span>Use one short turn video or four individual views for the strongest basis.</span><button className="primary-button" disabled={!person && !turnVideo} onClick={() => setWorkspaceStep("outfit")}>Continue to outfit <span aria-hidden="true">-&gt;</span></button></div>}
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
              <div className="measurement-chart" aria-label="Body measurement graph">{(Object.keys(body) as (keyof Measurements)[]).map((field) => <div key={field}><span>{field}</span><i style={{ width: body[field] ? `${Math.min(100, Number(body[field]) / (unit === "cm" ? 2.1 : .83))}%` : "0%" }} /><b>{body[field] || "â€”"} {body[field] && unit}</b></div>)}</div>
            </div>
            <div className="measurement-group">
              <h3>Main garment</h3>
              <div className="measurement-grid">
                {(Object.keys(garment) as (keyof GarmentMeasurements)[]).map((field) => <label key={field}><span>{field[0].toUpperCase() + field.slice(1)} ({unit})</span><input inputMode="decimal" type="number" min="0" step="0.1" value={garment[field]} onChange={(event) => updateGarment(field, event.target.value)} /></label>)}
              </div>
            </div>
            <div className={`fit-readiness ${fitDataComplete ? "complete" : ""}`} role="status" aria-live="polite">
              <b>{fitDataComplete ? "Measurement set complete" : "Measurements required"}</b>
              <span>{fitDataComplete ? "Ready for structured fit analysis once fabric stretch and construction data are verified." : `Complete both measurement groups before AttireLens performs fit analysis. Current photo basis: ${angleCount}/4 views.`}</span>
            </div>
          </section>}

          {workspaceStep === "fit" && <div className="action-panel wide">
            <button className="secondary-button" onClick={() => setWorkspaceStep("outfit")}>&lt;- Back to outfit</button>
            <div className="status" role="status" aria-live="polite"><i className={canPreview ? "ready" : ""} />{canPreview ? "Inputs ready for validation" : "Add yourself and a main garment to begin"}</div>
            <button className="primary-button" disabled={!canPreview} onClick={() => setStage("preview")}>Review fitting inputs <span aria-hidden="true">-&gt;</span></button>
          </div>}

          {stage === "preview" && (person || turnVideo) && main && (
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

                <div className="audit-grid single">
                  <section><h3>Processing readiness</h3><ul className="check-list"><li><b>Source images</b><span className="good">Ready for validation</span></li><li><b>Pose and silhouette</b><span>Secure inference required</span></li><li><b>Body dimensions</b><span className={bodyFieldsComplete ? "good" : ""}>{bodyFieldsComplete ? "User confirmed" : "Incomplete"}</span></li><li><b>Garment dimensions</b><span className={garmentFieldsComplete ? "good" : ""}>{garmentFieldsComplete ? "Provided" : "Incomplete"}</span></li><li><b>Fit and try-on</b><span>{fitDataComplete ? "Ready for model pipeline" : "Awaiting measurements"}</span></li></ul></section>
                </div>
                <button className="delete-button" onClick={clearSession}>Delete this session now</button>
              </div>
              <div className="concept-canvas">
                {person ? <img className="person-image" style={{ transform: `rotate(${rotation}deg)` }} src={person.url} alt={`Your uploaded base photograph, rotated ${rotation} degrees`} /> : turnVideo && <video className="person-image" src={turnVideo.url} aria-label="Your uploaded turn video" controls muted playsInline loop />}
                <div className="piece-stack" aria-label="Selected outfit pieces">
                  {[main, bottom, layer, accessory, footwear].filter(Boolean).map((piece, index) => piece && <img key={piece.url} src={piece.url} alt={`Selected piece ${index + 1}: ${piece.name}`} />)}
                </div>
                <span className="concept-label">Input review â€” generation begins after validation</span>
                <div className="rotation-controls" aria-label="Rotate preview image">
                  <button type="button" onClick={() => rotateBy(-90)} aria-label="Rotate preview counterclockwise 90 degrees">â†¶</button>
                  <span>{rotation}Â°</span>
                  <button type="button" onClick={() => rotateBy(90)} aria-label="Rotate preview clockwise 90 degrees">â†·</button>
                </div>
              </div>
              <p className="rotation-note">These controls rotate the 2D photo through a complete circle. A true view around the body requires front, side and back capture plus multi-angle garment data.</p>
            </section>
          )}
        </div>

        <p className="privacy-line">Your photos stay in this browser session and are not stored.</p>
      </section>

      <section className="how shell" id="how">
        <div className="how-promise"><span className="section-kicker">YOUR VIRTUAL DRESSING ROOM</span><h2>Build the look.<br />See the fit.<br /><em>Own the moment.</em></h2><p>Your wardrobe is the playground. AttireLens is where the whole look comes to life.</p></div>
        <div className="feature-grid">
          <article><h3>Every look belongs here.</h3><p>Womenswear, menswear, unisex and gender-fluid styles. The same tools, no separate lanes.</p></article>
          <article><h3>See the whole story.</h3><p>Read or hear how every layer comes together, from drape to detail.</p></article>
          <article><h3>Fit starts with facts.</h3><p>Body and garment measurements first. Guesswork never.</p></article>
          <article><h3>Style it head to toe.</h3><p>Clothes, layers, accessories and footwear in one complete look.</p></article>
        </div>
      </section>

      <footer className="shell"><Brand /><p>Virtual try-on for Asian and Middle Eastern styles.</p><div className="footer-links"><button className="link-button" onClick={() => setSizeGuideOpen(true)}>Size guide</button><button className="link-button" onClick={() => setPrivacyOpen(true)}>Privacy</button></div></footer>

      {sizeGuideOpen && <SizeGuide onClose={() => setSizeGuideOpen(false)} />}

      {privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPrivacyOpen(false)}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" aria-label="Close privacy details" onClick={() => setPrivacyOpen(false)}>x</button><span className="section-kicker">THE ATTIRELENS PROMISE</span><h2 id="privacy-title">Your body is not our data.</h2><p>AttireLens processes session images only for body, pose, silhouette, garment and fit analysis. This deployed build keeps input previews in browser memory until the secure zero-retention inference service is connected.</p><ul><li><b>Immediate control:</b> clear the session at any time.</li><li><b>No training:</b> photos never become training data by default.</li><li><b>Honest output:</b> a visual preview is not proof of physical fit.</li><li><b>Production standard:</b> every production inference provider must contractually enforce zero retention.</li></ul><button className="primary-button" onClick={() => setPrivacyOpen(false)}>I understand</button></section></div>}
    </main>
  );
}
