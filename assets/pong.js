(() => {
  const WIN_SCORE = 1;
  const REDIRECT_URL = "https://nauticalhost.xyz/";

  const canvas = document.getElementById("pong");
  const ctx = canvas.getContext("2d");
  const main = document.querySelector("main");
  const scoreboard = document.querySelector(".scoreboard");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  const scorePlayerEl = document.getElementById("score-player");
  const scoreBotEl = document.getElementById("score-bot");

  const W = canvas.width;
  const H = canvas.height;
  const PADDLE_W = 12;
  const PADDLE_H = 90;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 7;
  const BOT_SPEED = 5.5;

  let running = false;
  let player, bot, ball, scores;

  function resetPositions() {
    player = { y: H / 2 - PADDLE_H / 2 };
    bot = { y: H / 2 - PADDLE_H / 2 };
    ball = {
      x: W / 2,
      y: H / 2,
      vx: Math.random() < 0.5 ? 5 : -5,
      vy: (Math.random() * 6) - 3,
    };
  }

  function resetMatch() {
    scores = { player: 0, bot: 0 };
    scorePlayerEl.textContent = "0";
    scoreBotEl.textContent = "0";
    resetPositions();
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

  function resizeCanvas() {
    const gap = parseFloat(getComputedStyle(main).gap) || 0;
    const availW = main.clientWidth;
    const availH = main.clientHeight - scoreboard.offsetHeight - gap;
    const scale = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * scale) + "px";
    canvas.style.height = Math.floor(H * scale) + "px";
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function updatePlayer() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= PADDLE_SPEED;
    if (keys["ArrowDown"] || keys["s"]) player.y += PADDLE_SPEED;
    player.y = Math.min(Math.max(player.y, 0), H - PADDLE_H);
  }

  function updateBot() {
    const target = ball.y - PADDLE_H / 2;
    if (bot.y < target) bot.y += Math.min(BOT_SPEED, target - bot.y);
    else if (bot.y > target) bot.y -= Math.min(BOT_SPEED, bot.y - target);
    bot.y = Math.min(Math.max(bot.y, 0), H - PADDLE_H);
  }

  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= H - BALL_SIZE) {
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
      ball.x >= W - PADDLE_W - BALL_SIZE &&
      ball.y + BALL_SIZE >= bot.y &&
      ball.y <= bot.y + PADDLE_H &&
      ball.vx > 0
    ) {
      ball.vx *= -1.05;
      ball.vy += (Math.random() * 4) - 2;
      ball.x = W - PADDLE_W - BALL_SIZE;
    }

    if (ball.x < 0) {
      scores.bot += 1;
      scoreBotEl.textContent = scores.bot;
      onPoint();
    } else if (ball.x > W) {
      scores.player += 1;
      scorePlayerEl.textContent = scores.player;
      onPoint();
    }
  }

  function onPoint() {
    if (scores.player >= WIN_SCORE) {
      endMatch(true);
    } else if (scores.bot >= WIN_SCORE) {
      endMatch(false);
    } else {
      resetPositions();
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
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#333";
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#eee";
    ctx.fillRect(0, player.y, PADDLE_W, PADDLE_H);
    ctx.fillRect(W - PADDLE_W, bot.y, PADDLE_W, PADDLE_H);

    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
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
    resetMatch();
    overlay.classList.add("hidden");
    running = true;
    requestAnimationFrame(loop);
  }

  overlayMessage.textContent = "Beat the bot.";
  resetMatch();
  draw();
})();
