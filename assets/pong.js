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

  // Game-space constants. GAME_W is the axis the ball travels between the
  // two paddles; GAME_H is the axis the paddles move along. These never
  // change with screen orientation -- only how they're mapped onto the
  // canvas (see `vertical` below) does.
  const GAME_W = 800;
  const GAME_H = 500;
  const PADDLE_W = 12;
  const PADDLE_H = 90;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 8;

  // True when the court is drawn portrait-style: player paddle at the
  // bottom, bot at the top, both moving left/right. Decided purely by
  // available space in resizeCanvas(), not by a fixed breakpoint, so it
  // follows the device whichever way it's held.
  let vertical = false;
  let dpr = window.devicePixelRatio || 1;

  function renderInputMode() {
    if (isTouch) {
      instructions.innerHTML = "Move: &nbsp;drag on the board<br>Start: touch the board";
    } else if (vertical) {
      instructions.innerHTML = "Move: &nbsp;&larr;/&rarr;&nbsp; or A/D<br>Start: SPACE";
    } else {
      instructions.innerHTML = "Move: &nbsp;&uarr;/&darr;&nbsp; or W/S<br>Start: SPACE";
    }
    inputToggle.textContent = isTouch ? "Switch to keyboard" : "Switch to touch";
  }

  inputToggle.addEventListener("click", () => {
    isTouch = !isTouch;
    renderInputMode();
  });

  let running = false;
  let player, bot, ball, rallyHits;

  function resetPositions() {
    player = { y: GAME_H / 2 - PADDLE_H / 2 };
    bot = { y: GAME_H / 2 - PADDLE_H / 2 };
    ball = {
      x: GAME_W / 2,
      y: GAME_H / 2,
      vx: Math.random() < 0.5 ? 6 : -6,
      vy: (Math.random() * 6) - 3,
    };
    rallyHits = 0; // paddle returns so far this point; drives the ramp below
  }
  resetPositions();

  // ---------------------------------------------------------------------
  // Bot difficulty. The bot's reaction speed is the only thing standing
  // between a visitor and the redirect, so it's worth choosing on purpose
  // rather than inheriting whatever constant felt right for a mouse.
  //
  // On a phone, dragging a thumb across the screen is faster and more
  // precise than tapping arrow keys ever was, so the same BOT_SPEED that
  // makes the keyboard game fair can make the touch/portrait game close to
  // automatic. Default policy: touch starts a notch *easier* than keyboard
  // (so the first return feels winnable even though the drag is precise),
  // then both ramp up with the rally so a long touch exchange still ends
  // in a real contest instead of a free point.
  //
  // `touch` is true when the player is dragging instead of using keys;
  // `rallyHits` is how many times either paddle has already returned the
  // ball this point (0 on serve).
  // ---------------------------------------------------------------------
  const RAMP_PER_HIT = 0.5;
  function botSpeedFor(touch, rallyHits) {
    const base = touch ? 4.5 : 5.5;
    const cap = touch ? 7.5 : 6.5;
    return Math.min(base + rallyHits * RAMP_PER_HIT, cap);
  }

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
    if (vertical) {
      const scaleX = GAME_H / rect.width;
      touchPos = (touch.clientX - rect.left) * scaleX - PADDLE_H / 2;
    } else {
      const scaleY = GAME_H / rect.height;
      touchPos = (touch.clientY - rect.top) * scaleY - PADDLE_H / 2;
    }
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
    vertical = availH > availW;

    const logicalW = vertical ? GAME_H : GAME_W;
    const logicalH = vertical ? GAME_W : GAME_H;
    const scale = Math.min(availW / logicalW, availH / logicalH);
    canvas.style.width = Math.floor(logicalW * scale) + "px";
    canvas.style.height = Math.floor(logicalH * scale) + "px";

    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);

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
      const negKey = vertical ? (keys["ArrowLeft"] || keys["a"]) : (keys["ArrowUp"] || keys["w"]);
      const posKey = vertical ? (keys["ArrowRight"] || keys["d"]) : (keys["ArrowDown"] || keys["s"]);
      if (negKey) player.y -= PADDLE_SPEED;
      if (posKey) player.y += PADDLE_SPEED;
    }
    player.y = Math.min(Math.max(player.y, 0), GAME_H - PADDLE_H);
  }

  function updateBot() {
    const speed = botSpeedFor(isTouch, rallyHits);
    const target = ball.y - PADDLE_H / 2;
    if (bot.y < target) bot.y += Math.min(speed, target - bot.y);
    else if (bot.y > target) bot.y -= Math.min(speed, bot.y - target);
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
      rallyHits += 1;
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
      overlayMessage.textContent = "The bot wins. Press SPACE to try again.";
    }
  }

  function draw() {
    ctx.save();
    ctx.scale(dpr, dpr);
    if (vertical) {
      // Player paddle (game x=0) ends up at the screen bottom, bot
      // (game x=GAME_W) at the top; the across-axis (game y) maps
      // directly to screen x. The drawing code below is untouched --
      // it always draws in game space.
      ctx.translate(0, GAME_W);
      ctx.rotate(-Math.PI / 2);
    }

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
