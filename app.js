/* ============================================================
   SilentLink — prototype core
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  user: null,
  role: null,
  firebaseUser: null,
  profileSetup: null,
  authError: "",
  learnerLoadError: "",
  learnersLoading: false,
  stars: 14,
  lesson: ["hello", "thank-you"],
  lessonName: "Morning greetings",
  leniency: 45,
  feedback: "waiting",
  feedbackPinned: false,
  detectKey: null,
  awarded: {},
  camAllowed: false,
  camPromptSeen: false,
  offline: false,
  loadingDemo: false,
  videoError: false,
  reduceMotion: false,
  filters: { q: "", cat: "all", grade: "all", status: "all" },
  activeLearner: null,
  queueFilter: "All",
  queueReviewer: "all",
  searchStage: "idle",
  searchResults: null,
  practiceSet: ["hello", "thank-you", "please", "happy"],
  practiceIndex: 0,
  quizSelected: null,
  quizChecked: false,
  rewardStars: 3,
  protoOpen: false,
  lastAwarded: null,
  builderDrag: null,
  savedNotes: "",
  toastSeq: 0,
};

const PRACTICE_MESSAGES = {
  waiting: { cls: "waiting", icon: "hand", text: "Place your hand inside the frame. Handy will help you." },
  tracking: { cls: "tracking", icon: "scan", text: "I can see your hand — make the sign now." },
  close: { cls: "close", icon: "sparkles", text: "So close! Lift your thumb a little and try again." },
  match: { cls: "match", icon: "party-popper", text: "That's it! Beautiful signing — you earned 3 stars." },
  issue: { cls: "error", icon: "sun", text: "The camera can't see your hand. Move toward the light." },
};

const STATUS_META = {
  Validated: { cls: "chip-validated", icon: "badge-check" },
  "Under Review": { cls: "chip-review", icon: "clock" },
  Draft: { cls: "chip-draft", icon: "pencil-line" },
  Archived: { cls: "chip-archived", icon: "archive" },
};

/* ---------------- utilities ---------------- */
function ic(name, extra = "") {
  return `<i data-lucide="${name}"${extra ? ` class="${extra}"` : ""} aria-hidden="true"></i>`;
}
function esc(v = "") {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function pct(n) { return Math.round(n); }

/* ---------------- identity ---------------- */
const ROLE_META = {
  teacher: { label: "Teacher", home: "#/teacher/dashboard", bg: "#EEF2FF", color: "#4338CA" },
  learner: { label: "Learner", home: "#/learner/home", bg: "#CCFBF1", color: "#0F766E" },
  consultant: { label: "Consultant", home: "#/consultant/queue", bg: "#FEF3C7", color: "#92400E" },
};

function nameFromEmail(email) {
  const local = String(email || "").split("@")[0];
  const words = local.replace(/[._-]+/g, " ").replace(/[^a-zA-Z ]/g, " ").trim().split(/\s+/).filter(Boolean);
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "Friend";
}
function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || "S").slice(0, 2)).toUpperCase();
}
function learnerIdentity() {
  if (state.user && state.user.role === "learner") return state.user;
  return { name: "Learner", firstName: "Learner", initials: "L", bg: "#CCFBF1", color: "#0F766E" };
}
function meName() { return state.user ? state.user.name : "You"; }
function meInitials() { return state.user ? state.user.initials : "You"; }
function profileUser(user, profile) {
  const name = profile.name || nameFromEmail(user.email);
  const meta = ROLE_META[profile.role];
  return {
    uid: user.uid,
    name,
    firstName: name.split(" ")[0],
    initials: initialsOf(name),
    email: user.email,
    role: profile.role,
    learnerId: profile.learnerId || null,
    bg: meta.bg,
    color: meta.color,
  };
}
function applyRemoteSigns(records) {
  records.forEach((record) => {
    const sign = SIGN_BY_ID[record.id];
    if (sign) Object.assign(sign, record);
    else {
      SIGNS.push(record);
      SIGN_BY_ID[record.id] = record;
    }
  });
}
async function signOut() {
  try {
    await firebaseService.signOut();
    state.authError = "";
    state.profileSetup = null;
    closeModal();
    go("/login");
  } catch (error) {
    console.error("Firebase sign-out failed.", error);
    toast("Could not sign out. Please try again.", "warn", "circle-alert");
  }
}
function clearTimers() {
  (window.__slTimers || []).forEach(clearTimeout);
  window.__slTimers = [];
}
function later(fn, ms) {
  const t = setTimeout(fn, ms);
  (window.__slTimers = window.__slTimers || []).push(t);
  return t;
}
function go(path) {
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}
function avatar(l, cls = "") {
  return `<span class="avatar ${cls}" style="background:linear-gradient(145deg,${l.bg},${l.bg2});color:${l.color}" aria-hidden="true">${l.initials}</span>`;
}
function statusChip(status) {
  const m = STATUS_META[status] || STATUS_META.Draft;
  return `<span class="status ${m.cls}">${ic(m.icon)}${status}</span>`;
}

/* ---------------- SVG art ---------------- */
function handArt(opts = {}) {
  const { fing = [54, 62, 58, 48], thumb = -24, tilt = 0, palm = "#fff", ink = "#0F172A", face = true, cheeks = false } = opts;
  const fingers = fing.map((len, i) => {
    const x = 84 + i * 22;
    const sway = [-3, 0, 2, 5][i];
    return `<line x1="${x}" y1="124" x2="${x + sway}" y2="${118 - len}" stroke="${palm}" stroke-width="20" stroke-linecap="round"/>`;
  }).join("");
  const faceArt = face ? `
    <ellipse cx="98" cy="150" rx="5" ry="6.4" fill="${ink}"/>
    <ellipse cx="130" cy="150" rx="5" ry="6.4" fill="${ink}"/>
    <circle cx="99.8" cy="147.6" r="1.7" fill="#fff" opacity=".9"/>
    <circle cx="131.8" cy="147.6" r="1.7" fill="#fff" opacity=".9"/>
    ${cheeks ? `<ellipse cx="84" cy="164" rx="7" ry="4.4" fill="#FB7185" opacity=".4"/><ellipse cx="144" cy="164" rx="7" ry="4.4" fill="#FB7185" opacity=".4"/>` : ""}
    <path d="M103 166 Q114 176 126 165" stroke="${ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  ` : "";
  return `<svg viewBox="0 0 220 220" aria-hidden="true">
    <g transform="rotate(${tilt} 112 192)">
      ${fingers}
      <g transform="rotate(${thumb} 78 150)">
        <line x1="78" y1="152" x2="58" y2="108" stroke="${palm}" stroke-width="23" stroke-linecap="round"/>
      </g>
      <path d="M56 126 C56 104 71 94 92 94 L138 94 C157 94 168 107 168 126 L168 158 C168 187 146 203 114 203 L106 203 C74 203 56 187 56 158 Z" fill="${palm}"/>
      ${faceArt}
    </g>
  </svg>`;
}

function handy(variant = "waving", size = "med", extraClass = "") {
  let art;
  if (variant === "thumbs-up") {
    art = handArt({ fing: [28, 32, 30, 24], thumb: 34, tilt: 4, palm: "#FDE68A", ink: "#422800", cheeks: true });
  } else if (variant === "cheering") {
    art = handArt({ fing: [66, 74, 70, 58], thumb: -62, tilt: 16, palm: "#FDE68A", ink: "#422800", cheeks: true });
  } else {
    art = handArt({ fing: [58, 68, 64, 52], thumb: -42, tilt: -12, palm: "#FDE68A", ink: "#422800", cheeks: true });
  }
  const sparks = variant === "cheering" ? `
    <span class="spark" style="top:2%;left:-6%">${ic("sparkles")}</span>
    <span class="spark" style="bottom:16%;right:-4%;animation-delay:.8s">${ic("star")}</span>
    <span class="spark" style="top:26%;right:-10%;animation-delay:1.4s">${ic("sparkles")}</span>` : "";
  return `<div class="handy ${variant === "cheering" ? "cheering" : variant === "waving" ? "waving" : ""} ${size} ${extraClass}" role="img" aria-label="Handy the friendly signing hand, ${variant.replace("-", " ")}">
    ${art}${sparks}
  </div>`;
}

const HAND_POINTS = [
  [100, 178],
  [80, 166], [69, 152], [59, 139], [52, 126],
  [84, 142], [78, 110], [75, 88], [73, 70],
  [101, 138], [101, 104], [101, 80], [101, 62],
  [118, 142], [124, 110], [129, 88], [132, 70],
  [134, 152], [146, 130], [155, 114], [160, 99],
];
const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

function handSkeleton(variant = "dim") {
  const pts = HAND_POINTS;
  return `<svg class="skeleton-svg ${variant}" viewBox="0 0 200 220" aria-hidden="true">
    <g style="animation:skelSway 4.6s ease-in-out infinite;transform-origin:50% 92%">
      ${HAND_BONES.map(([a, b]) => `<line class="bone" x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}"/>`).join("")}
      ${pts.map(([x, y]) => `<circle class="joint" cx="${x}" cy="${y}" fill="rgba(255,255,255,.65)"/>`).join("")}
    </g>
  </svg>`;
}

function handThumb(sign, opts = {}) {
  const c = CATEGORIES[sign.category];
  return handArt({
    fing: sign.glyph.f,
    thumb: sign.glyph.thumb,
    tilt: sign.glyph.tilt,
    palm: opts.palm || "#fff",
    ink: opts.ink || c.deep,
    face: opts.face ?? false,
  });
}

function stars(n, size = "") {
  return `<span class="stars ${size}" aria-label="${n} of 3 stars">${[1, 2, 3].map((i) => `${ic("star", i <= n ? "on" : "")}`).join("")}</span>`;
}

function ring(value, size = 56, stroke = 6, color = "#4F46E5", label = true) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(value, 100) / 100) * c;
  const col = value >= 80 ? "#22C55E" : value >= 55 ? "#14B8A6" : value >= 35 ? "#F59E0B" : "#FB7185";
  const showSmall = size >= 60;
  return `<span class="ring-wrap" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
      <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke="${color === "auto" ? col : color}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
    </svg>
    ${label ? `<span class="ring-label">${Math.round(value)}%${showSmall ? "<small>mastery</small>" : ""}</span>` : ""}
  </span>`;
}

function starsLine(n) {
  const labels = { 1: "Needs support", 2: "Steady", 3: "Confident" };
  return `<span class="chip ${n === 3 ? "chip-validated" : n === 2 ? "chip-teal" : "chip-review"}">${ic(n === 3 ? "trending-up" : n === 2 ? "minus" : "life-buoy")}${labels[n]}</span>`;
}

/* ---------------- sign card ---------------- */
function signCard(sign) {
  const c = CATEGORIES[sign.category];
  const valid = sign.status === "Validated";
  return `<button class="sign-card" data-nav="#/teacher/sign/${sign.id}" >
    <div class="sign-thumb" style="--thumb-a:${c.soft};--thumb-b:${c.soft}">
      <span class="grade-pin">${sign.grade}</span>
      ${handThumb(sign)}
      ${valid ? "" : '<span class="draft-veil"></span>'}
    </div>
    <div class="sign-body">
      <span class="sign-gloss">${sign.gloss}</span>
      <div class="sign-meta"><span class="cat">${sign.category}</span><span class="dot" style="color:${c.fill}"></span><span class="cat">${sign.consultant === "Unassigned" ? "No reviewer" : sign.consultant.split(" ")[0]}</span></div>
      ${statusChip(sign.status)}
    </div>
  </button>`;
}

function pickItem(sign) {
  const c = CATEGORIES[sign.category];
  const inLesson = state.lesson.includes(sign.id);
  const valid = sign.status === "Validated";
  return `<div class="pick-item">
    <span class="pick-thumb" style="background:${c.soft}">${handThumb(sign)}</span>
    <span class="grow"><b>${sign.gloss}</b><small>${sign.category} · ${valid ? "Validated" : sign.status}</small></span>
    <button class="add" data-act="add-lesson" data-sign="${sign.id}" ${valid ? "" : "disabled style='opacity:.4'"} aria-label="Add ${sign.gloss} to lesson">${ic("plus")}</button>
  </div>`;
}

/* ---------------- video player ---------------- */
function videoPlayer(sign, opts = {}) {
  const variant = opts.variant || "full";
  if (state.videoError && opts.allowError !== false) {
    return `<div class="card card-pad" style="border-color:#FECDD3;background:#FFF1F2;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;padding:34px">
      <span class="e-ico" style="background:#FFE4E6;color:#BE123C;width:58px;height:58px;border-radius:16px;display:grid;place-items:center">${ic("video-off")}</span>
      <h3 style="font-size:16px">The demo video didn't load</h2>
      <p class="muted" style="font-size:12.5px;max-width:320px">You can still use the reference pose and notes. This clip will retry when the connection is better.</p>
      <button class="btn btn-secondary btn-sm" data-act="retry-video">${ic("refresh-cw")}Retry video</button>
      <span class="pill-note">${ic("wifi-off")}Offline copy is not downloaded</span>
    </div>`;
  }
  return `<div class="video-card" data-player>
    <div class="video-stage" id="video-stage">
      <span class="replay-tag">${ic("circle-play")}Reference demo · 8 sec</span>
      <div class="glyph-wrap">${handArt({ fing: sign.glyph.f, thumb: sign.glyph.thumb, tilt: sign.glyph.tilt, palm: "rgba(255,255,255,.94)", ink: "#1E1B4B", face: false })}</div>
      <span class="demo-corner">Front view · ${sign.grade}</span>
    </div>
    <div class="video-bar">
      <button class="vbtn play" data-v-play aria-label="Play demo">${ic("play")}</button>
      <button class="vbtn" data-v-slow aria-pressed="false" aria-label="Toggle slow motion">${ic("gauge")}</button>
      <button class="vbtn" data-v-loop aria-pressed="false" aria-label="Toggle loop">${ic("repeat")}</button>
      <button class="vbtn" data-v-mirror aria-pressed="false" aria-label="Mirror the video">${ic("flip-horizontal")}</button>
      <div class="track"><i style="width:0%"></i></div>
      <span class="time">0:00 / 0:08</span>
    </div>
  </div>`;
}

function initVideoPlayers() {
  $$("[data-player]").forEach((player) => {
    const stage = $(".video-stage", player);
    const fill = $(".track > i", player);
    const time = $(".time", player);
    const playBtn = $("[data-v-play]", player);
    let playing = false, pos = 0, rate = 1, timer = null, loop = false;

    const paint = () => {
      const total = 8;
      const shown = Math.min(total, (pos / 100) * total);
      fill.style.width = `${pos}%`;
      time.textContent = `0:0${Math.floor(shown)} / 0:08`;
    };
    const stop = () => { playing = false; clearInterval(timer); playBtn.innerHTML = ic("play"); playBtn.setAttribute("aria-label", "Play demo"); };
    playBtn.addEventListener("click", () => {
      if (playing) { stop(); return; }
      playing = true;
      playBtn.innerHTML = ic("pause");
      playBtn.setAttribute("aria-label", "Pause demo");
      clearInterval(timer);
      timer = setInterval(() => {
        if (!document.body.contains(player)) { clearInterval(timer); return; }
        pos += rate;
        if (pos >= 100) {
          if (loop) { pos = 0; } else { pos = 100; paint(); stop(); return; }
        }
        paint();
      }, 90);
    });
    $("[data-v-slow]", player).addEventListener("click", (e) => {
      const on = e.currentTarget.classList.toggle("on");
      e.currentTarget.setAttribute("aria-pressed", String(on));
      rate = on ? 0.4 : 1;
      stage.classList.toggle("slow", on);
    });
    $("[data-v-loop]", player).addEventListener("click", (e) => {
      const on = e.currentTarget.classList.toggle("on");
      e.currentTarget.setAttribute("aria-pressed", String(on));
      loop = on;
    });
    $("[data-v-mirror]", player).addEventListener("click", (e) => {
      const on = e.currentTarget.classList.toggle("on");
      e.currentTarget.setAttribute("aria-pressed", String(on));
      stage.classList.toggle("is-mirrored", on);
    });
  });
}

/* ---------------- camera ---------------- */
function camPrivacy() {
  return `<div class="cam-privacy">${ic("info")}Camera simulation only. No webcam is accessed.</div>`;
}

function camPanel({ variant = "tracking", allow = true, tall = false } = {}) {
  if (!allow) {
    return `<div class="cam-panel">
      <div class="cam-stage" style="aspect-ratio:${tall ? "4/3" : "4/3"}">
        <span class="cam-tag">${ic("camera")}Handy cam</span>
        <div class="cam-guide">
          <span style="width:84px;height:84px;border-radius:24px;display:grid;place-items:center;background:rgba(251,113,133,.18);color:#FDA4AF">${ic("video-off")}</span>
          <p><strong style="color:#fff;font-size:14px">Camera simulation</strong><br/>This prototype does not open or access your webcam.</p>
          <button class="btn btn-secondary btn-sm" data-act="allow-camera">${ic("play")}Continue demo</button>
        </div>
      </div>
      ${camPrivacy()}
    </div>`;
  }
  const guide = variant === "waiting" || variant === "issue";
  return `<div class="cam-panel" id="cam-panel">
    <div class="cam-stage">
      <span class="cam-tag">${ic("camera")}Handy cam</span>
      <span class="cam-live"><span class="dot"></span>ON-DEVICE</span>
      <div class="cam-frame ${variant}"></div>
      ${variant === "waiting" || variant === "issue" ? "" : `<div class="cam-skeleton">${handSkeleton(variant === "match" ? "match" : variant === "close" ? "close" : "tracking")}</div>`}
      ${variant === "waiting" ? `<div class="cam-guide">${ic("hand")}<p><strong style="color:#fff;font-size:13px">Show your hand</strong><br/>Keep it inside the dashed frame.</p></div>` : ""}
      ${variant === "issue" ? `<div class="cam-guide">
        <div class="flex" style="gap:16px">
          <span style="width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:rgba(250,204,21,.16);color:#FDE047">${ic("sun")}</span>
          <span style="width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:rgba(20,184,166,.16);color:#5EEAD4">${ic("move")}</span>
        </div>
        <p><strong style="color:#fff;font-size:13.5px">I can't see your hand</strong><br/>Sit facing a window or lamp, and keep your hand one arm-length from the screen.</p>
        <button class="btn btn-secondary btn-sm" data-act="allow-camera">${ic("refresh-cw")}Restart camera</button>
      </div>` : ""}
      ${variant === "match" ? `<div style="position:absolute;z-index:4;bottom:12px;left:0;right:0;display:flex;justify-content:center"><span class="status chip-validated" style="font-size:12px;padding:6px 12px">${ic("check")}Handshape + movement match</span></div>` : ""}
    </div>
    ${camPrivacy()}
  </div>`;
}

/* ---------------- toast / modal / confetti ---------------- */
function toast(message, tone = "ok", icon) {
  const region = $("#toast-region");
  while (region.children.length >= 2) region.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = `toast ${tone}`;
  el.innerHTML = `<span class="ti">${ic(icon || (tone === "ok" ? "check" : tone === "warn" ? "alert-triangle" : "info"))}</span><span>${esc(message)}</span>`;
  region.appendChild(el);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 220);
  }, 3400);
}

function openModal(html, cls = "") {
  $("#modal-region").innerHTML = `<div class="scrim" data-scrim>
    <div class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${html}</div>
  </div>`;
  if (window.lucide) lucide.createIcons();
  const focusTarget = $("#modal-region .modal .btn, #modal-region .modal button, #modal-region .modal input, #modal-region .modal textarea");
  if (focusTarget) focusTarget.focus({ preventScroll: true });
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#modal-region").innerHTML = "";
  document.body.style.overflow = "";
}
function modalHead(title, sub, icon = "sparkles") {
  return `<div class="modal-head">
    <span style="width:42px;height:42px;border-radius:12px;background:#EEF2FF;color:#4338CA;display:grid;place-items:center;flex:none">${ic(icon)}</span>
    <div><h2 id="modal-title">${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>
    <button class="icon-btn" data-act="close-modal" aria-label="Close dialog">${ic("x")}</button>
  </div>`;
}

function confetti() {
  if (state.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrap = document.createElement("div");
  wrap.className = "confetti";
  const colors = ["#4F46E5", "#14B8A6", "#FACC15", "#22C55E", "#FB7185", "#F59E0B"];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    p.style.animationDelay = `${Math.random() * 0.5}s`;
    p.style.width = `${5 + Math.random() * 7}px`;
    p.style.height = `${8 + Math.random() * 10}px`;
    if (i % 5 === 0) p.style.borderRadius = "50%";
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3800);
}

/* ---------------- shell ---------------- */
function offlineBar() {
  if (!state.offline) return "";
  return `<div class="offline-bar">${ic("wifi-off")}<span>You're offline — downloaded signs and lessons still work. Results will sync when you reconnect.</span><button data-act="toggle-offline">Dismiss</button></div>`;
}

const TEACHER_NAV = [
  ["dashboard", "layout-dashboard", "Dashboard"],
  ["repository", "library", "Repository"],
  ["builder", "blocks", "Builder"],
  ["progress", "chart-no-axes-column", "Progress"],
  ["recognition", "scan-hand", "Recognition", "beta"],
  ["sign-search", "scan-search", "Sign search", "beta"],
];

const CONSULTANT_NAV = [
  ["queue", "list-checks", "Validation Queue"],
  ["record", "record", "Record Sign"],
];

function teacherShell(active, content) {
  return `<div class="app">
    <header class="topbar">
      <a class="brand" href="#/teacher/dashboard" aria-label="SilentLink home">
        <span class="brand-mark">${ic("hand")}</span>
        <span class="brand-name">Silent<span>Link</span></span>
      </a>
      <nav class="main-nav" aria-label="Teacher navigation">
        ${TEACHER_NAV.map(([id, icon, label, beta]) => `<a class="nav-item ${active === id ? "active" : ""}" href="#/teacher/${id}" ${active === id ? 'aria-current="page"' : ""}>${ic(icon)}${label}${beta ? '<span class="beta">Beta</span>' : ""}</a>`).join("")}
      </nav>
      <div class="topbar-right">
        <a class="icon-btn ${active === "settings" ? "is-active" : ""}" href="#/teacher/settings" aria-label="Settings and privacy" style="text-decoration:none;${active === "settings" ? "background:#EEF2FF;color:#4338CA;border-color:#DDE3FF" : ""}">${ic("settings")}</a>
        <button class="icon-btn" data-act="open-help" aria-label="Help and scope">${ic("circle-help")}</button>
        <button class="role-chip" data-act="sign-out" title="Sign out">
          <span class="avatar" style="background:${state.user.bg};color:${state.user.color}">${state.user.initials}</span>
          <span><span style="display:block;font-weight:700;font-size:12px">${state.user.name}</span><small>Teacher</small></span>
          ${ic("log-out")}
        </button>
      </div>
    </header>
    ${offlineBar()}
    <main id="screen" class="screen"><div class="wrap">${content}</div></main>
    <nav class="tabbar" aria-label="Teacher navigation, compact">
      ${TEACHER_NAV.slice(0, 4).map(([id, icon, label]) => `<button class="${active === id ? "active" : ""}" data-nav="#/teacher/${id}">${ic(icon)}${label.split(" ")[0]}</button>`).join("")}
    </nav>
  </div>`;
}

function consultantShell(active, content) {
  return `<div class="app">
    <header class="topbar">
      <a class="brand" href="#/consultant/queue" aria-label="SilentLink home">
        <span class="brand-mark">${ic("hand")}</span>
        <span class="brand-name">Silent<span>Link</span></span>
      </a>
      <nav class="main-nav" aria-label="Consultant navigation">
        ${CONSULTANT_NAV.map(([id, icon, label]) => `<a class="nav-item ${active === id ? "active" : ""}" href="#/consultant/${id}" ${active === id ? 'aria-current="page"' : ""}>${ic(icon)}${label}</a>`).join("")}
      </nav>
      <div class="topbar-right">
        <span class="chip chip-teal" style="height:30px">${ic("badge-check")}Deaf consultant</span>
        <button class="role-chip" data-act="sign-out" title="Sign out">
          <span class="avatar" style="background:${state.user.bg};color:${state.user.color}">${state.user.initials}</span>
          <span><span style="display:block;font-weight:700;font-size:12px">${state.user.name}</span><small>Deaf consultant</small></span>
          ${ic("log-out")}
        </button>
      </div>
    </header>
    ${offlineBar()}
    <main id="screen" class="screen"><div class="wrap">${content}</div></main>
  </div>`;
}

function learnerShell(active, content, opts = {}) {
  const who = learnerIdentity();
  return `<div class="learner-shell">
    <header class="learner-head">
      <a class="brand" href="#/learner/home" aria-label="SilentLink home">
        <span class="brand-mark">${ic("hand")}</span>
        <span class="brand-name">Silent<span>Link</span></span>
      </a>
      <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
        <span class="star-pill" aria-label="${state.stars} stars collected">${ic("star")}<span id="star-count">${state.stars}</span></span>
        <button class="role-chip" data-act="sign-out" title="Sign out" style="min-height:48px">
          <span class="avatar lg" style="background:${who.bg};color:${who.color};width:38px;height:38px;font-size:16px">${who.initials}</span>
          <span><span style="display:block;font-weight:700;font-size:12.5px">${who.name}</span><small>Learner</small></span>
          ${ic("log-out")}
        </button>
      </div>
    </header>
    ${offlineBar()}
    <main id="screen" class="learner-wrap">${content}</main>
    <nav class="tabbar" aria-label="Learner navigation">
      <button class="${active === "home" ? "active" : ""}" data-nav="#/learner/home">${ic("house")}Home</button>
      <button class="${active === "practice" ? "active" : ""}" data-nav="#/learner/practice/hello">${ic("hand")}Practice</button>
      <button class="${active === "stars" ? "active" : ""}" data-nav="#/learner/stars">${ic("flower-2")}My Stars</button>
      <button class="${active === "reward" ? "active" : ""}" data-nav="#/learner/reward">${ic("gift")}Rewards</button>
    </nav>
  </div>`;
}

/* ---------------- login ---------------- */
function loginScreen() {
  return `<main class="login-page">
    <section class="login-card">
      <a class="login-brand" href="#/login" aria-label="SilentLink">
        <span class="brand-mark">${ic("hand")}</span>
        <span class="brand-name">Silent<span>Link</span></span>
      </a>
      <div class="login-copy">
        <h1>Sign in</h1>
      </div>
      ${state.authError ? `<p class="form-error" role="alert">${esc(state.authError)}</p>` : ""}
      ${state.profileSetup ? `<div class="banner warn" style="margin-bottom:16px">
        ${ic("shield-alert")}
        <div>This Firebase account needs a Firestore role profile. In the <code>users</code> collection, create a document with this ID: <code>${esc(state.profileSetup.uid)}</code>. Add a string field <code>role</code> with the account type you want: <code>learner</code>, <code>teacher</code>, or <code>consultant</code>. For a learner account, you can also add a string field <code>name</code> with a classroom nickname. Then sign out and sign in again.</div>
      </div>
      ` : ""}
      ${state.firebaseUser ? `<button class="btn btn-secondary btn-block" type="button" data-act="sign-out">Sign out of Firebase</button>` : `<form id="login-form" class="login-form" novalidate>
        <div class="field">
          <label for="login-email">Email</label>
          <input class="input" id="login-email" name="email" type="email" autocomplete="email" placeholder="you@school.ph" required />
        </div>
        <div class="field">
          <label for="login-password">Password</label>
          <input class="input" id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Your password" required />
        </div>
        <p class="form-error" id="login-error" role="alert" hidden></p>
        <button class="btn btn-primary btn-block login-submit" type="submit">Sign in</button>
      </form>`}
    </section>
  </main>`;
}

/* ---------------- prototype dev panel ---------------- */
const PROTO_SCREENS = [
  ["Getting in", [["Sign in", "#/login"]]],
  ["Teacher", [
    ["Dashboard", "#/teacher/dashboard"],
    ["Sign Repository", "#/teacher/repository"],
    ["Sign Detail — Hello", "#/teacher/sign/hello"],
    ["Sign Detail — No (unvalidated)", "#/teacher/sign/no"],
    ["Lesson Builder", "#/teacher/builder"],
    ["Learner Progress", "#/teacher/progress"],
    ["Sign-to-Search (Beta)", "#/teacher/sign-search"],
    ["Settings & Privacy", "#/teacher/settings"],
  ]],
  ["Learner", [
    ["Home", "#/learner/home"],
    ["Sign Practice", "#/learner/practice/hello"],
    ["Reward", "#/learner/reward"],
    ["My Stars", "#/learner/stars"],
  ]],
  ["Consultant", [
    ["Validation Queue", "#/consultant/queue"],
    ["Review — No", "#/consultant/review/no"],
    ["Record Sign", "#/consultant/record"],
  ]],
];

function protoPanel() {
  const cur = location.hash || "#/login";
  return `<aside class="proto-panel" aria-label="Prototype controls">
    <div class="proto-head">${ic("sliders-horizontal")}<b>Prototype panel</b><span class="tag">Dev</span>
      <button data-act="close-proto" aria-label="Close prototype panel">${ic("x")}</button>
    </div>
    <div class="proto-body thin-scroll">
      <div class="proto-group">
        <h4>Camera feedback states</h4>
        <div class="proto-seg" role="group" aria-label="Jump to practice feedback state">
          ${[["waiting", "A"], ["tracking", "B"], ["close", "C"], ["match", "D"], ["issue", "E"]].map(([k, l]) => `<button class="${state.feedback === k && state.feedbackPinned ? "on" : ""}" data-act="dev-feedback" data-state="${k}" title="${k}">${l}</button>`).join("")}
        </div>
        <p class="proto-hint">A waiting · B tracking · C close · D match · E camera issue. Opens Sign Practice with that state pinned.</p>
      </div>
      <div class="proto-group">
        <h4>States & scenarios</h4>
        <button class="proto-toggle ${state.offline ? "on" : ""}" data-act="toggle-offline"><span>Offline notice</span><span class="sw"></span></button>
        <button class="proto-toggle ${state.loadingDemo ? "on" : ""}" data-act="dev-loading"><span>Loading state (lists)</span><span class="sw"></span></button>
        <button class="proto-toggle ${state.videoError ? "on" : ""}" data-act="dev-video-error"><span>Video error</span><span class="sw"></span></button>
        <button class="proto-toggle ${state.reduceMotion ? "on" : ""}" data-act="dev-reduced-motion"><span>Reduced motion</span><span class="sw"></span></button>
        <button class="proto-toggle ${!state.camAllowed ? "on" : ""}" data-act="dev-camera-reset"><span>Camera permission prompt</span><span class="sw"></span></button>
      </div>
      <div class="proto-group">
        <h4>Jump to screen</h4>
        ${PROTO_SCREENS.map(([group, items]) => `<div style="margin-bottom:6px"><div class="proto-hint" style="padding:2px 4px 3px;color:#94A3B8">${group}</div>
          <div class="proto-links">${items.map(([label, href]) => `<a href="${href}" class="${cur === href ? "active" : ""}"><span class="pdot"></span>${label}</a>`).join("")}</div></div>`).join("")}
      </div>
      <div class="proto-group">
        <button class="proto-toggle" data-act="reset-proto"><span>Reset prototype data</span>${ic("rotate-ccw")}</button>
        <p class="proto-hint">13 reference signs · learner profiles stored per teacher · camera feedback is simulated.</p>
      </div>
    </div>
  </aside>`;
}

function renderProto() {
  const region = $("#proto-region");
  region.innerHTML = `<button class="proto-fab ${state.protoOpen ? "open" : ""}" data-act="toggle-proto" aria-expanded="${state.protoOpen}" aria-label="Prototype controls and camera states" title="Prototype controls">${ic(state.protoOpen ? "x" : "sliders-horizontal")}</button>
  ${state.protoOpen ? protoPanel() : ""}`;
  if (window.lucide) lucide.createIcons();
}

/* ---------------- help modal ---------------- */
function openHelp() {
  openModal(`
    ${modalHead("How SilentLink works", "A classroom aid for a fixed kindergarten vocabulary.", "circle-help")}
    <div class="modal-body stack">
      <div class="helper">${ic("check")}A reference catalog and learner profiles using classroom nicknames.</div>
      <div class="helper">${ic("check")}Consultant-validated reference clips, handshape and movement notes, and regional variants.</div>
      <div class="helper">${ic("check")}Picture-first lessons and quizzes that need no audio.</div>
      <div class="helper">${ic("info")}Practice results remain unavailable until real sign recognition is integrated.</div>
      <div class="helper">${ic("shield-check")}No webcam is accessed and no video or hand data is collected.</div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" data-act="close-modal">Got it</button></div>`);
}

/* ---------------- router ---------------- */
function currentParts() {
  const raw = (location.hash || "").replace(/^#\/?/, "");
  return raw.split("/").filter(Boolean).map(decodeURIComponent);
}

function render() {
  if (typeof stopRecognitionOnNavigation === "function") stopRecognitionOnNavigation();
  clearTimers();
  closeModal();
  $$(".confetti").forEach((el) => el.remove());
  state.protoOpen = state.protoOpen;
  const parts = currentParts();
  const app = $("#app");
  let html = "";

  if (!parts.length) {
    if (state.user) { location.replace(ROLE_META[state.user.role].home); return; }
    state.role = null;
    html = loginScreen();
  } else if (parts[0] === "login") {
    if (state.user) { location.replace(ROLE_META[state.user.role].home); return; }
    state.role = null;
    html = loginScreen();
  } else if (!state.user) {
    location.replace("#/login");
    html = loginScreen();
  } else if (parts[0] === "teacher") {
    state.role = "teacher";
    html = renderTeacher(parts);
  } else if (parts[0] === "learner") {
    state.role = "learner";
    html = renderLearner(parts);
  } else if (parts[0] === "consultant") {
    state.role = "consultant";
    html = renderConsultant(parts);
  } else {
    html = loginScreen();
  }

  app.innerHTML = html;
  if (window.lucide) lucide.createIcons();
  renderProto();
  initVideoPlayers();
  if (state.role === "teacher" && parts[1] === "recognition") renderRecognitionSamples();
  if (state.role === "teacher" && parts[1] === "builder") initBuilderDnD();
  if (state.role === "learner" && parts[1] === "practice") afterPracticeRender(parts[2]);
  if (state.role === "learner" && parts[1] === "reward") later(confetti, 200);
  if (state.role === "teacher" && parts[1] === "sign-search") afterSearchRender();
  window.scrollTo({ top: 0, behavior: state.reduceMotion ? "auto" : "instant" in window ? "instant" : "auto" });
}

/* ---------------- events ---------------- */
const ACTIONS = {
  "sign-out": () => signOut(),
  "close-modal": () => closeModal(),
  "open-help": () => openHelp(),
  "toggle-proto": () => { state.protoOpen = !state.protoOpen; renderProto(); },
  "close-proto": () => { state.protoOpen = false; renderProto(); },
  "dev-feedback": (el) => {
    state.feedback = el.dataset.state;
    state.feedbackPinned = true;
    if (state.role !== "learner") { go(`/learner/practice/${state.practiceSet[0]}`); } else { state.detectKey = null; render(); }
  },
  "toggle-offline": () => { state.offline = !state.offline; render(); },
  "dev-loading": () => {
    if (["repository", "progress", "queue"].includes(currentParts()[1])) {
      state.loadingDemo = true;
      render();
      later(() => { state.loadingDemo = false; render(); }, 1500);
    } else {
      toast("Loading demo runs on Repository, Progress, and Queue.", "info", "loader-circle");
    }
  },
  "dev-video-error": () => {
    state.videoError = !state.videoError;
    toast(state.videoError ? "Video error state on. Open a sign detail." : "Video restored.", state.videoError ? "warn" : "ok");
    renderProto();
    render();
  },
  "dev-reduced-motion": () => {
    document.body.classList.toggle("reduce-motion", !state.reduceMotion);
    state.reduceMotion = !state.reduceMotion;
    toast(state.reduceMotion ? "Reduced motion enabled." : "Reduced motion off.", "info");
    renderProto();
  },
  "dev-camera-reset": () => {
    state.camAllowed = false;
    state.camPromptSeen = false;
    toast("Camera permission reset. Open Sign Practice.", "info", "camera");
    renderProto();
  },
  "reset-proto": () => {
    state.stars = 14;
    state.lesson = ["hello", "thank-you"];
    state.feedback = "waiting";
    state.feedbackPinned = false;
    state.detectKey = null;
    state.awarded = {};
    state.practiceIndex = 0;
    state.camAllowed = false;
    state.camPromptSeen = false;
    state.offline = false;
    state.videoError = false;
    state.loadingDemo = false;
    state.searchStage = "idle";
    state.searchResults = null;
    state.filters = { q: "", cat: "all", grade: "all", status: "all" };
    toast("Prototype data reset.", "ok", "rotate-ccw");
    render();
  },
  "retry-video": () => { state.videoError = false; toast("Reconnecting to the demo clip…", "info", "refresh-cw"); render(); },
  "allow-camera": () => {
    state.camAllowed = true;
    state.camPromptSeen = true;
    if (state.feedback === "issue") { state.feedback = "waiting"; state.detectKey = null; }
    toast("Camera simulation enabled. No webcam is accessed.", "info", "camera");
    render();
  },
  "close-scrim": () => closeModal(),
};

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-scrim]")) { closeModal(); return; }
  const nav = e.target.closest("[data-nav]");
  if (nav) { e.preventDefault(); go(nav.dataset.nav.replace(/^#/, "")); return; }
  const actEl = e.target.closest("[data-act]");
  if (!actEl) return;
  const fn = ACTIONS[actEl.dataset.act];
  if (fn) { e.preventDefault(); fn(actEl); }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "login-form") return;
  e.preventDefault();
  const email = ($("#login-email")?.value || "").trim();
  const password = $("#login-password")?.value || "";
  const err = $("#login-error");
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail || password.length < 1) {
    if (err) { err.textContent = !validEmail ? "Enter a valid email address." : "Enter your password."; err.hidden = false; }
    (!validEmail ? $("#login-email") : $("#login-password"))?.focus();
    return;
  }
  if (!window.firebaseService) {
    state.authError = window.firebaseServiceError?.message || "Firebase is not available. Check your internet connection and reload.";
    render();
    return;
  }
  state.authError = "";
  if (err) err.hidden = true;
  firebaseService.signIn(email, password).catch((error) => {
    console.error("Firebase sign-in failed.", error);
    const messages = {
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/network-request-failed": "Could not reach Firebase. Check your internet connection.",
      "auth/too-many-requests": "Too many sign-in attempts. Wait a little, then try again.",
      "auth/user-disabled": "This Firebase account is disabled.",
    };
    state.authError = messages[error.code] || "Sign-in failed. Check your email and password, then try again.";
    render();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); if (state.protoOpen) { state.protoOpen = false; renderProto(); } }
});

window.addEventListener("hashchange", render);

function initApp() {
  if (!window.firebaseService) {
    state.authError = window.firebaseServiceError?.message || "Firebase is not available. Check your internet connection and reload.";
    render();
    return;
  }

  let authRevision = 0;
  firebaseService.onAuthStateChanged(async (user) => {
    const revision = ++authRevision;
    state.firebaseUser = user;
    state.profileSetup = null;

    if (!user) {
      state.user = null;
      state.role = null;
      if (currentParts()[0] !== "login") location.replace("#/login");
      else render();
      return;
    }

    try {
      const profile = await firebaseService.loadProfile(user);
      const signs = await firebaseService.loadSigns(profile.role);
      const learners = profile.role === "teacher"
        ? await firebaseService.loadLearners(user.uid)
        : [];
      if (revision !== authRevision) return;
      applyRemoteSigns(signs);
      LEARNERS.splice(0, LEARNERS.length, ...learners);
      state.learnersLoading = false;
      state.learnerLoadError = "";
      state.user = profileUser(user, profile);
      state.role = profile.role;
      state.authError = "";
      const route = currentParts();
      if (!route.length || route[0] === "login") location.replace(ROLE_META[profile.role].home);
      else render();
    } catch (error) {
      if (revision !== authRevision) return;
      console.error("Firebase account initialization failed.", error);
      state.user = null;
      state.role = null;
      LEARNERS.splice(0, LEARNERS.length);
      if (error.code === "profile/not-found" || error.code === "profile/invalid") {
        state.profileSetup = { uid: user.uid };
        state.authError = error.message;
      } else {
        state.learnerLoadError = error.message;
        state.authError = "Could not load your Firebase role or sign catalog. Check the Firestore security rules and try again.";
      }
      if (currentParts()[0] !== "login") location.replace("#/login");
      else render();
    }
  }, (error) => {
    console.error("Firebase authentication state failed.", error);
    state.authError = "Could not verify your Firebase sign-in. Reload the page and try again.";
    render();
  });
  render();
  if (window.lucide) lucide.createIcons();
}
