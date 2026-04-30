const APP_KEY = "kanaPassMvpStateV1";
const ONBOARDING_KEY = "kanaPassMvpOnboardingSeenV1";
const MASTERY_LABELS = ["New", "Seen", "Recognized", "Recalled", "Spaced", "Event-ready"];
const BADGES = {
  hiragana: "Hiragana Familiar",
  katakana: "Katakana Familiar",
  lookalike: "Lookalike Slayer",
  words: "Word Reader",
  event: "Intermediate Event Eligible",
  scribe: "Kana Scribe (future)"
};

const appState = {
  route: "home",
  currentScript: "hiragana",
  learnDisplayMode: "overview",
  selectedRowId: null,
  reviewQueue: [],
  reviewIndex: 0,
  lookalikeQuiz: null,
  flashcards: null,
  marksDrill: null,
  eventQuiz: null,
  eventResult: null
};

const app = document.getElementById("app");
const allKana = flattenKana();

init();

function init() {
  initializeProgress();
  render();
}

function flattenKana() {
  const items = [];
  ["hiragana", "katakana"].forEach((script) => {
    KANA_ROWS[script].forEach((row) => {
      row.chars.forEach((char) => {
        items.push({ ...char, script, rowId: row.id, rowLabel: row.label });
      });
    });
  });
  return items;
}

function defaultProgressEntry() {
  return {
    level: 0,
    correctCount: 0,
    incorrectCount: 0,
    correctStreak: 0,
    lastReviewedAt: null,
    nextReviewAt: null
  };
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(APP_KEY) || "{}");
    return parsed.progress || {};
  } catch (_error) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(APP_KEY, JSON.stringify({ progress }));
}

function initializeProgress() {
  const progress = loadProgress();
  allKana.forEach((entry) => {
    if (!progress[entry.kana]) {
      progress[entry.kana] = defaultProgressEntry();
    }
  });
  saveProgress(progress);
}

function getProgress() {
  return loadProgress();
}

function updateProgressForAnswer(kana, isCorrect) {
  const progress = getProgress();
  const item = progress[kana] || defaultProgressEntry();
  const now = Date.now();

  item.lastReviewedAt = now;
  if (isCorrect) {
    item.correctCount += 1;
    item.correctStreak += 1;
    if (item.level < 5) item.level += 1;
    const reviewMinutes = Math.max(2, 2 ** Math.min(item.level, 6));
    item.nextReviewAt = now + reviewMinutes * 60 * 1000;
  } else {
    item.incorrectCount += 1;
    item.correctStreak = 0;
    item.level = Math.max(0, item.level - 1);
    item.nextReviewAt = now + 2 * 60 * 1000;
  }

  progress[kana] = item;
  saveProgress(progress);
}

function shouldShowMnemonic(kana) {
  const progress = getProgress()[kana] || defaultProgressEntry();
  return progress.level < 2 || progress.correctStreak < 2;
}

function familiarityBar(level) {
  return `${"█".repeat(level)}${"░".repeat(5 - level)}`;
}

function pronunciationHint(romaji) {
  const guide = {
    a: "ah",
    i: "ee",
    u: "oo",
    e: "eh",
    o: "oh",
    ka: "kah",
    ki: "kee",
    ku: "koo",
    ke: "keh",
    ko: "koh",
    sa: "sah",
    shi: "shee",
    su: "soo",
    se: "seh",
    so: "soh",
    ta: "tah",
    chi: "chee",
    tsu: "tsoo",
    te: "teh",
    to: "toh",
    na: "nah",
    ni: "nee",
    nu: "noo",
    ne: "neh",
    no: "noh",
    ha: "hah",
    hi: "hee",
    fu: "foo",
    he: "heh",
    ho: "hoh",
    ma: "mah",
    mi: "mee",
    mu: "moo",
    me: "meh",
    mo: "moh",
    ya: "yah",
    yu: "yoo",
    yo: "yoh",
    ra: "rah",
    ri: "ree",
    ru: "roo",
    re: "reh",
    ro: "roh",
    wa: "wah",
    wo: "oh",
    n: "n"
  };
  return guide[romaji] || romaji;
}

function averageLevel(script) {
  const scriptKana = allKana.filter((k) => k.script === script).map((k) => k.kana);
  const progress = getProgress();
  const total = scriptKana.reduce((sum, kana) => sum + (progress[kana]?.level || 0), 0);
  return total / scriptKana.length;
}

function isSameLocalDay(timestamp, refDate = new Date()) {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return (
    date.getFullYear() === refDate.getFullYear() &&
    date.getMonth() === refDate.getMonth() &&
    date.getDate() === refDate.getDate()
  );
}

function studyStreakToday() {
  const progress = getProgress();
  const reviewsToday = Object.values(progress).filter((item) => isSameLocalDay(item.lastReviewedAt)).length;
  const streakActive = reviewsToday > 0;
  return { reviewsToday, streakActive };
}

function hasSeenOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === "yes";
}

function markOnboardingSeen() {
  localStorage.setItem(ONBOARDING_KEY, "yes");
}

function resetAllProgress() {
  const progress = {};
  allKana.forEach((entry) => {
    progress[entry.kana] = defaultProgressEntry();
  });
  saveProgress(progress);
  appState.reviewQueue = [];
  appState.reviewIndex = 0;
  appState.lookalikeQuiz = null;
  appState.eventQuiz = null;
  appState.eventResult = null;
}

function exportProgressJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Kana Pass MVP",
    progress: getProgress()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kana-pass-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function badgeStatus() {
  const hiraAvg = averageLevel("hiragana");
  const kataAvg = averageLevel("katakana");
  const earned = [];
  if (hiraAvg >= 3) earned.push(BADGES.hiragana);
  if (kataAvg >= 3) earned.push(BADGES.katakana);
  if (appState.eventResult?.scores?.lookalike >= 80) earned.push(BADGES.lookalike);
  if (appState.eventResult?.scores?.wordReading >= 80) earned.push(BADGES.words);
  if (appState.eventResult?.status === "Event Ready") earned.push(BADGES.event);
  return earned;
}

function navigate(route, extras = {}) {
  appState.route = route;
  Object.assign(appState, extras);
  render();
}

function render() {
  const nav = `
    <nav class="top-nav">
      <button class="secondary ${appState.route === "home" ? "active" : ""}" data-route="home">Dashboard</button>
      <button class="secondary ${appState.route === "learnHiragana" ? "active" : ""}" data-route="learnHiragana">Learn Hiragana</button>
      <button class="secondary ${appState.route === "learnKatakana" ? "active" : ""}" data-route="learnKatakana">Learn Katakana</button>
      <button class="secondary ${appState.route === "review" ? "active" : ""}" data-route="review">Review Weak Kana</button>
      <button class="secondary ${appState.route === "lookalike" ? "active" : ""}" data-route="lookalike">Lookalike Drill</button>
      <button class="secondary ${appState.route === "marks" ? "active" : ""}" data-route="marks">Dakuten / Handakuten</button>
      <button class="secondary ${appState.route === "quiz" ? "active" : ""}" data-route="quiz">Eligibility Quiz</button>
      <button class="secondary ${appState.route === "results" ? "active" : ""}" data-route="results">Results</button>
    </nav>
  `;

  let body = "";
  if (appState.route === "home") body = homeView();
  if (appState.route === "learnHiragana") body = learnView("hiragana");
  if (appState.route === "learnKatakana") body = learnView("katakana");
  if (appState.route === "review") body = reviewView();
  if (appState.route === "lookalike") body = lookalikeView();
  if (appState.route === "marks") body = marksView();
  if (appState.route === "flashcards") body = flashcardsView();
  if (appState.route === "quiz") body = eventQuizView();
  if (appState.route === "results") body = resultsView();

  app.innerHTML = `${nav}<section>${body}</section>`;
  bindGlobalEvents();
}

function bindGlobalEvents() {
  app.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-route");
      const map = {
        home: "home",
        learnHiragana: "learnHiragana",
        learnKatakana: "learnKatakana",
        review: "review",
        lookalike: "lookalike",
        marks: "marks",
        flashcards: "flashcards",
        quiz: "quiz",
        results: "results"
      };
      navigate(map[route]);
    });
  });
}

function homeView() {
  const progress = getProgress();
  const weakKana = allKana
    .map((k) => ({ ...k, level: progress[k.kana]?.level || 0 }))
    .sort((a, b) => a.level - b.level)
    .slice(0, 10);

  const earned = badgeStatus();
  const streak = studyStreakToday();
  const showOnboarding = !hasSeenOnboarding();
  return `
    <article>
      <h2>Home Dashboard</h2>
      <p>You do not need to be perfect. You only need to be <strong>ready enough</strong>.</p>
      ${
        showOnboarding
          ? `
      <div class="onboarding-card">
        <h3>Start Here</h3>
        <p>New learner path: Learn Hiragana -> Learn Katakana -> Lookalike Drill -> Eligibility Quiz.</p>
        <div class="grid">
          <button data-action="onboarding-start">Start my first session</button>
          <button class="secondary" data-action="onboarding-dismiss">I know where to go</button>
        </div>
      </div>
      `
          : ""
      }
      <div class="grid stats-grid">
        <div><strong>Hiragana avg:</strong> ${averageLevel("hiragana").toFixed(2)} / 5</div>
        <div><strong>Katakana avg:</strong> ${averageLevel("katakana").toFixed(2)} / 5</div>
        <div><strong>Study streak today:</strong> ${streak.reviewsToday} kana reviewed ${streak.streakActive ? "🔥" : ""}</div>
      </div>
      <article>
        <h3>Scoring Key</h3>
        <p class="muted">Row numbers are average familiarity for that row. Example: <strong>A-row 1.0/5</strong>.</p>
        <ul>
          <li>0 = New</li>
          <li>1 = Seen</li>
          <li>2 = Recognized</li>
          <li>3 = Recalled</li>
          <li>4 = Spaced</li>
          <li>5 = Event-ready</li>
        </ul>
      </article>
      <article>
        <h3>Dakuten / Handakuten Focus</h3>
        <p>Special practice for voicing marks: か -> が and は -> ぱ.</p>
        <button data-action="start-marks-drill">Start marks drill</button>
      </article>
      <h3>Familiarity Bars</h3>
      <div class="bars-grid">
        ${weakKana
          .map((k) => `<div class="bar-item"><span class="kana">${k.kana}</span> ${familiarityBar(k.level)}</div>`)
          .join("")}
      </div>
      <h3>Badges</h3>
      <ul>
        ${Object.values(BADGES)
          .map((badge) => `<li>${earned.includes(badge) ? "🏅" : "⬜"} ${badge}</li>`)
          .join("")}
      </ul>
      <div class="grid">
        <button data-action="start-review">Quick Review Weak Kana</button>
        <button class="secondary" data-action="start-quiz">Start Event Eligibility Quiz</button>
      </div>
      <h3>Progress Tools</h3>
      <div class="grid">
        <button class="secondary" data-action="export-progress">Export Progress JSON</button>
        <button class="contrast" data-action="reset-progress">Reset Progress</button>
      </div>
    </article>
  `;
}

function learnView(script) {
  const rows = KANA_ROWS[script];
  const progress = getProgress();
  const rowButtons = rows
    .map((row) => {
      const avg =
        row.chars.reduce((sum, c) => sum + (progress[c.kana]?.level || 0), 0) / row.chars.length;
      return `
        <div class="row-action-item">
          <button class="secondary" data-row="${row.id}" data-script="${script}">
            ${row.label} • Avg familiarity ${avg.toFixed(1)}/5
          </button>
          <button class="secondary outline" data-action="open-flashcards" data-row="${row.id}" data-script="${script}">
            Train Flash Cards
          </button>
        </div>
      `;
    })
    .join("");

  const selected = rows.find((r) => r.id === appState.selectedRowId) || rows[0];
  const isClassicGrid = appState.learnDisplayMode === "classic";

  const rowProgress = selected.chars
    .map((c) => {
      const level = progress[c.kana]?.level || 0;
      return `
        <div class="bar-item">
          <span class="kana">${c.kana}</span>
          <strong>${c.romaji}</strong>
          <div class="muted">Pronounce: ${pronunciationHint(c.romaji)}</div>
          <div class="muted">Level ${level}: ${MASTERY_LABELS[level]}</div>
          <div>${familiarityBar(level)}</div>
        </div>
      `;
    })
    .join("");

  const classicCards = selected.chars
    .map((c) => {
      const level = progress[c.kana]?.level || 0;
      const showMnemonic = shouldShowMnemonic(c.kana);
      return `
        <article class="kana-card">
          <h4>${c.kana}</h4>
          <p><strong>${c.romaji}</strong></p>
          <p class="muted">Pronounce: ${pronunciationHint(c.romaji)}</p>
          <p class="muted">Level ${level}: ${MASTERY_LABELS[level]}</p>
          <p>${c.kana} ${familiarityBar(level)}</p>
          ${showMnemonic ? `<small>${c.mnemonic}</small>` : "<small class='muted'>Mnemonic hidden after repeated correct answers.</small>"}
          <div class="grid">
            <button class="secondary" data-check-kana="${c.kana}" data-script="${script}">I got it right</button>
            <button class="contrast" data-miss-kana="${c.kana}" data-script="${script}">I missed it</button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <article>
      <h2>${script === "hiragana" ? "Learn Hiragana" : "Learn Katakana"}</h2>
      <p>Choose a row, then launch focused training. Progress still updates per kana.</p>
      <div class="row-buttons">${rowButtons}</div>
      <div class="grid">
        <button class="${isClassicGrid ? "secondary" : ""}" data-action="set-learn-mode" data-mode="overview">Overview Mode</button>
        <button class="${isClassicGrid ? "" : "secondary"}" data-action="set-learn-mode" data-mode="classic">Classic Grid Mode</button>
      </div>
      <h3>${selected.label} Overview</h3>
      <p class="muted">Training mode is one-card-at-a-time and prioritizes weak cards.</p>
      <div class="grid">
        <button data-action="open-flashcards" data-row="${selected.id}" data-script="${script}">
          Train Flash Cards
        </button>
      </div>
      ${isClassicGrid ? `<div class="cards-grid">${classicCards}</div>` : `<div class="bars-grid">${rowProgress}</div>`}
    </article>
  `;
}

function flashcardsView() {
  if (!appState.flashcards) {
    return `
      <article>
        <h2>Row Flashcards</h2>
        <p>Open Learn Hiragana or Learn Katakana and choose a row flashcard set.</p>
      </article>
    `;
  }

  const session = appState.flashcards;
  const card = session.currentCard;
  if (!card) {
    return `
      <article>
        <h2>Row Flashcards</h2>
        <p>No cards available for this row right now.</p>
      </article>
    `;
  }
  const progress = getProgress();
  const level = progress[card.kana]?.level || 0;
  const showBack = session.showBack;
  const scriptLabel = session.script === "hiragana" ? "Hiragana" : "Katakana";
  const totalAnswers = session.correct + session.incorrect;
  const accuracy = totalAnswers > 0 ? Math.round((session.correct / totalAnswers) * 100) : 0;

  return `
    <article>
      <h2>${scriptLabel} Flashcards: ${session.rowLabel}</h2>
      <p class="counter">Trained: ${totalAnswers} • Accuracy: ${accuracy}% • Prioritizing weak cards</p>
      <div class="quiz-card">
        <div class="quiz-kana">${card.kana}</div>
        ${
          showBack
            ? `
          <p><strong>${card.romaji}</strong></p>
          <p class="muted">Pronounce: ${pronunciationHint(card.romaji)} (audio coming soon)</p>
          <p class="muted">Level ${level}: ${MASTERY_LABELS[level]}</p>
          <p>${shouldShowMnemonic(card.kana) ? card.mnemonic : "Mnemonic hidden (you are recalling well)."}</p>
          <div class="grid">
            <button class="secondary" data-action="flashcard-easy" data-kana="${card.kana}">I recalled it</button>
            <button class="contrast" data-action="flashcard-hard" data-kana="${card.kana}">I missed it</button>
          </div>
        `
            : `
          <p class="muted">Try recall first, then reveal.</p>
          <button data-action="flashcard-flip">Flip card</button>
        `
        }
      </div>
      <div class="grid">
        <button class="secondary" data-action="flashcard-skip">Skip</button>
        <button class="secondary outline" data-action="flashcard-restart">Restart row deck</button>
      </div>
    </article>
  `;
}

function marksView() {
  if (!appState.marksDrill) {
    appState.marksDrill = buildMarksDrill();
  }
  const drill = appState.marksDrill;
  const q = drill.questions[drill.index];
  if (!q) {
    const pct = Math.round((drill.correct / drill.questions.length) * 100);
    return `
      <article>
        <h2>Dakuten / Handakuten Drill</h2>
        <p>Score: <strong>${pct}%</strong></p>
        <p>${pct >= 80 ? "Great marks control." : "Keep practicing marks; you are improving."}</p>
        <button data-action="restart-marks-drill">Practice again</button>
      </article>
    `;
  }
  return `
    <article>
      <h2>Dakuten / Handakuten Drill</h2>
      <article>
        <h3>Quick Tips</h3>
        <ul>
          <li><strong>Dakuten (゛)</strong> = "voice it": k -> g, s -> z, t -> d, h -> b.</li>
          <li><strong>Handakuten (゜)</strong> only applies to H-row and makes a <strong>p</strong> sound: h -> p.</li>
          <li>Mnemonic: <strong>two dots = buzz</strong> (voiced), <strong>small circle = pop</strong> (p-sound).</li>
          <li>Only the kana sound changes; the base shape stays the same.</li>
        </ul>
      </article>
      <p class="counter">Question ${drill.index + 1} / ${drill.questions.length}</p>
      <div class="quiz-card">
        <p><strong>${q.prompt}</strong></p>
        <div class="quiz-kana">${q.kana}</div>
        ${
          q.type === "text"
            ? `
          <form class="marks-text-form" data-correct="${q.answer}">
            <label for="marks-text-input">Type the romaji sound:</label>
            <input id="marks-text-input" name="marksTextInput" type="text" placeholder="e.g. ga" autocomplete="off" required />
            <button type="submit">Submit sound</button>
          </form>
        `
            : `
          <div class="grid option-grid">
            ${q.options
              .map((opt) => `<button class="secondary marks-option" data-answer="${opt}" data-correct="${q.answer}">${opt}</button>`)
              .join("")}
          </div>
        `
        }
      </div>
    </article>
  `;
}

function reviewView() {
  if (!appState.reviewQueue.length) {
    const queue = buildWeakQueue();
    appState.reviewQueue = queue;
    appState.reviewIndex = 0;
  }

  if (!appState.reviewQueue.length) {
    return `
      <article>
        <h2>Review Weak Kana</h2>
        <p>Everything looks stable. Try the eligibility quiz.</p>
      </article>
    `;
  }

  const current = appState.reviewQueue[appState.reviewIndex];
  const options = buildRomajiOptions(current.romaji);
  const showMnemonic = shouldShowMnemonic(current.kana);

  return `
    <article>
      <h2>Review Weak Kana</h2>
      <p>Active recall first. Wrong answers come back soon.</p>
      <p class="counter">Card ${appState.reviewIndex + 1} / ${appState.reviewQueue.length}</p>
      <div class="quiz-card">
        <div class="quiz-kana">${current.kana}</div>
        <p class="muted">Pick the romaji:</p>
        <div class="grid option-grid">
          ${options
            .map(
              (opt) =>
                `<button class="secondary review-option" data-answer="${opt}" data-correct="${current.romaji}" data-kana="${current.kana}">${opt}</button>`
            )
            .join("")}
        </div>
        ${showMnemonic ? `<small>${current.mnemonic}</small>` : "<small class='muted'>No mnemonic needed right now.</small>"}
      </div>
    </article>
  `;
}

function lookalikeView() {
  if (!appState.lookalikeQuiz) {
    appState.lookalikeQuiz = buildLookalikeRound(10);
  }
  const quiz = appState.lookalikeQuiz;
  const q = quiz.questions[quiz.index];
  if (!q) {
    const percent = Math.round((quiz.correct / quiz.questions.length) * 100);
    return `
      <article>
        <h2>Lookalike Drill</h2>
        <p>Score: <strong>${percent}%</strong></p>
        <p>${percent >= 80 ? "Strong lookalike recognition." : "Almost ready. Drill these pairs again."}</p>
        <button data-action="restart-lookalike">Practice again</button>
      </article>
    `;
  }

  return `
    <article>
      <h2>Lookalike Drill</h2>
      <p class="counter">Question ${quiz.index + 1} / ${quiz.questions.length}</p>
      <div class="quiz-card">
        <div class="quiz-kana">${q.promptKana}</div>
        <p class="muted">Select the matching romaji:</p>
        <div class="grid option-grid">
          ${q.options
            .map(
              (opt) =>
                `<button class="secondary lookalike-option" data-answer="${opt}" data-correct="${q.answer}" data-kana="${q.promptKana}">${opt}</button>`
            )
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function eventQuizView() {
  if (!appState.eventQuiz) appState.eventQuiz = buildEventQuiz();
  const quiz = appState.eventQuiz;
  const current = quiz.questions[quiz.index];

  if (!current) {
    const result = computeEventResult(quiz);
    appState.eventResult = result;
    navigate("results");
    return "";
  }

  return `
    <article>
      <h2>Event Eligibility Quiz</h2>
      <p>Short, mobile-friendly check for event readiness.</p>
      <p class="counter">Q ${quiz.index + 1} / ${quiz.questions.length} (${current.section})</p>
      <div class="quiz-card">
        <p><strong>${current.prompt}</strong></p>
        <div class="quiz-kana">${current.kana || ""}</div>
        <div class="grid option-grid">
          ${current.options
            .map(
              (opt) =>
                `<button class="secondary event-option" data-answer="${opt}" data-correct="${current.answer}" data-section="${current.section}" data-kana="${current.kana || ""}">${opt}</button>`
            )
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function resultsView() {
  if (!appState.eventResult) {
    return `
      <article>
        <h2>Results / Badge Screen</h2>
        <p>Take the eligibility quiz to see your readiness.</p>
      </article>
    `;
  }
  const result = appState.eventResult;
  const topWeak = result.weakAreas.slice(0, 3);
  const earned = badgeStatus();
  return `
    <article>
      <h2>Results / Badge Screen</h2>
      <h3 class="${result.statusClass}">${result.status}</h3>
      <p>${result.statusCopy}</p>
      <h4>Section Scores</h4>
      <ul>
        <li>Hiragana Recognition: ${result.scores.hiragana}%</li>
        <li>Katakana Recognition: ${result.scores.katakana}%</li>
        <li>Lookalike: ${result.scores.lookalike}%</li>
        <li>Word Reading: ${result.scores.wordReading}%</li>
        <li>Kana Mechanics: ${result.scores.mechanics}%</li>
        <li>Total Score: ${result.scores.total}%</li>
      </ul>
      <h4>Earned Badges</h4>
      <ul>
        ${Object.values(BADGES)
          .map((badge) => `<li>${earned.includes(badge) ? "🏅" : "⬜"} ${badge}</li>`)
          .join("")}
      </ul>
      <h4>Top 3 Weak Areas</h4>
      <ol>
        ${topWeak.map((w) => `<li>${w}</li>`).join("")}
      </ol>
      <h4>Here's what to repair</h4>
      <ul>
        ${result.repairPlan.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p class="muted">You do not need to be perfect to join. Aim for ready enough.</p>
      <div class="grid">
        <button data-action="retake-quiz">Retake quiz</button>
        <button class="secondary" data-action="repair-review">Review weak kana now</button>
      </div>
    </article>
  `;
}

function buildWeakQueue() {
  const progress = getProgress();
  return allKana
    .map((k) => ({ ...k, level: progress[k.kana]?.level || 0 }))
    .sort((a, b) => a.level - b.level)
    .slice(0, 20);
}

function flashcardWeightForKana(kana, sessionProgress = {}) {
  const globalProgress = getProgress();
  const progress = globalProgress[kana] || defaultProgressEntry();
  const levelPenalty = 1 + (5 - progress.level) * 2;
  const missPenalty = (progress.incorrectCount || 0) * 0.25;
  const streakDiscount = Math.min(progress.correctStreak || 0, 4) * 0.25;
  const localMissPenalty = (sessionProgress[kana]?.misses || 0) * 1.5;
  const now = Date.now();
  const dueBoost = progress.nextReviewAt && progress.nextReviewAt <= now ? 2 : 0;
  return Math.max(0.4, levelPenalty + missPenalty + localMissPenalty + dueBoost - streakDiscount);
}

function pickWeightedFlashcard(cards, sessionProgress = {}, lastKana = null) {
  if (!cards.length) return null;
  const pool = cards.map((card) => ({
    card,
    weight: flashcardWeightForKana(card.kana, sessionProgress)
  }));
  const viable = pool.filter((entry) => cards.length === 1 || entry.card.kana !== lastKana);
  const source = viable.length ? viable : pool;
  const totalWeight = source.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  for (let index = 0; index < source.length; index += 1) {
    random -= source[index].weight;
    if (random <= 0) return source[index].card;
  }
  return source[source.length - 1].card;
}

function initializeFlashcardSession(script, row) {
  const shuffledCards = shuffle(row.chars.map((char) => ({ ...char })));
  return {
    script,
    rowId: row.id,
    rowLabel: row.label,
    cards: shuffledCards,
    currentCard: pickWeightedFlashcard(shuffledCards),
    showBack: false,
    correct: 0,
    incorrect: 0,
    perKana: {},
    lastKana: null
  };
}

function advanceFlashcard({ markCorrect = null } = {}) {
  const session = appState.flashcards;
  if (!session || !session.currentCard) return;
  const kana = session.currentCard.kana;
  if (!session.perKana[kana]) {
    session.perKana[kana] = { seen: 0, misses: 0 };
  }
  session.perKana[kana].seen += 1;

  if (markCorrect === true) {
    session.correct += 1;
    updateProgressForAnswer(kana, true);
  } else if (markCorrect === false) {
    session.incorrect += 1;
    session.perKana[kana].misses += 1;
    updateProgressForAnswer(kana, false);
  }

  session.lastKana = kana;
  session.currentCard = pickWeightedFlashcard(session.cards, session.perKana, session.lastKana);
  session.showBack = false;
}

function buildRomajiOptions(correct) {
  const set = new Set([correct]);
  while (set.size < 4) {
    const candidate = allKana[Math.floor(Math.random() * allKana.length)].romaji;
    set.add(candidate);
  }
  return shuffle([...set]);
}

function buildLookalikeRound(count) {
  const entries = [];
  Object.entries(LOOKALIKE_PAIRS).forEach(([script, groups]) => {
    groups.forEach((group) => {
      group.forEach((kana) => {
        const lookup = allKana.find((k) => k.kana === kana);
        if (lookup) entries.push({ kana, answer: lookup.romaji, script, pool: group });
      });
    });
  });
  const questions = shuffle(entries).slice(0, count).map((e) => ({
    promptKana: e.kana,
    answer: e.answer,
    options: shuffle(
      [e.answer].concat(
        shuffle(
          e.pool
            .filter((k) => k !== e.kana)
            .map((k) => allKana.find((x) => x.kana === k)?.romaji)
            .filter(Boolean)
        ).slice(0, 2)
      ).concat(buildRomajiOptions(e.answer).slice(0, 1))
    ).slice(0, 4)
  }));
  return { questions, index: 0, correct: 0 };
}

function buildEventQuiz() {
  const hira = shuffle(allKana.filter((k) => k.script === "hiragana")).slice(0, 10);
  const kata = shuffle(allKana.filter((k) => k.script === "katakana")).slice(0, 10);
  const lookalike = buildLookalikeRound(8).questions.map((q) => ({
    section: "lookalike",
    prompt: "Lookalike check: pick the romaji",
    kana: q.promptKana,
    options: q.options,
    answer: q.answer
  }));
  const words = shuffle([...SIMPLE_WORDS.hiragana, ...SIMPLE_WORDS.katakana]).slice(0, 8).map((w) => ({
    section: "wordReading",
    prompt: "Read this word:",
    kana: w.kana,
    options: shuffle([w.answer, ...buildWordDistractors(w.answer, 3)]),
    answer: w.answer
  }));
  const mechanics = MECHANICS_QUESTIONS.map((m) => ({
    section: "mechanics",
    prompt: m.prompt,
    options: shuffle([...m.choices]),
    answer: m.answer
  }));

  const questions = [
    ...hira.map((h) => ({
      section: "hiragana",
      prompt: "Pick the romaji:",
      kana: h.kana,
      options: buildRomajiOptions(h.romaji),
      answer: h.romaji
    })),
    ...kata.map((k) => ({
      section: "katakana",
      prompt: "Pick the romaji:",
      kana: k.kana,
      options: buildRomajiOptions(k.romaji),
      answer: k.romaji
    })),
    ...lookalike,
    ...words,
    ...mechanics
  ];

  return {
    questions,
    index: 0,
    answers: [],
    bySection: {
      hiragana: { total: 10, correct: 0 },
      katakana: { total: 10, correct: 0 },
      lookalike: { total: 8, correct: 0 },
      wordReading: { total: 8, correct: 0 },
      mechanics: { total: 4, correct: 0 }
    }
  };
}

function buildMarksDrill() {
  const transformQuestions = [
    { type: "mcq", prompt: "Add dakuten:", kana: "か -> ?", answer: "が", options: ["か", "が", "ぱ", "た"] },
    { type: "mcq", prompt: "Add dakuten:", kana: "き -> ?", answer: "ぎ", options: ["ぎ", "き", "ぴ", "じ"] },
    { type: "mcq", prompt: "Add dakuten:", kana: "さ -> ?", answer: "ざ", options: ["さ", "ざ", "だ", "ぱ"] },
    { type: "mcq", prompt: "Add dakuten:", kana: "た -> ?", answer: "だ", options: ["だ", "た", "ざ", "ぱ"] },
    { type: "mcq", prompt: "Add dakuten:", kana: "は -> ?", answer: "ば", options: ["ぱ", "は", "ば", "ま"] },
    { type: "mcq", prompt: "Add handakuten:", kana: "は -> ?", answer: "ぱ", options: ["ば", "ぱ", "は", "ふ"] },
    { type: "mcq", prompt: "Add handakuten:", kana: "ひ -> ?", answer: "ぴ", options: ["ぴ", "び", "ひ", "み"] },
    { type: "mcq", prompt: "Add handakuten:", kana: "ふ -> ?", answer: "ぷ", options: ["ぶ", "ぷ", "ふ", "む"] },
    { type: "mcq", prompt: "Add handakuten:", kana: "へ -> ?", answer: "ぺ", options: ["べ", "ぺ", "へ", "め"] },
    { type: "mcq", prompt: "Add handakuten:", kana: "ほ -> ?", answer: "ぽ", options: ["ぼ", "ぽ", "ほ", "も"] }
  ].map((q) => ({ ...q, options: shuffle(q.options) }));

  const soundQuestions = [
    { type: "text", prompt: "What sound does this become with dakuten?", kana: "か゛", answer: "ga" },
    { type: "text", prompt: "What sound does this become with dakuten?", kana: "は゛", answer: "ba" },
    { type: "text", prompt: "What sound does this become with handakuten?", kana: "は゜", answer: "pa" },
    { type: "text", prompt: "What sound does this become with dakuten?", kana: "た゛", answer: "da" },
    { type: "text", prompt: "What sound does this become with handakuten?", kana: "ほ゜", answer: "po" }
  ];

  return { questions: shuffle([...transformQuestions, ...soundQuestions]), index: 0, correct: 0 };
}

function normalizeRomajiInput(value) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function buildWordDistractors(answer, count) {
  const pool = [...SIMPLE_WORDS.hiragana, ...SIMPLE_WORDS.katakana].map((w) => w.answer);
  const unique = new Set();
  while (unique.size < count) {
    const value = pool[Math.floor(Math.random() * pool.length)];
    if (value !== answer) unique.add(value);
  }
  return [...unique];
}

function computeEventResult(quiz) {
  const toPercent = (obj) => Math.round((obj.correct / obj.total) * 100);
  const scores = {
    hiragana: toPercent(quiz.bySection.hiragana),
    katakana: toPercent(quiz.bySection.katakana),
    lookalike: toPercent(quiz.bySection.lookalike),
    wordReading: toPercent(quiz.bySection.wordReading),
    mechanics: toPercent(quiz.bySection.mechanics)
  };
  scores.total = Math.round((scores.hiragana + scores.katakana + scores.lookalike + scores.wordReading + scores.mechanics) / 5);

  const green =
    scores.hiragana >= 90 &&
    scores.katakana >= 90 &&
    scores.lookalike >= 80 &&
    scores.wordReading >= 80 &&
    scores.mechanics >= 70;

  const yellow = !green && scores.total >= 75;
  let status = "Build First";
  let statusClass = "status-red";
  let statusCopy = "Here's what to repair before joining. You're building strong foundations.";
  if (green) {
    status = "Event Ready";
    statusClass = "status-green";
    statusCopy = "Ready enough for manga study events. Keep light review to stay sharp.";
  } else if (yellow) {
    status = "Almost Ready";
    statusClass = "status-yellow";
    statusCopy = "Almost ready. A bit of repair work and you'll be ready enough.";
  }

  const weakAreas = Object.entries(scores)
    .filter(([k]) => k !== "total")
    .sort((a, b) => a[1] - b[1])
    .map(([k, v]) => `${labelForSection(k)} (${v}%)`);

  const repairPlan = buildRepairPlan(scores);
  return { scores, status, statusClass, statusCopy, weakAreas, repairPlan };
}

function labelForSection(section) {
  const labels = {
    hiragana: "Hiragana recognition",
    katakana: "Katakana recognition",
    lookalike: "Lookalike differentiation",
    wordReading: "Word reading",
    mechanics: "Kana mechanics"
  };
  return labels[section] || section;
}

function buildRepairPlan(scores) {
  const plan = [];
  if (scores.hiragana < 90) {
    plan.push("Run 2 rounds of Hiragana row drills and focus on low-bar kana.");
  }
  if (scores.katakana < 90) {
    plan.push("Run 2 rounds of Katakana row drills and review rows with average below 3.");
  }
  if (scores.lookalike < 80) {
    plan.push("Repeat Lookalike Drill twice, especially シ/ツ and ね/れ/わ families.");
  }
  if (scores.wordReading < 80) {
    plan.push("Read the 16 simple words aloud in 3 short cycles.");
  }
  if (scores.mechanics < 70) {
    plan.push("Review dakuten, handakuten, small っ, and long vowel mark ー.");
  }
  if (!plan.length) {
    plan.push("Do one weekly spaced review to stay event-ready.");
  }
  return plan;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches("[data-action='start-review']")) {
    appState.reviewQueue = [];
    navigate("review");
  }

  if (target.matches("[data-action='onboarding-start']")) {
    markOnboardingSeen();
    appState.selectedRowId = "a";
    navigate("learnHiragana");
  }

  if (target.matches("[data-action='onboarding-dismiss']")) {
    markOnboardingSeen();
    render();
  }

  if (target.matches("[data-action='start-quiz']")) {
    appState.eventQuiz = null;
    navigate("quiz");
  }

  if (target.matches("[data-action='start-marks-drill']")) {
    appState.marksDrill = null;
    navigate("marks");
  }

  if (target.matches("[data-action='retake-quiz']")) {
    appState.eventQuiz = null;
    appState.eventResult = null;
    navigate("quiz");
  }

  if (target.matches("[data-action='repair-review']")) {
    appState.reviewQueue = [];
    navigate("review");
  }

  if (target.matches("[data-action='export-progress']")) {
    exportProgressJson();
  }

  if (target.matches("[data-action='reset-progress']")) {
    const okay = window.confirm(
      "Reset all kana progress? This clears levels, counts, quiz state, and weak review queue."
    );
    if (okay) {
      resetAllProgress();
      render();
    }
  }

  if (target.matches("[data-action='restart-lookalike']")) {
    appState.lookalikeQuiz = null;
    navigate("lookalike");
  }

  if (target.matches("[data-action='restart-marks-drill']")) {
    appState.marksDrill = null;
    navigate("marks");
  }

  if (target.matches("[data-action='open-flashcards']")) {
    const rowId = target.getAttribute("data-row");
    const script = target.getAttribute("data-script");
    const row = KANA_ROWS[script].find((r) => r.id === rowId);
    if (row) {
      appState.flashcards = initializeFlashcardSession(script, row);
      navigate("flashcards");
    }
  }

  if (target.matches("[data-action='set-learn-mode']")) {
    const mode = target.getAttribute("data-mode");
    if (mode === "overview" || mode === "classic") {
      appState.learnDisplayMode = mode;
      render();
    }
  }

  if (target.matches("[data-row]") && !target.matches("[data-action='open-flashcards']")) {
    appState.selectedRowId = target.getAttribute("data-row");
    const script = target.getAttribute("data-script");
    navigate(script === "hiragana" ? "learnHiragana" : "learnKatakana");
  }

  if (target.matches("[data-action='flashcard-flip']")) {
    if (appState.flashcards) {
      appState.flashcards.showBack = true;
      render();
    }
  }

  if (target.matches("[data-action='flashcard-skip']")) {
    if (appState.flashcards) {
      advanceFlashcard();
      render();
    }
  }

  if (target.matches("[data-action='flashcard-restart']")) {
    if (appState.flashcards) {
      const session = appState.flashcards;
      const row = KANA_ROWS[session.script].find((r) => r.id === session.rowId);
      if (row) {
        appState.flashcards = initializeFlashcardSession(session.script, row);
      }
      render();
    }
  }

  if (target.matches("[data-action='flashcard-easy']")) {
    if (appState.flashcards) {
      advanceFlashcard({ markCorrect: true });
    }
    render();
  }

  if (target.matches("[data-action='flashcard-hard']")) {
    if (appState.flashcards) {
      advanceFlashcard({ markCorrect: false });
    }
    render();
  }

  if (target.matches("[data-check-kana]")) {
    updateProgressForAnswer(target.getAttribute("data-check-kana"), true);
    render();
  }

  if (target.matches("[data-miss-kana]")) {
    updateProgressForAnswer(target.getAttribute("data-miss-kana"), false);
    render();
  }

  if (target.matches(".review-option")) {
    const answer = target.getAttribute("data-answer");
    const correct = target.getAttribute("data-correct");
    const kana = target.getAttribute("data-kana");
    const isCorrect = answer === correct;
    updateProgressForAnswer(kana, isCorrect);
    if (!isCorrect) appState.reviewQueue.push(allKana.find((k) => k.kana === kana));
    appState.reviewIndex += 1;
    render();
  }

  if (target.matches(".lookalike-option")) {
    const answer = target.getAttribute("data-answer");
    const correct = target.getAttribute("data-correct");
    const kana = target.getAttribute("data-kana");
    const isCorrect = answer === correct;
    if (isCorrect) appState.lookalikeQuiz.correct += 1;
    updateProgressForAnswer(kana, isCorrect);
    appState.lookalikeQuiz.index += 1;
    render();
  }

  if (target.matches(".marks-option")) {
    const answer = target.getAttribute("data-answer");
    const correct = target.getAttribute("data-correct");
    if (appState.marksDrill) {
      if (answer === correct) appState.marksDrill.correct += 1;
      appState.marksDrill.index += 1;
      render();
    }
  }

  if (target.matches(".event-option")) {
    const answer = target.getAttribute("data-answer");
    const correct = target.getAttribute("data-correct");
    const section = target.getAttribute("data-section");
    const kana = target.getAttribute("data-kana");
    const isCorrect = answer === correct;
    if (appState.eventQuiz.bySection[section]) {
      if (isCorrect) appState.eventQuiz.bySection[section].correct += 1;
    }
    if (kana) updateProgressForAnswer(kana, isCorrect);
    appState.eventQuiz.answers.push({ section, isCorrect });
    appState.eventQuiz.index += 1;
    render();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (!form.matches(".marks-text-form")) return;
  event.preventDefault();
  if (!appState.marksDrill) return;

  const input = form.querySelector("#marks-text-input");
  const userAnswer = normalizeRomajiInput(input?.value || "");
  const correct = normalizeRomajiInput(form.getAttribute("data-correct"));
  if (userAnswer === correct) appState.marksDrill.correct += 1;
  appState.marksDrill.index += 1;
  render();
});
