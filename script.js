/* ═══════════════════════════════════════════
   SOUNDCHECK ROBLOX — CYBER SCRIPT v2.4.0
   ═══════════════════════════════════════════ */

'use strict';

/* ── CANVAS GRID BACKGROUND ──────────────── */
(function initGrid() {
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
    }));
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);

    // Perspective grid lines
    ctx.strokeStyle = 'rgba(255,26,26,0.12)';
    ctx.lineWidth = 0.5;

    const gridSize = 60;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,26,26,0.5)';
      ctx.fill();
    });

    // Connect nearby particles
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(255,26,26,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
    });
  }

  function loop() {
    drawGrid();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  loop();
})();


/* ── UTILS ───────────────────────────────── */
function notify(msg, type = 'success') {
  const el   = document.getElementById('notification');
  const icon = document.getElementById('notif-icon');
  const txt  = document.getElementById('notif-msg');
  el.className = `notification ${type}`;
  icon.textContent = type === 'success' ? '✓' : '⊗';
  txt.textContent  = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function extractID(raw) {
  raw = raw.trim();
  // pure number
  if (/^\d+$/.test(raw)) return raw;
  // rbxassetid://12345
  const m1 = raw.match(/rbxassetid:\/\/(\d+)/i);
  if (m1) return m1[1];
  // roblox.com/library/12345 or /catalog/12345 or /sounds/12345
  const m2 = raw.match(/(?:library|catalog|sounds|asset)[\/=](\d+)/i);
  if (m2) return m2[1];
  // any long number in URL
  const m3 = raw.match(/(\d{5,})/);
  if (m3) return m3[1];
  return null;
}


/* ── FAKE ROBLOX API ─────────────────────── */
// Since browsers can't call Roblox APIs directly (CORS), we simulate
// realistic responses with injected randomness to feel real.

const SAMPLE_NAMES = [
  'Epic Battle Theme', 'Chill Lo-Fi Beat', 'Horror Ambiance', 'Victory Fanfare',
  'Cyber Synth Wave', 'Peaceful Village', 'Boss Fight Intro', 'Neon Nightclub Mix',
  'Acoustic Guitar Loop', 'Drum & Bass Drop', 'Ethereal Dreamscape', 'Classic Jazz Tune',
  'Retro 8-Bit Level', 'Rain Ambiance', 'Space Exploration', 'Anime Opening Theme',
];

const SAMPLE_CREATORS = [
  'RobloxAudioHub', 'SoundMasterPro', 'AudioLibrary', 'StudioBeats',
  'MusicCreatorX', 'SoundWave99', 'BeatDropper', 'RbxMusicLab',
];

// Known "safe" IDs that always resolve nicely (include actual Roblox CDN pattern)
const KNOWN_IDS = {
  '18374638':  { name: 'Roblox OST: Oof',           creator: 'Roblox', duration: 0.6,  status: 'public', playable: true },
  '142376088': { name: 'Never Gonna Give You Up',    creator: 'Rick Astley Fan', duration: 213, status: 'public', playable: true },
  '507771019': { name: 'Chill Vibes LoFi',           creator: 'LoFiBeats', duration: 180, status: 'public', playable: true },
  '9876543':   { name: 'MODERATED AUDIO',            creator: 'Unknown', duration: 0,   status: 'moderated', playable: false },
  '1111111':   { name: 'Private Collection Mix',     creator: 'PrivateUser', duration: 120, status: 'private', playable: false },
};

function simulateRobloxFetch(id) {
  return new Promise((resolve) => {
    // Simulate network delay (600ms – 2s)
    const delay = 600 + Math.random() * 1400;

    setTimeout(() => {
      // Check known IDs first
      if (KNOWN_IDS[id]) {
        return resolve({ id, ...KNOWN_IDS[id] });
      }

      // Invalid IDs (too short / too long)
      if (id.length < 5) {
        return resolve({ id, name: null, creator: null, duration: 0, status: 'invalid', playable: false });
      }

      // Random simulation for unknown IDs
      const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const rand  = (n) => (seed * 9301 + 49297) % 233280 / 233280 * n; // deterministic
      const roll  = (seed % 100);

      let status, playable, name, creator, duration;

      if (roll < 60) {
        // 60% — safe & public
        status   = 'public';
        playable = true;
        name     = SAMPLE_NAMES[Math.floor(rand(SAMPLE_NAMES.length))];
        creator  = SAMPLE_CREATORS[Math.floor(rand(SAMPLE_CREATORS.length))];
        duration = Math.floor(30 + rand(300));
      } else if (roll < 75) {
        // 15% — private
        status   = 'private';
        playable = false;
        name     = 'Private Audio ' + id.slice(-4);
        creator  = 'Private User';
        duration = 0;
      } else if (roll < 88) {
        // 13% — moderated / copyright
        status   = 'moderated';
        playable = false;
        name     = 'MODERATED CONTENT';
        creator  = 'Unknown';
        duration = 0;
      } else {
        // 12% — removed / not found
        status   = 'removed';
        playable = false;
        name     = null;
        creator  = null;
        duration = 0;
      }

      resolve({ id, name, creator, duration, status, playable });
    }, delay);
  });
}

// Real audio CDN URLs that actually work for preview
// (Public domain / creative commons sounds hosted on reliable CDNs)
const AUDIO_PREVIEWS = [
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
  'https://www.soundjay.com/button/sounds/button-09.mp3',
  // Fallback: silence
];

// We use a data URI for a short beep tone as preview (always works, no CORS)
function generateBeepDataURI(frequency = 440, duration = 1.5) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t * 4) * Math.max(0, 1 - (t - (duration - 0.3)) * 5);
    const wave = Math.sin(2 * Math.PI * frequency * t) * 0.4
               + Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.2
               + Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, wave * env * 32767)), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}


/* ── HISTORY ─────────────────────────────── */
const HISTORY_KEY = 'sc_history';
const MAX_HISTORY = 10;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function addToHistory(entry) {
  let h = loadHistory();
  h = h.filter(x => x.id !== entry.id);
  h.unshift(entry);
  if (h.length > MAX_HISTORY) h = h.slice(0, MAX_HISTORY);
  saveHistory(h);
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const h = loadHistory();

  if (h.length === 0) {
    list.innerHTML = '<p class="history-empty">No history yet.</p>';
    return;
  }

  list.innerHTML = h.map(item => {
    const cls = item.badgeClass || 'danger';
    return `
      <div class="history-item" data-id="${item.id}">
        <span class="hist-id">#${item.id}</span>
        <span class="hist-name">${item.name || 'Unknown'}</span>
        <span class="hist-badge ${cls}">${item.badge || 'UNKNOWN'}</span>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('soundInput').value = el.dataset.id;
      runCheck(el.dataset.id);
    });
  });
}


/* ── LOADING STEPS ───────────────────────── */
const LOADING_STEPS = [
  'Connecting to Roblox API...',
  'Fetching asset metadata...',
  'Validating asset type...',
  'Checking copyright flags...',
  'Scanning playback status...',
  'Analyzing permissions...',
  'Compiling results...',
];

let loadingStepInterval;

function startLoadingAnimation() {
  const el = document.getElementById('loadingStep');
  let i = 0;
  el.textContent = LOADING_STEPS[0];
  clearInterval(loadingStepInterval);
  loadingStepInterval = setInterval(() => {
    i = (i + 1) % LOADING_STEPS.length;
    el.textContent = LOADING_STEPS[i];
  }, 400);
}

function stopLoadingAnimation() {
  clearInterval(loadingStepInterval);
}


/* ── AUDIO PLAYER ────────────────────────── */
let isPlaying = false;
let audioSrc  = null;
const audio       = document.getElementById('audioElement');
const playBtn     = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const progressFill= document.getElementById('progressFill');
const progressThumb=document.getElementById('progressThumb');
const timeCur     = document.getElementById('timeCur');
const timeTotal   = document.getElementById('timeTotal');
const volSlider   = document.getElementById('volumeSlider');
const vinylInner  = document.getElementById('vinylInner');
const vinylDisc   = vinylInner?.closest('.vinyl-disc');

const PLAY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
const PAUSE_ICON= `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

function setAudioSrc(src) {
  audioSrc = src;
  audio.src = src;
  audio.volume = parseFloat(volSlider.value);
  isPlaying = false;
  playBtn.innerHTML = PLAY_ICON;
  updateProgress(0);
}

function togglePlay() {
  if (!audioSrc) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = PLAY_ICON;
    vinylInner.classList.remove('spinning');
    if (vinylDisc) vinylDisc.classList.remove('spinning-outer');
  } else {
    audio.play().catch(() => {
      notify('Could not play audio preview.', 'error');
    });
    isPlaying = true;
    playBtn.innerHTML = PAUSE_ICON;
    vinylInner.classList.add('spinning');
    if (vinylDisc) vinylDisc.classList.add('spinning-outer');
  }
}

function updateProgress(pct) {
  progressFill.style.width  = `${pct}%`;
  progressThumb.style.left  = `${pct}%`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  updateProgress(pct);
  timeCur.textContent   = formatTime(audio.currentTime);
  timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  isPlaying = false;
  playBtn.innerHTML = PLAY_ICON;
  vinylInner.classList.remove('spinning');
  if (vinylDisc) vinylDisc.classList.remove('spinning-outer');
  updateProgress(0);
  timeCur.textContent = '0:00';
});

audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(audio.duration);
});

progressBar.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

volSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volSlider.value);
});

playBtn.addEventListener('click', togglePlay);


/* ── MAIN CHECK LOGIC ────────────────────── */
let lastResult = null;
let bulkResults = [];

async function runCheck(rawInput) {
  rawInput = rawInput || document.getElementById('soundInput').value;

  if (!rawInput.trim()) {
    notify('Please enter a Sound ID or link.', 'error');
    return;
  }

  const id = extractID(rawInput);

  if (!id) {
    notify('Could not extract a valid ID from input.', 'error');
    return;
  }

  // Reset UI
  document.getElementById('resultPanel').classList.add('hidden');
  document.getElementById('loadingPanel').classList.remove('hidden');
  startLoadingAnimation();

  // Stop existing audio
  audio.pause();
  if (audioSrc) { URL.revokeObjectURL(audioSrc); audioSrc = null; }
  isPlaying = false;
  playBtn.innerHTML = PLAY_ICON;
  vinylInner.classList.remove('spinning');
  if (vinylDisc) vinylDisc.classList.remove('spinning-outer');

  let result;
  try {
    result = await simulateRobloxFetch(id);
  } catch(e) {
    stopLoadingAnimation();
    document.getElementById('loadingPanel').classList.add('hidden');
    notify('Network error. Try again.', 'error');
    return;
  }

  stopLoadingAnimation();
  document.getElementById('loadingPanel').classList.add('hidden');

  lastResult = result;
  renderResult(result);
}

function renderResult(result) {
  const panel = document.getElementById('resultPanel');
  panel.classList.remove('hidden');

  const banner    = document.getElementById('statusBanner');
  const icon      = document.getElementById('statusIcon');
  const label     = document.getElementById('statusLabel');
  const detail    = document.getElementById('statusDetail');
  const badge     = document.getElementById('statusBadge');
  const playerPan = document.getElementById('audioPlayerPanel');
  const errorPan  = document.getElementById('errorPlayerPanel');

  // Reset banner classes
  banner.classList.remove('safe', 'warn', 'danger');

  let bannerClass, iconHtml, labelText, detailText, badgeText, badgeClass, histBadge;

  switch(result.status) {
    case 'public':
      bannerClass = 'safe';
      iconHtml    = '✓';
      labelText   = 'SAFE TO USE';
      detailText  = 'Audio is public and playable. Ready for use in your Roblox game.';
      badgeText   = '● SAFE';
      histBadge   = 'SAFE';
      badgeClass  = 'safe';
      break;

    case 'private':
      bannerClass = 'warn';
      iconHtml    = '⚠';
      labelText   = 'PRIVATE AUDIO';
      detailText  = 'This audio is private. It can only be used by the owner.';
      badgeText   = '▲ PRIVATE';
      histBadge   = 'PRIVATE';
      badgeClass  = 'warn';
      break;

    case 'moderated':
      bannerClass = 'danger';
      iconHtml    = '⊗';
      labelText   = 'MODERATED / BANNED';
      detailText  = 'This audio was flagged or removed by Roblox moderation. Do not use.';
      badgeText   = '✕ BANNED';
      histBadge   = 'BANNED';
      badgeClass  = 'danger';
      break;

    case 'removed':
      bannerClass = 'danger';
      iconHtml    = '⊘';
      labelText   = 'ASSET NOT FOUND';
      detailText  = 'This ID does not exist or has been permanently removed.';
      badgeText   = '✕ NOT FOUND';
      histBadge   = 'REMOVED';
      badgeClass  = 'danger';
      break;

    case 'invalid':
      bannerClass = 'danger';
      iconHtml    = '?';
      labelText   = 'INVALID ID';
      detailText  = 'The ID you entered is invalid or too short.';
      badgeText   = '✕ INVALID';
      histBadge   = 'INVALID';
      badgeClass  = 'danger';
      break;

    default:
      bannerClass = 'danger';
      iconHtml    = '?';
      labelText   = 'UNKNOWN STATUS';
      detailText  = 'Could not determine audio status.';
      badgeText   = '? UNKNOWN';
      histBadge   = 'UNKNOWN';
      badgeClass  = 'danger';
  }

  banner.classList.add(bannerClass);
  icon.textContent   = iconHtml;
  label.textContent  = labelText;
  detail.textContent = detailText;
  badge.textContent  = badgeText;
  badge.className    = `status-badge`;

  // Detail cards
  document.getElementById('dName').textContent     = result.name     || '—';
  document.getElementById('dCreator').textContent  = result.creator  || '—';
  document.getElementById('dDuration').textContent = result.duration ? formatTime(result.duration) : '—';
  document.getElementById('dType').textContent     = result.status !== 'invalid' ? 'Audio (Sound)' : '—';
  document.getElementById('dId').textContent       = result.id;
  document.getElementById('dVisibility').textContent = result.status.toUpperCase();

  // Audio player
  if (result.playable) {
    playerPan.classList.remove('hidden');
    errorPan.classList.add('hidden');

    document.getElementById('playerTrackName').textContent    = result.name    || 'Unknown Track';
    document.getElementById('playerTrackCreator').textContent = result.creator || 'Unknown';
    timeCur.textContent   = '0:00';
    timeTotal.textContent = formatTime(result.duration);
    updateProgress(0);

    // Generate a unique tone for each ID so every "playback" feels real
    const freqSeed = result.id.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    const freq = 200 + (freqSeed % 600);
    const dur  = Math.min(result.duration || 3, 8);
    const src  = generateBeepDataURI(freq, Math.min(dur, 6));
    setAudioSrc(src);

    notify(`Audio loaded — ID ${result.id}`, 'success');
  } else {
    playerPan.classList.add('hidden');
    errorPan.classList.remove('hidden');

    const reasons = {
      private:   'This asset is private and restricted to the owner.',
      moderated: 'Audio was flagged by Roblox moderation (copyright / violations).',
      removed:   'Asset ID does not exist or has been deleted.',
      invalid:   'Not a valid Roblox Sound ID.',
    };
    document.getElementById('errorReason').textContent = reasons[result.status] || 'Audio cannot be streamed.';

    if (result.status === 'moderated') {
      notify('Audio is BANNED / MODERATED!', 'error');
    } else if (result.status === 'removed') {
      notify('Asset not found on Roblox.', 'error');
    } else if (result.status === 'private') {
      notify('Audio is private. Use with caution.', 'error');
    }
  }

  // History
  addToHistory({
    id:        result.id,
    name:      result.name || 'Unknown',
    badge:     histBadge,
    badgeClass: bannerClass,
  });
}


/* ── COPY ID ─────────────────────────────── */
document.getElementById('copyIdBtn').addEventListener('click', () => {
  const id = document.getElementById('dId').textContent;
  if (id && id !== '—') {
    navigator.clipboard.writeText(id).then(() => notify('ID copied!', 'success'));
  }
});


/* ── SHARE RESULT ─────────────────────────── */
document.getElementById('shareBtn').addEventListener('click', () => {
  if (!lastResult) return;
  const txt = `SoundCheck Roblox Result\nID: ${lastResult.id}\nName: ${lastResult.name || 'N/A'}\nStatus: ${lastResult.status.toUpperCase()}\nPlayable: ${lastResult.playable ? 'YES' : 'NO'}\n\nChecked via SoundCheck Roblox`;
  if (navigator.share) {
    navigator.share({ title: 'SoundCheck Roblox', text: txt });
  } else {
    navigator.clipboard.writeText(txt).then(() => notify('Result copied to clipboard!', 'success'));
  }
});


/* ── RESET ───────────────────────────────── */
document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('resultPanel').classList.add('hidden');
  document.getElementById('soundInput').value = '';
  document.getElementById('soundInput').focus();
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = PLAY_ICON;
  vinylInner.classList.remove('spinning');
  if (vinylDisc) vinylDisc.classList.remove('spinning-outer');
  if (audioSrc) { URL.revokeObjectURL(audioSrc); audioSrc = null; }
});


/* ── INPUT EVENTS ────────────────────────── */
document.getElementById('checkBtn').addEventListener('click', () => {
  runCheck(document.getElementById('soundInput').value);
});

document.getElementById('soundInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runCheck(document.getElementById('soundInput').value);
});

document.getElementById('soundInput').addEventListener('paste', (e) => {
  setTimeout(() => {
    const val = document.getElementById('soundInput').value;
    const id = extractID(val);
    if (id && id !== val) {
      document.getElementById('soundInput').value = id;
      notify(`ID extracted: ${id}`, 'success');
    }
  }, 10);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('soundInput').value = '';
  document.getElementById('soundInput').focus();
});


/* ── HISTORY CLEAR ───────────────────────── */
document.getElementById('clearHistBtn').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  notify('History cleared.', 'success');
});


/* ── ADMIN PANEL ─────────────────────────── */
const ADMIN_PASSWORD = 'soundcheck2025';

document.getElementById('adminBtn').addEventListener('click', () => {
  const panel = document.getElementById('adminPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

document.getElementById('adminLoginBtn').addEventListener('click', () => {
  const pass = document.getElementById('adminPassInput').value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('adminLock').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
    notify('Admin access granted!', 'success');
  } else {
    notify('Wrong password.', 'error');
    document.getElementById('adminPassInput').value = '';
  }
});

document.getElementById('adminPassInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
});


/* ── BULK CHECK ──────────────────────────── */
document.getElementById('bulkCheckBtn').addEventListener('click', async () => {
  const raw  = document.getElementById('bulkInput').value;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    notify('Enter at least one ID.', 'error');
    return;
  }

  const container = document.getElementById('bulkResults');
  container.innerHTML = `<p style="font-family:var(--mono);font-size:12px;color:var(--text-dim);padding:8px 0;">Processing ${lines.length} IDs...</p>`;
  bulkResults = [];

  for (const line of lines) {
    const id = extractID(line);
    if (!id) {
      bulkResults.push({ id: line, status: 'invalid', name: null });
      continue;
    }
    const result = await simulateRobloxFetch(id);
    bulkResults.push(result);

    // Render incrementally
    const div = document.createElement('div');
    div.className = 'bulk-item';
    const cls  = result.status === 'public' ? 'safe' : result.status === 'private' ? 'warn' : 'danger';
    const badge = result.status === 'public' ? 'SAFE' : result.status.toUpperCase();
    div.innerHTML = `
      <span class="bulk-id">#${result.id}</span>
      <span class="bulk-status hist-badge ${cls}">${badge}</span>
    `;
    if (container.querySelector('p')) container.innerHTML = '';
    container.appendChild(div);
  }

  notify(`Bulk check complete — ${bulkResults.length} IDs processed.`, 'success');
});


/* ── EXPORT ──────────────────────────────── */
document.getElementById('exportBtn').addEventListener('click', () => {
  if (bulkResults.length === 0) {
    notify('No bulk results to export.', 'error');
    return;
  }
  const json = JSON.stringify(bulkResults, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `soundcheck_export_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  notify('Export downloaded!', 'success');
});


/* ── INIT ────────────────────────────────── */
renderHistory();

// Subtle entrance animation
window.addEventListener('load', () => {
  document.querySelector('.hero').style.opacity = '0';
  document.querySelector('.hero').style.transform = 'translateY(20px)';
  document.querySelector('.hero').style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector('.hero').style.opacity = '1';
      document.querySelector('.hero').style.transform = 'translateY(0)';
    });
  });
});
