(() => {
  const REDIRECT_URL = "https://nauticalhost.xyz/";

  const canvas = document.getElementById("pong");
  const ctx = canvas.getContext("2d");
  const main = document.querySelector("main");
  const topbar = document.querySelector(".topbar");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  const instructions = document.getElementById("instructions");
  const inputToggle = document.getElementById("input-toggle");

  let isTouch = window.matchMedia("(pointer: coarse)").matches;

  const GAME_W = 800;
  const GAME_H = 500;
  const PADDLE_W = 12;
  const PADDLE_H = 90;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 8;
  const BOT_SPEED = 5.5;

  let dpr = window.devicePixelRatio || 1;

  function renderInputMode() {
    instructions.innerHTML = isTouch
      ? "Move: &nbsp;drag on the board<br>Start: touch the board"
      : "Move: &nbsp;&uarr;/&darr;&nbsp; or W/S<br>Start: SPACE";
    inputToggle.textContent = isTouch ? "Switch to keyboard" : "Switch to touch";
  }

  inputToggle.addEventListener("click", () => {
    isTouch = !isTouch;
    renderInputMode();
  });

  let running = false;
  let player, bot, ball;

  function resetPositions() {
    player = { y: GAME_H / 2 - PADDLE_H / 2 };
    bot = { y: GAME_H / 2 - PADDLE_H / 2 };
    ball = {
      x: GAME_W / 2,
      y: GAME_H / 2,
      vx: Math.random() < 0.5 ? 6 : -6,
      vy: (Math.random() * 6) - 3,
    };
  }
  resetPositions();

  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " ") {
      e.preventDefault();
      if (!running) startMatch();
    }
  });
  window.addEventListener("keyup", (e) => { keys[e.key] = false; });

  let touchPos = null;
  function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleY = GAME_H / rect.height;
    touchPos = (touch.clientY - rect.top) * scaleY - PADDLE_H / 2;
  }
  function handleTouchStart(e) {
    if (e.target === inputToggle) return;
    if (!running) startMatch();
    handleTouch(e);
  }
  main.addEventListener("touchstart", handleTouchStart, { passive: false });
  main.addEventListener("touchmove", handleTouch, { passive: false });
  main.addEventListener("touchend", () => { touchPos = null; });

  function resizeCanvas() {
    const gap = parseFloat(getComputedStyle(main).gap) || 0;
    const availW = main.clientWidth;
    const availH = main.clientHeight - topbar.getBoundingClientRect().height - gap;

    const scale = Math.min(availW / GAME_W, availH / GAME_H);
    canvas.style.width = Math.floor(GAME_W * scale) + "px";
    canvas.style.height = Math.floor(GAME_H * scale) + "px";
    topbar.style.width = canvas.style.width;

    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(GAME_W * dpr);
    canvas.height = Math.round(GAME_H * dpr);

    renderInputMode();
    draw(); // changing canvas.width/height clears it, so redraw now
  }
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resizeCanvas);
  }
  resizeCanvas();

  function updatePlayer() {
    if (touchPos !== null) {
      player.y = touchPos;
    } else {
      if (keys["ArrowUp"] || keys["w"]) player.y -= PADDLE_SPEED;
      if (keys["ArrowDown"] || keys["s"]) player.y += PADDLE_SPEED;
    }
    player.y = Math.min(Math.max(player.y, 0), GAME_H - PADDLE_H);
  }

  function updateBot() {
    const target = ball.y - PADDLE_H / 2;
    if (bot.y < target) bot.y += Math.min(BOT_SPEED, target - bot.y);
    else if (bot.y > target) bot.y -= Math.min(BOT_SPEED, bot.y - target);
    bot.y = Math.min(Math.max(bot.y, 0), GAME_H - PADDLE_H);
  }

  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= GAME_H - BALL_SIZE) {
      ball.vy *= -1;
    }

    // player paddle on left, bot paddle on right
    if (
      ball.x <= PADDLE_W &&
      ball.y + BALL_SIZE >= player.y &&
      ball.y <= player.y + PADDLE_H &&
      ball.vx < 0
    ) {
      ball.vx *= -1.05;
      ball.vy += (Math.random() * 4) - 2;
      ball.x = PADDLE_W;
    }

    if (
      ball.x >= GAME_W - PADDLE_W - BALL_SIZE &&
      ball.y + BALL_SIZE >= bot.y &&
      ball.y <= bot.y + PADDLE_H &&
      ball.vx > 0
    ) {
      ball.vx *= -1.05;
      ball.vy += (Math.random() * 4) - 2;
      ball.x = GAME_W - PADDLE_W - BALL_SIZE;
    }

    if (ball.x < 0) {
      endMatch(false);
    } else if (ball.x > GAME_W) {
      endMatch(true);
    }
  }

  function endMatch(won) {
    running = false;
    overlay.classList.remove("hidden");
    if (won) {
      overlayMessage.textContent = "You beat the bot! Redirecting you to nauticalhost.xyz...";
      setTimeout(() => { window.location.href = REDIRECT_URL; }, 2000);
    } else {
      overlayMessage.textContent = "The bot wins.";
    }
  }

  function draw() {
    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.strokeStyle = "#333";
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(GAME_W / 2, 0);
    ctx.lineTo(GAME_W / 2, GAME_H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#eee";
    ctx.fillRect(0, player.y, PADDLE_W, PADDLE_H);
    ctx.fillRect(GAME_W - PADDLE_W, bot.y, PADDLE_W, PADDLE_H);

    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    ctx.restore();
  }

  function loop() {
    if (!running) return;
    updatePlayer();
    updateBot();
    updateBall();
    draw();
    requestAnimationFrame(loop);
  }

  function startMatch() {
    resetPositions();
    overlay.classList.add("hidden");
    running = true;
    requestAnimationFrame(loop);
  }

  overlayMessage.textContent = "Beat the bot.";
  draw();
})();
