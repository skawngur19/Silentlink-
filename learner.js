/* ============================================================
   SilentLink — Learner screens
   ============================================================ */

const TODAY_SIGNS = ["hello", "thank-you", "please"];

function renderLearner(parts) {
  const screen = parts[1] || "home";
  if (screen === "practice") {
    initPracticeSign(parts[2]);
    return learnerShell("practice", practiceScreen(parts[2]));
  }
  if (screen === "reward") return learnerShell("reward", rewardScreen());
  if (screen === "stars") return learnerShell("stars", starsScreen());
  return learnerShell("home", homeScreen());
}

function initPracticeSign(id) {
  const signId = SIGN_BY_ID[id] ? id : "hello";
  if (state.lastPracticeSign !== signId) {
    state.lastPracticeSign = signId;
    state.feedback = "waiting";
    state.feedbackPinned = false;
    state.detectKey = null;
    state.practiceIndex = Math.max(0, state.practiceSet.indexOf(signId));
  }
}

/* ---------------- Home ---------------- */
function homeScreen() {
  return `
  <div class="hero">
    <div class="grow">
      <h1>Hi, ${learnerIdentity().firstName}!</h1>
      <p>Handy has three signs ready for you today. Take your time — every try is a good try.</p>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn btn-primary btn-xl" data-nav="#/learner/practice/hello">${ic("play")}Let's sign</button>
        <button class="btn btn-secondary btn-lg" data-nav="#/learner/stars">${ic("flower-2")}My garden</button>
      </div>
    </div>
    ${handy("waving", "big")}
  </div>

  <div class="grid g-3" style="margin-top:18px">
    <a class="big-card bc-1" href="#/learner/practice/hello">
      <span class="bc-ico" style="background:#fff">${ic("hand")}</span>
      <b>Today's Signs</b>
      <span>Hello · Thank you · Please</span>
      <span class="arrow">${ic("arrow-right")}</span>
    </a>
    <a class="big-card bc-2" href="#/learner/stars">
      <span class="bc-ico" style="background:#fff">${ic("star")}</span>
      <b>My Stars</b>
      <span>See your sticker garden</span>
      <span class="arrow">${ic("arrow-right")}</span>
    </a>
    <a class="big-card bc-3" href="#/learner/practice/please">
      <span class="bc-ico" style="background:#fff">${ic("shapes")}</span>
      <b>Play Quiz</b>
      <span>Pick the right picture</span>
      <span class="arrow">${ic("arrow-right")}</span>
    </a>
  </div>

  <div class="section-head"><h2>Pick a sign to practice</h2></div>
  <div class="grid g-3">
    ${TODAY_SIGNS.map((id) => {
      const s = SIGN_BY_ID[id]; const c = CATEGORIES[s.category];
      return `<button class="sign-card" data-nav="#/learner/practice/${id}" style="text-align:left" aria-label="Practice ${s.gloss}">
        <span class="sign-thumb" style="--thumb-a:${c.soft};--thumb-b:${c.soft};aspect-ratio:16/10">${handThumb(s)}</span>
        <span style="padding:12px 14px;display:flex;align-items:center;gap:8px">
          <span style="font-family:var(--head);font-size:26px;font-weight:900;flex:1">${s.gloss}</span>
          <span style="width:48px;height:48px;border-radius:14px;background:${c.soft};color:${c.deep};display:grid;place-items:center">${ic("play")}</span>
        </span>
      </button>`;
    }).join("")}
  </div>

  <div class="card card-pad flex" style="gap:14px;margin-top:18px">
    <span class="avatar xl" style="background:#EEF2FF;color:#4338CA">T</span>
    <div>
      <small class="demo-note">${ic("message-circle")}Note from your teacher</small>
      <p style="font-family:var(--head);font-size:20px;font-weight:800;line-height:1.35;margin-top:4px">“Take your time, ${learnerIdentity().firstName}. I'm proud of how you keep trying.”</p>
      <span class="tiny muted">Your teacher</span>
    </div>
  </div>`;
}

/* ---------------- Practice ---------------- */
function practiceScreen(id) {
  const signId = SIGN_BY_ID[id] ? id : "hello";
  const sign = SIGN_BY_ID[signId];
  const c = CATEGORIES[sign.category];
  const msg = PRACTICE_MESSAGES[state.feedback];
  const idx = Math.max(0, state.practiceSet.indexOf(signId));
  const allow = state.camAllowed;
  const variant = state.feedback === "issue" ? "issue" : state.feedback;

  return `
  <div class="flex between" style="margin-bottom:12px;gap:10px;flex-wrap:wrap">
    <button class="icon-btn" style="width:54px;height:54px;border-radius:16px" data-nav="#/learner/home" aria-label="Back home">${ic("arrow-left")}</button>
    <div class="dots" role="progressbar" aria-valuemin="1" aria-valuemax="${state.practiceSet.length}" aria-valuenow="${idx + 1}" aria-label="Sign practice progress">
      ${state.practiceSet.map((s, i) => `<i class="${i < idx ? "done" : i === idx ? "now" : ""}"></i>`).join("")}
    </div>
    <div style="display:flex;align-items:center;gap:9px;margin-left:auto">
      <span class="chip chip-teal" style="font-size:13px;padding:7px 12px">${ic("hand")}${sign.category}</span>
      <span class="chip chip-indigo" style="font-size:13px;padding:7px 12px">${sign.grade}</span>
    </div>
  </div>

  <div class="page-head" style="margin-bottom:4px">
    <div class="grow">
      <h1 class="page-title" style="font-size:30px;font-weight:900">${sign.gloss}</h1>
      <p class="page-sub" style="font-size:15px">${state.feedback === "match" ? "You did it! Handy is cheering." : "Watch Handy, then copy the sign."}</p>
    </div>
    <div id="practice-handy">${handy(state.feedback === "match" ? "cheering" : "waving", "med")}</div>
  </div>

  <div class="practice-grid">
    <div>
      <div class="flex between" style="margin-bottom:8px">
        <strong style="font-family:var(--head);font-size:17px">1. Watch the sign</strong>
      </div>
      ${videoPlayer(sign)}
    </div>

    <div>
      <div class="flex between" style="margin-bottom:8px">
        <strong style="font-family:var(--head);font-size:17px">2. Copy the sign</strong>
      </div>
      <div id="practice-cam">${camPanel({ variant, allow })}</div>
      <div id="practice-feedback" style="margin-top:10px">${practiceFeedbackHTML()}</div>
    </div>
  </div>

  <div class="practice-actions" style="margin-top:10px" id="practice-actions">
    <button class="btn btn-secondary btn-lg" data-act="practice-again">${ic("rotate-ccw")}Try again</button>
    <button class="btn ${state.feedback === "match" ? "btn-teal" : "btn-primary"} btn-lg" data-act="practice-next">${ic("arrow-right")}${state.feedback === "match" ? "Next sign" : "Skip for now"}</button>
    <button class="help-fab" data-act="learner-help">${ic("life-buoy")}Help</button>
  </div>

`;
}

function practiceFeedbackHTML() {
  const f = state.feedback;
  const msg = PRACTICE_MESSAGES[f];
  if (!state.camAllowed) {
    return `<div class="feedback-strip waiting">${ic("info")}<div>This is a practice simulation. No webcam is accessed.</div></div>`;
  }
  if (f === "match") {
    const n = 3;
    return `<div class="feedback-strip match" style="gap:12px;padding:10px 14px">
      ${ic("party-popper")}
      <div class="grow"><strong>You earned 3 stars!</strong><div style="margin-top:2px">${stars(3)}</div></div>
      ${handy("cheering", "small")}
    </div>`;
  }
  if (f === "issue") {
    return `<div class="feedback-strip error">${ic("sun")}<div>I can't see your hand. Try sitting near a window or lamp, and move a little closer.</div></div>`;
  }
  return `<div class="feedback-strip ${msg.cls}">${ic(msg.icon)}<div>${msg.text}</div></div>`;
}

function updatePracticeUI() {
  const cam = $("#practice-cam");
  const fb = $("#practice-feedback");
  const handyEl = $("#practice-handy");
  const variant = state.feedback === "issue" ? "issue" : state.feedback;
  if (cam) cam.innerHTML = camPanel({ variant, allow: state.camAllowed });
  if (fb) fb.innerHTML = practiceFeedbackHTML();
  if (handyEl) handyEl.innerHTML = handy(state.feedback === "match" ? "cheering" : "waving", "med");
  const star = $("#star-count");
  if (star) star.textContent = state.stars;
  if (window.lucide) lucide.createIcons();
  if (state.feedback === "match") {
    const sign = SIGN_BY_ID[state.practiceSet[state.practiceIndex]];
    const key = `${sign.id}:${state.practiceAttempt || 0}`;
    if (state.lastAwarded !== key) {
      state.lastAwarded = key;
      state.rewardStars = 3;
      state.stars += 3;
      if (star) star.textContent = state.stars;
      toast("3 stars! Handy is cheering for you.", "ok", "star");
      confetti();
    }
    const nextBtn = $("[data-act='practice-next']");
    if (nextBtn) {
      nextBtn.classList.remove("btn-primary");
      nextBtn.classList.add("btn-teal");
      nextBtn.innerHTML = `${ic("arrow-right")}Next sign`;
    }
  }
}

function setFeedback(f) {
  state.feedback = f;
  updatePracticeUI();
}

function afterPracticeRender(id) {
  const sign = SIGN_BY_ID[id] || SIGN_BY_ID.hello;
  state.practiceIndex = Math.max(0, state.practiceSet.indexOf(sign.id));
  if (!state.camAllowed) {
    if (!state.camPromptSeen) {
      state.camPromptSeen = true;
      later(openCameraPrompt, 320);
    }
    return;
  }
  const key = `${sign.id}:${state.practiceAttempt || 0}:${state.feedbackPinned ? "pin" : "auto"}`;
  if (state.detectKey === key) return;
  state.detectKey = key;
  if (state.feedbackPinned) { updatePracticeUI(); return; }
  if (state.feedback === "match") return;
  later(() => setFeedback("tracking"), 1200);
  later(() => setFeedback("close"), 3000);
  later(() => setFeedback("match"), 4800);
}

function openCameraPrompt() {
  openModal(`
    ${modalHead("Can Handy see your hand?", "Handy needs the camera for practice.", "camera")}
    <div class="modal-body">
      <div style="border-radius:18px;overflow:hidden">${camPanel({ variant: "waiting", allow: true })}</div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" data-act="camera-deny">${ic("video-off")}Not now</button>
      <button class="btn btn-primary" data-act="camera-allow">${ic("play")}Continue demo</button>
    </div>`);
}

/* ---------------- Reward ---------------- */
function rewardScreen() {
  return `
  <div class="flex between" style="margin-bottom:12px">
    <button class="icon-btn" style="width:52px;height:52px;border-radius:16px" data-nav="#/learner/home" aria-label="Back home">${ic("arrow-left")}</button>
    <span class="chip chip-teal" style="font-size:13px;padding:7px 12px">${ic("gift")}Reward</span>
  </div>

  <div class="card" style="overflow:hidden;background:linear-gradient(160deg,#FFFBEB,#F0FDF4 70%,#ECFDF5);border-color:#FDE68A">
    <div style="padding:32px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px">
      <div style="position:relative">
        ${handy("cheering", "big")}
      </div>
      <span class="chip chip-beta" style="font-size:12px;padding:6px 12px;margin-top:8px">${ic("party-popper")}You did it!</span>
      <h1 style="font-size:40px;font-weight:900;letter-spacing:-.035em;margin-top:4px">You earned ${state.rewardStars} stars!</h1>
      <p style="font-size:19px;color:var(--muted);max-width:440px;line-height:1.5">You matched <strong>Hello</strong>. Your sticker garden grew a little today.</p>
      <div style="margin:12px 0 6px" class="stars xl">${[1, 2, 3].map((i) => `<span class="stars-pop">${ic("star", "on pop")}</span>`).join("")}</div>
      <div class="pick-item" style="max-width:330px;width:100%;text-align:left;background:#fff;margin-top:6px">
        <span class="pick-thumb" style="background:#FEF3C7;color:#B45309;width:46px;height:46px">${ic("party-popper")}</span>
        <span class="grow"><b>New sticker: Party Popper</b><small>Added to your sticker book</small></span>
        ${ic("sparkles", "")}
      </div>
      <div class="btn-row" style="margin-top:16px;justify-content:center">
        <button class="btn btn-teal btn-xl" data-nav="#/learner/stars">${ic("flower-2")}See my garden</button>
        <button class="btn btn-secondary btn-lg" data-nav="#/learner/practice/${state.practiceSet[Math.min(state.practiceIndex + 1, state.practiceSet.length - 1)]}">${ic("play")}Keep practicing</button>
      </div>
      <p class="tiny muted" style="margin-top:12px">No scores. Just signs you know and stars you earned.</p>
    </div>
  </div>

  <div class="grid g-3" style="margin-top:16px">
    ${STICKERS.filter((s) => s.unlocked).slice(0, 3).map((s) => `<div class="sticker-tile">
      <span style="width:62px;height:62px;border-radius:18px;background:#FEF3C7;color:#B45309;display:grid;place-items:center">${ic(s.icon)}</span>
      <b>${s.name}</b><small>In your sticker book</small>
    </div>`).join("")}
  </div>`;
}

/* ---------------- My Stars ---------------- */
function starsScreen() {
  return `
  <div class="page-head">
    <div class="grow">
      <h1 class="page-title" style="font-size:40px;font-weight:900">Your sticker garden</h1>
      <p class="page-sub" style="font-size:18px">Every sign you practice helps something grow.</p>
    </div>
    <span class="star-pill" aria-label="Stars collected">${ic("star")}${state.stars}</span>
  </div>

  <div class="garden">
    ${STICKERS.map((s) => `<div class="sticker-cell ${s.unlocked ? "" : "locked"}">
      ${s.unlocked
        ? `<span style="width:62%;aspect-ratio:1;border-radius:16px;display:grid;place-items:center;background:${s.icon === "star" || s.icon === "sun" ? "#FEF3C7" : s.icon === "heart" ? "#FFE4E6" : s.icon === "rainbow" ? "#EDE9FE" : "#DCFCE7"};color:${s.icon === "heart" ? "#BE123C" : s.icon === "rainbow" ? "#6D28D9" : "#15803D"}">${ic(s.icon)}</span>
          <small>${s.name}</small>`
        : `<span style="width:54%;aspect-ratio:1;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.5);color:#94A3B8">${ic("lock")}</span>
          <small style="color:#94A3B8">Keep practicing</small>`}
    </div>`).join("")}
  </div>

  <div class="grid g-2" style="margin-top:18px">
    <div class="card card-pad">
      <div class="flex between" style="margin-bottom:10px"><strong style="font-family:var(--head);font-size:16px">Sticker book</strong><span class="chip chip-teal">${ic("book-heart")}Collected</span></div>
      <div class="sticker-row" style="grid-template-columns:repeat(3,1fr)">
        ${STICKERS.filter((s) => s.unlocked).slice(0, 6).map((s) => `<div class="sticker-tile" style="padding:10px">
          <span style="width:44px;height:44px;border-radius:13px;background:#F0FDF4;color:#15803D;display:grid;place-items:center">${ic(s.icon)}</span>
          <b style="font-size:11px">${s.name}</b>
        </div>`).join("")}
      </div>
    </div>
    <div class="card card-pad" style="background:linear-gradient(150deg,#EEF2FF,#F0FDFA);border-color:#DDE6FF;display:flex;flex-direction:column;gap:10px;justify-content:center">
      <div class="flex" style="gap:12px">
        <div style="width:88px;flex:none">${handy("thumbs-up", "small")}</div>
        <div>
          <strong style="font-family:var(--head);font-size:19px;display:block">Grow your garden</strong>
          <p class="muted" style="font-size:14px;line-height:1.5;margin-top:4px">Practice a sign to unlock the next sticker. There is no score to beat — only signs to learn.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" data-nav="#/learner/practice/${TODAY_SIGNS[0]}">${ic("play")}Practice a sign</button>
    </div>
  </div>`;
}

/* ---------------- learner actions ---------------- */
Object.assign(ACTIONS, {
  "camera-allow": () => {
    state.camAllowed = true;
    state.camPromptSeen = true;
    closeModal();
    state.feedback = state.feedbackPinned ? state.feedback : "waiting";
    state.detectKey = null;
    render();
    toast("Camera simulation enabled. No webcam is accessed.", "info", "camera");
  },
  "camera-deny": () => {
    state.camPromptSeen = true;
    closeModal();
    render();
    toast("Camera off. You can turn it on anytime.", "info", "video-off");
  },
  "practice-again": () => {
    state.practiceAttempt = (state.practiceAttempt || 0) + 1;
    state.feedbackPinned = false;
    state.feedback = "waiting";
    state.detectKey = null;
    state.lastAwarded = null;
    render();
    toast("Try again — Handy is watching.", "info", "rotate-ccw");
  },
  "practice-next": () => {
    const idx = state.practiceIndex;
    if (idx >= state.practiceSet.length - 1) {
      state.rewardStars = state.feedback === "match" ? 3 : 1;
      go("/learner/reward");
    } else {
      const next = state.practiceSet[idx + 1];
      state.detectKey = null;
      state.practiceAttempt = 0;
      state.lastAwarded = null;
      state.feedback = "waiting";
      state.feedbackPinned = false;
      go(`/learner/practice/${next}`);
    }
  },
  "learner-help": () => openLearnerHelp(),
});

function openLearnerHelp() {
  openModal(`
    ${modalHead("Ask for help", "Your teacher will come to your table.", "life-buoy")}
    <div class="modal-body">
      <div class="flex" style="gap:14px;padding:12px;border-radius:16px;background:#F5F7FF">
        <span class="avatar xl" style="background:#EEF2FF;color:#4338CA">T</span>
        <div><strong style="font-family:var(--head);font-size:18px">Your teacher</strong><p class="tiny muted">Kinder — Sunflower</p>
        <p class="tiny muted" style="margin-top:6px">${ic("clock")} Usually at your table in under a minute.</p></div>
      </div>
      <div class="banner info" style="margin-top:12px">${ic("hand")}You can keep trying while you wait. Nothing is wrong.</div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" data-act="close-modal">Keep trying</button>
      <button class="btn btn-amber" data-act="help-sent">${ic("bell-ring")}Call my teacher</button>
    </div>`);
}

Object.assign(ACTIONS, {
  "help-sent": () => {
    closeModal();
    openModal(`
      ${modalHead("Your teacher is on the way", "They saw your help request on their tablet.", "check-circle-2")}
      <div class="modal-body" style="text-align:center;padding:26px">
        <div style="display:flex;justify-content:center">${handy("thumbs-up", "big")}</div>
        <p style="font-family:var(--head);font-size:19px;font-weight:800;margin-top:10px">You did the right thing by asking.</p>
        <p class="muted" style="font-size:13px;margin-top:4px">Stay on this screen and try again when you're ready.</p>
      </div>
      <div class="modal-foot" style="justify-content:center"><button class="btn btn-primary" data-act="close-modal">Okay</button></div>`);
    toast("Help request sent to your teacher.", "ok", "bell-ring");
  },
});
