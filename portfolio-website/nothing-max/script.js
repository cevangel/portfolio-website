(() => {
  const ASSET_BASE = (() => {
    const s = document.currentScript;
    if (s && s.src) {
      return s.src.slice(0, s.src.lastIndexOf("/") + 1);
    }
    return "";
  })();

  // ---------- DOM ----------
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const beforeSudsEl = document.getElementById("beforeSuds");
  const beforeSudsValueEl = document.getElementById("beforeSudsValue");
  const afterSudsEl = document.getElementById("afterSuds");
  const afterSudsValueEl = document.getElementById("afterSudsValue");
  const beforeFeelingEl = document.getElementById("beforeFeeling");
  const afterFeelingEl = document.getElementById("afterFeeling");
  const beforeNoteEl = document.getElementById("beforeNote");
  const afterNoteEl = document.getElementById("afterNote");
  const reasonEl = document.getElementById("reason");

  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const saveEntryBtn = document.getElementById("saveEntryBtn");
  const closeOverlayBtn = document.getElementById("closeOverlayBtn");

  const timeDisplay = document.getElementById("timeDisplay");
  const statusText = document.getElementById("statusText");
  const progressCircle = document.getElementById("progressCircle");
  const quoteBox = document.getElementById("quoteBox");
  const buddyText = document.getElementById("buddyText");
  const buddyReminder = document.getElementById("buddyReminder");

  const todayTimeEl = document.getElementById("todayTime");
  const todaySessionsEl = document.getElementById("todaySessions");
  const journalListEl = document.getElementById("journalList");

  const successOverlay = document.getElementById("successOverlay");
  const failBeatupOverlay = document.getElementById("failBeatupOverlay");
  const dismissFailBeatupBtn = document.getElementById("dismissFailBeatupBtn");
  const capsuleEl = document.getElementById("capsule");
  const rewardCardEl = document.getElementById("rewardCard");
  const rewardRarityEl = document.getElementById("rewardRarity");
  const rewardNameEl = document.getElementById("rewardName");
  const rewardDescEl = document.getElementById("rewardDesc");

  const particles = document.getElementById("particles");
  const toast = document.getElementById("toast");
  const timerWrap = document.querySelector(".timer-wrap");

  const bellAudio = new Audio(ASSET_BASE + "assets/meditationBell.mp3");
  const levelUpAudio = new Audio(ASSET_BASE + "assets/pokemonLevelUp.mp3");
  const punchingAudio = new Audio(ASSET_BASE + "assets/punching.mp3");
  const wilhelmAudio = new Audio(ASSET_BASE + "assets/wilhelmscream.mp3");
  bellAudio.preload = "auto";
  levelUpAudio.preload = "auto";
  punchingAudio.preload = "auto";
  wilhelmAudio.preload = "auto";

  // ---------- Timer state ----------
  const CIRCUMFERENCE = 2 * Math.PI * 52;
  progressCircle.style.strokeDasharray = CIRCUMFERENCE;
  progressCircle.style.strokeDashoffset = CIRCUMFERENCE;

  let interval = null;
  let totalMs = 0;
  let endTime = null;
  let running = false;
  let interactionArmed = false;
  let audioCtx = null;
  let currentReward = null;
  let lastChimedMinute = 0;
  let finishVfxTimer = null;

  // ---------- Copy / content ----------
  const reasonCopy = {
    overwhelmed: {
      quote: "“Overwhelm is a signal to make it smaller and simpler. Not harsher.”",
      buddy: "Your buddy is helping you let the overwhelm settle by doing nothing.",
      reminder:
        "Let your gaze soften on something real or one slow breath; pair it with gratitude and patient self-talk. Calm that doesn’t depend on a screen. Quietly notice what you actually need underneath; you can address it when the timer ends."
    },
    avoidance: {
      quote: "Pause first. Then ask yourself: What's the next tiny step.",
      buddy: "Your buddy is interrupting the spiral with you. By doing nothing.",
      reminder:
        "Step off autopilot: notice your space or a body sensation, add one honest kind line, and let the scroll urge pass. Don't obey it. Check inward for what you are really avoiding or needing. You can take one small step toward it after the timer."
    },
    bored: {
      quote: "“Bored does not mean bad or unsafe.”",
      buddy: "Your buddy is showing you being still helps you recharge and let you tune into your mind and body for what you really need. By doing nothing.",
      reminder:
        "Let low stimulation be okay: Train your brain to notice the things that make you happy around you and in yourself. You don't need a screen for dopamine. Sense whether you feel hungry, angry, lonely or tired. And plan to act on that when the timer ends."
    },
    reset: {
      quote: "“A small reset can help any time of day. Even just a minute.”",
      buddy: "Your buddy is doing a tiny nervous-system reset with you. By doing nothing.",
      reminder:
        "Rest attention on what’s physically here and thank yourself for this pocket of stillness. Steadiness from real life, not another feed. Name what would actually help you next internally (remember HALT); you can follow through once time’s up."
    },
    emotional: {
      quote: "“You may not need an answer right now. You may need to let feelings settle first.”",
      buddy: "Your buddy is helping you ride the feelings wave instead of fixing it immediately. By doing nothing.",
      reminder:
        "Give the feeling room without more screen input—soft gaze, grounding touch, forgiving self-talk. When you’re ready, notice what you need underneath (HALT, boundaries, etc.) and address it after the timer."
    }
  };

  const rewards = [
    { id: "pause-slime", rarity: "Common", name: "Pause Slime", desc: "A blob of concentrated loafing energy." },
    { id: "tea-ghost", rarity: "Common", name: "Tea Ghost", desc: "Haunts kettles and encourages tiny resets." },
    { id: "rest-bat", rarity: "Common", name: "Rest Bat", desc: "Sleeps upside down and judges hustle culture." },
    { id: "wise-frog", rarity: "Rare", name: "Wise Frog", desc: "Knows when you need water before you do." },
    { id: "cloud-monk", rarity: "Rare", name: "Cloud Monk", desc: "Floats gently above unnecessary urgency." },
    { id: "golden-cat", rarity: "Epic", name: "Golden Cat of Stillness", desc: "A legendary beast of luxurious non-productivity." }
  ];

  // ---------- localStorage ----------
  const STORAGE_KEY = "doNothingGachaData_v1";

  function todayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDefaultData() {
    return {
      today: {
        date: todayString(),
        totalSeconds: 0,
        sessions: 0
      },
      journal: [],
      collection: {
        owned: [],
        lastPulled: null
      }
    };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultData();
      const parsed = JSON.parse(raw);

      if (!parsed.today || parsed.today.date !== todayString()) {
        parsed.today = {
          date: todayString(),
          totalSeconds: 0,
          sessions: 0
        };
      }

      if (!parsed.journal) parsed.journal = [];
      if (!parsed.collection) parsed.collection = { owned: [], lastPulled: null };
      if (!parsed.collection.owned) parsed.collection.owned = [];

      return parsed;
    } catch (err) {
      console.error("Failed to load localStorage:", err);
      return getDefaultData();
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let appData = loadData();

  // ---------- helpers ----------
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatMs(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${pad(mins)}:${pad(secs)}`;
  }

  function formatSecondsFriendly(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  }

  function getDurationMs() {
    const mins = Math.max(0, parseInt(minutesEl.value || "0", 10));
    const secs = Math.max(0, parseInt(secondsEl.value || "0", 10));
    return (mins * 60 + secs) * 1000;
  }

  function updateProgress(msLeft) {
    const safeLeft = Math.max(0, msLeft);
    const elapsed = totalMs - safeLeft;
    const progress = totalMs > 0 ? Math.max(0, Math.min(1, elapsed / totalMs)) : 0;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
  }

  function renderStats() {
    todayTimeEl.textContent = formatSecondsFriendly(appData.today.totalSeconds);
    todaySessionsEl.textContent = appData.today.sessions;
  }

  function renderJournal() {
    const entries = appData.journal.slice(-5).reverse();

    if (entries.length === 0) {
      journalListEl.innerHTML = `<div class="empty">No entries yet.</div>`;
      return;
    }

    journalListEl.innerHTML = entries.map(entry => {
      const created = new Date(entry.timestamp);
      const time = created.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return `
        <div class="journal-item">
          <div class="journal-top">
            <div>${entry.date}</div>
            <div>${time}</div>
          </div>
          <div class="journal-main">
            <strong>SUDS:</strong> ${entry.beforeSuds} → ${entry.afterSuds}<br>
            <strong>Feelings:</strong> ${escapeHtml(entry.beforeFeeling || "—")} → ${escapeHtml(entry.afterFeeling || "—")}<br>
            <strong>Reward:</strong> ${escapeHtml(entry.rewardName || "—")}<br>
            <strong>Note:</strong> ${escapeHtml(entry.note || entry.beforeNote || "—")}
          </div>
        </div>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function updateReasonUI() {
    const copy = reasonCopy[reasonEl.value] || reasonCopy.reset;
    quoteBox.textContent = copy.quote;
    buddyText.textContent = copy.buddy;
    buddyReminder.textContent = copy.reminder;
  }

  function resetTimerUI() {
    const ms = getDurationMs() || 60000;
    timeDisplay.textContent = formatMs(ms);
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE;
    statusText.textContent = "Press Start, then leave the screen alone.";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 1000);
  }

  // ---------- sound / haptics ----------
  function initAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function tone(freq = 440, start = 0, duration = 0.08, type = "sine", volume = 0.04) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);

    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  }

  function playStartSound() {
    initAudio();
    tone(220, 0.00, 0.07, "triangle", 0.03);
    tone(330, 0.05, 0.08, "triangle", 0.025);
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  // ---------- effects ----------
  function triggerShake() {
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 500);
  }

  function syncMinuteChimes(elapsedMs) {
    const minuteIdx = Math.floor(Math.max(0, elapsedMs) / 60000);
    while (lastChimedMinute < minuteIdx) {
      lastChimedMinute++;
      onMinuteMark();
    }
  }

  function onMinuteMark() {
    bellAudio.currentTime = 0;
    bellAudio.play().catch(() => {});

    vibrate([45, 35, 65]);

    if (timerWrap) {
      timerWrap.classList.remove("minute-pulse");
      void timerWrap.offsetWidth;
      timerWrap.classList.add("minute-pulse");
    }

    progressCircle.classList.remove("minute-ring-glow");
    void progressCircle.offsetWidth;
    progressCircle.classList.add("minute-ring-glow");
    setTimeout(() => progressCircle.classList.remove("minute-ring-glow"), 700);
  }

  function triggerFinishCelebration() {
    document.body.classList.remove("finish-victory");
    void document.body.offsetWidth;
    document.body.classList.add("finish-victory");
    if (finishVfxTimer) clearTimeout(finishVfxTimer);
    finishVfxTimer = setTimeout(() => {
      document.body.classList.remove("finish-victory");
      finishVfxTimer = null;
    }, 4000);

    levelUpAudio.currentTime = 0;
    levelUpAudio.play().catch(() => {});
    vibrate([90, 45, 120, 55, 140, 65, 160, 80, 200, 100, 240, 120, 280]);
  }

  function showFailBeatupOverlay() {
    if (failBeatupOverlay) failBeatupOverlay.classList.remove("hidden");
  }

  function hideFailBeatupOverlay() {
    if (failBeatupOverlay) failBeatupOverlay.classList.add("hidden");
  }

  function playFailBeatupSequence() {
    hideFailBeatupOverlay();
    punchingAudio.currentTime = 0;
    wilhelmAudio.currentTime = 0;

    const showOverlay = () => showFailBeatupOverlay();

    const afterPunch = () => {
      wilhelmAudio.currentTime = 0;
      wilhelmAudio.play().catch(() => {
        showOverlay();
      });
      wilhelmAudio.addEventListener(
        "ended",
        () => {
          showOverlay();
        },
        { once: true }
      );
    };

    punchingAudio.addEventListener(
      "ended",
      () => {
        afterPunch();
      },
      { once: true }
    );

    punchingAudio.play().catch(() => {
      afterPunch();
    });
  }

  function confettiBurst(count = 70) {
    const colors = ["#7c5cff", "#00dbff", "#ffe066", "#79ffb1", "#ffffff", "#ff9fb6"];
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";

      const size = 6 + Math.random() * 10;
      const dx = (Math.random() - 0.5) * 720 + "px";
      const dy = (Math.random() * 700 - 100) + "px";
      const rot = (Math.random() * 1080 - 540) + "deg";

      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.width = size + "px";
      p.style.height = size * 1.8 + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty("--dx", dx);
      p.style.setProperty("--dy", dy);
      p.style.setProperty("--rot", rot);
      p.style.animationDuration = (1200 + Math.random() * 900) + "ms";

      particles.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  }

  // ---------- gacha ----------
  function pullReward() {
    const roll = Math.random() * 100;

    // weighted rarity: common 70, rare 25, epic 5
    let pool;
    if (roll < 70) {
      pool = rewards.filter(r => r.rarity === "Common");
    } else if (roll < 95) {
      pool = rewards.filter(r => r.rarity === "Rare");
    } else {
      pool = rewards.filter(r => r.rarity === "Epic");
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function rarityColor(rarity) {
    if (rarity === "Epic") return "#ffe066";
    if (rarity === "Rare") return "#79ffb1";
    return "#bfc8f3";
  }

  function revealReward() {
    currentReward = pullReward();

    appData.collection.lastPulled = currentReward.id;
    if (!appData.collection.owned.includes(currentReward.id)) {
      appData.collection.owned.push(currentReward.id);
    }
    saveData(appData);

    rewardRarityEl.textContent = currentReward.rarity;
    rewardNameEl.textContent = currentReward.name;
    rewardDescEl.textContent = currentReward.desc;
    rewardRarityEl.style.color = rarityColor(currentReward.rarity);

    rewardCardEl.classList.remove("hidden");
    capsuleEl.textContent = "★";
    capsuleEl.style.background = `linear-gradient(135deg, ${rarityColor(currentReward.rarity)}, #00dbff)`;
  }

  // ---------- timer flow ----------
  function armInteractionDetection() {
    setTimeout(() => {
      interactionArmed = true;
    }, 180);
  }

  function tick() {
    const msLeft = endTime - Date.now();
    const displayMs = Math.max(0, msLeft);
    timeDisplay.textContent = formatMs(displayMs);
    updateProgress(displayMs);

    if (running && msLeft > 0) {
      const elapsed = totalMs - msLeft;
      syncMinuteChimes(elapsed);
    }

    if (msLeft <= 0 && running) {
      syncMinuteChimes(totalMs);
      clearInterval(interval);
      interval = null;
      running = false;
      interactionArmed = false;
      lastChimedMinute = 0;
      timeDisplay.textContent = "00:00";
      updateProgress(0);
      onSuccess();
    }
  }

  function startTimer() {
    initAudio();

    const ms = getDurationMs();
    if (ms < 5000) {
      statusText.textContent = "Use at least 5 seconds.";
      return;
    }

    totalMs = ms;
    endTime = Date.now() + ms;
    running = true;
    interactionArmed = false;
    lastChimedMinute = 0;

    hideFailBeatupOverlay();
    punchingAudio.pause();
    wilhelmAudio.pause();

    statusText.textContent = "Doing nothing... don't touch the screen.";
    startBtn.disabled = true;
    playStartSound();
    vibrate([20]);

    tick();
    clearInterval(interval);
    interval = setInterval(tick, 100);
    armInteractionDetection();
  }

  function failTimer() {
    if (!running || !interactionArmed) return;

    clearInterval(interval);
    interval = null;
    running = false;
    interactionArmed = false;
    lastChimedMinute = 0;
    startBtn.disabled = false;

    progressCircle.style.strokeDashoffset = CIRCUMFERENCE;
    statusText.textContent = "Oops. Interaction detected. Try again.";
    playFailBeatupSequence();
    vibrate([30, 30, 30]);
    showToast("Interaction detected — timer failed");
  }

  function onSuccess() {
    hideFailBeatupOverlay();
    startBtn.disabled = false;
    statusText.textContent = "Success. You finished the timer.";
    triggerFinishCelebration();
    confettiBurst(90);
    setTimeout(() => confettiBurst(45), 180);
    triggerShake();

    const secondsCompleted = Math.round(totalMs / 1000);
    appData.today.totalSeconds += secondsCompleted;
    appData.today.sessions += 1;
    saveData(appData);
    renderStats();

    rewardCardEl.classList.add("hidden");
    capsuleEl.textContent = "?";
    capsuleEl.style.background = "linear-gradient(135deg, var(--accent), var(--accent2))";

    successOverlay.classList.remove("hidden");

    setTimeout(() => {
      revealReward();
    }, 650);
  }

  function resetAll() {
    clearInterval(interval);
    interval = null;
    running = false;
    interactionArmed = false;
    lastChimedMinute = 0;
    startBtn.disabled = false;
    currentReward = null;
    document.body.classList.remove("finish-victory");
    if (finishVfxTimer) {
      clearTimeout(finishVfxTimer);
      finishVfxTimer = null;
    }
    successOverlay.classList.add("hidden");
    rewardCardEl.classList.add("hidden");
    hideFailBeatupOverlay();
    updateReasonUI();
    resetTimerUI();
  }

  function saveJournalEntry() {
    const entry = {
      timestamp: Date.now(),
      date: todayString(),
      durationSeconds: Math.round(totalMs / 1000),
      reason: reasonEl.value,
      beforeSuds: Number(beforeSudsEl.value),
      afterSuds: Number(afterSudsEl.value),
      beforeFeeling: beforeFeelingEl.value.trim(),
      afterFeeling: afterFeelingEl.value.trim(),
      beforeNote: beforeNoteEl.value.trim(),
      note: afterNoteEl.value.trim(),
      rewardId: currentReward ? currentReward.id : null,
      rewardName: currentReward ? currentReward.name : null
    };

    appData.journal.push(entry);
    saveData(appData);
    renderJournal();

    successOverlay.classList.add("hidden");
    statusText.textContent = "Entry saved. Nice work.";
  }

  function skipSave() {
    successOverlay.classList.add("hidden");
    statusText.textContent = "Reward collected.";
  }

  // ---------- event listeners ----------
  startBtn.addEventListener("click", startTimer);
  resetBtn.addEventListener("click", resetAll);
  if (dismissFailBeatupBtn) {
    dismissFailBeatupBtn.addEventListener("click", hideFailBeatupOverlay);
  }
  saveEntryBtn.addEventListener("click", saveJournalEntry);
  closeOverlayBtn.addEventListener("click", skipSave);

  reasonEl.addEventListener("change", updateReasonUI);

  beforeSudsEl.addEventListener("input", () => {
    beforeSudsValueEl.textContent = beforeSudsEl.value;
  });

  afterSudsEl.addEventListener("input", () => {
    afterSudsValueEl.textContent = afterSudsEl.value;
  });

  [minutesEl, secondsEl].forEach(el => {
    el.addEventListener("input", resetTimerUI);
  });

  ["pointerdown", "wheel", "keydown", "touchstart"].forEach(evt => {
    window.addEventListener(evt, () => failTimer(), { passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) failTimer();
  });

  // ---------- init ----------
  updateReasonUI();
  beforeSudsValueEl.textContent = beforeSudsEl.value;
  afterSudsValueEl.textContent = afterSudsEl.value;
  renderStats();
  renderJournal();
  resetTimerUI();
})();