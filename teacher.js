/* ============================================================
   SilentLink — Teacher screens
   ============================================================ */

function teacherLoadingCards(n = 8) {
  return `<div class="sign-grid">${Array.from({ length: n }).map(() => `<div class="card" style="overflow:hidden"><div class="skeleton-block" style="aspect-ratio:4/3;border-radius:0"></div><div style="padding:13px;display:flex;flex-direction:column;gap:8px"><div class="skeleton-line" style="width:58%"></div><div class="skeleton-line" style="width:38%;height:9px"></div></div></div>`).join("")}</div>`;
}

function emptyState({ icon = "search-x", title, body, action = "" }) {
  return `<div class="empty">
    <span class="e-ico">${ic(icon)}</span>
    <h2>${title}</h2>
    <p>${body}</p>
    ${action ? `<div class="btn-row">${action}</div>` : ""}
  </div>`;
}

function renderTeacher(parts) {
  const screen = parts[1] || "dashboard";
  const param = parts[2];
  switch (screen) {
    case "repository": return teacherShell("repository", repositoryScreen());
    case "sign": return teacherShell("repository", signDetailScreen(param));
    case "builder": return teacherShell("builder", builderScreen());
    case "progress": return teacherShell("progress", param ? learnerDetailScreen(param) : progressScreen());
    case "recognition": return teacherShell("recognition", recognitionScreen());
    case "sign-search": return teacherShell("sign-search", signSearchScreen());
    case "settings": return teacherShell("settings", settingsScreen());
    default: return teacherShell("dashboard", dashboardScreen());
  }
}

/* ---------------- Dashboard ---------------- */
function classAverage() {
  const vals = LEARNERS.flatMap((learner) => Object.values(learner.mastery || {}));
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

function dashboardScreen() {
  const validated = SIGNS.filter((s) => s.status === "Validated").length;
  const review = SIGNS.filter((s) => s.status === "Under Review").length;
  const drafts = SIGNS.filter((s) => s.status === "Draft").length;
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Good morning, ${state.user.firstName}</h1>
      <p class="page-sub">${LEARNERS.length} learner profiles · ${validated} validated signs in your current set</p>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-nav="#/teacher/builder">${ic("blocks")}Build lesson</button>
      <button class="btn btn-primary" data-nav="#/learner/practice/hello">${ic("play")}Start practice</button>
    </div>
  </div>

  <div class="grid g-4">
    <div class="stat"><span class="stat-ico" style="background:#EEF2FF;color:#4338CA">${ic("library")}</span><div><b>${validated}</b><span>Validated signs ready</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#CCFBF1;color:#0F766E">${ic("users")}</span><div><b>${LEARNERS.length}</b><span>Learners in class</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#FEF3C7;color:#92400E">${ic("chart-no-axes-column")}</span><div><b>${classAverage() === null ? "—" : `${classAverage()}%`}</b><span>Average class mastery</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#FEE2E2;color:#B91C1C">${ic("clock")}</span><div><b>${review + drafts}</b><span>Awaiting consultant review</span></div></div>
  </div>

  <div class="section-head"><h2>Quick actions</h2></div>
  <div class="grid g-3">
    <button class="quick" data-nav="#/teacher/recognition">
      <span class="quick-ico" style="background:#EDE9FE;color:#5B21B6">${ic("scan-hand")}</span>
      <strong>Try sign recognition</strong>
      <span>Collect consented hand samples and compare signs locally.</span>
    </button>
    <button class="quick" data-nav="#/teacher/sign-search">
      <span class="quick-ico" style="background:#EEF2FF;color:#4338CA">${ic("scan-search")}</span>
      <strong>Search signs</strong>
      <span>Look up a sign, or try Sign-to-Search Beta with the camera.</span>
    </button>
    <button class="quick" data-nav="#/teacher/builder">
      <span class="quick-ico" style="background:#CCFBF1;color:#0F766E">${ic("blocks")}</span>
      <strong>Build a lesson</strong>
      <span>Sequence validated signs, set leniency, add a picture quiz.</span>
    </button>
    <button class="quick" data-nav="#/learner/practice/hello">
      <span class="quick-ico" style="background:#FEF3C7;color:#92400E">${ic("play")}</span>
      <strong>Start practice</strong>
      <span>Open Handy practice on this tablet for the class.</span>
    </button>
  </div>

  <div class="section-head"><h2>Today</h2></div>
  <div class="split">
    <div class="card">
      <div class="card-head">
        <span style="width:34px;height:34px;border-radius:10px;background:#FEF3C7;color:#92400E;display:grid;place-items:center">${ic("alert-circle")}</span>
        <div><h2>Learners needing attention</h2><div class="sub">Based on mastery drops and camera setup</div></div>
      </div>
      ${LEARNERS.length ? `<div class="card-pad muted">Progress flags will appear after real practice results are available.</div>` : `<div class="card-pad muted">No learner profiles yet.</div>`}
    </div>

    <div class="stack">
      <div class="card card-pad">
        <div class="flex between" style="margin-bottom:12px">
          <span class="eyebrow" style="margin:0">${ic("calendar")}Assigned today</span>
          <span class="chip chip-teal">Kinder — Sunflower</span>
        </div>
        <h3 style="font-size:19px;margin-bottom:4px">${state.lessonName}</h2>
        <p class="muted" style="font-size:12.5px">${state.lesson.length} signs · balanced leniency · picture quiz</p>
        <div class="scroll-x" style="margin:14px 0 16px">
          ${state.lesson.slice(0, 4).map((id) => { const s = SIGN_BY_ID[id]; const c = CATEGORIES[s.category]; return `<span style="width:74px;flex:none">
            <span style="display:block;border-radius:12px;background:${c.soft};padding:4px">${handThumb(s)}</span>
            <span style="display:block;text-align:center;font-size:10.5px;font-weight:700;margin-top:4px">${s.gloss}</span>
          </span>`; }).join("")}
        </div>
        <div class="flex" style="gap:8px">
          <button class="btn btn-primary btn-sm" style="flex:1" data-nav="#/learner/practice/${state.lesson[0] || "hello"}">${ic("play")}Practice now</button>
          <button class="btn btn-secondary btn-sm" data-nav="#/teacher/builder">${ic("pen-line")}Edit</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Repository health</h2><div class="sub">Consultant validation status</div></div></div>
        <div style="padding:14px 20px" class="stack-sm">
          ${[
            ["Validated", validated, "#22C55E"],
            ["Under review", review, "#F59E0B"],
            ["Draft", drafts, "#94A3B8"],
          ].map(([label, n, color]) => `<div>
            <div class="flex between" style="font-size:11.5px;font-weight:700;margin-bottom:4px"><span>${label}</span><span>${n}</span></div>
            <div class="track" style="background:#EDF1F7;height:7px"><i style="width:${(n / 13) * 100}%;background:${color}"></i></div>
          </div>`).join("")}
          <button class="btn btn-secondary btn-sm btn-block" style="margin-top:6px" data-nav="#/consultant/queue">${ic("badge-check")}Open validation queue</button>
        </div>
      </div>
    </div>
  </div>

  <div class="section-head"><h2>Recent activity</h2></div>
  <div class="card"></div>`;
}

/* ---------------- Repository ---------------- */
function repoFiltered() {
  const f = state.filters;
  const q = f.q.trim().toLowerCase();
  return SIGNS.filter((s) => {
    if (f.status === "all") { if (s.status === "Archived") return false; }
    else if (s.status !== f.status) return false;
    if (f.cat !== "all" && s.category !== f.cat) return false;
    if (f.grade !== "all" && s.grade !== f.grade) return false;
    if (q && !(`${s.gloss} ${s.category} ${s.consultant} ${s.variants.join(" ")}`).toLowerCase().includes(q)) return false;
    return true;
  });
}

function repositoryScreen() {
  const total = SIGNS.filter((s) => s.status !== "Archived").length;
  const validated = SIGNS.filter((s) => s.status === "Validated").length;
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Sign repository</h1>
      <p class="page-sub">${total} signs in the kindergarten set · ${validated} validated by Deaf consultants</p>
    </div>
    <button class="btn btn-primary" data-nav="#/teacher/builder">${ic("blocks")}Build a lesson</button>
  </div>

  <div class="banner info" style="margin-bottom:16px">${ic("badge-check")}<div>Only <strong>Validated</strong> signs can be added to lessons. Ask a Deaf consultant to review anything marked Under Review or Draft.</div></div>

  <div class="card card-pad" style="margin-bottom:16px">
    <div class="filter-bar">
      <div class="search-field">
        ${ic("search")}
        <input class="input" id="repo-search" type="search" placeholder="Search signs, variants, or consultants" value="${esc(state.filters.q)}" aria-label="Search signs" />
      </div>
      <select class="select" id="filter-cat" aria-label="Filter by category">
        <option value="all">All categories</option>
        ${Object.keys(CATEGORIES).map((c) => `<option value="${c}" ${state.filters.cat === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      <select class="select" id="filter-grade" aria-label="Filter by grade">
        <option value="all">All grades</option>
        ${["Kinder", "Grade 1", "Grade 2"].map((g) => `<option value="${g}" ${state.filters.grade === g ? "selected" : ""}>${g}</option>`).join("")}
      </select>
      <select class="select" id="filter-status" aria-label="Filter by validation status">
        <option value="all">All statuses</option>
        ${["Validated", "Under Review", "Draft", "Archived"].map((s) => `<option value="${s}" ${state.filters.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select>
      <button class="btn btn-ghost btn-sm" data-act="clear-filters">${ic("filter-x")}Clear</button>
    </div>
    <div class="flex between" style="margin-top:12px">
      <span class="tiny muted" id="repo-count">${repoFiltered().length} results</span>
    </div>
  </div>

  <div id="sign-results">${repoResultsHTML()}</div>`;
}

function repoResultsHTML() {
  if (state.loadingDemo) return teacherLoadingCards(8);
  const list = repoFiltered();
  if (!list.length) {
    return emptyState({
      icon: "search-x",
      title: "No signs match those filters",
      body: "Try a different category or status. Undated drafts and archived signs stay hidden until a consultant reviews them.",
      action: `<button class="btn btn-primary btn-sm" data-act="clear-filters">${ic("rotate-ccw")}Clear filters</button>`,
    });
  }
  return `<div class="sign-grid">${list.map(signCard).join("")}</div>
  <div class="flex" style="margin-top:18px;justify-content:center;gap:8px">
    <span class="chip chip-validated">${ic("badge-check")}${SIGNS.filter((s) => s.status === "Validated").length} validated</span>
    <span class="chip chip-review">${ic("clock")}${SIGNS.filter((s) => s.status === "Under Review").length} under review</span>
    <span class="chip chip-draft">${ic("pencil-line")}${SIGNS.filter((s) => s.status === "Draft").length} draft</span>
  </div>`;
}

function paintRepoResults() {
  const region = $("#sign-results");
  if (!region) return;
  region.innerHTML = repoResultsHTML();
  const count = $("#repo-count");
  if (count) count.textContent = `${repoFiltered().length} results`;
  if (window.lucide) lucide.createIcons();
}

/* ---------------- Sign detail ---------------- */
function signDetailScreen(id) {
  const sign = SIGN_BY_ID[id];
  if (!sign) return emptyState({ icon: "file-question", title: "Sign not found", body: "This reference may have been archived.", action: `<a class="btn btn-primary btn-sm" href="#/teacher/repository">Back to repository</a>` });
  const c = CATEGORIES[sign.category];
  const valid = sign.status === "Validated";
  const inLesson = state.lesson.includes(sign.id);

  return `
  <a class="btn btn-ghost btn-sm" href="#/teacher/repository" style="margin-bottom:12px">${ic("arrow-left")}All signs</a>
  <div class="split">
    <div class="stack">
      ${videoPlayer(sign)}
      <div class="card">
        <div class="card-head"><div><h2>Handshape & movement</h2><div class="sub">What the recognizer checks</div></div><span class="chip chip-indigo">${ic("scan")}2 signals</span></div>
        <div class="card-pad stack">
          <div class="flex" style="align-items:flex-start;gap:12px">
            <span style="width:34px;height:34px;border-radius:10px;background:#EEF2FF;color:#4338CA;display:grid;place-items:center;flex:none">${ic("hand")}</span>
            <div><strong style="font-size:13px">Handshape</strong><p class="muted" style="font-size:12.5px;margin-top:2px">${sign.handshape}</p></div>
          </div>
          <div class="flex" style="align-items:flex-start;gap:12px">
            <span style="width:34px;height:34px;border-radius:10px;background:#CCFBF1;color:#0F766E;display:grid;place-items:center;flex:none">${ic("move-right")}</span>
            <div><strong style="font-size:13px">Movement</strong><p class="muted" style="font-size:12.5px;margin-top:2px">${sign.movement}</p></div>
          </div>
          ${sign.status === "Under Review" ? `<div class="banner warn">${ic("clock")}<div>This sign is <strong>under consultant review</strong>. Notes may change before it is added to lessons.</div></div>` : ""}
          ${sign.status === "Draft" ? `<div class="banner neutral">${ic("pencil-line")}<div>Draft reference. It has not been reviewed by a Deaf consultant yet.</div></div>` : ""}
          ${sign.status === "Archived" ? `<div class="banner neutral">${ic("archive")}<div>Archived sign, kept for consultant records. Hidden from the teacher search by default.</div></div>` : ""}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Regional variants</h2><div class="sub">${sign.variants.length} notes from partner classrooms</div></div><span class="chip chip-teal">${ic("map-pin")}PH</span></div>
        <div class="list">
          ${sign.variants.map((v) => `<div class="row" style="padding-top:11px;padding-bottom:11px"><span class="dot" style="color:${c.fill};width:8px;height:8px"></span><div class="grow" style="font-size:12.5px">${v}</div></div>`).join("")}
        </div>
        <div style="padding:12px 20px;border-top:1px solid var(--line)">
          <span class="helper">${ic("info")}${sign.variantNote}</span>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card card-pad">
        <div class="flex" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">
          ${statusChip(sign.status)}
          <span class="chip" style="background:${c.soft};color:${c.deep}">${sign.category}</span>
          <span class="chip chip-indigo">${sign.grade}</span>
        </div>
        <h1 style="font-size:34px;letter-spacing:-.03em;font-weight:900">${sign.gloss}</h1>
        <p class="muted" style="font-size:12.5px;margin-top:4px">ASL reference · added ${sign.added}</p>

        <div class="hr"></div>
        <div class="flex" style="gap:11px">
          <span class="avatar" style="background:#CCFBF1;color:#0F766E">${sign.consultant === "Unassigned" ? "?" : "GV"}</span>
          <div class="grow">
            <strong style="font-size:13px">${sign.consultant === "Unassigned" ? "No reviewer assigned" : sign.consultant}</strong>
            <small class="muted" style="display:block;font-size:11px">${sign.consultant === "Unassigned" ? "Awaiting Deaf consultant" : "Deaf consultant · content validator"}</small>
          </div>
          ${ic("badge-check", "")}
        </div>
        <div class="meta-grid" style="margin-top:14px">
          <div class="meta-cell"><small>Validation date</small><b>${sign.validated}</b></div>
          <div class="meta-cell"><small>Reference pose</small><b>${valid ? "Approved" : "Pending"}</b></div>
        </div>

        ${valid ? `<button class="btn ${inLesson ? "btn-secondary" : "btn-primary"} btn-lg btn-block" style="margin-top:16px" data-act="add-to-lesson" data-sign="${sign.id}">
          ${inLesson ? ic("check") + "Added to lesson" : ic("plus") + "Add to lesson"}
        </button>` : `<button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" disabled aria-describedby="gate-note">${ic("lock")}Add to lesson</button>
          <p class="helper" id="gate-note" style="margin-top:8px">${ic("info")}Only Validated signs can be added. Ask ${sign.consultant === "Unassigned" ? "a Deaf consultant" : sign.consultant.split(" ")[0]} to finish the review.</p>`}

        <div class="btn-row" style="margin-top:10px">
          <button class="btn btn-secondary btn-sm" style="flex:1" data-nav="#/learner/practice/${sign.id}">${ic("play")}Practice this sign</button>
          <button class="btn btn-secondary btn-sm" style="flex:1" data-act="toast-download">${ic("download")}Save reference</button>
        </div>

        ${inLesson ? `<div class="banner success" style="margin-top:12px">${ic("check-circle-2")}<div>In <strong>${esc(state.lessonName)}</strong> · sequence position ${state.lesson.indexOf(sign.id) + 1}.</div></div>` : ""}
      </div>

      <div class="card card-pad">
        <div class="flex between"><span class="tiny muted">Need this sign in another lesson?</span>
          <button class="btn btn-ghost btn-sm" data-nav="#/teacher/builder">${ic("blocks")}Open builder</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------- Lesson builder ---------------- */
function builderScreen() {
  const validSigns = SIGNS.filter((s) => s.status === "Validated");
  const steps = [
    ["Choose signs", state.lesson.length > 0],
    ["Set leniency", true],
    ["Add quiz", true],
    ["Assign", false],
  ];
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Build a lesson</h1>
      <p class="page-sub">Sequence validated signs, tune how forgiving Handy is, then assign to your class.</p>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-act="preview-lesson" ${state.lesson.length ? "" : "disabled"}>${ic("eye")}Preview as learner</button>
      <button class="btn btn-primary" data-act="assign-lesson" ${state.lesson.length ? "" : "disabled"}>${ic("send")}Assign to class</button>
    </div>
  </div>

  <div class="card card-pad" style="margin-bottom:16px">
    <div class="stepper">
      ${steps.map(([label, done], i) => `${i ? '<span class="step-line"></span>' : ""}<div class="step ${i === state.lesson.length || (!state.lesson.length && i === 0) ? "active" : done ? "done" : ""}">
        <span class="step-ico">${done ? ic("check") : i + 1}</span><span>${label}</span>
      </div>`).join("")}
    </div>
  </div>

  <div class="builder">
    <div class="card">
      <div class="card-head">
        <div><h2>Sign library</h2><div class="sub">Validated signs only · ${validSigns.length} available</div></div>
        <span class="chip chip-validated right">${ic("badge-check")}Validated</span>
      </div>
      <div style="padding:12px 16px;border-bottom:1px solid var(--line)">
        <div class="search-field">${ic("search")}<input class="input" id="builder-search" type="search" placeholder="Find a sign to add" aria-label="Search validated signs" /></div>
      </div>
      <div class="picker-list thin-scroll" id="builder-picker">
        ${validSigns.map(pickItem).join("")}
      </div>
      <div style="padding:12px 16px;border-top:1px solid var(--line)">
        <span class="helper">${ic("info")}Under Review and Draft signs are hidden here until a consultant validates them.</span>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head">
          <div class="grow">
            <label class="tiny muted" for="lesson-name" style="font-weight:700">Lesson name</label>
            <input id="lesson-name" class="input" style="margin-top:5px;font-family:var(--head);font-weight:800;font-size:17px;border-color:transparent;padding-left:0;min-height:34px" value="${esc(state.lessonName)}" aria-label="Lesson name" />
          </div>
          <span class="chip chip-teal">${state.lesson.length} signs</span>
        </div>
        <div style="padding:14px 16px">
          <div class="drop-list" id="lesson-drop" aria-label="Lesson sequence, drag to reorder">
            ${state.lesson.map((id, i) => {
              const s = SIGN_BY_ID[id]; const c = CATEGORIES[s.category];
              return `<div class="seq-item" draggable="true" data-seq="${id}" data-index="${i}">
                <span class="num">${i + 1}</span>
                <span class="grip">${ic("grip-vertical")}</span>
                <span class="thumb" style="background:${c.soft}">${handThumb(s)}</span>
                <span class="grow"><b>${s.gloss}</b><small>${s.category} · ${s.grade}</small></span>
                <button class="rm" data-act="remove-lesson" data-sign="${id}" aria-label="Remove ${s.gloss}">${ic("x")}</button>
              </div>`;
            }).join("")}
          </div>
          <div class="flex between" style="margin-top:8px">
            <span class="tiny muted">${ic("grip-vertical")} Drag to reorder</span>
            <button class="btn btn-ghost btn-sm" data-act="clear-lesson" ${state.lesson.length ? "" : "disabled"}>${ic("trash-2")}Clear</button>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <div class="flex between" style="margin-bottom:2px">
          <strong style="font-family:var(--head);font-size:15px">Leniency</strong>
          <span class="chip" id="leniency-label" style="background:#EEF2FF;color:#4338CA">${leniencyLabel(state.leniency)}</span>
        </div>
        <p class="muted" style="font-size:11.5px;margin-bottom:8px">How much handshape and movement variation Handy accepts.</p>
        <input class="slider" id="leniency" type="range" min="0" max="100" value="${state.leniency}" step="5" aria-label="Leniency" aria-valuetext="${leniencyLabel(state.leniency)}" />
        <div class="range-marks"><span>Strict</span><span>Balanced</span><span>Generous</span></div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h2>Picture-matching quiz</h2><div class="sub">One short question, no reading needed</div></div>
          <span class="chip chip-indigo">${ic("shapes")}3 pictures</span>
        </div>
        <div class="card-pad">
          ${quizHTML()}
        </div>
      </div>
    </div>
  </div>

`;
}

function leniencyLabel(v) {
  return v <= 25 ? "Strict · 25%" : v <= 60 ? "Balanced · 45%" : "Generous · 80%";
}

function quizHTML() {
  const options = ["thank-you", "please", "yes"];
  const correct = "thank-you";
  return `<div class="flex between" style="margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <strong style="font-size:13.5px">Which picture shows “Thank you”?</strong>
      <span class="chip chip-indigo">${ic("image")}Picture only</span>
    </div>
    <div class="grid g-3" style="gap:10px">
      ${options.map((id) => {
        const s = SIGN_BY_ID[id]; const c = CATEGORIES[s.category];
        const picked = state.quizSelected === id;
        const showOk = state.quizChecked && id === correct;
        const showNo = state.quizChecked && picked && id !== correct;
        return `<button class="sign-card" data-act="quiz-select" data-sign="${id}"  style="outline:${showOk ? "3px solid #22C55E" : showNo ? "3px solid #FB7185" : picked ? "3px solid #4F46E5" : "none"};outline-offset:-1px">
          <span class="sign-thumb" style="--thumb-a:${c.soft};--thumb-b:${c.soft};aspect-ratio:1/1">${handThumb(s)}</span>
          <span style="padding:7px;font-size:11px;font-weight:700;text-align:center">${state.quizChecked ? s.gloss : "Picture " + (options.indexOf(id) + 1)}</span>
        </button>`;
      }).join("")}
    </div>
    <div class="flex between" style="margin-top:10px;gap:8px;flex-wrap:wrap">
      ${state.quizChecked
        ? `<span class="status ${state.quizSelected === correct ? "chip-validated" : "chip-review"}">${ic(state.quizSelected === correct ? "circle-check" : "rotate-ccw")}${state.quizSelected === correct ? "Correct — learners see stars, not scores." : "Every try is a practice. Learners can retry."}</span>`
        : `<span class="tiny muted">Tap one picture to preview the quiz.</span>`}
      <button class="btn btn-secondary btn-sm" data-act="quiz-check" ${state.quizSelected ? "" : "disabled"}>${ic("check")}Check picture</button>
    </div>`;
}

/* ---------------- Progress ---------------- */
function openAddLearnerModal() {
  openModal(`
    ${modalHead("Add learner profile", "Use a classroom nickname and grade only.", "user-plus")}
    <form id="add-learner-form">
      <div class="modal-body stack">
        <div class="banner neutral">${ic("shield-check")}<div>Do not enter a learner's full name, birth date, contact details, or other identifying information.</div></div>
        <div class="field">
          <label for="learner-nickname">Classroom nickname</label>
          <input class="input" id="learner-nickname" name="nickname" maxlength="32" autocomplete="off" required />
        </div>
        <div class="field">
          <label for="learner-grade">Grade</label>
          <select class="select" id="learner-grade" name="grade" required>
            <option value="Kinder">Kinder</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
          </select>
        </div>
        <p class="form-error" id="learner-form-error" role="alert" hidden></p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" type="button" data-act="close-modal">Cancel</button>
        <button class="btn btn-primary" type="submit">${ic("user-plus")}Save profile</button>
      </div>
    </form>`, "narrow");
}

function masteryFor(learner) {
  const grouped = {};
  (learner.attempts || []).forEach((attempt) => {
    const signId = attempt.signId || attempt.sign;
    if (!signId || !SIGN_BY_ID[signId]) return;
    (grouped[signId] ||= []).push(attempt.result === "match" || attempt.result === "Match" ? 1 : 0);
  });
  return Object.fromEntries(Object.entries(grouped).map(([id, results]) => [
    id,
    Math.round(results.reduce((sum, result) => sum + result, 0) / results.length * 100),
  ]));
}

function progressScreen() {
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Learner progress</h1>
      <p class="page-sub">Private to your teacher account. Progress appears after genuine sign-recognition results are connected.</p>
    </div>
    <button class="btn btn-primary" data-act="add-learner">${ic("user-plus")}Add learner</button>
  </div>

  <div class="grid g-3" style="margin-bottom:18px">
    <div class="stat"><span class="stat-ico" style="background:#EEF2FF;color:#4338CA">${ic("users")}</span><div><b>${LEARNERS.length}</b><span>Learner profiles</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#CCFBF1;color:#0F766E">${ic("hand")}</span><div><b>${LEARNERS.reduce((sum, learner) => sum + learner.attempts.length, 0)}</b><span>Recorded practice attempts</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#FEF3C7;color:#92400E">${ic("chart-no-axes-column")}</span><div><b>${classAverage() === null ? "—" : `${classAverage()}%`}</b><span>Average mastery</span></div></div>
  </div>

  <div class="card">
    <div class="card-head"><div><h2>Learner profiles</h2><div class="sub">Practice results are not generated from the simulated camera.</div></div><span class="chip chip-teal right">${ic("users")}${LEARNERS.length} learners</span></div>
    ${state.learnerLoadError ? `<div class="banner danger" style="margin:16px">${ic("circle-alert")}<div>${esc(state.learnerLoadError)} Check the published Firestore rules.</div></div>` : ""}
    ${state.learnersLoading ? `<div class="card-pad muted">Loading learner profiles…</div>` : LEARNERS.length ? `<div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>Nickname</th><th>Grade</th><th>Progress</th><th>Practice records</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>
          ${LEARNERS.map((l) => {
            const mastery = masteryFor(l);
            const values = Object.values(mastery);
            const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
            return `<tr>
              <td><div class="flex" style="gap:9px">${avatar(l, "ring")}<div class="t-name">${esc(l.name)}</div></div></td>
              <td>${esc(l.grade)}</td>
              <td>${avg === null ? "Not recorded" : `${avg}%`}</td>
              <td>${l.attempts.length}</td>
              <td><button class="btn btn-secondary btn-sm" data-nav="#/teacher/progress/${l.id}">${ic("eye")}View</button></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : `<div class="card-pad">${emptyState({
      icon: "users",
      title: "No learner profiles yet",
      body: "Add a classroom nickname and grade to create your first private learner profile.",
      action: `<button class="btn btn-primary" data-act="add-learner">${ic("user-plus")}Add learner</button>`,
    })}</div>`}
  </div>`;
}

function learnerDetailScreen(id) {
  const l = LEARNERS.find((x) => x.id === id);
  if (!l) return teacherShell("progress", emptyState({ icon: "user-x", title: "Learner not found", body: "This learner may have moved to another class." }));
  const mastery = masteryFor(l);
  const ids = Object.keys(mastery);
  const values = Object.values(mastery);
  const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  const attempts = l.attempts || [];
  return `
  <a class="btn btn-ghost btn-sm" href="#/teacher/progress" style="margin-bottom:12px">${ic("arrow-left")}Class progress</a>
  <div class="page-head">
    <div class="grow flex" style="gap:14px">
      ${avatar(l, "xl ring")}
      <div>
        <h1 class="page-title">${esc(l.name)}</h1>
        <p class="page-sub">${esc(l.grade)} · Classroom nickname</p>
      </div>
    </div>
  </div>

  <div class="grid g-3" style="margin-bottom:18px">
    <div class="stat"><span class="stat-ico" style="background:#CCFBF1;color:#0F766E">${ic("hand")}</span><div><b>${attempts.length}</b><span>Recorded attempts</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#EEF2FF;color:#4338CA">${ic("chart-no-axes-column")}</span><div><b>${avg === null ? "—" : `${avg}%`}</b><span>Observed match rate</span></div></div>
    <div class="stat"><span class="stat-ico" style="background:#FEF3C7;color:#92400E">${ic("library")}</span><div><b>${ids.length}</b><span>Signs with records</span></div></div>
  </div>

  <div class="split">
    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Practice by sign</h2><div class="sub">Based on saved practice records only</div></div></div>
        <div class="card-pad" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 10px">
          ${ids.length ? ids.map((sid) => { const s = SIGN_BY_ID[sid]; return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center">
            ${ring(mastery[sid], 52, 5, "auto")}
            <span style="font-size:11px;font-weight:700">${esc(s.gloss)}</span>
          </div>`; }).join("") : `<p class="muted" style="grid-column:1/-1;text-align:center;padding:18px">No genuine practice results have been recorded yet.</p>`}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Practice history</h2><div class="sub">Most recent recorded attempt first</div></div></div>
        ${attempts.length ? `<div class="table-wrap">
          <table class="tbl">
            <thead><tr><th>Date</th><th>Sign</th><th>Result</th></tr></thead>
            <tbody>${attempts.map((attempt) => {
              const sign = SIGN_BY_ID[attempt.signId || attempt.sign];
              const date = attempt.createdAt?.toDate ? attempt.createdAt.toDate().toLocaleDateString() : "—";
              const matched = attempt.result === "match" || attempt.result === "Match";
              return `<tr>
              <td class="tiny muted">${date}</td>
              <td class="t-name">${esc(sign?.gloss || "Unknown sign")}</td>
              <td><span class="status ${matched ? "chip-validated" : "chip-review"}">${ic(matched ? "check" : "sparkles")}${matched ? "Match" : "Retry"}</span></td>
            </tr>`;
            }).join("")}</tbody>
          </table>
        </div>` : `<div class="card-pad muted">Practice records will appear here when real sign recognition is connected.</div>`}
      </div>
    </div>

    <div class="card card-pad">
      <div class="banner neutral">${ic("shield-check")}<div>This profile stores only a classroom nickname and grade. No full name, birth date, notes, or camera video is saved.</div></div>
      <button class="btn btn-ghost btn-sm" style="margin-top:12px" data-nav="#/teacher/progress">${ic("arrow-left")}Back to learner profiles</button>
    </div>
  </div>`;
}

/* ---------------- Sign-to-Search ---------------- */
function searchResultsHTML() {
  if (state.searchStage === "analyzing") {
    return `<div class="card card-pad" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;padding:34px">
      <span style="width:54px;height:54px;border-radius:16px;background:#EEF2FF;color:#4338CA;display:grid;place-items:center;animation:pulse 1.6s ease-in-out infinite">${ic("scan-search")}</span>
      <strong style="font-family:var(--head);font-size:16px">Analyzing handshape & movement…</strong>
      <p class="muted" style="font-size:12px;max-width:260px">Matching against the validated kindergarten vocabulary.</p>
      <div class="track" style="width:100%;max-width:220px;background:#EDF1F7;height:7px"><i style="width:68%;background:#4F46E5;transition:width 2s linear"></i></div>
    </div>`;
  }
  if (state.searchStage === "countdown") {
    return `<div class="card card-pad" style="text-align:center;padding:30px">
      <strong style="font-family:var(--head);font-size:15px">Hold the sign steady</strong>
      <p class="muted" style="font-size:12px;margin-top:4px">Capturing a short clip on this device.</p>
      <div id="countdown-num" style="font-family:var(--head);font-size:64px;font-weight:900;color:#4F46E5;line-height:1.1;margin-top:6px">3</div>
    </div>`;
  }
  if (state.searchStage === "results" && state.searchResults) {
    return `<div class="banner success" style="margin-bottom:12px">${ic("sparkles")}<div><strong>3 possible matches.</strong> Confirm with a Deaf consultant before using a new sign in class.</div></div>
    ${state.searchResults.map((r, i) => {
      const s = SIGN_BY_ID[r.id]; const c = CATEGORIES[s.category];
      return `<div class="card" style="margin-bottom:10px;overflow:hidden">
        <div style="display:flex;gap:12px;padding:12px">
          <span style="position:relative;width:92px;flex:none;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,#312E81,#0F766E);display:grid;place-items:center">
            <span style="position:absolute;top:5px;left:5px;font-size:9px;font-weight:800;color:#fff;background:rgba(2,6,23,.5);padding:2px 5px;border-radius:4px">#${i + 1}</span>
            <span style="width:62%">${handArt({ fing: s.glyph.f, thumb: s.glyph.thumb, tilt: s.glyph.tilt, palm: "rgba(255,255,255,.94)", ink: "#1E1B4B", face: false })}</span>
            <span style="position:absolute;bottom:5px;right:5px;color:#fff;opacity:.8">${ic("play")}</span>
          </span>
          <div class="grow">
            <div class="flex between"><strong style="font-family:var(--head);font-size:16px">${s.gloss}</strong><span class="chip ${r.match >= 85 ? "chip-validated" : "chip-review"}">${r.match}% match</span></div>
            <div class="tiny muted" style="margin:2px 0 6px">${s.category} · ${s.grade} · ${statusChip(s.status)}</div>
            <div class="track" style="background:#EDF1F7;height:6px"><i style="width:${r.match}%;background:${c.fill}"></i></div>
            <div class="flex" style="gap:6px;margin-top:8px">
              <button class="btn btn-secondary btn-sm" data-nav="#/teacher/sign/${s.id}">${ic("eye")}View sign</button>
              <button class="btn btn-ghost btn-sm" data-act="add-to-lesson" data-sign="${s.id}" ${s.status === "Validated" ? "" : "disabled"}>${ic("plus")}Add to lesson</button>
            </div>
          </div>
        </div>
      </div>`;
    }).join("")}`;
  }
  return `<div class="empty" style="padding:32px 20px">
    <span class="e-ico">${ic("scan-search")}</span>
    <h2>No search yet</h2>
    <p>Press Start, then perform the sign inside the frame. You'll get the top 3 matches with video previews.</p>
    <div class="pill-note">${ic("info")}Beta · fixed vocabulary of ${SIGNS.filter((s) => s.status !== "Archived").length} kindergarten signs</div>
  </div>`;
}

function signSearchScreen() {
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Sign-to-Search <span class="chip chip-beta" style="font-size:11px;vertical-align:middle">Beta</span></h1>
      <p class="page-sub">Perform an unknown sign and SilentLink suggests the closest matches from the validated set.</p>
    </div>
    <span class="pill-note">${ic("info")}Teacher tool · not for learner assessment</span>
  </div>

  <div class="split">
    <div>
      <div id="search-cam">
        ${camPanel({ variant: state.searchStage === "results" || state.searchStage === "analyzing" ? "tracking" : "waiting", allow: state.camAllowed })}
      </div>
      <div class="flex" style="margin-top:12px;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" id="search-start" data-act="start-search">${ic("scan")}${state.searchStage === "results" ? "Search another sign" : "Start search"}</button>
        <button class="btn btn-secondary" data-act="search-slowmo" ${state.searchStage === "results" ? "" : "disabled"}>${ic("gauge")}Watch in slow motion</button>
        <span class="pill-note" style="margin-left:auto">${ic("clock")}Countdown 3s · analysis 2s</span>
      </div>
      <div class="card card-pad" style="margin-top:14px">
        <div class="flex" style="gap:12px;align-items:flex-start">
          <span style="width:36px;height:36px;border-radius:10px;background:#FEF3C7;color:#92400E;display:grid;place-items:center;flex:none">${ic("sun")}</span>
          <div><strong style="font-size:13px">Tip for a clean read</strong><p class="muted" style="font-size:12px;margin-top:2px">Face a light source, keep your hand inside the dashed frame, and hold the sign for the full countdown.</p></div>
        </div>
      </div>
    </div>
    <div>
      <div class="flex between" style="margin-bottom:10px"><h2 style="font-size:17px">Top matches</h2><span class="tiny muted">Match confidence</span></div>
      <div id="search-results">${searchResultsHTML()}</div>
    </div>
  </div>`;
}

/* ---------------- Settings ---------------- */
function settingsScreen() {
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title">Settings & privacy</h1>
      <p class="page-sub">Camera readiness and learner privacy.</p>
    </div>
    <span class="chip chip-review">${ic("info")}Recognition not connected</span>
  </div>

  <div class="split">
    <div class="stack">
      <div class="card">
        <div class="card-head"><div><h2>Consent & learner privacy</h2><div class="sub">Consent records are not stored in this prototype.</div></div></div>
        <div class="card-pad">${emptyState({ icon: "shield-check", title: "No consent records stored", body: "Keep guardian consent forms in your school's approved system. This app currently stores only learner nicknames and grades." })}</div>
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Camera preview</h2><div class="sub">The current camera feedback is simulated.</div></div></div>
        <div class="card-pad stack-sm">
          <div class="banner neutral">${ic("info")}This prototype does not access the webcam, detect hand landmarks, or recognize signs. It does not record video or practice attempts.</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:4px" data-act="test-camera">${ic("eye")}Preview simulation</button>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card card-pad">
        <strong style="font-family:var(--head);font-size:15px;display:block;margin-bottom:4px">Learner data</strong>
        <p class="muted" style="font-size:12.5px;margin-bottom:12px">Firestore stores only the classroom nickname and grade you add to a learner profile.</p>
        <div class="stack-sm">
          <div class="flex between" style="font-size:12px"><span class="muted">Practice attempts</span><strong>Not recorded</strong></div>
          <div class="flex between" style="font-size:12px"><span class="muted">Camera video</span><strong>Not captured</strong></div>
          <div class="flex between" style="font-size:12px"><span class="muted">Consent records</span><strong>Not stored</strong></div>
        </div>
        <p class="helper" style="margin-top:12px">${ic("info")}Use your school's approved system for guardian consent and identifiable student records.</p>
      </div>

      <div class="card card-pad" style="background:#F4F7FB">
        <div class="flex between"><div><strong style="font-size:13px">Downloaded content</strong><p class="tiny muted" style="margin-top:2px">2 lessons · 9 signs available offline</p></div><span class="chip chip-validated">${ic("check")}Ready</span></div>
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:10px" data-act="toggle-offline">${ic("wifi-off")}Preview offline notice</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- Teacher actions / events ---------------- */
Object.assign(ACTIONS, {
  "add-learner": () => openAddLearnerModal(),
  "clear-filters": () => { state.filters = { q: "", cat: "all", grade: "all", status: "all" }; render(); },
  "add-to-lesson": (el) => {
    const id = el.dataset.sign;
    const s = SIGN_BY_ID[id];
    if (!s || s.status !== "Validated") { toast("Only validated signs can be added to lessons.", "warn", "lock"); return; }
    if (state.lesson.includes(id)) { go("/teacher/builder"); return; }
    state.lesson.push(id);
    toast(`${s.gloss} added to “${state.lessonName}”.`, "ok", "plus");
    render();
  },
  "add-lesson": (el) => {
    const id = el.dataset.sign;
    if (!state.lesson.includes(id)) {
      state.lesson.push(id);
      toast(`${SIGN_BY_ID[id].gloss} added to the sequence.`, "ok", "plus");
      render();
    }
  },
  "remove-lesson": (el) => { state.lesson = state.lesson.filter((x) => x !== el.dataset.sign); render(); },
  "clear-lesson": () => { state.lesson = []; toast("Lesson sequence cleared.", "info", "trash-2"); render(); },
  "preview-lesson": () => openLessonPreview(),
  "assign-lesson": () => openAssignModal(),
  "quiz-select": (el) => { state.quizSelected = el.dataset.sign; state.quizChecked = false; render(); },
  "quiz-check": () => {
    state.quizChecked = true;
    render();
    toast(state.quizSelected === "thank-you" ? "Correct picture — learners would see stars." : "Not quite. Learners can always try again.", state.quizSelected === "thank-you" ? "ok" : "warn");
  },
  "test-camera": () => openCameraTest(),
  "toast-download": () => toast("Reference clip saved to this device for offline practice.", "ok", "download"),
  "start-search": () => startSignSearch(),
  "search-slowmo": () => { if (state.searchResults) go(`/teacher/sign/${state.searchResults[0].id}`); },
});

document.addEventListener("submit", async (e) => {
  if (e.target.id !== "add-learner-form") return;
  e.preventDefault();
  const form = e.target;
  const nickname = $("#learner-nickname", form)?.value || "";
  const grade = $("#learner-grade", form)?.value || "";
  const submit = $("button[type='submit']", form);
  const error = $("#learner-form-error", form);
  if (!state.user?.uid || state.user.role !== "teacher") {
    if (error) { error.textContent = "Sign in with a teacher account to add a learner."; error.hidden = false; }
    return;
  }

  if (submit) submit.disabled = true;
  try {
    const learner = await firebaseService.createLearner(state.user.uid, nickname, grade);
    LEARNERS.unshift(learner);
    state.learnerLoadError = "";
    closeModal();
    toast("Learner profile saved to Firestore.", "ok", "user-plus");
    render();
  } catch (saveError) {
    console.error("Could not save learner profile.", saveError);
    if (error) {
      error.textContent = saveError.message || "Could not save the learner profile. Check your connection and Firestore rules.";
      error.hidden = false;
    } else {
      toast("Could not save the learner profile. Check your connection and Firestore rules.", "warn", "circle-alert");
    }
    if (submit) submit.disabled = false;
  }
});

/* input/change handling (teacher) */
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "repo-search") { state.filters.q = el.value; paintRepoResults(); }
  if (el.id === "builder-search") {
    const q = el.value.trim().toLowerCase();
    $$("#builder-picker .pick-item").forEach((item) => {
      const label = item.textContent.toLowerCase();
      item.style.display = label.includes(q) ? "" : "none";
    });
  }
  if (el.id === "leniency") {
    state.leniency = Number(el.value);
    const label = $("#leniency-label");
    if (label) label.textContent = leniencyLabel(state.leniency);
    el.setAttribute("aria-valuetext", leniencyLabel(state.leniency));
  }
  if (el.id === "lesson-name") state.lessonName = el.value;
});

document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "filter-cat") { state.filters.cat = el.value; paintRepoResults(); }
  if (el.id === "filter-grade") { state.filters.grade = el.value; paintRepoResults(); }
  if (el.id === "filter-status") { state.filters.status = el.value; paintRepoResults(); }
});

/* drag & drop lesson builder */
function initBuilderDnD() {
  const drop = $("#lesson-drop");
  if (!drop) return;
  let dragId = null;

  $$(".seq-item", drop).forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      dragId = item.dataset.seq;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragId);
    });
    item.addEventListener("dragend", () => { item.classList.remove("dragging"); dragId = null; });
  });

  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("drag-over");
    const over = e.target.closest(".seq-item");
    if (!over || !dragId) return;
    const dragging = drop.querySelector(`[data-seq="${dragId}"]`);
    if (!dragging || over === dragging) return;
    const rect = over.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    drop.insertBefore(dragging, after ? over.nextSibling : over);
  });
  drop.addEventListener("dragleave", (e) => {
    if (!drop.contains(e.relatedTarget)) drop.classList.remove("drag-over");
  });
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("drag-over");
    const payload = e.dataTransfer.getData("text/plain");
    if (payload && !drop.querySelector(`.seq-item[data-seq="${payload}"]`) && SIGN_BY_ID[payload]?.status === "Validated") {
      state.lesson.push(payload);
      render();
      return;
    }
    const order = $$(".seq-item", drop).map((n) => n.dataset.seq);
    if (order.length) { state.lesson = order; render(); }
  });

  $$("#builder-picker .pick-item").forEach((item) => {
    item.setAttribute("draggable", "true");
    item.addEventListener("dragstart", (e) => {
      const id = $(".add", item)?.dataset.sign;
      if (id) e.dataTransfer.setData("text/plain", id);
    });
  });
}

/* lesson preview modal */
function openLessonPreview() {
  const items = state.lesson.map((id) => SIGN_BY_ID[id]);
  openModal(`
    ${modalHead("Learner preview", "Big pictures, big buttons, no reading required.", "eye")}
    <div class="modal-body">
      <div class="banner info" style="margin-bottom:14px">${ic("info")}Preview only. This prototype does not access the webcam or detect signs.</div>
      <div style="background:#F5F7FF;border-radius:20px;padding:16px;border:1px solid #E0E7FF">
        <div class="flex between" style="margin-bottom:12px"><span class="flex" style="gap:7px;font-family:var(--head);font-weight:900;font-size:16px">${ic("hand")}${esc(state.lessonName)}</span>${stars(0)}</div>
        <div class="grid g-2" style="gap:10px">
          ${items.slice(0, 4).map((s) => `<div style="background:#fff;border-radius:16px;padding:10px;display:flex;align-items:center;gap:10px">
            <span style="width:64px;height:58px;border-radius:12px;background:${CATEGORIES[s.category].soft};display:grid;place-items:center;flex:none">${handThumb(s)}</span>
            <span style="font-family:var(--head);font-size:21px;font-weight:900">${s.gloss}</span>
          </div>`).join("")}
        </div>
        <button class="btn btn-primary btn-lg btn-block" style="margin-top:12px" data-act="preview-start">${ic("play")}Start with Handy</button>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-secondary" data-act="close-modal">Close preview</button></div>`, "wide");
}

function openAssignModal() {
  openModal(`
    ${modalHead("Assign “" + esc(state.lessonName) + "”", `${state.lesson.length} validated signs · ${leniencyLabel(state.leniency)}`, "send")}
    <div class="modal-body stack">
      <div class="field"><label>Learners</label>
        <div class="consent-list">
          ${LEARNERS.length ? LEARNERS.map((l) => `<label class="check"><input type="checkbox" checked /><span><strong>${esc(l.name)}</strong><span>${esc(l.grade)}</span></span></label>`).join("") : `<p class="muted">Add a learner profile before selecting learners.</p>`}
        </div>
      </div>
      <div class="banner neutral">${ic("info")}Lesson assignments are still a prototype and are not saved to Firestore.</div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" data-act="close-modal">Cancel</button>
      <button class="btn btn-primary" data-act="confirm-assign" ${LEARNERS.length ? "" : "disabled"}>${ic("send")}Preview assignment</button>
    </div>`);
}

/* camera test modal */
function openCameraTest() {
  openModal(`
    ${modalHead("Camera preview", "This prototype does not access the webcam.", "eye")}
    <div class="modal-body">
      <div style="max-width:400px;margin:0 auto">${camPanel({ variant: "waiting" })}</div>
      <div class="banner neutral" style="margin-top:14px">${ic("info")}The hand illustration and feedback states are a visual simulation only; no hand is detected.</div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" data-act="close-modal">${ic("check")}Close preview</button></div>`, "wide");
}

/* sign-to-search flow */
let searchTimers = [];
function startSignSearch() {
  if (!state.camAllowed) { state.camAllowed = true; state.camPromptSeen = true; }
  searchTimers.forEach(clearTimeout);
  searchTimers = [];
  state.searchStage = "countdown";
  state.searchResults = null;
  render();
  const countEl = () => $("#countdown-num");
  let n = 3;
  const tick = () => {
    const el = countEl();
    n -= 1;
    if (n > 0) { if (el) el.textContent = String(n); searchTimers.push(setTimeout(tick, 800)); }
    else {
      state.searchStage = "analyzing";
      const cam = $("#search-cam"); const res = $("#search-results");
      if (cam) cam.innerHTML = camPanel({ variant: "tracking" });
      if (res) res.innerHTML = searchResultsHTML();
      if (window.lucide) lucide.createIcons();
      searchTimers.push(setTimeout(() => {
        state.searchStage = "results";
        state.searchResults = [
          { id: "thank-you", match: 94 },
          { id: "please", match: 81 },
          { id: "hello", match: 63 },
        ];
        const res2 = $("#search-results"); if (res2) res2.innerHTML = searchResultsHTML();
        if (window.lucide) lucide.createIcons();
        toast("Analysis complete — 3 possible matches.", "ok", "scan-search");
      }, 2000));
    }
  };
  searchTimers.push(setTimeout(tick, 900));
}

function afterSearchRender() {
  if (state.searchStage === "countdown" || state.searchStage === "analyzing") { /* handled by flow */ }
}

Object.assign(ACTIONS, {
  "confirm-assign": () => {
    closeModal();
    openModal(`
      ${modalHead("Assignment preview", "This prototype does not save lesson assignments yet.", "info")}
      <div class="modal-body">
        <div class="flex" style="gap:12px;padding:14px;border-radius:16px;background:#F5F7FF;border:1px solid #E0E7FF">
          <span style="width:44px;height:44px;border-radius:13px;background:#4F46E5;color:#fff;display:grid;place-items:center;flex:none">${ic("blocks")}</span>
          <div><strong style="font-size:14px">${esc(state.lessonName)}</strong><p class="tiny muted">${state.lesson.length} signs · ${LEARNERS.length} learner profiles selected</p></div>
        </div>
        <div class="banner neutral" style="margin-top:12px">${ic("info")}No lesson or progress data has been written to Firestore.</div>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-secondary" data-act="preview-start">${ic("play")}Preview now</button>
          <button class="btn btn-primary" data-act="go-progress">${ic("chart-no-axes-column")}View progress</button>
        </div>
      </div>
      <div class="modal-foot"><button class="btn btn-secondary" data-act="close-modal">Done</button></div>`);
    toast("Assignment preview opened. Nothing was saved.", "info", "send");
  },
  "go-progress": () => { closeModal(); go("/teacher/progress"); },
  "preview-start": () => { closeModal(); go(`/learner/practice/${state.lesson[0] || "hello"}`); },
});
