/* Общий лайтбокс для всех страниц сайта.
   Собирает все контентные фото (галерея работ, фото студии, фото обучения)
   и открывает их на весь экран с листанием, свайпом и клавиатурой. */
(function () {
  "use strict";

  var SELECTOR = [
    "#galleryGrid img",              // страница «Работы»
    "#about .about-photo",           // «О студии» — крупное фото
    "#about .about-collage img",     // «О студии» — два маленьких
    "#training .edu-photo img",      // тизер обучения на главной
    ".training-visual img",          // страница «Обучение» — крупное
    ".train-shots img"               // страница «Обучение» — лента
  ].join(",");

  var shots = [].slice.call(document.querySelectorAll(SELECTOR));
  if (!shots.length) return;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // разметка: переиспользуем существующую или создаём
  var lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.id = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Просмотр фото");
    lb.innerHTML =
      '<button class="lb-btn lb-close" id="lbClose" aria-label="Закрыть">✕</button>' +
      '<button class="lb-btn lb-prev" id="lbPrev" aria-label="Предыдущее">‹</button>' +
      '<img id="lbImg" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">' +
      '<button class="lb-btn lb-next" id="lbNext" aria-label="Следующее">›</button>' +
      '<div class="lb-count" id="lbCount"></div>';
    document.body.appendChild(lb);
  }

  var lbImg = document.getElementById("lbImg");
  var lbCount = document.getElementById("lbCount");
  var idx = 0;
  var lastFocus = null;

  function show(i) {
    idx = (i + shots.length) % shots.length;
    var im = shots[idx];
    lbImg.src = im.currentSrc || im.src;
    lbImg.alt = im.alt || "";
    lbCount.textContent = idx + 1 + " / " + shots.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    var c = document.getElementById("lbClose");
    if (c) c.focus();
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  shots.forEach(function (im, i) {
    // кликаем по обёртке, если она есть (карточка), иначе по самой картинке
    var target = im.closest("figure") || im.closest(".ph") || im.closest(".about-visual") || im;
    target.style.cursor = "pointer";
    if (!target.hasAttribute("data-hover")) target.setAttribute("data-hover", "");
    target.addEventListener("click", function () { open(i); });
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", "Открыть фото" + (im.alt ? ": " + im.alt : ""));
    target.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });

  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
  });

  var sx = 0;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
