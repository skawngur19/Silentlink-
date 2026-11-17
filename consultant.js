/* ============================================================
   SilentLink — Deaf Consultant screens
   ============================================================ */

function renderConsultant(parts) {
  const screen = parts[1] || "queue";
  if (screen === "review") return consultantShell("queue", reviewScreen(parts[2]));
  if (screen === "record") return consultantShell("record", recordScreen());
  return consultantShell("queue", queueScreen());
}

/* ---------------- Validation queue ---------------- */
const QUEUE_COLUMNS = [
  { status: "Draft", icon: "pencil-line", hint: "Needs a reviewer" },
  { status: "Under Review", icon: "clock", hint: "In review" },
  { status: "Validated", icon: "badge-check", hint: "Approved" },
  { status: "Archived", icon: "archive", hint: "Retired" },
];

function queueCard(sign) {
  const c = CATEGORIES[sign.category];
  const assigned = sign.consultant === "Unassigned" ? "Unassigned" : sign.consultant === meName() ? "You" : sign.consultant;
  return `<button class="kan-card" data-nav="#/consultant/review/${sign.id}">
    <span class="thumb" style="background:${c.soft}">${handThumb(sign)}</span>
    <span class="grow"><b>${sign.gloss}</b><small>${sign.category} · ${assigned}</small></span>
    ${ic("chevron-right", "")}
  </button>`;
}

function queueScreen() {
  const all = SIGNS;
  const counts = (st) => all.filter((s) => s.status === st).length;
  const reviewer = state.queueReviewer;
  const q = (sign) => reviewer === "all" ? true : reviewer === "me" ? sign.consultant === meName() : sign.consultant === "Unassigned";

  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Validation queue</h1>
      <p class="page-sub">Review kindergarten signs before teachers can use them in lessons.</p>
    </div>
    <div class="btn-row">
      <span class="chip chip-teal" style="min-height:38px">${ic("badge-check")}${counts("Validated")} validated</span>
      <button class="btn btn-primary" data-nav="#/consultant/record">${ic("record")}Record a sign</button>
    </div>
  </div>

  <div class="card card-pad" style="margin-bottom:16px">
    <div class="flex between flex-wrap" style="gap:12px">
      <div class="seg" role="group" aria-label="Filter queue by status">
        <button class="${state.queueFilter === "All" ? "active" : ""}" data-act="queue-filter" data-filter="All">All</button>
        ${QUEUE_COLUMNS.map((c) => `<button class="${state.queueFilter === c.status ? "active" : ""}" data-act="queue-filter" data-filter="${c.status}">${c.status}</button>`).join("")}
      </div>
      <div class="flex" style="gap:8px">
        <select class="select" id="reviewer-filter" aria-label="Filter by assigned reviewer" style="width:auto;min-width:170px">
          <option value="all" ${reviewer === "all" ? "selected" : ""}>All reviewers</option>
          <option value="me" ${reviewer === "me" ? "selected" : ""}>Assigned to me</option>
          <option value="unassigned" ${reviewer === "unassigned" ? "selected" : ""}>Unassigned</option>
        </select>
        <button class="btn btn-secondary btn-sm" data-act="assign-me">${ic("user-check")}Assign me</button>
      </div>
    </div>
  </div>

  <div class="kanban">
    ${QUEUE_COLUMNS.map((col) => {
      const items = all.filter((s) => s.status === col.status && q(s));
      const dim = state.queueFilter !== "All" && state.queueFilter !== col.status;
      return `<section class="kan-col" style="${dim ? "opacity:.5" : ""}">
        <h2><span style="color:${col.status === "Validated" ? "#15803D" : col.status === "Under Review" ? "#92400E" : "#64748B"}">${ic(col.icon)}</span>${col.status}<span class="count">${items.length}</span></h2>
        ${items.length ? items.map(queueCard).join("") : `<div style="padding:14px 8px;text-align:center;color:#94A3B8;font-size:11.5px;line-height:1.5">${ic("inbox")}<br/>Nothing here<br/><span style="font-size:10px">${col.hint}</span></div>`}
      </section>`;
    }).join("")}
  </div>

  <div class="card card-pad" style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
    <span style="width:38px;height:38px;border-radius:11px;background:#FEF3C7;color:#92400E;display:grid;place-items:center;flex:none">${ic("message-square")}</span>
    <div class="grow"><strong style="font-size:13px">Reviewer note</strong><p class="tiny muted">“No” and “Sad” still need a second reference angle. Please add it before validating for classroom use.</p></div>
  </div>`;
}

/* ---------------- Review sign ---------------- */
function reviewScreen(id) {
  const sign = SIGN_BY_ID[id] || SIGNS.find((s) => s.status === "Under Review");
  const c = CATEGORIES[sign.category];
  const already = sign.status === "Validated";
  return `
  <a class="btn btn-ghost btn-sm" href="#/consultant/queue" style="margin-bottom:12px">${ic("arrow-left")}Back to queue</a>
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">${sign.gloss}</h1>
      <p class="page-sub">${sign.category} · ${sign.grade} · submitted ${sign.added}</p>
    </div>
    <div class="flex" style="gap:8px;flex-wrap:wrap">
      ${statusChip(sign.status)}
      ${sign.consultant === "Unassigned" ? `<button class="btn btn-secondary btn-sm" data-act="assign-me">${ic("user-check")}Assign to me</button>` : `<span class="chip chip-teal">${ic("user-round")}Assigned to you</span>`}
    </div>
  </div>

  <div class="split">
    <div class="stack">
      ${videoPlayer(sign)}
      <div class="card">
        <div class="card-head"><div><h2>Reference pose</h2><div class="sub">21 landmarks · front view</div></div><span class="chip chip-indigo">${ic("scan")}Preview</span></div>
        <div class="card-pad">
          <div style="border-radius:16px;background:radial-gradient(120% 90% at 50% 0%, #1E293B, #0B1220);position:relative;overflow:hidden;aspect-ratio:16/9">
            <div style="position:absolute;inset:8%">${handSkeleton("dim")}</div>
            <span style="position:absolute;top:10px;left:12px;color:rgba(255,255,255,.7);font-size:10px;font-weight:700">${ic("hand")} Reference handshape</span>
          </div>
          <div class="grid g-2" style="margin-top:10px;gap:8px">
            <div class="meta-cell"><small>Handshape</small><b>Open flat hand</b></div>
            <div class="meta-cell"><small>Movement</small><b>${sign.id === "no" ? "Two taps" : sign.id === "sad" ? "Downward path" : "Small outward"}</b></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Sign metadata</h2><div class="sub">Submitted by partner classroom</div></div><span class="chip chip-draft">v1</span></div>
        <div class="card-pad stack">
          <div class="meta-grid">
            <div class="meta-cell"><small>Category</small><b>${sign.category}</b></div>
            <div class="meta-cell"><small>Grade</small><b>${sign.grade}</b></div>
            <div class="meta-cell"><small>Submitted</small><b>${sign.added}</b></div>
            <div class="meta-cell"><small>Variants documented</small><b>${sign.variants.length}</b></div>
          </div>
          <div><small class="tiny muted" style="font-weight:700">Handshape notes</small><p style="font-size:12.5px;margin-top:3px">${sign.handshape}</p></div>
          <div><small class="tiny muted" style="font-weight:700">Movement notes</small><p style="font-size:12.5px;margin-top:3px">${sign.movement}</p></div>
          <div><small class="tiny muted" style="font-weight:700">Regional variants</small>
            <div class="stack-sm" style="margin-top:4px">${sign.variants.map((v) => `<div class="helper">${ic("map-pin")}${v}</div>`).join("")}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Your review</h2><div class="sub">${already ? "Already validated" : "Complete all checks before approving"}</div></div><span class="chip chip-teal right">${ic("badge-check")}Deaf reviewer</span></div>
        <div class="card-pad stack-sm">
          ${[
            ["Handshape matches the reference", true],
            ["Movement path is clear and repeatable", sign.id !== "sad"],
            ["Regional variants are documented", true],
            ["Credit line and licensing consent present", true],
          ].map(([label, on], i) => `<label class="check"><input type="checkbox" ${on ? "checked" : ""} data-review-check="${i}" /><span><strong>${label}</strong><span>${on ? "Confirmed" : "Needs a second reference angle"}</span></span></label>`).join("")}
          <div class="field" style="margin-top:6px">
            <label for="review-comment">Reviewer comment (shared with teachers)</label>
            <textarea class="textarea" id="review-comment" placeholder="Add a note about handshape, movement, or regional variants…"></textarea>
          </div>
          <div class="btn-row" style="margin-top:4px">
            <button class="btn btn-green" style="flex:1" data-act="approve-sign" data-sign="${sign.id}" ${already ? "disabled" : ""}>${ic("check")}${already ? "Validated" : "Approve sign"}</button>
            <button class="btn btn-amber" data-act="request-changes" data-sign="${sign.id}">${ic("message-square")}Request changes</button>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <strong style="font-family:var(--head);font-size:14px;display:block;margin-bottom:8px">Credit & licensing</strong>
        <div class="flex" style="gap:10px">
          <span class="avatar" style="background:${state.user.bg};color:${state.user.color}">${meInitials()}</span>
          <div class="grow"><strong style="font-size:12.5px">${meName()}</strong><small class="tiny muted" style="display:block">Deaf consultant · credit shown to teachers</small></div>
          ${ic("badge-check", "")}
        </div>
        <div class="hr"></div>
        <label class="check" style="border-color:#DDE3FF;background:#F5F7FF">
          <input type="checkbox" id="license-consent" checked />
          <span><strong>Licensing consent</strong><span>I confirm this reference was recorded with consent and may be shown to teachers and learners in SilentLink.</span></span>
        </label>
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:10px" data-act="view-license">${ic("file-text")}Read consent terms</button>
      </div>

      <div class="card card-pad">
        <div class="demo-note" style="margin-bottom:6px">${ic("message-square")}Previous reviewer note</div>
        <p style="font-size:12.5px;line-height:1.55">“Please add a second angle for the two-handed variants before validating. The handshape itself looks consistent.”</p>
        <span class="tiny muted" style="display:block;margin-top:6px">Content reviewer · 5 Nov 2026</span>
      </div>
    </div>
  </div>`;
}

/* ---------------- Record sign ---------------- */
function recordScreen() {
  const stage = state.recordStage || "empty";
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Record a sign</h1>
      <p class="page-sub">Record or upload a reference clip, then add the metadata teachers will see.</p>
    </div>
    <span class="chip chip-teal">${ic("shield-check")}On-device preview</span>
  </div>

  <div class="split">
    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Reference clip</h2><div class="sub">Front view · good light · hands fully visible</div></div><span class="chip chip-indigo">${ic("video")}8 sec</span></div>
        <div class="card-pad" id="record-media">${recordMediaHTML(stage)}</div>
      </div>

      <div class="card card-pad">
        <div class="flex between" style="margin-bottom:8px"><strong style="font-family:var(--head);font-size:14px">Recording checklist</strong><span class="chip chip-teal">4 steps</span></div>
        <div class="stack-sm">
          <div class="helper">${ic("check")}Plain background, no bright window behind the hands.</div>
          <div class="helper">${ic("check")}One sign per clip, held for the full countdown.</div>
          <div class="helper">${ic("check")}Document regional variants in the metadata.</div>
          <div class="helper">${ic("check")}Credit and consent recorded before submitting.</div>
        </div>
      </div>

      <div class="card card-pad" style="background:#F4F7FB">
        <div class="flex" style="gap:10px;align-items:flex-start">
          <span style="width:34px;height:34px;border-radius:10px;background:#fff;color:#0F766E;display:grid;place-items:center;flex:none">${ic("lock")}</span>
          <p class="tiny muted" style="line-height:1.6">Recording happens on this device. Uploaded clips are stored as reference content only and never contain learner footage.</p>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Sign metadata</h2><div class="sub">Required before submitting for review</div></div></div>
        <div class="card-pad stack">
          <div class="field"><label for="rec-gloss">Gloss</label><input class="input" id="rec-gloss" placeholder="e.g. Hello" value="${esc(state.recordGloss || "")}" /></div>
          <div class="grid g-2" style="gap:10px">
            <div class="field"><label for="rec-cat">Category</label>
              <select class="select" id="rec-cat">${Object.keys(CATEGORIES).map((c) => `<option>${c}</option>`).join("")}</select>
            </div>
            <div class="field"><label for="rec-grade">Grade</label>
              <select class="select" id="rec-grade"><option>Kinder</option><option>Grade 1</option><option>Grade 2</option></select>
            </div>
          </div>
          <div class="field"><label for="rec-hand">Handshape notes</label><textarea class="textarea" id="rec-hand" style="min-height:72px" placeholder="Palm orientation, finger position, contact point…"></textarea></div>
          <div class="field"><label for="rec-move">Movement notes</label><textarea class="textarea" id="rec-move" style="min-height:72px" placeholder="Direction, repetition, start and end pose…"></textarea></div>
          <div class="field"><label for="rec-variants">Regional variants</label><textarea class="textarea" id="rec-variants" style="min-height:72px" placeholder="e.g. Cebu: two quick waves at the temple"></textarea></div>
          <div class="field"><label for="rec-credit">Consultant credit line</label><input class="input" id="rec-credit" value="${meName()} · Deaf consultant" /></div>
          <label class="check"><input type="checkbox" id="rec-license" checked /><span><strong>Licensing consent</strong><span>This clip may be used for teacher reference and learner practice in SilentLink.</span></span></label>
          <label class="check"><input type="checkbox" id="rec-face" /><span><strong>Facial expression note (optional)</strong><span>Optional teaching note.</span></span></label>
        </div>
      </div>
      <div class="flex" style="gap:8px">
        <button class="btn btn-secondary" style="flex:1" data-act="save-draft">${ic("save")}Save draft</button>
        <button class="btn btn-primary" style="flex:1" data-act="submit-sign">${ic("send")}Submit for review</button>
      </div>
      <p class="helper">${ic("info")}All new signs start as Draft. A Deaf consultant must validate before teachers can add them to lessons.</p>
    </div>
  </div>`;
}

function recordMediaHTML(stage) {
  if (stage === "recording") {
    return `<div style="border-radius:18px;background:radial-gradient(120% 100% at 50% 0%, #1E293B, #0B1220);aspect-ratio:4/3;position:relative;display:grid;place-items:center;color:#fff;overflow:hidden">
      <span class="cam-live" style="top:12px;right:12px"><span class="dot"></span>RECORDING</span>
      <div style="text-align:center">
        <div id="rec-count" style="font-family:var(--head);font-size:64px;font-weight:900;color:#FDE047">3</div>
        <p style="font-size:12px;color:rgba(255,255,255,.7)">Hold the sign steady</p>
      </div>
      <div class="cam-privacy" style="position:absolute;bottom:0;left:0;right:0">${ic("shield-check")}On-device recording. Nothing uploaded until you submit.</div>
    </div>`;
  }
  if (stage === "preview") {
    const s = { ...SIGN_BY_ID.hello };
    return `<div class="video-card" data-player>
      <div class="video-stage">
        <span class="replay-tag">${ic("circle-play")}New clip · 8 sec</span>
        <div class="glyph-wrap">${handArt({ fing: [58, 66, 62, 50], thumb: -46, tilt: -16, palm: "rgba(255,255,255,.94)", ink: "#1E1B4B", face: false })}</div>
        <span class="demo-corner">Front view · just recorded</span>
      </div>
      <div class="video-bar">
        <button class="vbtn play" data-v-play aria-label="Play clip">${ic("play")}</button>
        <button class="vbtn" data-v-slow aria-pressed="false" aria-label="Slow motion">${ic("gauge")}</button>
        <button class="vbtn" data-v-loop aria-pressed="false" aria-label="Loop">${ic("repeat")}</button>
        <button class="vbtn" data-v-mirror aria-pressed="false" aria-label="Mirror">${ic("flip-horizontal")}</button>
        <div class="track"><i style="width:0%"></i></div>
        <span class="time">0:00 / 0:08</span>
      </div>
    </div>
    <div class="flex between" style="margin-top:10px">
      <span class="status chip-validated">${ic("check")}Clip captured on device</span>
      <button class="btn btn-secondary btn-sm" data-act="record-again">${ic("rotate-ccw")}Record again</button>
    </div>`;
  }
  return `<div class="upload">
    <span class="u-ico">${ic("upload-cloud")}</span>
    <b>Upload a reference clip</b>
    <span>MP4 or MOV · up to 40 MB · landscape preferred</span>
    <div class="btn-row" style="margin-top:4px">
      <button class="btn btn-secondary btn-sm" data-act="fake-upload">${ic("folder-open")}Choose file</button>
      <button class="btn btn-primary btn-sm" data-act="start-record">${ic("video")}Record with camera</button>
    </div>
  </div>
  <div class="banner neutral" style="margin-top:12px">${ic("info")}A second angle can be added later from the sign detail. One clip is enough to start review.</div>`;
}

/* ---------------- consultant actions ---------------- */
Object.assign(ACTIONS, {
  "queue-filter": (el) => { state.queueFilter = el.dataset.filter; render(); },
  "assign-me": async () => {
    const route = currentParts();
    if (route[1] === "review" && route[2]) {
      const s = SIGN_BY_ID[route[2]];
      if (s) {
        const updated = { ...s, consultant: meName() };
        try {
          await firebaseService.saveSign(updated);
          Object.assign(s, updated);
        } catch (error) {
          console.error("Could not save sign reviewer.", error);
          toast("Reviewer assignment was not saved. Check your consultant role and Firestore rules.", "warn", "circle-alert");
          return;
        }
      }
      toast("Assigned to you for review.", "ok", "user-check");
      render();
    } else {
      toast("Select a sign first, then assign it to yourself.", "info", "user-check");
    }
  },
  "approve-sign": (el) => {
    const license = $("#license-consent");
    if (license && !license.checked) { toast("Licensing consent is required before validating.", "warn", "file-warning"); return; }
    const sign = SIGN_BY_ID[el.dataset.sign];
    openModal(`
      ${modalHead("Approve “" + sign.gloss + "”?", "Teachers will be able to add this sign to lessons.", "badge-check")}
      <div class="modal-body stack">
        <div class="banner success">${ic("badge-check")}<div>Handshape and movement approved for <strong>${sign.grade}</strong>.</div></div>
        <div class="field"><label for="approve-credit">Credit line shown to teachers</label><input class="input" id="approve-credit" value="${meName()} · Deaf consultant" /></div>
        <label class="check"><input type="checkbox" id="approve-license" checked /><span><strong>Licensing consent confirmed</strong><span>Clip may be shown to teachers and kindergarten learners in SilentLink.</span></span></label>
        <p class="helper">${ic("info")}This prototype will mark the sign as Validated and record today's date.</p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-act="close-modal">Cancel</button>
        <button class="btn btn-green" data-act="confirm-approve" data-sign="${sign.id}">${ic("check")}Confirm approval</button>
      </div>`);
  },
  "confirm-approve": async (el) => {
    const license = $("#approve-license");
    if (license && !license.checked) { toast("Tick the licensing consent to continue.", "warn", "file-warning"); return; }
    const sign = SIGN_BY_ID[el.dataset.sign];
    const updated = { ...sign, status: "Validated", consultant: meName(), validated: new Date().toLocaleDateString() };
    try {
      await firebaseService.saveSign(updated);
      Object.assign(sign, updated);
    } catch (error) {
      console.error("Could not save sign validation.", error);
      toast("Sign validation was not saved. Check your consultant role and Firestore rules.", "warn", "circle-alert");
      return;
    }
    closeModal();
    openModal(`
      ${modalHead("Sign validated", "“" + sign.gloss + "” is now available to teachers.", "check-circle-2")}
      <div class="modal-body">
        <div class="stack-sm">
          <div class="flex between"><span class="tiny muted">Status</span>${statusChip("Validated")}</div>
          <div class="flex between"><span class="tiny muted">Credit</span><strong style="font-size:12px">${meName()}</strong></div>
          <div class="flex between"><span class="tiny muted">Validated</span><strong style="font-size:12px">${esc(sign.validated)}</strong></div>
          <div class="flex between"><span class="tiny muted">Visible to learners</span><strong style="font-size:12px">Validated signs only</strong></div>
        </div>
        <div class="banner info" style="margin-top:12px">${ic("info")}Teachers can now add “${sign.gloss}” to lessons. Archiving remains available if the reference is retired.</div>
      </div>
      <div class="modal-foot"><button class="btn btn-primary" data-act="back-to-queue">Back to queue</button></div>`);
    toast(`“${sign.gloss}” validated.`, "ok", "badge-check");
  },
  "request-changes": (el) => {
    const sign = SIGN_BY_ID[el.dataset.sign];
    openModal(`
      ${modalHead("Request changes", "Your note goes to the submitting classroom.", "message-square")}
      <div class="modal-body stack">
        <div class="field"><label for="request-comment">What needs to change?</label>
          <textarea class="textarea" id="request-comment" placeholder="e.g. Please add a second angle showing the movement path."></textarea>
        </div>
        <div class="field"><label for="request-due">Review again by</label><input class="input" id="request-due" type="date" value="2026-11-16" /></div>
        <div class="banner neutral">${ic("info")}The sign stays Under Review and remains unavailable for lessons.</div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-act="close-modal">Cancel</button>
        <button class="btn btn-amber" data-act="send-changes" data-sign="${sign.id}">${ic("send")}Send request</button>
      </div>`);
  },
  "send-changes": async (el) => {
    const comment = $("#request-comment");
    if (!comment || !comment.value.trim()) { toast("Add a comment so the classroom knows what to fix.", "warn", "message-square"); comment?.focus(); return; }
    const sign = SIGN_BY_ID[el.dataset.sign];
    const updated = { ...sign, status: "Under Review", consultant: meName() };
    try {
      await firebaseService.saveSign(updated);
      Object.assign(sign, updated);
    } catch (error) {
      console.error("Could not save sign review request.", error);
      toast("Review request was not saved. Check your consultant role and Firestore rules.", "warn", "circle-alert");
      return;
    }
    closeModal();
    toast(`Changes requested for “${sign.gloss}”.`, "warn", "message-square");
    go("/consultant/queue");
  },
  "back-to-queue": () => { closeModal(); go("/consultant/queue"); },
  "view-license": () => openModal(`
    ${modalHead("Consent & licensing terms", "Plain-language summary for this prototype.", "file-text")}
    <div class="modal-body stack">
      <div class="helper">${ic("check")}The signer consented to their reference clip being used for teacher training and learner practice.</div>
      <div class="helper">${ic("check")}Credit appears beside the clip and in lesson previews.</div>
      <div class="helper">${ic("check")}Clips never include learner footage or identifying information.</div>
      <div class="helper">${ic("x")}Clips may not be re-shared outside the school's SilentLink account.</div>
      <div class="banner neutral">${ic("info")}This is a prototype summary, not legal advice. Work with your school's privacy officer for official consent forms.</div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" data-act="close-modal">Close</button></div>`),
  "start-record": () => {
    state.recordStage = "recording";
    const region = $("#record-media");
    if (region) { region.innerHTML = recordMediaHTML("recording"); if (window.lucide) lucide.createIcons(); }
    let n = 3;
    const tick = () => {
      n -= 1;
      const el = $("#rec-count");
      if (n > 0) { if (el) el.textContent = String(n); later(tick, 800); }
      else {
        state.recordStage = "preview";
        const r = $("#record-media");
        if (r) { r.innerHTML = recordMediaHTML("preview"); if (window.lucide) lucide.createIcons(); initVideoPlayers(); }
        toast("Clip captured. Add metadata, then submit.", "ok", "video");
      }
    };
    later(tick, 900);
  },
  "record-again": () => {
    state.recordStage = "empty";
    const r = $("#record-media");
    if (r) { r.innerHTML = recordMediaHTML("empty"); if (window.lucide) lucide.createIcons(); }
  },
  "fake-upload": () => {
    state.recordStage = "preview";
    const r = $("#record-media");
    if (r) { r.innerHTML = recordMediaHTML("preview"); if (window.lucide) lucide.createIcons(); initVideoPlayers(); }
    toast("hello-reference.mp4 attached (mock upload).", "ok", "upload");
  },
  "save-draft": () => {
    const gloss = $("#rec-gloss")?.value.trim();
    if (!gloss) { toast("Add a gloss before saving the draft.", "warn", "pencil-line"); $("#rec-gloss")?.focus(); return; }
    toast(`“${gloss}” saved as a draft.`, "ok", "save");
    go("/consultant/queue");
  },
  "submit-sign": () => {
    const gloss = $("#rec-gloss")?.value.trim();
    if (!gloss) { toast("Add a gloss before submitting.", "warn", "pencil-line"); $("#rec-gloss")?.focus(); return; }
    const license = $("#rec-license");
    if (license && !license.checked) { toast("Licensing consent is required to submit.", "warn", "file-warning"); return; }
    openModal(`
      ${modalHead("Submitted for review", "“" + esc(gloss) + "” is now in the validation queue.", "check-circle-2")}
      <div class="modal-body">
        <div class="banner success">${ic("badge-check")}<div>Status: <strong>Draft</strong> → <strong>Under Review</strong>. A Deaf consultant will check handshape, movement, variants, and licensing.</div></div>
        <div class="stack-sm" style="margin-top:12px">
          <div class="flex between"><span class="tiny muted">Assigned reviewer</span><strong style="font-size:12px">${meName()}</strong></div>
          <div class="flex between"><span class="tiny muted">Expected review</span><strong style="font-size:12px">Within 3 school days</strong></div>
          <div class="flex between"><span class="tiny muted">Visible to teachers</span><strong style="font-size:12px">Only after validation</strong></div>
        </div>
      </div>
      <div class="modal-foot"><button class="btn btn-primary" data-act="back-to-queue">Open validation queue</button></div>`);
    toast("Reference submitted to the validation queue.", "ok", "send");
  },
});

document.addEventListener("change", (e) => {
  if (e.target.id === "reviewer-filter") { state.queueReviewer = e.target.value; render(); }
});

/* boot */
initApp();
