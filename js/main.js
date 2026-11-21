// 송도 국제대학교 입시 정리 — 공통 스크립트 (로그인/주문/결제 기능 없음)
(function () {
  "use strict";

  // 저장소 접근은 실패할 수 있으므로 항상 try/catch
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* 무시 */ } }

  // ----- 다크/라이트 테마 -----
  var root = document.documentElement;
  var savedTheme = load("igc-theme");
  if (savedTheme === "dark" || savedTheme === "light") root.setAttribute("data-theme", savedTheme);
  var themeBtn = document.getElementById("theme-toggle");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeIcon() { if (themeBtn) themeBtn.textContent = isDark() ? "☀️" : "🌙"; }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save("igc-theme", next);
      syncThemeIcon();
    });
  }
  syncThemeIcon();

  // ----- 모바일 메뉴 -----
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ----- 목차(TOC) 자동 생성 + 현재 위치 표시 -----
  var content = document.querySelector(".md");
  var tocList = document.getElementById("toc-list");
  if (content && tocList) {
    var heads = content.querySelectorAll("h2, h3");
    var links = [];
    heads.forEach(function (h) {
      var li = document.createElement("li");
      li.className = h.tagName === "H3" ? "lv3" : "lv2";
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
      links.push({ el: h, a: a });
    });
    if ("IntersectionObserver" in window && links.length) {
      var current = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (current) current.classList.remove("active");
            var hit = links.find(function (l) { return l.el === en.target; });
            if (hit) { current = hit.a; current.classList.add("active"); }
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      links.forEach(function (l) { io.observe(l.el); });
    }
  }

  // ----- 체크리스트 상태 저장 (이 브라우저에만 저장됨) -----
  var page = document.body.getAttribute("data-page") || "page";
  document.querySelectorAll(".md ul.checklist input[type=checkbox]").forEach(function (cb, i) {
    var key = "igc-check-" + page + "-" + i;
    var stored = load(key);
    if (stored === "1") cb.checked = true;
    if (stored === "0") cb.checked = false;
    var li = cb.closest("li");
    function sync() { if (li) li.classList.toggle("done", cb.checked); }
    sync();
    cb.addEventListener("change", function () { save(key, cb.checked ? "1" : "0"); sync(); });
  });

  // ----- D-day 표시 (data-date="YYYY-MM-DD") -----
  var today = new Date(); today.setHours(0, 0, 0, 0);
  document.querySelectorAll("[data-date]").forEach(function (el) {
    var d = new Date(el.getAttribute("data-date") + "T00:00:00");
    var diff = Math.round((d - today) / 86400000);
    var li = el.closest("li");
    var tag = document.createElement("span");
    tag.className = "badge";
    if (diff < 0) { tag.textContent = "지남"; if (li) li.classList.add("past"); }
    else if (diff === 0) { tag.textContent = "D-DAY"; tag.className = "badge bad"; }
    else { tag.textContent = "D-" + diff; tag.className = diff <= 14 ? "badge bad" : "badge warn"; }
    el.appendChild(document.createTextNode(" "));
    el.appendChild(tag);
  });

  // ----- 맨 위로 버튼 -----
  var topBtn = document.getElementById("to-top");
  if (topBtn) {
    window.addEventListener("scroll", function () {
      topBtn.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }
})();
