/* Browser-only hand landmark sampling and nearest-example recognition prototype. */
const RECOGNITION_VERSION = 1;
const RECOGNITION_SIGNS = SIGNS.filter((sign) => sign.status === "Validated");
const LANDMARK_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const LANDMARK_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const LANDMARK_MODULE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";
let handLandmarker = null;
let cameraStream = null;
let recognitionFrame = 0;
let recognitionRunning = false;
let collectingFrames = null;
let collectingSignId = null;
let collectingSince = 0;
let lastCollectedAt = 0;
let lastPredictionAt = 0;
let liveFrames = [];
let signSamples = [];

function recognitionScreen() {
  if (!RECOGNITION_SIGNS.length) {
    return `<div class="page-head"><div class="grow"><h1 class="page-title">Sign recognition</h1></div></div>
      <div class="banner neutral">${ic("info")}There are no validated signs available to collect samples for.</div>`;
  }
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Sign recognition <span class="chip chip-beta">Prototype</span></h1>
      <p class="page-sub">Collect labeled examples and compare new hand movements with those examples on this device.</p>
    </div>
  </div>
  <div class="banner warn" style="margin-bottom:16px">
    ${ic("shield-alert")}
    <div><strong>Research prototype—not for grading or care decisions.</strong> Use only with school and guardian approval. No names or video are saved, and nothing is sent to Firebase. Landmark samples stay in memory until you export them; refreshing the page clears them.</div>
  </div>
  <div class="split">
    <div class="stack">
      <div class="card card-pad stack">
        <div class="field">
          <label for="recognition-sign">Sign label for the sample</label>
          <select class="select" id="recognition-sign">
            ${RECOGNITION_SIGNS.map((sign) => `<option value="${sign.id}">${esc(sign.gloss)}</option>`).join("")}
          </select>
          <p id="recognition-sign-guide" class="helper">${esc(RECOGNITION_SIGNS[0]?.handshape || "")} ${esc(RECOGNITION_SIGNS[0]?.movement || "")}</p>
        </div>
        <label class="check">
          <input type="checkbox" id="recognition-approval" />
          <span><strong>Approval confirmed</strong><span>I confirm school approval and guardian consent are in place for this participant.</span></span>
        </label>
        <div class="btn-row">
          <button class="btn btn-primary" data-act="recognition-start">${ic("camera")}Start camera</button>
          <button class="btn btn-secondary" data-act="recognition-stop" disabled>${ic("video-off")}Stop camera</button>
          <button class="btn btn-teal" data-act="recognition-capture" disabled>${ic("circle-dot")}Record 2-second sample</button>
        </div>
        <p id="recognition-status" class="helper" role="status" aria-live="polite">Camera is off. Choose a sign and confirm approval before starting.</p>
      </div>
      <div class="card card-pad">
        <div class="recognition-video-wrap">
          <video id="recognition-video" muted playsinline aria-label="Local camera preview"></video>
          <div class="recognition-video-empty">${ic("hand")}Camera preview appears here. The app does not save video.</div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="flex between" style="margin-bottom:8px">
          <div><h2>Closest example</h2><p class="tiny muted">Experimental nearest-example result; not a validated sign prediction.</p></div>
          <strong id="recognition-result">Waiting for samples</strong>
        </div>
      </div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Training examples</h2><div class="sub">Aim for at least 5 samples per sign and varied repetitions.</div></div></div>
        <div id="recognition-sample-counts" class="card-pad stack-sm"></div>
        <div class="card-pad recognition-data-actions">
          <button class="btn btn-secondary btn-sm" data-act="recognition-import">${ic("upload")}Import JSON</button>
          <button class="btn btn-secondary btn-sm" data-act="recognition-export" ${signSamples.length ? "" : "disabled"}>${ic("download")}Export samples</button>
          <button class="btn btn-ghost btn-sm" data-act="recognition-clear" ${signSamples.length ? "" : "disabled"}>${ic("trash-2")}Clear samples</button>
          <input id="recognition-file" type="file" accept="application/json,.json" hidden />
        </div>
      </div>
      <div class="banner neutral">${ic("info")}The recognizer uses MediaPipe hand landmarks and a nearest-example comparison. It is not trained for ASL accuracy; test it with independent signers before relying on any result.</div>
    </div>
  </div>`;
}

function renderRecognitionSamples() {
  const region = $("#recognition-sample-counts");
  if (!region) return;
  region.innerHTML = RECOGNITION_SIGNS.map((sign) => {
    const count = signSamples.filter((sample) => sample.signId === sign.id).length;
    return `<div class="flex between recognition-sample-row"><span>${esc(sign.gloss)}</span><strong>${count} sample${count === 1 ? "" : "s"}</strong></div>`;
  }).join("");
  const exportButton = $("[data-act='recognition-export']");
  const clearButton = $("[data-act='recognition-clear']");
  if (exportButton) exportButton.disabled = signSamples.length === 0;
  if (clearButton) clearButton.disabled = signSamples.length === 0;
  updateRecognitionSignGuide();
}

function updateRecognitionSignGuide() {
  const signId = $("#recognition-sign")?.value;
  const sign = RECOGNITION_SIGNS.find((item) => item.id === signId);
  const guide = $("#recognition-sign-guide");
  if (guide && sign) guide.textContent = `${sign.handshape} ${sign.movement}`;
}

function recognitionStatus(message, error = false) {
  const status = $("#recognition-status");
  if (status) {
    status.textContent = message;
    status.classList.toggle("form-error", error);
  }
}

function normalizeLandmarks(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length !== 21
    || landmarks.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z))) return null;
  const wrist = landmarks[0];
  const palmScale = Math.hypot(landmarks[9].x - wrist.x, landmarks[9].y - wrist.y, landmarks[9].z - wrist.z);
  if (!Number.isFinite(palmScale) || palmScale < 0.001) return null;
  return landmarks.flatMap((point) => [
    (point.x - wrist.x) / palmScale,
    (point.y - wrist.y) / palmScale,
    (point.z - wrist.z) / palmScale,
  ]);
}

function frameDistance(left, right) {
  let distance = 0;
  for (let i = 0; i < left.length; i += 1) distance += Math.abs(left[i] - right[i]);
  return distance / left.length;
}

function sequenceDistance(left, right) {
  const previous = Array(right.length + 1).fill(Infinity);
  previous[0] = 0;
  for (let i = 1; i <= left.length; i += 1) {
    const current = Array(right.length + 1).fill(Infinity);
    for (let j = 1; j <= right.length; j += 1) {
      current[j] = frameDistance(left[i - 1], right[j - 1])
        + Math.min(previous[j], current[j - 1], previous[j - 1]);
    }
    for (let j = 0; j <= right.length; j += 1) previous[j] = current[j];
  }
  return previous[right.length] / (left.length + right.length);
}

function closestTrainingExample(frames) {
  const eligible = RECOGNITION_SIGNS
    .map((sign) => sign.id)
    .filter((signId) => signSamples.filter((sample) => sample.signId === signId).length >= 5);
  if (!eligible.length) return null;
  return signSamples
    .filter((sample) => eligible.includes(sample.signId))
    .map((sample) => ({ signId: sample.signId, distance: sequenceDistance(frames, sample.frames) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

async function loadHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  recognitionStatus("Loading the hand-landmark model…");
  const { FilesetResolver, HandLandmarker } = await import(LANDMARK_MODULE_URL);
  const vision = await FilesetResolver.forVisionTasks(LANDMARK_WASM_URL);
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: LANDMARK_MODEL_URL },
    runningMode: "VIDEO",
    numHands: 1,
  });
  return handLandmarker;
}

async function startRecognitionCamera() {
  if (!$("#recognition-approval")?.checked) {
    recognitionStatus("Confirm school approval and guardian consent before starting the camera.", true);
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    recognitionStatus("Camera access requires localhost or a secure HTTPS connection in a supported browser.", true);
    return;
  }
  try {
    const detector = await loadHandLandmarker();
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    const video = $("#recognition-video");
    video.srcObject = cameraStream;
    await video.play();
    video.closest(".recognition-video-wrap").classList.add("is-active");
    recognitionRunning = true;
    liveFrames = [];
    $("[data-act='recognition-start']").disabled = true;
    $("[data-act='recognition-stop']").disabled = false;
    $("[data-act='recognition-capture']").disabled = false;
    recognitionStatus("Camera is active on this device only. Center one signing hand in the frame.");
    runRecognitionLoop(detector, video);
  } catch (error) {
    console.error("Could not start sign recognition camera.", error);
    await stopSignRecognitionCamera();
    recognitionStatus(error.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access in your browser settings and try again."
      : "Could not load the hand model or camera. Check your internet connection and camera, then retry.", true);
  }
}

function runRecognitionLoop(detector, video) {
  const tick = () => {
    if (!recognitionRunning || !video.isConnected) return;
    if (video.readyState >= 2 && video.currentTime !== runRecognitionLoop.lastVideoTime) {
      runRecognitionLoop.lastVideoTime = video.currentTime;
      try {
        const result = detector.detectForVideo(video, performance.now());
        const frame = normalizeLandmarks(result.landmarks?.[0]);
        if (frame) {
          liveFrames.push(frame);
          if (liveFrames.length > 12) liveFrames.shift();
          const now = performance.now();
          if (collectingFrames && now - lastCollectedAt >= 150) {
            collectingFrames.push(frame);
            lastCollectedAt = now;
          }
          if (collectingFrames && now - collectingSince >= 2000) finishSampleCapture();
          if (liveFrames.length === 12 && now - lastPredictionAt >= 500) {
            lastPredictionAt = now;
            const closest = closestTrainingExample(liveFrames);
            const label = $("#recognition-result");
            if (label) label.textContent = closest ? `Closest example: ${SIGN_BY_ID[closest.signId].gloss}` : "Collect 5 samples per sign first";
          }
        } else {
          liveFrames = [];
          if (collectingFrames) recognitionStatus("No hand detected. Keep the signing hand visible in the frame.");
        }
      } catch (error) {
        console.error("Sign recognition frame processing failed.", error);
        recognitionStatus("Hand tracking stopped after an error. Stop and restart the camera.", true);
        stopSignRecognitionCamera();
        return;
      }
    }
    recognitionFrame = requestAnimationFrame(tick);
  };
  runRecognitionLoop.lastVideoTime = -1;
  recognitionFrame = requestAnimationFrame(tick);
}

function beginSampleCapture() {
  if (!recognitionRunning) {
    recognitionStatus("Start the camera before recording a sample.", true);
    return;
  }
  collectingSignId = $("#recognition-sign")?.value;
  if (!RECOGNITION_SIGNS.some((sign) => sign.id === collectingSignId)) {
    recognitionStatus("Choose a validated sign label.", true);
    return;
  }
  collectingFrames = [];
  collectingSince = performance.now();
  lastCollectedAt = 0;
  recognitionStatus(`Recording a 2-second ${SIGN_BY_ID[collectingSignId].gloss} sample. Perform the sign once.`);
}

function finishSampleCapture() {
  const frames = collectingFrames;
  const signId = collectingSignId;
  collectingFrames = null;
  collectingSignId = null;
  if (!frames || frames.length < 8) {
    recognitionStatus("Not enough hand movement was captured. Keep your hand visible and try again.", true);
    return;
  }
  signSamples.push({ signId, frames });
  renderRecognitionSamples();
  recognitionStatus(`${SIGN_BY_ID[signId].gloss} sample added in memory. Export the sample set before leaving if you need to keep it.`);
}

async function stopSignRecognitionCamera() {
  recognitionRunning = false;
  collectingFrames = null;
  collectingSignId = null;
  if (recognitionFrame) cancelAnimationFrame(recognitionFrame);
  recognitionFrame = 0;
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  const video = $("#recognition-video");
  if (video) {
    video.pause();
    video.srcObject = null;
    video.closest(".recognition-video-wrap")?.classList.remove("is-active");
  }
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
  const start = $("[data-act='recognition-start']");
  const stop = $("[data-act='recognition-stop']");
  const capture = $("[data-act='recognition-capture']");
  if (start) start.disabled = false;
  if (stop) stop.disabled = true;
  if (capture) capture.disabled = true;
}

function exportRecognitionSamples() {
  if (!signSamples.length) {
    recognitionStatus("There are no samples to export.", true);
    return;
  }
  const blob = new Blob([JSON.stringify({ version: RECOGNITION_VERSION, samples: signSamples }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "silentlink-hand-landmark-samples.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  recognitionStatus("Sample file downloaded. Store it only in an approved, access-controlled location.");
}

async function importRecognitionSamples(file) {
  if (!file || file.size > 5_000_000) {
    recognitionStatus("Choose a JSON sample file smaller than 5 MB.", true);
    return;
  }
  try {
    const data = JSON.parse(await file.text());
    if (data.version !== RECOGNITION_VERSION || !Array.isArray(data.samples) || data.samples.length > 500) {
      throw new Error("The sample file format is not supported.");
    }
    const validIds = new Set(RECOGNITION_SIGNS.map((sign) => sign.id));
    const validSamples = data.samples.filter((sample) =>
      validIds.has(sample.signId)
      && Array.isArray(sample.frames)
      && sample.frames.length >= 8
      && sample.frames.length <= 40
      && sample.frames.every((frame) => Array.isArray(frame)
        && frame.length === 63
        && frame.every((value) => Number.isFinite(value) && Math.abs(value) <= 5)));
    if (validSamples.length !== data.samples.length) throw new Error("The file contains invalid or unsupported hand samples.");
    signSamples = validSamples;
    renderRecognitionSamples();
    recognitionStatus(`${signSamples.length} labeled samples loaded in memory. They are not uploaded.`);
  } catch (error) {
    console.error("Could not import hand samples.", error);
    recognitionStatus(error.message || "Could not read the sample file.", true);
  }
}

async function clearRecognitionSamples() {
  openModal(`
    ${modalHead("Clear collected samples?", "This removes the in-memory sample set from this page.", "trash-2")}
    <div class="modal-foot">
      <button class="btn btn-secondary" data-act="close-modal">Keep samples</button>
      <button class="btn btn-amber" data-act="recognition-confirm-clear">${ic("trash-2")}Clear samples</button>
    </div>`);
}

Object.assign(ACTIONS, {
  "recognition-start": () => startRecognitionCamera(),
  "recognition-stop": () => stopSignRecognitionCamera(),
  "recognition-capture": () => beginSampleCapture(),
  "recognition-export": () => exportRecognitionSamples(),
  "recognition-import": () => $("#recognition-file")?.click(),
  "recognition-clear": () => clearRecognitionSamples(),
  "recognition-confirm-clear": () => {
    signSamples = [];
    closeModal();
    renderRecognitionSamples();
    const result = $("#recognition-result");
    if (result) result.textContent = "Waiting for samples";
    recognitionStatus("In-memory samples cleared.");
  },
});

document.addEventListener("change", (event) => {
  if (event.target.id === "recognition-file") {
    const file = event.target.files?.[0];
    importRecognitionSamples(file);
    event.target.value = "";
  } else if (event.target.id === "recognition-sign") {
    updateRecognitionSignGuide();
  }
});

function stopRecognitionOnNavigation() {
  if (currentParts()[1] !== "recognition" && (recognitionRunning || handLandmarker)) stopSignRecognitionCamera();
}
