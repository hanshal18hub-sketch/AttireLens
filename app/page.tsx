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

function Brand({ homeLink = false }: { homeLink?: boolean }) {
  const content = <><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">Attire<em>Lens</em></span></>;
  return homeLink ? <a href="#top" className="brand" aria-label="AttireLens home">{content}</a> : <div className="brand">{content}</div>;
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
  const turnVideo = usePreview(videoFile);
  const right = usePreview(rightFile);
  const back = usePreview(backFile);
  const left = usePreview(leftFile);
  const main = usePreview(mainFile);
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
  const captureDetail = turnVideo ? "A future local frame check will verify that all four body views are clear before estimating measurements." : angleCount === 4 ? "All four recommended views are present." : `${4 - angleCount} more angle${4 - angleCount === 1 ? "" : "s"} recommended; AttireLens should widen every uncertainty range.`;

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
    setPersonFile(null); setVideoFile(null); setVideoError(""); setRightFile(null); setBackFile(null); setLeftFile(null); setMainFile(null); setBottomFile(null); setLayerFile(null); setAccessoryFile(null); setFootwearFile(null);
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
        <Brand homeLink />
        <div className="nav-links"><a href="#how">How it works</a><button className="link-button" onClick={() => setPrivacyOpen(true)}>Privacy</button></div>
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
            <label><span>Cultural context</span><select value={region} onChange={(e) => setRegion(e.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select><small>Examples: {garmentExamples[region]}</small></label>
            <fieldset><legend>Draping preference</legend><div className="choice-row">{drapeChoices.map((choice) => <button type="button" aria-pressed={drape === choice} className={drape === choice ? "choice active" : "choice"} key={choice} onClick={() => setDrape(choice)}>{choice}</button>)}</div></fieldset>
          </div>}

          <div className={`composition-grid step-${workspaceStep}`}>
            <section className="person-panel capture-panel" aria-labelledby="person-title">
              <div className="step-label"><b>1</b><span><strong id="person-title">Capture your shape</strong>Four angles are the recommended minimum for the strongest estimate.</span></div>
              <VideoUploadCard file={turnVideo} onChange={updateVideo} error={videoError} />
              <div className="capture-divider"><span>or add individual photos</span></div>
              <div className="capture-grid">
                <UploadCard id="person-photo" title="Front" hint="Required" file={person} onChange={setPersonFile} />
                <UploadCard id="right-photo" title="Right profile" hint="Recommended" file={right} onChange={setRightFile} optional />
                <UploadCard id="back-photo" title="Back" hint="Recommended" file={back} onChange={setBackFile} optional />
                <UploadCard id="left-photo" title="Left profile" hint="Recommended" file={left} onChange={setLeftFile} optional />
              </div>
              <div className={`capture-readiness level-${angleCount}`} role="status" aria-live="polite"><b>{angleCount}/4 views Â· {captureLevel}</b><span>{captureDetail}</span></div>
              <details className="capture-guide"><summary>How to capture the best result</summary><ul><li>Show your complete body, including the top of the head and both feet.</li><li>For video, turn slowly through front, right, back and left without moving the camera.</li><li>Stand naturally with feet hip-width apart and arms slightly away from the torso.</li><li>Place the camera level around waist height; do not tilt it up or down.</li><li>Wear close-fitting clothing when comfortable, or enter measurements manually.</li><li>Provide your measured height; without a known scale, centimetre estimates cannot be dependable.</li></ul></details>
            </section>
            <section className="pieces-panel" aria-labelledby="pieces-title">
              <div className="step-label"><b>2</b><span><strong id="pieces-title">Free mix-and-match space</strong>Add, remove and replace each category independently.</span></div>
              <div className="piece-grid">
                <UploadCard id="main-garment" title={mode === "online" ? "Main garment" : "Photograph main piece"} hint="Kurta, saree, sherwani, dress, thobe..." file={main} onChange={setMainFile} />
                <UploadCard id="lower-piece" title="Lower piece" hint="Trousers, lehenga, dhoti, skirt, sarong..." file={bottom} onChange={setBottomFile} optional />
         ëNx¶‰žËkºwµçuÉ…‘¥ÕÌèÔÀ”ì‰…­É½Õ¹èŒÕŒÙŒÀìµ…É¥¸µÉ¥¡ÐèáÁàìô(¹ÍÑ…ÑÕÌ¤¹É•…‘äì‰…­É½Õ¹èŒÜÄàÀÙì‰½àµÍ¡…‘½ÜèÀ€À€À€ÑÁà€”Õ”å”Äìô(¹ÁÉ¥µ…Éäµ‰ÕÑÑ½¸ì‰½É‘•ÈèÉÁàÍ½±¥Ù…È ´µ¥¹¬¤ì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàì‰…­É½Õ¹éÙ…È ´µ¥¹¬¤ì½±½ÈéÝ¡¥Ñ”ìÁ…‘‘¥¹œèÄÑÁà€ÈÑÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÝ•¥¡ÐèàÀÀì™½¹ÐµÍ¥é”èÄÍÁàìÑÉ…¹Í¥Ñ¥½¸è¸ÉÌ•…Í”ìô(¹ÁÉ¥µ…Éäµ‰ÕÑÑ½¸é¡½Ù•Èé¹½Ð é‘¥Í…‰±•¤ì‰…­É½Õ¹éÙ…È ´µ‘••À¤ì½±½ÈéÝ¡¥Ñ”ì‰½àµÍ¡…‘½ÜèÀ€ÙÁà€ÄÙÁàÉ‰„ àÔ°ÐÜ°ØÈ°¸È¤ìÑÉ…¹Í™½É´éÑÉ…¹Í±…Ñ•d ´ÅÁà¤ìô(¹ÁÉ¥µ…Éäµ‰ÕÑÑ½¸é‘¥Í…‰±•ì½Á…¥Ñäè¸ÌàìÕÉÍ½Èé¹½Ðµ…±±½Ý•ìô(¹ÁÉ¥µ…Éäµ‰ÕÑÑ½¸ÍÁ…¸ìµ…É¥¸µ±•™ÐèÌÁÁàìô(¹…Ñ¥½¸µÁ…¹•°Íµ…±°ì©ÕÍÑ¥™äµÍ•±˜é•¹ì½±½ÈèŒäàäääÄì™½¹ÐµÍ¥é”èÄÁÁàìô(¹½¹Ñ•áÐµÉ½ÜìÁ…‘‘¥¹œèÈáÁà€ÌáÁà€Àì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìè¸ÜÕ™È€Ä¸ÈÕ™Èì…ÀèÌÉÁàìô(¹½¹Ñ•áÐµÉ½Ü±…‰•°ì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÝÁàì™½¹ÐµÍ¥é”èÄÉÁàì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹½¹Ñ•áÐµÉ½ÜÍ•±•ÐìÝ¥‘Ñ èÄÀÀ”ì‰½É‘•ÈèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰½É‘•ÈµÉ…‘¥ÕÌèÄÁÁàìÁ…‘‘¥¹œèÄÉÁàì½±½ÈéÙ…È ´µ¥¹¬¤ì‰…­É½Õ¹éÝ¡¥Ñ”ìô(¹½¹Ñ•áÐµÉ½ÜÍµ…±°ì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÝ•¥¡ÐèÐÀÀì±¥¹”µ¡•¥¡ÐèÄ¸Ðìô(¹½¹Ñ•áÐµÉ½Ü™¥•±‘Í•Ðì‰½É‘•ÈèÀìÁ…‘‘¥¹œèÀìµ…É¥¸èÀìµ¥¸µÝ¥‘Ñ èÀìô(¹½¹Ñ•áÐµÉ½Ü±••¹ì™½¹ÐµÍ¥é”èÄÉÁàì™½¹ÐµÝ•¥¡ÐèÜÀÀìµ…É¥¸µ‰½ÑÑ½´èáÁàìô(¹¡½¥”µÉ½Üì‘¥ÍÁ±…äé™±•àì™±•àµÝÉ…ÀéÝÉ…Àì…ÀèÝÁàìô(¹¡½¥”ì‰½É‘•ÈèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰…­É½Õ¹éÝ¡¥Ñ”ì½±½ÈèŒÕ˜ØÈÕˆì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìÁ…‘‘¥¹œèáÁà€ÄÅÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÍ¥é”èÄÁÁàìô(¹¡½¥”¹…Ñ¥Ù”ì‰…­É½Õ¹éÙ…È ´µ‘••À¤ì½±½ÈéÝ¡¥Ñ”ì‰½É‘•Èµ½±½ÈéÙ…È ´µ‘••À¤ì™½¹ÐµÝ•¥¡ÐèàÀÀìô(¹½µÁ½Í¥Ñ¥½¸µÉ¥ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èì…ÀèÈÑÁàìÁ…‘‘¥¹œèÈÙÁà€ÌáÁà€ÄáÁàìô(¹½µÁ½Í¥Ñ¥½¸µÉ¥¹ÍÑ•Àµ…ÁÑÕÉ”€¹Á¥••ÌµÁ…¹•°°€¹½µÁ½Í¥Ñ¥½¸µÉ¥¹ÍÑ•Àµ½ÕÑ™¥Ð€¹Á•ÉÍ½¸µÁ…¹•°°€¹½µÁ½Í¥Ñ¥½¸µÉ¥¹ÍÑ•Àµ™¥Ðì‘¥ÍÁ±…äé¹½¹”ìô(¹½µÁ½Í¥Ñ¥½¸µÉ¥¹ÍÑ•Àµ…ÁÑÕÉ”€¹Á•ÉÍ½¸µÁ…¹•°ìÝ¥‘Ñ èÄÀÀ”ìô(¹Á¥•”µÉ¥ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌéÉ•Á•…Ð Ô°Å™È¤ì…ÀèÄÁÁàìô(¹…ÁÑÕÉ”µÉ¥ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌéÉ•Á•…Ð Ð°Å™È¤ì…ÀèÄÁÁàìô(¹…ÁÑÕÉ”µÉ¥€¹ÕÁ±½…µ…É¹½µÁ…Ðìµ¥¸µ¡•¥¡ÐèÄÔÁÁàìô(¹…ÁÑÕÉ”µÉ¥€¹ÕÁ±½…µ…É¹½µÁ…Ð¥µœì¡•¥¡ÐèÄÔÁÁàìô(¹…ÁÑÕÉ”µÉ¥€¹ÕÁ±½…µ¥½¸ìÝ¥‘Ñ èÌáÁàì¡•¥¡ÐèÌáÁàì™½¹ÐµÍ¥é”èÄåÁàìô(¹Ù¥‘•¼µÕÁ±½…ìµ¥¸µ¡•¥¡ÐèÄÀÑÁàìÁ½Í¥Ñ¥½¸éÉ•±…Ñ¥Ù”ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È…ÕÑ¼ì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÄáÁàì‰½É‘•ÈèÅÁàÍ½±¥€…„Èá˜ì‰½É‘•ÈµÉ…‘¥ÕÌèÄÑÁàì‰…­É½Õ¹è™™˜Ù•˜ìÁ…‘‘¥¹œèÄÙÁà€ÄáÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èìô(¹Ù¥‘•¼µÕÁ±½…¥¹ÁÕÐìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ì½Á…¥ÑäèÀìÁ½¥¹Ñ•Èµ•Ù•¹ÑÌé¹½¹”ìô(¹Ù¥‘•¼µÕÁ±½…ÍÁ…¸ì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÑÁàìô¹Ù¥‘•¼µÕÁ±½…ÍÁ…¸ˆì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÈÅÁàìô¹Ù¥‘•¼µÕÁ±½…Íµ…±°ì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÁÁàìô(¹Ù¥‘•¼µÕÁ±½…€øÍÑÉ½¹œì‰…­É½Õ¹éÙ…È ´µ¥¹¬¤ì½±½ÈéÝ¡¥Ñ”ì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìÁ…‘‘¥¹œèÄÁÁà€ÄÑÁàì™½¹ÐµÍ¥é”èÄÁÁàìô(¹Ù¥‘•¼µÕÁ±½…Ù¥‘•¼ìÝ¥‘Ñ èÄÀÀ”ìµ…àµ¡•¥¡ÐèÄäÁÁàìÉ¥µ½±Õµ¸èÄ¼´Äì‰½É‘•ÈµÉ…‘¥ÕÌèåÁàì‰…­É½Õ¹èŒÄÄÄìô(¹Ù¥‘•¼µÕÁ±½…•´ìÉ¥µ½±Õµ¸èÄ¼´Äì½±½ÈèŒáˆÌÀÈÔì™½¹ÐµÍ¥é”èÄÁÁàì™½¹ÐµÍÑå±”é¹½Éµ…°ìô(¹…ÁÑÕÉ”µ‘¥Ù¥‘•Èì‘¥ÍÁ±…äé™±•àì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÄÉÁàìµ…É¥¸èÄÑÁà€Àì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èåÁàìÑ•áÐµÑÉ…¹Í™½É´éÕÁÁ•É…Í”ì±•ÑÑ•ÈµÍÁ…¥¹œè¸ÄÉ•´ìô(¹…ÁÑÕÉ”µ‘¥Ù¥‘•Èèé‰•™½É”°¹…ÁÑÕÉ”µ‘¥Ù¥‘•Èèé…™Ñ•Èì½¹Ñ•¹Ðèˆˆì¡•¥¡ÐèÅÁàì™±•àèÄì‰…­É½Õ¹éÙ…È ´µ±¥¹”¤ìô(¹…ÁÑÕÉ”µÉ•…‘¥¹•ÍÌìµ…É¥¸µÑ½ÀèÄÁÁàìÁ…‘‘¥¹œèÄÁÁà€ÄÉÁàì‰½É‘•Èµ±•™ÐèÑÁàÍ½±¥€„ØÝŒÔÈì‰…­É½Õ¹è™™˜å•”ì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÉÁàì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÁÁàìô(¹…ÁÑÕÉ”µÉ•…‘¥¹•ÍÌ¹±•Ù•°´Ðì‰½É‘•Èµ±•™Ðµ½±½ÈèŒÐÀÕ„ÐÜì‰…­É½Õ¹è”Ý•”Üìô(¹…ÁÑÕÉ”µÉ•…‘¥¹•ÍÌˆì½±½ÈéÙ…È ´µ¥¹¬¤ì™½¹ÐµÍ¥é”èÄÅÁàìô(¹…ÁÑÕÉ”µÕ¥‘”ìµ…É¥¸µÑ½ÀèÄÁÁàì‰½É‘•ÈèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰½É‘•ÈµÉ…‘¥ÕÌèåÁàì‰…­É½Õ¹éÝ¡¥Ñ”ì™½¹ÐµÍ¥é”èÄÅÁàì½±½ÈèŒØØØäØÀìô(¹…ÁÑÕÉ”µÕ¥‘”ÍÕµµ…ÉäìÁ…‘‘¥¹œèÄÁÁà€ÄÉÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÝ•¥¡ÐèÜÀÀì½±½ÈéÙ…È ´µ‘••À¤ìô(¹…ÁÑÕÉ”µÕ¥‘”Õ°ìµ…É¥¸èÀìÁ…‘‘¥¹œèÀ€ÈÙÁà€ÄÉÁàì±¥¹”µ¡•¥¡ÐèÄ¸Ôìô(¹™¥ÐµÍÑÕ‘¥¼ìµ…É¥¸èÀ€ÌáÁà€ÈÑÁàìÁ…‘‘¥¹œèÈÑÁàì‰½É‘•ÈèÅÁàÍ½±¥€‘™ŒÝˆÜì‰½É‘•ÈµÉ…‘¥ÕÌèÄÑÁàì‰…­É½Õ¹è™‰˜Á”àì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÄ¸ÄÕ™È€Å™È€Å™Èì…ÀèÈÉÁàì‰½àµÍ¡…‘½Üé¹½¹”ìô(¹™¥Ðµ¥¹ÑÉ¼ Èì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÌÁÁàì±¥¹”µ¡•¥¡ÐèÄ¸ÀÔìµ…É¥¸èåÁà€À€ÄÁÁàìô(¹™¥Ðµ¥¹ÑÉ¼Àì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÉÁàì±¥¹”µ¡•¥¡ÐèÄ¸ÔÔìµ…É¥¸èÀ€À€ÄáÁàìô(¹™¥Ðµ½ÁÑ¥½¹Ìì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È€Å™Èì…ÀèåÁàìô(¹™¥Ðµ½ÁÑ¥½¹Ì±…‰•°°€¹µ•…ÍÕÉ•µ•¹ÐµÉ¥±…‰•°ì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÙÁàì½±½ÈèŒÕ˜ØÈÕˆì™½¹ÐµÍ¥é”èÄÁÁàì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹™¥Ðµ½ÁÑ¥½¹ÌÍ•±•Ð°€¹µ•…ÍÕÉ•µ•¹ÐµÉ¥¥¹ÁÕÐìÝ¥‘Ñ èÄÀÀ”ì‰½É‘•ÈèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰½É‘•ÈµÉ…‘¥ÕÌèáÁàì‰…­É½Õ¹éÝ¡¥Ñ”ì½±½ÈéÙ…È ´µ¥¹¬¤ìÁ…‘‘¥¹œèåÁà€ÄÁÁàìô(¹µ•…ÍÕÉ•µ•¹ÐµÉ½ÕÀ Ìì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÈÁÁàìµ…É¥¸èÀ€À€ÄÁÁàìô(¹µ•…ÍÕÉ•µ•¹Ðµ¹½Ñ”ì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÁÁàì±¥¹”µ¡•¥¡ÐèÄ¸ÐÔìµ…É¥¸è´ÑÁà€À€ÄÁÁàìô(¹µ•…ÍÕÉ•µ•¹ÐµÉ¥ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È€Å™Èì…ÀèåÁàìô(¹½¹™¥É´µÉ½Üì‘¥ÍÁ±…äé™±•àì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÕÁàì™½¹ÐµÍ¥é”èåÁàì™½¹ÐµÝ•¥¡ÐèÔÀÀì½±½ÈéÙ…È ´µµÕÑ•¤ìô(¹½¹™¥É´µÉ½Ü¥¹ÁÕÐìÝ¥‘Ñ é…ÕÑ¼ìµ…É¥¸èÀì…•¹Ðµ½±½ÈéÙ…È ´µ‘••À¤ìô(¹µ•…ÍÕÉ•µ•¹Ðµ¡…ÉÐìµ…É¥¸µÑ½ÀèÄÑÁàì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÝÁàìô(¹µ•…ÍÕÉ•µ•¹Ðµ¡…ÉÐ‘¥Øì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÐÉÁà€Å™È€ÔÉÁàì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÝÁàì™½¹ÐµÍ¥é”èáÁàìÑ•áÐµÑÉ…¹Í™½É´é…Á¥Ñ…±¥é”ì½±½ÈéÙ…È ´µµÕÑ•¤ìô(¹µ•…ÍÕÉ•µ•¹Ðµ¡…ÉÐ‘¥Øèé‰•™½É”ì½¹Ñ•¹ÐèˆˆìÉ¥µ½±Õµ¸èÈìÉ¥µÉ½ÜèÄì¡•¥¡ÐèÝÁàì‰…­É½Õ¹è‘•‘™àì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìô(¹µ•…ÍÕÉ•µ•¹Ðµ¡…ÉÐ¤ìÉ¥µ½±Õµ¸èÈìÉ¥µÉ½ÜèÄì¡•¥¡ÐèÝÁàì‰…­É½Õ¹èŒÝŒáˆÜÔì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìµ¥¸µÝ¥‘Ñ èÀìèµ¥¹‘•àèÄìÑÉ…¹Í¥Ñ¥½¸éÝ¥‘Ñ €¸ÉÌ•…Í”ìô(¹µ•…ÍÕÉ•µ•¹Ðµ¡…ÉÐˆì½±½ÈéÙ…È ´µ¥¹¬¤ìÑ•áÐµ…±¥¸éÉ¥¡Ðì™½¹ÐµÍ¥é”èáÁàìô(¹™¥ÐµÉ•…‘¥¹•ÍÌìÉ¥µ½±Õµ¸èÄ¼´Äì‰½É‘•Èµ±•™ÐèÑÁàÍ½±¥€„ØÝŒÔÈì‰…­É½Õ¹è™™˜å•”ìÁ…‘‘¥¹œèÄÉÁà€ÄÑÁàì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÍÁàì™½¹ÐµÍ¥é”èÄÅÁàì½±½ÈèŒØàÙˆØÌìô(¹™¥ÐµÉ•…‘¥¹•ÍÌ¹½µÁ±•Ñ”ì‰½É‘•Èµ±•™Ðµ½±½ÈèŒÐÀÕ„ÐÜì‰…­É½Õ¹è”Ý•”Üìô(¹™¥ÐµÉ•…‘¥¹•ÍÌˆì½±½ÈéÙ…È ´µ¥¹¬¤ìô(¹ÍÑ•Àµ…Ñ¥½¹Ììµ…É¥¸èÀ€ÌáÁà€ÈáÁàìÁ…‘‘¥¹œµÑ½ÀèÄáÁàì‰½É‘•ÈµÑ½ÀèÅÁàÍ½±¥€•‰”Ý‘”ì‘¥ÍÁ±…äé™±•àì©ÕÍÑ¥™äµ½¹Ñ•¹ÐéÍÁ…”µ‰•ÑÝ••¸ì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÄÙÁàì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÅÁàìô(¹…Ñ¥½¸µÁ…¹•°¹Ý¥‘”ìµ…É¥¸èÀ€ÌáÁà€ÈáÁàìô(¹ÁÉ¥Ù…äµ±¥¹”ìµ…É¥¸èÈÁÁà…ÕÑ¼€Àì½±½ÈéÙ…È ´µµÕÑ•¤ì™½¹ÐµÍ¥é”èÄÅÁàìô(¹É•ÍÕ±Ðì‰½É‘•ÈµÑ½ÀèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰…­É½Õ¹è••”å”ÄìÁ…‘‘¥¹œèÌÉÁà€ÌáÁàì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìè¸àÕ™È€Ä¸ÄÕ™Èì…ÀèÌáÁàì…¹¥µ…Ñ¥½¸éÉ•Ù•…°€¸ÕÌ•…Í”‰½Ñ ìô)­•å™É…µ•ÌÉ•Ù•…°ì™É½´ì½Á…¥ÑäèÀìÑÉ…¹Í™½É´éÑÉ…¹Í±…Ñ•d ÄÉÁà¤ìôô(¹É•ÍÕ±Ðµ­¥­•Èì™½¹ÐµÍ¥é”èÄÁÁàì±•ÑÑ•ÈµÍÁ…¥¹œè¸Äá•´ì™½¹ÐµÝ•¥¡ÐèàÀÀì½±½ÈèŒØØÜÄØÀìô(¹É•ÍÕ±Ð È°€¹¡½Ü È°€¹ÁÉ¥Ù…äµµ½‘…° Èì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÐÉÁàì±¥¹”µ¡•¥¡ÐèÄì±•ÑÑ•ÈµÍÁ…¥¹œè´¸ÀÌÕ•´ìµ…É¥¸èÄÁÁà€À€ÄÕÁàìô(¹É•ÍÕ±Ðµ½ÁäÀì½±½ÈèŒØàÙˆØÌì±¥¹”µ¡•¥¡ÐèÄ¸Øì™½¹ÐµÍ¥é”èÄÍÁàìô(¹¥¹Í¥¡ÑÌìµ…É¥¸èÈÑÁà€Àì‰½É‘•ÈµÑ½ÀèÅÁàÍ½±¥€Íá˜ìô(¹¥¹Í¥¡ÑÌ‘¥Øì‘¥ÍÁ±…äé™±•àì©ÕÍÑ¥™äµ½¹Ñ•¹ÐéÍÁ…”µ‰•ÑÝ••¸ìÁ…‘‘¥¹œèÄÉÁà€Àì‰½É‘•Èµ‰½ÑÑ½´èÅÁàÍ½±¥€Íá˜ì™½¹ÐµÍ¥é”èÄÅÁàìô(¹¥¹Í¥¡ÑÌÍÁ…¸ì½±½ÈèŒÜÜÝˆÜÌìô(¹¥¹Í¥¡ÑÌÍÑÉ½¹œì½±½ÈèŒÔÄÔÐÑ”ìô¹¥¹Í¥¡ÑÌ€¹Í…™”ì½±½ÈèŒÔÄØØÑ˜ìô(¹Í•½¹‘…Éäµ‰ÕÑÑ½¸ì‰…­É½Õ¹é¹½¹”ì‰½É‘•ÈèÅÁàÍ½±¥€…•ˆÙ…„ì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìÁ…‘‘¥¹œèÄÁÁà€ÄÕÁàì½±½ÈéÙ…È ´µ‘••À¤ìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÍ¥é”èÄÅÁàì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹É•ÍÕ±Ðµ…Ñ¥½¹Ìì‘¥ÍÁ±…äé™±•àì™±•àµÝÉ…ÀéÝÉ…Àì…ÀèáÁàìµ…É¥¸èÄáÁà€À€ÑÁàìô(¹ÍÈµÍÑ…ÑÕÌìµ¥¸µ¡•¥¡ÐèÈÁÁàì½±½ÈèŒÔÄØØÑ˜€…¥µÁ½ÉÑ…¹Ðì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹…Õ‘¥ÐµÉ¥ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È€Å™Èì…ÀèÄáÁàìµ…É¥¸èÈÁÁà€Àìô(¹…Õ‘¥ÐµÉ¥¹Í¥¹±”ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èìô(¹…Õ‘¥ÐµÉ¥ Ìì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÈÁÁàìµ…É¥¸èÀ€À€áÁàìô(¹¡•¬µ±¥ÍÐì±¥ÍÐµÍÑå±”é¹½¹”ìÁ…‘‘¥¹œèÀìµ…É¥¸èÀì‰½É‘•ÈµÑ½ÀèÅÁàÍ½±¥€Íá˜ìô(¹¡•¬µ±¥ÍÐ±¤ì‘¥ÍÁ±…äé™±•àì©ÕÍÑ¥™äµ½¹Ñ•¹ÐéÍÁ…”µ‰•ÑÝ••¸ì…ÀèÄÁÁàìÁ…‘‘¥¹œèåÁà€Àì‰½É‘•Èµ‰½ÑÑ½´èÅÁàÍ½±¥€Íá˜ì™½¹ÐµÍ¥é”èÄÁÁàìô(¹¡•¬µ±¥ÍÐÍÁ…¸ìÑ•áÐµ…±¥¸éÉ¥¡Ðì½±½ÈèŒÜÜÝˆÜÌìô¹¡•¬µ±¥ÍÐ€¹½½ì½±½ÈèŒÐÈØÀÐÐì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹‘•±•Ñ”µ‰ÕÑÑ½¸ì‰½É‘•ÈèÅÁàÍ½±¥€„ÔÙˆØÈì‰…­É½Õ¹è™™˜å˜Üì½±½ÈèŒÝˆÍ˜ÌÜì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìÁ…‘‘¥¹œèÄÁÁà€ÄÕÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÍ¥é”èÄÅÁàì™½¹ÐµÝ•¥¡ÐèÜÀÀìô(¹½¹•ÁÐµ…¹Ù…Ììµ¥¸µ¡•¥¡ÐèÐÀÁÁàìÁ½Í¥Ñ¥½¸éÉ•±…Ñ¥Ù”ì½Ù•É™±½Üé¡¥‘‘•¸ì‰…­É½Õ¹è‘•‘‰Ìì‰½É‘•ÈµÉ…‘¥ÕÌèÄÑÁàìô(¹Á•ÉÍ½¸µ¥µ…”ìÝ¥‘Ñ èÄÀÀ”ì¡•¥¡ÐèÄÀÀ”ìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ì½‰©•Ðµ™¥Ðé½Ù•ÈìÑÉ…¹Í¥Ñ¥½¸éÑÉ…¹Í™½É´€¸ÈÕÌ•…Í”ìô(¹…Éµ•¹Ðµ¥¹Í•ÐìÝ¥‘Ñ èÄÌÁÁàìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ìÉ¥¡ÐèÄÑÁàìÑ½ÀèÄÑÁàìÁ…‘‘¥¹œèÙÁàì‰½É‘•ÈµÉ…‘¥ÕÌèåÁàì‰…­É½Õ¹éÉ‰„ ÈÔÔ°ÈÔÔ°ÈÔÔ°¸ä¤ì‰½àµÍ¡…‘½ÜèÀ€áÁà€ÌÁÁàÉ‰„ À°À°À°¸Äà¤ìô(¹…Éµ•¹Ðµ¥¹Í•Ð¥µœìÝ¥‘Ñ èÄÀÀ”ì…ÍÁ•ÐµÉ…Ñ¥¼èÄ¼Ä¸Èì½‰©•Ðµ™¥Ðé½Ù•Èì‰½É‘•ÈµÉ…‘¥ÕÌèÕÁàìô(¹Á¥•”µÍÑ…¬ìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ìÉ¥¡ÐèÄÑÁàìÑ½ÀèÄÑÁàì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÝÁàìô(¹Á¥•”µÍÑ…¬¥µœìÝ¥‘Ñ èäÉÁàì¡•¥¡ÐèÄÀÁÁàì½‰©•Ðµ™¥Ðé½Ù•Èì‰½É‘•ÈèÕÁàÍ½±¥É‰„ ÈÔÔ°ÈÔÔ°ÈÔÔ°¸äÈ¤ì‰½É‘•ÈµÉ…‘¥ÕÌèáÁàì‰½àµÍ¡…‘½ÜèÀ€ÙÁà€ÈÁÁàÉ‰„ À°À°À°¸ÄØ¤ìô(¹…Éµ•¹Ðµ¥¹Í•ÐÍÁ…¸°€¹½¹•ÁÐµ±…‰•°ì‘¥ÍÁ±…äé‰±½¬ì™½¹ÐµÍ¥é”èåÁàìÑ•áÐµÑÉ…¹Í™½É´éÕÁÁ•É…Í”ì±•ÑÑ•ÈµÍÁ…¥¹œè¸Å•´ìÑ•áÐµ…±¥¸é•¹Ñ•ÈìÁ…‘‘¥¹œèÕÁà€À€ÅÁàìô(¹½¹•ÁÐµ±…‰•°ìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ì±•™ÐèÄÑÁàì‰½ÑÑ½´èÄÑÁàì½±½ÈéÝ¡¥Ñ”ì‰…­É½Õ¹éÉ‰„ ÌÀ°ÌÔ°ÌÀ°¸Ü¤ì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàìÁ…‘‘¥¹œèÝÁà€ÄÁÁàìô(¹É½Ñ…Ñ¥½¸µ½¹ÑÉ½±ÌìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ìÉ¥¡ÐèÄÑÁàì‰½ÑÑ½´èÄÑÁàì‘¥ÍÁ±…äé™±•àì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÝÁàìÁ…‘‘¥¹œèÕÁàì‰½É‘•ÈµÉ…‘¥ÕÌèäåÁàì‰…­É½Õ¹éÉ‰„ ÈÔÔ°ÈÔÌ°ÈÐà°¸äÐ¤ì‰½àµÍ¡…‘½ÜèÀ€ÕÁà€ÈÁÁàÉ‰„ À°À°À°¸ÄØ¤ìô(¹É½Ñ…Ñ¥½¸µ½¹ÑÉ½±Ì‰ÕÑÑ½¸ìÝ¥‘Ñ èÌÑÁàì¡•¥¡ÐèÌÑÁàì‰½É‘•ÈèÅÁàÍ½±¥Ù…È ´µ±¥¹”¤ì‰½É‘•ÈµÉ…‘¥ÕÌèÔÀ”ì‰…­É½Õ¹éÝ¡¥Ñ”ì½±½ÈéÙ…È ´µ‘••À¤ìÕÉÍ½ÈéÁ½¥¹Ñ•Èì™½¹ÐµÍ¥é”èÈÁÁàì±¥¹”µ¡•¥¡ÐèÄìô(¹É½Ñ…Ñ¥½¸µ½¹ÑÉ½±ÌÍÁ…¸ìµ¥¸µÝ¥‘Ñ èÌÉÁàìÑ•áÐµ…±¥¸é•¹Ñ•Èì½±½ÈéÙ…È ´µ¥¹¬¤ì™½¹ÐµÍ¥é”èÄÁÁàì™½¹ÐµÝ•¥¡ÐèàÀÀìô(¹É½Ñ…Ñ¥½¸µ¹½Ñ”ìÉ¥µ½±Õµ¸èÈìµ…É¥¸è´ÌÑÁà€À€À€…¥µÁ½ÉÑ…¹Ðì™½¹ÐµÍ¥é”èÄÁÁà€…¥µÁ½ÉÑ…¹Ðì½±½ÈèŒÜÌÜØÙ”€…¥µÁ½ÉÑ…¹Ðìô(¹¡½ÜìÝ¥‘Ñ éµ¥¸ ÄÈÈÁÁà±…±Œ ÄÀÀ”€´€ÐÁÁà¤¤ìµ…É¥¸èÌÑÁà…ÕÑ¼€ÐáÁàìÁ…‘‘¥¹œèÜÑÁà€ÔÑÁàì‰½É‘•ÈèÅÁàÍ½±¥É‰„ äÄ°ÔÜ°Ìà°¸Äà¤ì‰½É‘•ÈµÉ…‘¥ÕÌèÈáÁàì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìè¸ÜÉ™È€Ä¸Èá™Èì…ÀèÐáÁàìÁ½Í¥Ñ¥½¸éÉ•±…Ñ¥Ù”ì¥Í½±…Ñ¥½¸é¥Í½±…Ñ”ì½Ù•É™±½Üé¡¥‘‘•¸ì‰…­É½Õ¹è•™”ÉÈÕÉ° œ½…ÑÑ¥É•±•¹Ìµ‘É•ÍÍ¥¹œµÉ½½´¹Á¹œœ¤•¹Ñ•È½½Ù•È¹¼µÉ•Á•…Ðì‰½àµÍ¡…‘½ÜèÀ€ÈÑÁà€ØÁÁàÉ‰„ ÜÐ°ÐÔ°ÌÐ°¸ÄÈ¤ìô(¹¡½Üèé‰•™½É”ì½¹Ñ•¹ÐèˆˆìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ì¥¹Í•ÐèÀìèµ¥¹‘•àè´Äì‰…­É½Õ¹é±¥¹•…ÈµÉ…‘¥•¹Ð äÁ‘•œ±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸äØ¤€À”±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸äÄ¤€ÌØ”±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸Øà¤€ØÄ”±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸ÐÈ¤€ÄÀÀ”¤ìô(¹¡½Ü Èì™½¹ÐµÍ¥é”èÔÉÁàìµ…É¥¸µÑ½ÀèÄÑÁàìô(¹¡½Ü È•´ì½±½ÈèŒäØÉ˜ÈÐì™½¹ÐµÝ•¥¡ÐèØÀÀìô(¹¡½ÜµÁÉ½µ¥Í”€øÀìµ…àµÝ¥‘Ñ èÌÄÁÁàìµ…É¥¸èÈÉÁà€À€Àì½±½ÈèŒÔÔÑ„ÐÌì™½¹ÐµÍ¥é”èÄÍÁàì±¥¹”µ¡•¥¡ÐèÄ¸ÔÔìô(¹™•…ÑÕÉ”µÉ¥ì‘¥ÍÁ±…äé™±•àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÄÑÁàì‰…­É½Õ¹éÑÉ…¹ÍÁ…É•¹Ðìô(¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”ìÝ¥‘Ñ èàà”ì‘¥ÍÁ±…äéÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìè¸àÕ™È€Ä¸ÄÕ™Èì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì…ÀèÈÉÁàì‰…­É½Õ¹éÉ‰„ ÈÔÔ°ÈÔÌ°ÈÐä°¸àà¤ì‰½É‘•ÈèÅÁàÍ½±¥€ÕˆÈå˜ì‰½É‘•ÈµÉ…‘¥ÕÌèääåÁàìÁ…‘‘¥¹œèÈÁÁà€ÈáÁàìµ¥¸µ¡•¥¡ÐèÀì‰½àµÍ¡…‘½ÜèÀ€áÁà€ÈÑÁàÉ‰„ ÜÐ°ÐÔ°ÌÐ°¸ÀØ¤ìô(¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”é¹Ñ µ¡¥±¡•Ù•¸¤ì…±¥¸µÍ•±˜é™±•àµ•¹ì‰…­É½Õ¹éÉ‰„ ÈÌà°ÈÈØ°ÈÌä°¸àà¤ì‰½É‘•Èµ½±½Èè…ˆÉŒìô(¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”é¹Ñ µ¡¥± Ì¤ì‰…­É½Õ¹éÉ‰„ ÈÌÀ°ÈÌÜ°ÈÈÔ°¸ä¤ì‰½É‘•Èµ½±½Èè‰‘‰ˆÜìô(¹™•…ÑÕÉ”µÉ¥ Ìì™½¹Ðµ™…µ¥±äéÙ…È ´µ™½¹Ðµ‘¥ÍÁ±…ä¤±Í•É¥˜ì™½¹ÐµÍ¥é”èÈÕÁàìµ…É¥¸èÀìô¹™•…ÑÕÉ”µÉ¥Àì½±½ÈèŒÕ˜ÔäÔÐì±¥¹”µ¡•¥¡ÐèÄ¸Ôì™½¹ÐµÍ¥é”èÄÉÁàìµ…É¥¸èÀìô)™½½Ñ•Èìµ¥¸µ¡•¥¡ÐèÄÌÁÁàì‘¥ÍÁ±…äé™±•àì…±¥¸µ¥Ñ•µÌé•¹Ñ•Èì©ÕÍÑ¥™äµ½¹Ñ•¹ÐéÍÁ…”µ‰•ÑÝ••¸ì‰½É‘•ÈµÑ½ÀèÅÁàÍ½±¥É‰„ ÌÐ°ÌÔ°ÌÄ°¸ÄÌ¤ì½±½ÈèŒÜÌÜÐÙì™½¹ÐµÍ¥é”èÄÉÁàìô(¹µ½‘…°µ‰…­‘É½ÀìÁ½Í¥Ñ¥½¸é™¥á•ì¥¹Í•ÐèÀìèµ¥¹‘•àèÈÀì‰…­É½Õ¹éÉ‰„ ÈÜ°ÌÄ°ÈÜ°¸ØÈ¤ì‘¥ÍÁ±…äéÉ¥ìÁ±…”µ¥Ñ•µÌé•¹Ñ•ÈìÁ…‘‘¥¹œèÈÁÁàì‰…­‘É½Àµ™¥±Ñ•Èé‰±ÕÈ áÁà¤ìô(¹ÁÉ¥Ù…äµµ½‘…°ìÁ½Í¥Ñ¥½¸éÉ•±…Ñ¥Ù”ìÝ¥‘Ñ éµ¥¸ ØÀÁÁà°ÄÀÀ”¤ìµ…àµ¡•¥¡ÐèäÁÙ ì½Ù•É™±½Üé…ÕÑ¼ì‰…­É½Õ¹éÙ…È ´µÁ…Á•È¤ì‰½É‘•ÈµÉ…‘¥ÕÌèÄáÁàìÁ…‘‘¥¹œèÐÉÁàì‰½àµÍ¡…‘½ÜèÀ€ÈÕÁà€àÁÁàÉ‰„ À°À°À°¸ÈÔ¤ìô(¹ÁÉ¥Ù…äµµ½‘…° Èì™½¹ÐµÍ¥é”èÐáÁàìô¹ÁÉ¥Ù…äµµ½‘…°À°€¹ÁÉ¥Ù…äµµ½‘…°±¤ì½±½ÈèŒØäÙˆØÐì±¥¹”µ¡•¥¡ÐèÄ¸Øì™½¹ÐµÍ¥é”èÄÍÁàìô¹ÁÉ¥Ù…äµµ½‘…°Õ°ìÁ…‘‘¥¹œµ±•™ÐèÄáÁàìµ…É¥¸èÈÉÁà€À€ÈáÁàìô¹ÁÉ¥Ù…äµµ½‘…°±¤ìµ…É¥¸µ‰½ÑÑ½´èÄÁÁàìô¹µ½‘…°µ±½Í”ìÁ½Í¥Ñ¥½¸é…‰Í½±ÕÑ”ìÉ¥¡ÐèÄáÁàìÑ½ÀèÄÑÁàì‰½É‘•ÈèÀì‰…­É½Õ¹é¹½¹”ì™½¹ÐµÍ¥é”èÈÙÁàìÕÉÍ½ÈéÁ½¥¹Ñ•Èì½±½ÈèŒÜÜÜìô)µ•‘¥„€¡µ…àµÝ¥‘Ñ èÜØÁÁà¤ì(€€¹Í¡•±°ìÝ¥‘Ñ éµ¥¸ ÄÀÀ”€´€ÈÑÁà°€ÄÄØÁÁà¤ìô¹¹…Øì¡•¥¡ÐèÜÁÁàìô¹¹…Øµ±¥¹­Ìì‘¥ÍÁ±…äé¹½¹”ìô¹¹…ØµÑ„ì™½¹ÐµÍ¥é”èÄÅÁà€…¥µÁ½ÉÑ…¹ÐìÁ…‘‘¥¹œèåÁà€ÄÍÁà€…¥µÁ½ÉÑ…¹Ðìô€¹¡•É¼ìÁ…‘‘¥¹œµÑ½ÀèÌáÁàìô Äì™½¹ÐµÍ¥é”èÔÑÁàìô¹¡•É¼µ½Áäì™½¹ÐµÍ¥é”èÄÑÁàìô¹µ½‘”µÑ…‰Ì‰ÕÑÑ½¸ìµ¥¸µÝ¥‘Ñ èÀìÝ¥‘Ñ èÔÀ”ìÁ…‘‘¥¹œµ¥¹±¥¹”èÄÁÁàì™½¹ÐµÍ¥é”èÄÉÁàìô¹Ý½É­ÍÁ…”µÁÉ½É•ÍÌìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È€Å™È€Å™ÈìÁ…‘‘¥¹œµ¥¹±¥¹”èÄÉÁàì…ÀèÕÁàìô¹Ý½É­ÍÁ…”µÁÉ½É•ÍÌ¤°¹Ý½É­ÍÁ…”µÁÉ½É•ÍÌ‰ÕÑÑ½¸Íµ…±°ì‘¥ÍÁ±…äé¹½¹”ìô¹Ý½É­ÍÁ…”µÁÉ½É•ÍÌ‰ÕÑÑ½¸ì©ÕÍÑ¥™äµ½¹Ñ•¹Ðé•¹Ñ•ÈìÁ…‘‘¥¹œèåÁà€ÕÁàìô¹Ý½É­ÍÁ…”µÁÉ½É•ÍÌ‰ÕÑÑ½¸ÍÁ…¸ì™½¹ÐµÍ¥é”èåÁàìô¹½¹Ñ•áÐµÉ½Ü°¹½µÁ½Í¥Ñ¥½¸µÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™ÈìÁ…‘‘¥¹œµ¥¹±¥¹”èÄáÁàìô¹…ÁÑÕÉ”µÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™È€Å™Èìô¹Á¥•”µÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èìô¹ÍÑ•Àµ…Ñ¥½¹Ììµ…É¥¸µ¥¹±¥¹”èÄáÁàì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ìÑ•áÐµ…±¥¸é•¹Ñ•Èìô¹™¥ÐµÍÑÕ‘¥¼ìµ…É¥¸µ¥¹±¥¹”èÄáÁàìÁ…‘‘¥¹œèÈÁÁàìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èìô¹™¥ÐµÉ•…‘¥¹•ÍÌìÉ¥µ½±Õµ¸é…ÕÑ¼ìô¹…Ñ¥½¸µÁ…¹•°¹Ý¥‘”ìµ…É¥¸µ¥¹±¥¹”èÄáÁàìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èì…ÀèÄÑÁàìÑ•áÐµ…±¥¸é•¹Ñ•Èìô¹…Ñ¥½¸µÁ…¹•°Íµ…±°ì©ÕÍÑ¥™äµÍ•±˜é•¹Ñ•Èìô¹ÍÑ…ÑÕÌì½É‘•Èè´Äìô¹É•ÍÕ±ÐìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™ÈìÁ…‘‘¥¹œèÈÕÁà€ÄáÁàìô¹½¹•ÁÐµ…¹Ù…Ììµ¥¸µ¡•¥¡ÐèÐÄÁÁàì½É‘•Èè´Äìô¹É½Ñ…Ñ¥½¸µ¹½Ñ”ìÉ¥µ½±Õµ¸èÄìµ…É¥¸èÀ€…¥µÁ½ÉÑ…¹Ðìô¹…Õ‘¥ÐµÉ¥ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èìô¹¡½ÜìÝ¥‘Ñ éµ¥¸ ÄÀÀ”€´€ÈÑÁà°ÄÄØÁÁà¤ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èì…ÀèÌÁÁàìÁ…‘‘¥¹œèÐÙÁà€ÈÉÁàì‰…­É½Õ¹µÁ½Í¥Ñ¥½¸èÔà”•¹Ñ•Èìô¹¡½Üèé‰•™½É”ì‰…­É½Õ¹é±¥¹•…ÈµÉ…‘¥•¹Ð ÄàÁ‘•œ±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸äÜ¤€À”±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸ä¤€ÐÜ”±É‰„ ÈÔÔ°ÈÔÀ°ÈÐÄ°¸ØØ¤€ÄÀÀ”¤ìô¹¡½Ü Èì™½¹ÐµÍ¥é”èÐÙÁàìô¹¡½ÜµÁÉ½µ¥Í”€øÀìµ…àµÝ¥‘Ñ èÄÀÀ”ìô¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÌÉÁà€Å™Èì…ÀèÄÉÁàìô¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”ÀìÉ¥µ½±Õµ¸èÈìô™½½Ñ•ÈìÁ…‘‘¥¹œèÌÁÁà€Àì™±•àµ‘¥É•Ñ¥½¸é½±Õµ¸ì…ÀèÄÕÁàìÑ•áÐµ…±¥¸é•¹Ñ•Èìô¹ÁÉ¥Ù…äµµ½‘…°ìÁ…‘‘¥¹œèÌáÁà€ÈÑÁà€ÈáÁàìô¹ÁÉ¥Ù…äµµ½‘…° Èì™½¹ÐµÍ¥é”èÐÁÁàìô)ô)µ•‘¥„€¡µ…àµÝ¥‘Ñ èÜØÁÁà¤ì€¹Ù¥‘•¼µÕÁ±½…ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™ÈìÑ•áÐµ…±¥¸é•¹Ñ•Èìô¹Ù¥‘•¼µÕÁ±½…€øÍÑÉ½¹œì©ÕÍÑ¥™äµÍ•±˜é•¹Ñ•Èìô¹¡•É¼èé‰•™½É”ì±•™Ðè´äÁÁàìô¹¡•É¼èé…™Ñ•ÈìÉ¥¡Ðè´ÄÄÁÁàìô¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”°¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”é¹Ñ µ¡¥±¡•Ù•¸¤ìÝ¥‘Ñ èÄÀÀ”ìÉ¥µÑ•µÁ±…Ñ”µ½±Õµ¹ÌèÅ™Èì…±¥¸µÍ•±˜éÍÑÉ•Ñ ì…ÀèÕÁàì‰½É‘•ÈµÉ…‘¥ÕÌèÈÑÁàìÁ…‘‘¥¹œèÄåÁà€ÈÅÁàìô¹™•…ÑÕÉ”µÉ¥…ÉÑ¥±”ÀìÉ¥µ½±Õµ¸é…ÕÑ¼ìôô)µ•‘¥„€¡ÁÉ•™•ÉÌµÉ•‘Õ•µµ½Ñ¥½¸èÉ•‘Õ”¤ì€¨°¨èé‰•™½É”°¨èé…™Ñ•Èì…¹¥µ…Ñ¥½¸µ‘ÕÉ…Ñ¥½¸è¸ÀÅµÌ€…¥µÁ½ÉÑ…¹Ðì…¹¥µ…Ñ¥½¸µ¥Ñ•É…Ñ¥½¸µ½Õ¹ÐèÄ€…¥µÁ½ÉÑ…¹ÐìÍÉ½±°µ‰•¡…Ù¥½Èé…ÕÑ¼€…¥µÁ½ÉÑ…¹ÐìÑÉ…¹Í¥Ñ¥½¸µ‘ÕÉ…Ñ¥½¸è¸ÀÅµÌ€…¥µÁ½ÉÑ…¹Ðìôô)µ•‘¥„€¡™½É•µ½±½ÉÌè…Ñ¥Ù”¤ì€¹¡½¥”¹…Ñ¥Ù”°¹ÁÉ¥µ…Éäµ‰ÕÑÑ½¸°¹ÍÑ•Àµ±…‰•°ˆì‰½É‘•ÈèÉÁàÍ½±¥	ÕÑÑ½¹Q•áÐìôô