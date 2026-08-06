// ===== Pomodoro Clock =====
// Reliable, drift-free timer using timestamp-based calculations.

(function () {
  "use strict";

  // ---- DOM Elements ----
  var timerDisplay = document.getElementById("timerDisplay");
  var timerStatus = document.getElementById("timerStatus");
  var sessionLabel = document.getElementById("sessionLabel");
  var progressRing = document.getElementById("progressRing");
  var timerCard = document.querySelector(".timer-card");
  var startBtn = document.getElementById("startBtn");
  var startIcon = document.getElementById("startIcon");
  var startLabel = document.getElementById("startLabel");
  var resetBtn = document.getElementById("resetBtn");
  var workTab = document.getElementById("workTab");
  var breakTab = document.getElementById("breakTab");
  var workPlus = document.getElementById("workPlus");
  var workMinus = document.getElementById("workMinus");
  var breakPlus = document.getElementById("breakPlus");
  var breakMinus = document.getElementById("breakMinus");
  var workValue = document.getElementById("workValue");
  var breakValue = document.getElementById("breakValue");
  var cycleCount = document.getElementById("cycleCount");

  // ---- Constants ----
  var MIN_LENGTH = 1; // minutes
  var MAX_LENGTH = 60; // minutes
  var RING_CIRCUMFERENCE = 2 * Math.PI * 130; // r = 130

  // ---- State ----
  var workLength = 25; // minutes
  var breakLength = 5; // minutes
  var mode = "work"; // "work" | "break"
  var isRunning = false;
  var isPaused = false;
  var totalSeconds = workLength * 60;
  var remainingSeconds = totalSeconds;
  var completedCycles = 0;
  var endTime = null; // timestamp when the current session ends
  var timerId = null;

  // ---- Audio (Web Audio API chime) ----
  var audioCtx = null;

  // Creates/resumes the AudioContext within a user gesture so the
  // completion chime reliably plays later.
  function initAudio() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    } catch (e) {
      // Audio not available; silently ignore.
    }
  }

  function playChime() {
    initAudio();
    try {
      if (!audioCtx) return;
      var now = audioCtx.currentTime;
      var notes = [880, 1174.66]; // A5, D6

      notes.forEach(function (freq, index) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + index * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.4, now + index * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + index * 0.18 + 0.5,
        );
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + index * 0.18);
        osc.stop(now + index * 0.18 + 0.55);
      });
    } catch (e) {
      // Audio not available; silently ignore.
    }
  }

  // ---- Helpers ----
  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }

  function updateRing() {
    var progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    var offset = RING_CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    updateRing();
  }

  function updateSettingsUI() {
    workValue.textContent = workLength;
    breakValue.textContent = breakLength;
    workMinus.disabled = workLength <= MIN_LENGTH;
    workPlus.disabled = workLength >= MAX_LENGTH;
    breakMinus.disabled = breakLength <= MIN_LENGTH;
    breakPlus.disabled = breakLength >= MAX_LENGTH;
  }

  function updateCycleUI() {
    cycleCount.textContent =
      completedCycles === 1
        ? "1 completed cycle"
        : completedCycles + " completed cycles";
  }

  function setMode(newMode) {
    mode = newMode;
    var isWork = mode === "work";

    timerCard.classList.toggle("break-mode", !isWork);
    workTab.classList.toggle("active", isWork);
    breakTab.classList.toggle("active", !isWork);

    totalSeconds = (isWork ? workLength : breakLength) * 60;
    remainingSeconds = totalSeconds;

    sessionLabel.textContent = isWork ? "Work Session" : "Break Session";
    timerStatus.textContent = isRunning ? "Running" : "Ready";

    updateDisplay();
  }

  function setRunning(running) {
    isRunning = running;
    isPaused = false;
    timerStatus.textContent = running ? "Running" : "Ready";
    startIcon.innerHTML = running ? "&#10074;&#10074;" : "&#9654;";
    startLabel.textContent = running ? "Pause" : "Start";
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    endTime = Date.now() + remainingSeconds * 1000;
    timerId = setInterval(tick, 250);
  }

  function tick() {
    var now = Date.now();
    var remainingMs = endTime - now;

    if (remainingMs <= 0) {
      remainingSeconds = 0;
      updateDisplay();
      stopTimer();
      onSessionComplete();
      return;
    }

    var newRemaining = Math.ceil(remainingMs / 1000);
    if (newRemaining !== remainingSeconds) {
      remainingSeconds = newRemaining;
      updateDisplay();
    }
  }

  function onSessionComplete() {
    playChime();

    if (mode === "work") {
      completedCycles += 1;
      updateCycleUI();
      setMode("break");
    } else {
      setMode("work");
    }

    // Keep running automatically into the next session.
    setRunning(true);
    startTimer();
  }

  // ---- Event Handlers ----
  function handleStart() {
    initAudio(); // unlock audio on user gesture
    if (isRunning) {
      // Pause
      stopTimer();
      isRunning = false;
      isPaused = true;
      timerStatus.textContent = "Paused";
      startIcon.innerHTML = "&#9654;";
      startLabel.textContent = "Resume";
    } else {
      // Start or resume
      if (isPaused) {
        // Resume from where we left off
      } else if (remainingSeconds === 0) {
        // Edge case: timer finished while paused; restart current session
        remainingSeconds = totalSeconds;
        updateDisplay();
      }
      setRunning(true);
      startTimer();
    }
  }

  function handleReset() {
    stopTimer();
    isRunning = false;
    isPaused = false;
    completedCycles = 0;
    updateCycleUI();
    setMode("work");
    setRunning(false);
  }

  function adjustWork(delta) {
    var newValue = workLength + delta;
    if (newValue < MIN_LENGTH || newValue > MAX_LENGTH) return;
    workLength = newValue;
    updateSettingsUI();

    if (!isRunning && !isPaused && mode === "work") {
      totalSeconds = workLength * 60;
      remainingSeconds = totalSeconds;
      updateDisplay();
    }
  }

  function adjustBreak(delta) {
    var newValue = breakLength + delta;
    if (newValue < MIN_LENGTH || newValue > MAX_LENGTH) return;
    breakLength = newValue;
    updateSettingsUI();

    if (!isRunning && !isPaused && mode === "break") {
      totalSeconds = breakLength * 60;
      remainingSeconds = totalSeconds;
      updateDisplay();
    }
  }

  // ---- Wire up events ----
  startBtn.addEventListener("click", handleStart);
  resetBtn.addEventListener("click", handleReset);

  workTab.addEventListener("click", function () {
    if (mode === "work") return;
    stopTimer();
    isRunning = false;
    isPaused = false;
    setMode("work");
    setRunning(false);
  });

  breakTab.addEventListener("click", function () {
    if (mode === "break") return;
    stopTimer();
    isRunning = false;
    isPaused = false;
    setMode("break");
    setRunning(false);
  });

  workPlus.addEventListener("click", function () {
    adjustWork(1);
  });

  workMinus.addEventListener("click", function () {
    adjustWork(-1);
  });

  breakPlus.addEventListener("click", function () {
    adjustBreak(1);
  });

  breakMinus.addEventListener("click", function () {
    adjustBreak(-1);
  });

  // ---- Init ----
  progressRing.style.strokeDasharray = RING_CIRCUMFERENCE;
  updateSettingsUI();
  updateCycleUI();
  setMode("work");
  setRunning(false);
})();
