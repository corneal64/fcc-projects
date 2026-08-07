const game = {
  count: 1,
  possibilities: ["red", "green", "yellow", "blue"],
  currentGame: [],
  playerInput: [],
  winMessages: [
    "Awesome!",
    "That's amazing!",
    "Keep going!",
    "You're doing great!",
    "Nice!",
    "Epic!",
    "Marvelous!",
    "Wonderful!",
    "Excellent!",
    "Fabulous!",
  ],
  sounds: {
    red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
    green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
    yellow: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
    blue: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
  },
  strict: false,
  sound: true,
  isPlaying: false, // true while the sequence is being shown
  isGameActive: false, // true when a game is in progress
  sequenceTimer: null,
};

const pads = document.querySelectorAll(".pad");
const startBtn = document.getElementById("btn1");
const strictBtn = document.getElementById("strictMode");
const soundBtn = document.getElementById("sound");
const volumeIcon = document.getElementById("volume");
const levelDisplay = document.getElementById("level");
const messageDisplay = document.getElementById("message");

// ---------- Event Listeners ----------

startBtn.addEventListener("click", () => {
  if (startBtn.classList.contains("started")) {
    stopGame();
  } else {
    startGame();
  }
});

strictBtn.addEventListener("click", () => {
  game.strict = !game.strict;
  strictBtn.textContent = game.strict ? "Strict Mode" : "Normal Mode";
  strictBtn.classList.toggle("active", game.strict);
});

soundBtn.addEventListener("click", () => {
  game.sound = !game.sound;
  soundBtn.classList.toggle("muted", !game.sound);
  if (game.sound) {
    volumeIcon.innerHTML =
      '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  } else {
    volumeIcon.innerHTML =
      '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }
});

pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    if (!game.isGameActive || game.isPlaying) return;
    handlePlayerInput(pad.dataset.color);
  });

  pad.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!game.isGameActive || game.isPlaying) return;
      handlePlayerInput(pad.dataset.color);
    }
  });
});

// ---------- Game Logic ----------

function handlePlayerInput(color) {
  // Ignore clicks beyond the current sequence length
  if (game.playerInput.length >= game.currentGame.length) return;

  lightUp(color);
  game.playerInput.push(color);

  const currentIndex = game.playerInput.length - 1;
  const isCorrect =
    game.playerInput[currentIndex] === game.currentGame[currentIndex];

  if (!isCorrect) {
    if (game.strict) {
      showMessage("Ouch!! Back to level 1", "error");
      setTimeout(() => startGame(), 1200);
    } else {
      showMessage("Oops... that's not correct. Try Again!", "error");
      game.playerInput = [];
      setTimeout(() => {
        showSequence(game.currentGame);
      }, 1000);
    }
    return;
  }

  // Correct so far
  if (game.playerInput.length === game.currentGame.length) {
    // Completed the full sequence
    game.count++;
    if (game.count > 20) {
      // Player won!
      gameWon();
    } else {
      showMessage(pickAWord() + " Next Level!", "success");
      setTimeout(() => {
        nextLevel();
      }, 1000);
    }
  }
}

function nextLevel() {
  generateMove();
  game.playerInput = [];
  showSequence(game.currentGame);
}

function generateMove() {
  game.currentGame.push(game.possibilities[Math.floor(Math.random() * 4)]);
}

function pickAWord() {
  return game.winMessages[Math.floor(Math.random() * game.winMessages.length)];
}

function startGame() {
  // Clear any pending sequence timer
  if (game.sequenceTimer) {
    clearTimeout(game.sequenceTimer);
    game.sequenceTimer = null;
  }

  game.count = 1;
  game.currentGame = [];
  game.playerInput = [];
  game.isGameActive = true;

  startBtn.classList.add("started");
  startBtn.textContent = "Restart";
  pads.forEach((pad) => pad.classList.remove("disabled"));

  generateMove();
  showSequence(game.currentGame);
}

function stopGame() {
  if (game.sequenceTimer) {
    clearTimeout(game.sequenceTimer);
    game.sequenceTimer = null;
  }

  game.count = 1;
  game.currentGame = [];
  game.playerInput = [];
  game.isGameActive = false;
  game.isPlaying = false;

  startBtn.classList.remove("started");
  startBtn.textContent = "Start";
  pads.forEach((pad) => pad.classList.add("disabled"));

  levelDisplay.textContent = "Level 1";
  showMessage("Press Start to play");
}

function gameWon() {
  game.isGameActive = false;
  pads.forEach((pad) => pad.classList.add("disabled"));
  showMessage("Congratulations! You Won!", "success");

  // Auto-restart after a delay
  setTimeout(() => {
    startGame();
  }, 3000);
}

function showSequence(moves) {
  game.isPlaying = true;
  pads.forEach((pad) => pad.classList.add("disabled"));

  levelDisplay.textContent = "Level " + game.count;

  let i = 0;
  const playNext = () => {
    if (i >= moves.length) {
      // Sequence finished, allow player input
      game.isPlaying = false;
      pads.forEach((pad) => pad.classList.remove("disabled"));
      return;
    }
    lightUp(moves[i]);
    i++;
    game.sequenceTimer = setTimeout(playNext, 800);
  };

  // Small delay before starting the sequence
  game.sequenceTimer = setTimeout(playNext, 500);
}

function lightUp(color) {
  const pad = document.getElementById(color);
  pad.classList.add("active");

  if (game.sound) {
    playSound(color);
  }

  setTimeout(() => {
    pad.classList.remove("active");
  }, 400);
}

function playSound(color) {
  // Reset audio to allow rapid replay
  const audio = game.sounds[color];
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore autoplay errors
  });
}

function showMessage(text, type) {
  messageDisplay.textContent = text;
  messageDisplay.classList.remove("error", "success");
  if (type) {
    messageDisplay.classList.add(type);
  }
}
