­r‡^Ñf¥–Ø¦{]ìyÊ'vÃ®¶›­"use client";

import { FormEvent, useMemo, useState } from "react";

type Field = "chest" | "waist" | "hip" | "inseam";
type Values = Record<Field, string>;
type Ranges = Record<Field, { low: string; high: string }>;
type Fit = "tight" | "close" | "regular" | "loose" | "unknown";
type Report = {
  environment: "test";
  testOnly: true;
  summary: { meanAbsoluteErrorCm: number; confidenceCoveragePercent: number; fitAgreementPercent: number; passed: boolean };
  measurements: Array<{ field: Field; absoluteErrorCm: number; withinRange: boolean }>;
  gates: string[];
};

const fields: Field[] = ["chest", "waist", "hip", "inseam"];
const emptyValues: Values = { chest: "", waist: "", hip: "", inseam: "" };
const emptyRanges: Ranges = { chest: { low: "", high: "" }, waist: { low: "", high: "" }, hip: { low: "", high: "" }, inseam: { low: "", high: "" } };

export default function LabClient({ operator }: { operator: string }) {
  const [caseId, setCaseId] = useState(() => `FIT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
  const [source, setSource] = useState<"simulated" | "model-predicted">("simulated");
  const [garment, setGarment] = useState("Kurta");
  const [truth, setTruth] = useState<Values>(emptyValues);
  const [predicted, setPredicted] = useState<Values>(emptyValues);
  const [ranges, setRanges] = useState<Ranges>(emptyRanges);
  const [fitTruth, setFitTruth] = useState<Fit>("regular");
  const [fitPredicted, setFitPredicted] = useState<Fit>("unknown");
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const complete = useMemo(() => fields.every((field) => truth[field] && predicted[field] && ranges[field].low && ranges[field].high), [truth, predicted, ranges]);

  function updateValues(setter: typeof setTruth, field: Field, value: string) { setter((current) => ({ ...current, [field]: value })); }
  function updateRange(field: Field, side: "low" | "high", value: string) { setRanges((current) => ({ ...current, [field]: { ...current[field], [side]: value } })); }

  async function evaluate(event: FormEvent) {
    event.preventDefault(); setError(""); setReport(null);
    if (!consent) return setError("Record consent before evaluating a human test case.");
    setBusy(true);
    try {
      const response = await fetch("/api/lab/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ environment: "test", caseId, source, garment, consentRecorded: consent, groundTruth: truth, prediction: { values: predicted, ranges }, fit: { groundTruth: fitTruth, predicted: fitPredicted } }) });
      const data = await response.json() as Report & { error?: string };
      if (!response.ok) throw new Error(data.error || "Evaluation was rejected.");
      setReport(data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Evaluation failed safely."); }
    finally { setBusy(false); }
  }

  function exportCase() {
    const payload = { environment: "test", testOnly: true, caseId, source, garment, consentRecorded: consent, groundTruth: truth, prediction: { values: predicted, ranges }, fit: { groundTruth: fitTruth, predicted: fitPredicted }, report };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${caseId}.test.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <main className="lab-page"><header className="lab-header"><div><a href="/" className="lab-brand">AttireLens</a><span className="test-badge">TEST LAB Â· NOT CUSTOMER OUTPUT</span></div><p>Signed in as {operator}</p></header><section className="lab-hero"><span>INTERNAL FIT VALIDATION</span><h1>Measure the model.<br />Don&apos;t admire it.</h1><p>Compare predictions with known truth. Simulated and model-produced values are always identified separately.</p></section><form className="lab-workspace" onSubmit={evaluate}><section className="lab-card lab-identity"><h2>Test case</h2><label>Anonymous case ID<input value={caseId} onChange={(event) => setCaseId(event.target.value.toUpperCase())} pattern="[A-Z0-9-]{4,40}" required /></label><label>Prediction source<select value={source} onChange={(event) => setSource(event.target.value as typeof source)}><option value="simulated">Simulated pipeline response</option><option value="model-predicted">Real model prediction</option></select></label><label>Garment<input value={garment} onChange={(event) => setGarment(event.target.value)} required /></label><label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Consent has been recorded separately</label><p>No name, photo, video or measurement is stored by this lab page.</p></section><section className="lab-card lab-measures"><div className="lab-table-head"><span>Measurement (cm)</span><span>Ground truth</span><span>Prediction</span><span>Confidence range</span></div>{fields.map((field) => <div className="lab-measure-row" key={field}><strong>{field}</strong><input aria-label={`${field} ground truth`} type="number" min="1" max="300" step="0.1" value={truth[field]} onChange={(event) => updateValues(setTruth, field, event.target.value)} required /><input aria-label={`${field} prediction`} type="number" min="1" max="300" step="0.1" value={predicted[field]} onChange={(event) => updateValues(setPredicted, field, event.target.value)} required /><span><input aria-label={`${field} confidence low`} type="number" min="1" max="300" step="0.1" placeholder="low" value={ranges[field].low} onChange={(event) => updateRange(field, "low", event.target.value)} required /><i>â€“</i><input aria-label={`${field} confidence high`} type="number" min="1" max="300" step="0.1" placeholder="high" value={ranges[field].high} onChange={(event) => updateRange(field, "high", event.target.value)} required /></span></div>)}<div className="lab-fit-row"><label>Physical fit<select value={fitTruth} onChange={(event) => setFitTruth(event.target.value as Fit)}>{["tight","close","regular","loose","unknown"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Predicted fit<select value={fitPredicted} onChange={(event) => setFitPredicted(event.target.value as Fit)}>{["tight","close","regular","loose","unknown"].map((item) => <option key={item}>{item}</option>)}</select></label></div></section><div className="lab-actions"><span>{source === "simulated" ? "Simulator checks plumbing onlyâ€”not model accuracy." : "Model results must include version and provenance before release use."}</span><button disabled={!complete || !consent || busy}>{busy ? "Evaluatingâ€¦" : "Run accuracy evaluation"}</button></div>{error && <p className="lab-error" role="alert">{error}</p>}{report && <section className={`lab-report ${report.summary.passed ? "pass" : "fail"}`} aria-live="polite"><div><span>{report.summary.passed ? "PASSED INITIAL GATES" : "FAILED INITIAL GATES"}</span><h2>{report.summary.meanAbsoluteErrorCm.toFixed(1)} cm mean error</h2></div><dl><div><dt>Range coverage</dt><dd>{report.summary.confidenceCoveragePercent}%</dd></div><div><dt>Fit agreement</dt><dd>{report.summary.fitAgreementPercent}%</dd></div><div><dt>Environment</dt><dd>TEST ONLY</dd></div></dl><ul>{report.gates.map((gate) => <li key={gate}>{gate}</li>)}</ul><button type="button" onClick={exportCase}>Export test record</button></section>}</form></main>;
}
