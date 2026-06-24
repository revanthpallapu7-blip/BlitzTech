(function () {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const canvas = document.querySelector("[data-uv-canvas]");
  const form = document.querySelector("[data-lead-form]");
  const formStatus = document.querySelector("[data-form-status]");

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (navToggle && nav && header) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      header.classList.toggle("nav-active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLAnchorElement)) return;

      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      header.classList.remove("nav-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  if (form && formStatus) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const company = String(data.get("company") || "").trim();
      const campaign = String(data.get("campaign") || "").trim();

      if (!name || !company || !campaign) {
        formStatus.textContent = "Please complete the required fields.";
        return;
      }

      formStatus.textContent = "Thanks. Your proposal request is ready for the BlitzTech team.";
      form.reset();
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let points = [];
  let frameId = 0;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const columns = width < 760 ? 5 : 8;
    const rows = width < 760 ? 4 : 5;
    points = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        points.push({
          x: (x / Math.max(columns - 1, 1)) * width,
          y: (y / Math.max(rows - 1, 1)) * height,
          phase: Math.random() * Math.PI * 2,
          drift: 10 + Math.random() * 20,
        });
      }
    }
  }

  function draw(now) {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    const time = now * 0.00055;

    points.forEach((point, index) => {
      const pulse = Math.sin(time + point.phase);
      const x = point.x + Math.cos(time * 0.9 + point.phase) * point.drift;
      const y = point.y + pulse * point.drift;

      for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
        const next = points[nextIndex];
        const nextX = next.x + Math.cos(time * 0.9 + next.phase) * next.drift;
        const nextY = next.y + Math.sin(time + next.phase) * next.drift;
        const distance = Math.hypot(nextX - x, nextY - y);

        if (distance < 260) {
          const opacity = (1 - distance / 260) * 0.24;
          const gradient = context.createLinearGradient(x, y, nextX, nextY);
          gradient.addColorStop(0, `rgba(32, 229, 255, ${opacity})`);
          gradient.addColorStop(0.55, `rgba(141, 92, 255, ${opacity * 0.82})`);
          gradient.addColorStop(1, `rgba(184, 255, 77, ${opacity * 0.72})`);
          context.strokeStyle = gradient;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(nextX, nextY);
          context.stroke();
        }
      }

      context.fillStyle = `rgba(32, 229, 255, ${0.2 + Math.max(pulse, 0) * 0.22})`;
      context.beginPath();
      context.arc(x, y, 1.8, 0, Math.PI * 2);
      context.fill();
    });

    frameId = window.requestAnimationFrame(draw);
  }

  resizeCanvas();
  frameId = window.requestAnimationFrame(draw);

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(frameId);
    resizeCanvas();
    frameId = window.requestAnimationFrame(draw);
  });
})();
