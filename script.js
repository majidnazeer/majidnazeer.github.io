(function () {
  "use strict";

  /* =======================================================
     THEME
     ======================================================= */

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("mn-theme", theme); } catch (e) { /* ignore */ }
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme() === "light" ? "dark" : "light");
    });
    applyTheme(currentTheme());
  }

  /* External http(s) links open in a new tab; leave internal/mailto alone. */
  function enhanceExternalLinks(scope) {
    var rootEl = scope && scope.querySelectorAll ? scope : document;
    var links = rootEl.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) continue;
      a.setAttribute("target", "_blank");
      var rel = (a.getAttribute("rel") || "").trim();
      if (rel.indexOf("noopener") === -1) rel = (rel + " noopener").trim();
      if (rel.indexOf("noreferrer") === -1) rel = (rel + " noreferrer").trim();
      a.setAttribute("rel", rel);
    }
  }

  /* =======================================================
     FOOTER YEAR
     ======================================================= */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =======================================================
     NAVIGATION
     ======================================================= */

  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  var navLinks = siteNav
    ? Array.prototype.slice.call(siteNav.querySelectorAll("a"))
    : [];
  var sections = Array.prototype.slice.call(document.querySelectorAll(".sec[id]"));
  var page = document.body.getAttribute("data-page") || "home";

  /* =======================================================
     PROFILE SIDEBAR (Discovery-style, every page)
     ======================================================= */

  function injectProfileSidebar() {
    var mount = document.getElementById("profileSidebar");
    if (!mount) return;

    mount.innerHTML =
      '<div class="profile-sidebar__card">' +
        '<figure class="profile-sidebar__photo">' +
          '<img src="assets/majid-nazeer-2026.jpg" alt="Portrait of Dr Majid Nazeer" width="280" height="280" loading="eager">' +
        '</figure>' +
        '<p class="profile-sidebar__eyebrow">Research Assistant Professor</p>' +
        '<h2 class="profile-sidebar__name">Majid Nazeer</h2>' +
        '<hr class="profile-sidebar__divider">' +
        '<ul class="profile-sidebar__list">' +
          '<li class="profile-sidebar__item">' +
            '<span class="profile-sidebar__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><text x="12" y="15.4" text-anchor="middle" font-size="8.5" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="var(--surface)">iD</text></svg>' +
            '</span>' +
            '<span class="profile-sidebar__item-body">' +
              '<span class="profile-sidebar__label">ORCID</span>' +
              '<a href="https://orcid.org/0000-0002-7631-1599" target="_blank" rel="noopener noreferrer">0000-0002-7631-1599</a>' +
            '</span>' +
          '</li>' +
          '<li class="profile-sidebar__item">' +
            '<span class="profile-sidebar__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>' +
            '</span>' +
            '<span class="profile-sidebar__item-body">' +
              '<span class="profile-sidebar__label">Email</span>' +
              '<a href="mailto:majid.nazeer@connect.polyu.hk">majid.nazeer@connect.polyu.hk</a>' +
            '</span>' +
          '</li>' +
          '<li class="profile-sidebar__item">' +
            '<span class="profile-sidebar__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2 4.2 9h2.6v.2c0 1.55 2.3 2.85 5.2 2.85s5.2-1.3 5.2-2.85V9h2.6L12 3.2zm0 10.1c-2.45 0-4.55-.75-5.5-1.85v2.35c0 1.55 2.45 2.85 5.5 2.85s5.5-1.3 5.5-2.85v-2.35c-.95 1.1-3.05 1.85-5.5 1.85z"/></svg>' +
            '</span>' +
            '<span class="profile-sidebar__item-body">' +
              '<a href="https://scholar.google.com.hk/citations?user=uDGLThoAAAAJ" target="_blank" rel="noopener noreferrer">Google Scholar</a>' +
            '</span>' +
          '</li>' +
          '<li class="profile-sidebar__item">' +
            '<span class="profile-sidebar__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="7.5" r="2.2"/><circle cx="7.2" cy="15.5" r="2.2"/><circle cx="16.8" cy="15.5" r="2.2"/><path d="M10.2 9.2 8.5 13.5M13.8 9.2l1.7 4.3M9.4 15.5h5.2"/></svg>' +
            '</span>' +
            '<span class="profile-sidebar__item-body">' +
              '<a href="https://www.webofscience.com/wos/author/record/631583" target="_blank" rel="noopener noreferrer">Web of Science</a>' +
            '</span>' +
          '</li>' +
          '<li class="profile-sidebar__item">' +
            '<span class="profile-sidebar__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z"/></svg>' +
            '</span>' +
            '<span class="profile-sidebar__item-body">' +
              '<a href="https://www.linkedin.com/in/majid-nazeer-29897914" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
            '</span>' +
          '</li>' +
        '</ul>' +
      '</div>';
  }

  injectProfileSidebar();
  enhanceExternalLinks();

  /* =======================================================
     CITATION METRICS - Google Scholar "All" column (not Since 2021)
     Scholar has no public API; figures live in data.js and are shown as-is.
     ======================================================= */

  function loadLiveMetrics() {
    var cit = document.getElementById("statCitations");
    var h = document.getElementById("statHIndex");
    var i10 = document.getElementById("statI10");
    if (!cit || !h || !i10) return;

    var m = typeof SCHOLAR_METRICS !== "undefined" ? SCHOLAR_METRICS : null;
    if (m && m.citations != null) {
      cit.textContent = Number(m.citations).toLocaleString("en-US");
    } else {
      cit.textContent = cit.getAttribute("data-fallback") || cit.textContent;
    }
    if (m && m.hIndex != null) {
      h.textContent = String(m.hIndex);
    } else {
      h.textContent = h.getAttribute("data-fallback") || "27";
    }
    if (m && m.i10Index != null) {
      i10.textContent = String(m.i10Index);
    } else {
      i10.textContent = i10.getAttribute("data-fallback") || "42";
    }
  }

  if (page === "home") loadLiveMetrics();

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Scrollspy - home page sections only */
  if (page === "home" && sections.length && navLinks.length) {
    var hashLinks = navLinks.filter(function (a) {
      return a.getAttribute("href").charAt(0) === "#";
    });
    var activeId = "";

    function setActive(id) {
      if (!id || id === activeId) return;
      activeId = id;
      hashLinks.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
      });
    }

    function updateNav() {
      var vh = window.innerHeight;
      var y = window.scrollY || window.pageYOffset;
      var docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );

      if (y + vh >= docH - 80) {
        setActive(sections[sections.length - 1].id);
        return;
      }

      var mark = vh * 0.35;
      var current = sections[0].id;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= mark) {
          current = sections[i].id;
        }
      }
      setActive(current);
    }

    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    updateNav();
  }

  /* =======================================================
     PUBLICATIONS (outputs page)
     ======================================================= */

  function stripTags(s) { return s.replace(/<[^>]+>/g, ""); }

  var pubTypeFilter = "all";
  var typeLabels = {
    journal: "Journal",
    chapter: "Book chapter",
    conference: "Conference"
  };

  /* Surnames / tokens for supervised students (known student first authors). */
  var STUDENT_TOKENS = [
    "sattar", "mahmood", "umar", "zohaib", "amin", "adeniran",
    "ahsan", "qureshi", "waqas", "raza", "kwok", "borsah",
    "iqbal", "hafeez", "choi", "awais", "kanwal", "javed", "inam"
  ];

  function nazeerIsFirstAuthor(authors) {
    var first = stripTags(authors || "").split(",")[0].trim();
    return /^Nazeer\b/i.test(first);
  }

  function nazeerAuthorIndex(authors) {
    var parts = stripTags(authors || "").split(",");
    for (var i = 0; i < parts.length; i++) {
      if (/Nazeer/i.test(parts[i])) return i;
    }
    return -1;
  }

  function firstAuthorIsStudent(authors) {
    var first = stripTags(authors || "").split(",")[0].trim().toLowerCase();
    return STUDENT_TOKENS.some(function (tok) {
      return first.indexOf(tok) !== -1;
    });
  }

  function pubRoleList(p) {
    var roles = [];
    var explicit = Array.isArray(p.roles) ? p.roles.slice() : [];
    var kind = p.type || "journal";
    var isFirst = nazeerIsFirstAuthor(p.authors);
    var isStudentWork = firstAuthorIsStudent(p.authors) && !isFirst;
    var nazeerIdx = nazeerAuthorIndex(p.authors);

    function has(role) {
      return explicit.indexOf(role) !== -1;
    }

    /* Conference: Speaker only (Dataset/Code are separate resource badges). */
    if (kind === "conference") {
      if (has("speaker") || p.speaker === true || isFirst) {
        roles.push("speaker");
      }
      return roles.filter(function (r, i) { return roles.indexOf(r) === i; });
    }

    if (has("first-author") || p.firstAuthor === true || isFirst) {
      roles.push("first-author");
    }

    if (
      has("corresponding") ||
      p.corresponding === true ||
      isFirst ||
      (isStudentWork && nazeerIdx === 1)
    ) {
      roles.push("corresponding");
    }

    return roles.filter(function (r, i) { return roles.indexOf(r) === i; });
  }

  var roleLabels = {
    "first-author": "First author",
    corresponding: "Corresponding author",
    speaker: "Speaker"
  };

  function roleBadgesHtml(roles) {
    if (!roles.length) return "";
    return roles.map(function (r) {
      return '<span class="pub__role pub__role--' + r + '">' + (roleLabels[r] || r) + "</span>";
    }).join("");
  }

  function resourceLinkBadgesHtml(p) {
    var bits = [];
    if (p.code) {
      bits.push(
        '<a class="pub__role pub__role--code" href="data-code.html#codes">Code</a>'
      );
    }
    if (p.dataset) {
      bits.push(
        '<a class="pub__role pub__role--dataset" href="data-code.html#datasets">Dataset</a>'
      );
    }
    if (p.viz) {
      bits.push(
        '<a class="pub__role pub__role--viz" href="data-code.html#datasets">Data visualization</a>'
      );
    }
    return bits.join("");
  }

  function pubDateKey(value) {
    var d = String(value || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    if (/^\d{4}-\d{2}$/.test(d)) return d + "-01";
    if (/^\d{4}$/.test(d)) return d + "-01-01";
    return "";
  }

  function renderPubs() {
    var listEl = document.getElementById("pubList");
    var countEl = document.getElementById("pubCount");
    var emptyEl = document.getElementById("pubEmpty");
    var searchEl = document.getElementById("pubSearch");
    if (!listEl || typeof PUBLICATIONS === "undefined") return;

    var q = searchEl ? searchEl.value.trim().toLowerCase() : "";
    var shown = PUBLICATIONS.filter(function (p) {
      var t = p.type || "journal";
      if (pubTypeFilter !== "all" && t !== pubTypeFilter) return false;
      if (!q) return true;
      var roles = pubRoleList(p);
      var roleText = roles.concat(roles.map(function (r) { return roleLabels[r] || ""; })).join(" ");
      var hay = (p.title + " " + stripTags(p.authors) + " " + stripTags(p.venue || "") + " " + (p.doi || "") + " " + p.year + " " + t + " " + roleText + " " + (p.code || "") + " " + (p.dataset || "") + (p.viz ? " data visualization viz" : "")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    shown.sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      var oa = typeof a.order === "number" ? a.order : 999;
      var ob = typeof b.order === "number" ? b.order : 999;
      if (oa !== ob) return oa - ob;
      var da = pubDateKey(a.published);
      var db = pubDateKey(b.published);
      if (da && db && da !== db) return da < db ? 1 : -1;
      if (da && !db) return -1;
      if (!da && db) return 1;
      return (a.title || "").localeCompare(b.title || "");
    });

    var years = [];
    var byYear = {};
    shown.forEach(function (p) {
      if (!byYear[p.year]) {
        byYear[p.year] = [];
        years.push(p.year);
      }
      byYear[p.year].push(p);
    });

    listEl.innerHTML = years.map(function (year) {
      var items = byYear[year].map(function (p) {
        var venue = p.venue || "";
        var parts = [];
        if (venue) {
          parts.push('<i class="pub__venue-name">' + venue + "</i>");
        }
        if (p.doi) {
          var doiSafe = String(p.doi).replace(/"/g, "");
          parts.push(
            '<a class="pub__doi" href="https://doi.org/' + doiSafe +
            '" target="_blank" rel="noopener noreferrer">doi:' + doiSafe + "</a>"
          );
        }
        var meta = parts.join(" - ");
        var kind = p.type || "journal";
        var badge = '<span class="pub__type">' + (typeLabels[kind] || kind) + "</span>";
        var roles = roleBadgesHtml(pubRoleList(p));
        var resources = resourceLinkBadgesHtml(p);
        var badges = '<div class="pub__badges">' + badge +
          (roles || resources ? '<span class="pub__roles">' + roles + resources + "</span>" : "") +
          "</div>";
        return '<li class="pub">' +
          badges +
          '<h3 class="pub__title">' + p.title + "</h3>" +
          '<p class="pub__authors">' + p.authors + "</p>" +
          (meta ? '<p class="pub__venue">' + meta + "</p>" : "") +
        "</li>";
      }).join("");

      return '<li class="pub-year">' +
        '<div class="pub-year__tag">' +
          '<span class="pub-year__label">' + year + "</span>" +
        "</div>" +
        '<ul class="pub-year__list">' + items + "</ul>" +
      "</li>";
    }).join("");

    if (emptyEl) emptyEl.hidden = shown.length !== 0;
    if (countEl) {
      countEl.textContent = shown.length === PUBLICATIONS.length
        ? shown.length + " outputs"
        : shown.length + " shown";
    }
    enhanceExternalLinks(listEl);
  }

  var searchEl = document.getElementById("pubSearch");
  if (searchEl) searchEl.addEventListener("input", renderPubs);

  var pubTypeChips = document.getElementById("pubTypeChips");
  if (pubTypeChips) {
    pubTypeChips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pub-type]");
      if (!btn) return;
      pubTypeFilter = btn.getAttribute("data-pub-type");
      Array.prototype.forEach.call(pubTypeChips.querySelectorAll(".chip"), function (c) {
        c.classList.toggle("is-active", c === btn);
      });
      renderPubs();
    });
  }

  renderPubs();

  /* =======================================================
     ACTIVITY CHART
     ======================================================= */

  function renderActivity() {
    var chart = document.getElementById("activityChart");
    var hint = document.getElementById("activityHint");
    var startEl = document.getElementById("activityStart");
    var endEl = document.getElementById("activityEnd");
    if (!chart || typeof ACTIVITY === "undefined" || !ACTIVITY.length) return;

    var max = 1;
    ACTIVITY.forEach(function (d) {
      if (d.count > max) max = d.count;
    });

    if (startEl) startEl.textContent = ACTIVITY[0].year;
    if (endEl) endEl.textContent = ACTIVITY[ACTIVITY.length - 1].year;

    chart.innerHTML = ACTIVITY.map(function (d, i) {
      var h = d.count === 0 ? 4 : Math.max(8, Math.round((d.count / max) * 100));
      return '<button type="button" class="activity__bar" data-year="' + d.year +
        '" data-count="' + d.count + '" style="--d:' + (i * 28) + 'ms" ' +
        'aria-label="' + d.year + ': ' + d.count + ' publications">' +
        '<span class="activity__tip">Research output ' + d.year + ': ' + d.count + '</span>' +
        '<span class="activity__fill" style="height:' + h + '%"></span>' +
      '</button>';
    }).join("");

    var bars = Array.prototype.slice.call(chart.querySelectorAll(".activity__bar"));
    var last = bars[bars.length - 1];

    function setHint(btn) {
      if (!hint) return;
      if (!btn) {
        hint.textContent = "";
        return;
      }
      hint.textContent = "Research output " + btn.getAttribute("data-year") +
        ": " + btn.getAttribute("data-count");
    }

    function activate(btn) {
      bars.forEach(function (b) { b.classList.remove("is-on"); });
      if (btn) btn.classList.add("is-on");
    }

    bars.forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        activate(btn);
        setHint(btn);
      });
      btn.addEventListener("focus", function () {
        activate(btn);
        setHint(btn);
      });
      btn.addEventListener("blur", function () {
        setHint(null);
      });
    });

    chart.addEventListener("mouseleave", function () {
      activate(last);
      setHint(null);
    });

    activate(last);
    setHint(null);
  }

  renderActivity();

  /* =======================================================
     CODES & DATASETS
     ======================================================= */

  function renderResources(items, listId, emptyId, type) {
    var el = document.getElementById(listId);
    var empty = document.getElementById(emptyId);
    if (!el) return;

    if (!items || !items.length) {
      el.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    el.innerHTML = items.map(function (item, i) {
      var meta = item.lang || item.format || "";
      var icon = type === "code"
        ? '<svg class="resource__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.57 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.28 5.69.42.36.79 1.08.79 2.18 0 1.57-.01 2.84-.01 3.22 0 .32.21.68.8.57A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>'
        : '<svg class="resource__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>';
      var viz = item.viz;
      var vizHtml = "";
      if (viz && viz.url) {
        vizHtml =
          '<a class="resource-card__sub" href="' + viz.url + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="resource-card__sub-rail" aria-hidden="true"></span>' +
            '<span class="resource-card__sub-mark" aria-hidden="true"></span>' +
            '<div class="resource-card__sub-body">' +
              '<span class="resource-card__sub-label">Related</span>' +
              '<span class="resource-card__sub-title">' + (viz.title || "Data visualization") + '</span>' +
              (viz.meta ? '<span class="resource-card__sub-meta">' + viz.meta + '</span>' : '') +
              (viz.desc ? '<p class="resource-card__sub-desc">' + viz.desc + '</p>' : '') +
            '</div>' +
            '<span class="resource-card__arrow" aria-hidden="true">→</span>' +
          '</a>';
      }

      var mainLink =
        '<a class="resource-card__link" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' +
          icon +
          '<div class="resource-card__body">' +
            '<h3 class="resource-card__title">' + item.title + '</h3>' +
            (meta ? '<span class="resource-card__meta">' + meta + '</span>' : '') +
            (item.desc ? '<p class="resource-card__desc">' + item.desc + '</p>' : '') +
          '</div>' +
          '<span class="resource-card__arrow" aria-hidden="true">→</span>' +
        '</a>';

      return '<li class="resource-card' + (vizHtml ? ' resource-card--has-sub' : '') + '"' +
        (item.id ? ' id="dataset-' + item.id + '"' : '') +
        ' style="--delay:' + (i * 60) + 'ms">' +
        (vizHtml
          ? '<div class="resource-card__shell">' + mainLink + vizHtml + '</div>'
          : mainLink) +
      '</li>';
    }).join("");
    enhanceExternalLinks(el);
  }

  if (page === "codes") {
    renderResources(typeof CODES !== "undefined" ? CODES : [], "codeList", "codeEmpty", "code");
  }
  if (page === "datasets") {
    renderResources(typeof DATASETS !== "undefined" ? DATASETS : [], "datasetList", "datasetEmpty", "dataset");
  }
  if (page === "data-code" || page === "resources") {
    renderResources(typeof CODES !== "undefined" ? CODES : [], "codeList", "codeEmpty", "code");
    renderResources(typeof DATASETS !== "undefined" ? DATASETS : [], "datasetList", "datasetEmpty", "dataset");
  }

  /* =======================================================
     PANEL TABS + CV / PEOPLE
     ======================================================= */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function revealExpandToggles(root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll(".fund-card"), function (card) {
      var blurb = card.querySelector(".fund-card__blurb");
      var btn = card.querySelector(".fund-card__toggle");
      if (!blurb || !btn) return;
      if (blurb.scrollHeight > blurb.clientHeight + 1) {
        btn.hidden = false;
      } else {
        btn.remove();
        card.classList.add("is-open");
      }
    });
  }

  function recordHtml(title, when, org, note, url) {
    var noteHtml = "";
    if (note) {
      if (url) {
        var safeUrl = String(url).replace(/"/g, "");
        noteHtml = '<p class="record__note"><a class="record__link" href="' + safeUrl +
          '" target="_blank" rel="noopener noreferrer">' + esc(note) + '</a></p>';
      } else {
        noteHtml = '<p class="record__note">' + esc(note) + '</p>';
      }
    }
    return '<li class="record">' +
      (when ? '<span class="record__when">' + esc(when) + '</span>' : '') +
      '<p class="record__title">' + esc(title) + '</p>' +
      (org ? '<p class="record__org">' + esc(org) + '</p>' : '') +
      noteHtml +
    '</li>';
  }

  if (page === "home" || page === "supervision") {
    var aboutPos = document.getElementById("aboutPositions");
    if (aboutPos && typeof POSITIONS !== "undefined") {
      aboutPos.innerHTML = POSITIONS.map(function (p) {
        return recordHtml(p.role, p.years, p.org, "");
      }).join("");
    }

    var aboutEdu = document.getElementById("aboutEducation");
    if (aboutEdu && typeof EDUCATION !== "undefined") {
      aboutEdu.innerHTML = EDUCATION.map(function (e) {
        return recordHtml(e.degree, e.years, e.place, e.note, e.url);
      }).join("");
      enhanceExternalLinks(aboutEdu);
    }

    var aboutTeach = document.getElementById("aboutTeaching");
    if (aboutTeach && typeof TEACHING !== "undefined") {
      aboutTeach.innerHTML = TEACHING.map(function (t) {
        return recordHtml(t.title, t.years, t.note, "");
      }).join("");
    }

    var aboutTeachGrant = document.getElementById("aboutTeachingGrant");
    if (aboutTeachGrant && typeof GRANTS_TEACHING !== "undefined") {
      aboutTeachGrant.innerHTML = GRANTS_TEACHING.map(function (g) {
        return recordHtml(g.title, g.years, g.funder + (g.amount ? " - " + g.amount : ""), g.role);
      }).join("");
    }
  }

  function activateTab(root, id) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-panel]"));
    if (!tabs.length) return;

    var target = id;
    if (!target || !root.querySelector('[data-panel="' + target + '"]')) {
      target = tabs[0].getAttribute("data-tab");
    }

    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === target;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-panel") === target;
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });

    if (history.replaceState) {
      history.replaceState(null, "", "#" + target);
    } else {
      location.hash = target;
    }
  }

  function initPanelTabs(root) {
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-tab]"));
    var fromHash = (location.hash || "").replace(/^#/, "");
    activateTab(root, fromHash);

    root.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (!tab || !root.contains(tab)) return;
      activateTab(root, tab.getAttribute("data-tab"));
    });

    root.addEventListener("keydown", function (e) {
      var current = e.target.closest("[data-tab]");
      if (!current || !root.contains(current)) return;
      var i = tabs.indexOf(current);
      if (i < 0) return;
      var next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      tabs[next].focus();
      activateTab(root, tabs[next].getAttribute("data-tab"));
    });

    window.addEventListener("hashchange", function () {
      activateTab(root, (location.hash || "").replace(/^#/, ""));
    });
  }

  document.querySelectorAll("[data-tabs]").forEach(initPanelTabs);

  if (page === "recognition" || page === "cv") {
    var memEl = document.getElementById("membershipsList");
    if (memEl && typeof MEMBERSHIPS !== "undefined") {
      memEl.innerHTML = MEMBERSHIPS.map(function (m) {
        return recordHtml(m.role, m.years, m.org, m.note || "");
      }).join("");
    }

    var awEl = document.getElementById("awardsList");
    if (awEl && typeof AWARDS !== "undefined") {
      awEl.innerHTML = AWARDS.map(function (a) {
        return recordHtml(a.title, a.year, a.org, a.note);
      }).join("");
    }

    var talkTypeLabel = {
      invited: "Invited",
      keynote: "Keynote",
      conference: "Conference",
      organised: "Seminar organised",
      chair: "Session chair"
    };

    function renderTalks(filter) {
      var list = document.getElementById("talksList");
      if (!list || typeof TALKS === "undefined") return;
      var items = TALKS.filter(function (t) {
        if (filter === "all") return true;
        if (filter === "invited") return t.type === "invited" || t.type === "keynote";
        return t.type === filter;
      });
      list.innerHTML = items.map(function (t) {
        return '<li class="record">' +
          '<span class="record__when">' + esc(t.years) + '</span>' +
          '<p class="role-tag">' + esc(talkTypeLabel[t.type] || t.type) + '</p>' +
          '<p class="record__title">' + esc(t.title) + '</p>' +
          '<p class="record__org">' + esc(t.venue) + '</p>' +
          (t.note ? '<p class="record__note">' + esc(t.note) + '</p>' : '') +
        '</li>';
      }).join("");
    }

    renderTalks("all");
    var talkChips = document.getElementById("talkChips");
    if (talkChips) {
      talkChips.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-talk]");
        if (!btn) return;
        Array.prototype.forEach.call(talkChips.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        renderTalks(btn.getAttribute("data-talk"));
      });
    }
  }

  if (page === "service") {
    function parseServiceYear(years) {
      var m = String(years || "").match(/(\d{4})/);
      if (!m) return 0;
      return parseInt(m[1], 10);
    }

    function isServiceOngoing(years) {
      return /present/i.test(String(years || ""));
    }

    function parseServiceEndYear(years) {
      var text = String(years || "");
      if (/present/i.test(text)) return 9999;
      var m = text.match(/(\d{4})/g);
      if (!m || !m.length) return 0;
      return parseInt(m[m.length - 1], 10);
    }

    function classifyDeptItem(s) {
      var t = String(s.title || "").toLowerCase();
      if (/representative|moderator/.test(t)) {
        return { key: "leadership", tag: "Leadership", role: s.title.replace(/,.*/, "").trim() };
      }
      if (/member/.test(t)) {
        return { key: "departmental", tag: "Departmental service", role: "Member" };
      }
      return { key: "departmental", tag: "Departmental service", role: "" };
    }

    function splitReviewVenue(note) {
      var text = String(note || "").trim();
      if (!text) return { summary: "", venues: [] };

      var journals = [
        "Journal of Marine Science and Engineering",
        "Frontiers in Marine Science",
        "Kuwait Journal of Science",
        "Remote Sensing",
        "Climate"
      ];

      var venues = [];
      var rest = text;
      var peeled = true;
      while (peeled) {
        peeled = false;
        for (var i = 0; i < journals.length; i++) {
          var j = journals[i];
          if (rest.length < j.length) continue;
          var tail = rest.slice(rest.length - j.length);
          if (tail.toLowerCase() !== j.toLowerCase()) continue;
          var before = rest.slice(0, rest.length - j.length);
          if (before && !/(?:,\s*|\s+and\s+|\s+in\s+)$/i.test(before) && before.length > 0) {
            continue;
          }
          venues.unshift(j);
          rest = before.replace(/(?:,\s*|\s+and\s+|\s+in\s+)$/i, "").trim();
          peeled = true;
          break;
        }
      }

      if (!venues.length) {
        if (/reviewer|journals?\b/i.test(text)) {
          return { summary: text, venues: [] };
        }
        var parts = text.split(/,\s*/);
        if (parts.length >= 2) {
          var last = parts[parts.length - 1];
          if (last.length <= 70) {
            return { summary: parts.slice(0, -1).join(", "), venues: [last] };
          }
        }
        return { summary: "", venues: [text] };
      }

      return { summary: rest, venues: venues };
    }

    function allServiceItems() {
      var items = [];

      if (typeof DEPT_SERVICE !== "undefined") {
        DEPT_SERVICE.forEach(function (s) {
          var c = classifyDeptItem(s);
          items.push({
            key: c.key,
            tag: c.tag,
            title: s.title,
            years: s.years,
            venues: s.note ? [s.note] : [],
            role: c.role,
            summary: "",
            startYear: parseServiceYear(s.years),
            endYear: parseServiceEndYear(s.years),
            ongoing: isServiceOngoing(s.years)
          });
        });
      }

      if (typeof SERVICE_HIGHLIGHTS !== "undefined") {
        SERVICE_HIGHLIGHTS.forEach(function (s) {
          var split = splitReviewVenue(s.note || "");
          items.push({
            key: "reviewing",
            tag: "Assessing and reviewing",
            title: s.title,
            years: s.years,
            venues: split.venues,
            role: "",
            summary: split.summary,
            startYear: parseServiceYear(s.years),
            endYear: parseServiceEndYear(s.years),
            ongoing: isServiceOngoing(s.years)
          });
        });
      }

      if (typeof EXTERNAL_EXAMS !== "undefined") {
        EXTERNAL_EXAMS.forEach(function (x) {
          items.push({
            key: "examining",
            tag: "External examination",
            title: x.topic,
            years: x.years,
            venues: [],
            role: (x.degree ? x.degree + " - " : "") + (x.role || "External examiner"),
            summary: "",
            startYear: parseServiceYear(x.years),
            endYear: parseServiceEndYear(x.years),
            ongoing: isServiceOngoing(x.years)
          });
        });
      }

      if (typeof ENGAGEMENT !== "undefined") {
        ENGAGEMENT.forEach(function (e) {
          items.push({
            key: "engagement",
            tag: "Engagement",
            title: e.title,
            years: e.years,
            venues: e.note ? [e.note] : [],
            role: "",
            summary: "",
            startYear: parseServiceYear(e.years),
            endYear: parseServiceEndYear(e.years),
            ongoing: isServiceOngoing(e.years)
          });
        });
      }

      return items;
    }

    var serviceFilter = "all";
    var serviceSort = "newest";
    var serviceQuery = "";

    function renderServiceList() {
      var root = document.getElementById("serviceRoot");
      var emptyEl = document.getElementById("serviceEmpty");
      var countEl = document.getElementById("serviceCount");
      if (!root) return;

      var q = serviceQuery.trim().toLowerCase();
      var items = allServiceItems().filter(function (s) {
        if (serviceFilter !== "all" && s.key !== serviceFilter) return false;
        if (!q) return true;
        var hay = (s.title + " " + (s.venues || []).join(" ") + " " + s.tag + " " + s.role + " " + s.summary).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      items.sort(function (a, b) {
        if (serviceSort === "oldest") {
          return a.endYear - b.endYear ||
            a.startYear - b.startYear ||
            a.title.localeCompare(b.title);
        }
        /* Newest: later end year first (present = ongoing), then later start;
           so 2017-2019 before 2017, and 2023-2024 before 2023. */
        return b.endYear - a.endYear ||
          b.startYear - a.startYear ||
          a.title.localeCompare(b.title);
      });

      if (countEl) {
        countEl.textContent = items.length + (items.length === 1 ? " item" : " items");
      }

      if (!items.length) {
        root.innerHTML = "";
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;

      root.innerHTML = items.map(function (s, i) {
        var id = "svc-more-" + i;
        var venues = s.venues || [];
        var showSummary = !!(s.summary && venues.indexOf(s.summary) === -1);
        var venueHtml = venues.map(function (v) {
          return '<p class="fund-card__venue">' + esc(v) + "</p>";
        }).join("");
        return '<li class="fund-card">' +
          '<div class="fund-card__top">' +
            '<p class="fund-card__tag">' + esc(s.tag) + "</p>" +
            '<p class="fund-card__when">' + esc(s.years) + "</p>" +
          "</div>" +
          '<h3 class="fund-card__title">' + esc(s.title) + "</h3>" +
          (s.role && s.role !== s.title ? '<p class="fund-card__role"><span>' + esc(s.role) + "</span></p>" : "") +
          venueHtml +
          (showSummary ? (
            '<div class="fund-card__expand">' +
              '<p class="fund-card__blurb" id="' + id + '">' + esc(s.summary) + "</p>" +
              '<button type="button" class="fund-card__toggle" hidden aria-expanded="false" aria-controls="' + id + '">… See more</button>' +
            "</div>"
          ) : "") +
        "</li>";
      }).join("");
      revealExpandToggles(root);
    }

    renderServiceList();

    var serviceRoot = document.getElementById("serviceRoot");
    if (serviceRoot) {
      serviceRoot.addEventListener("click", function (e) {
        var btn = e.target.closest(".fund-card__toggle");
        if (!btn || !serviceRoot.contains(btn)) return;
        var card = btn.closest(".fund-card");
        if (!card) return;
        var open = card.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "… See less" : "… See more";
      });
    }

    var serviceChips = document.getElementById("serviceChips");
    if (serviceChips) {
      serviceChips.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-service]");
        if (!btn) return;
        serviceFilter = btn.getAttribute("data-service");
        Array.prototype.forEach.call(serviceChips.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        renderServiceList();
      });
    }

    var searchEl = document.getElementById("serviceSearch");
    if (searchEl) {
      searchEl.addEventListener("input", function () {
        serviceQuery = searchEl.value;
        renderServiceList();
      });
    }

    var sortEl = document.getElementById("serviceSort");
    if (sortEl) {
      sortEl.addEventListener("change", function () {
        serviceSort = sortEl.value;
        renderServiceList();
      });
    }
  }

  if (page === "funded") {
    var grantBuckets = [
      { key: "pi", label: "Principal Investigator", items: typeof GRANTS_PI !== "undefined" ? GRANTS_PI : [] },
      { key: "coi", label: "Co-Investigator", items: typeof GRANTS_COI !== "undefined" ? GRANTS_COI : [] },
      { key: "key", label: "Key member", items: typeof GRANTS_KEY !== "undefined" ? GRANTS_KEY : [] },
      { key: "teaching", label: "Teaching project", items: typeof GRANTS_TEACHING !== "undefined" ? GRANTS_TEACHING : [] }
    ];

    var grantFilter = "all";
    var grantSort = "newest";
    var grantQuery = "";

    function parseGrantStartYear(years) {
      var m = String(years || "").match(/(\d{4})/);
      return m ? parseInt(m[1], 10) : 0;
    }

    function parseGrantAmount(amount) {
      var s = String(amount || "");
      var hk = s.match(/HK\$\s*([\d,]+)/i);
      if (hk) return parseInt(hk[1].replace(/,/g, ""), 10);
      var cny = s.match(/CNY\s*([\d,]+)/i);
      if (cny) return Math.round(parseInt(cny[1].replace(/,/g, ""), 10) * 1.08);
      var approx = s.match(/~\s*HK\$\s*([\d,]+)/i);
      if (approx) return parseInt(approx[1].replace(/,/g, ""), 10);
      return 0;
    }

    function grantTypeTag(key, funder) {
      var f = String(funder || "").toLowerCase();
      if (key === "teaching") return "Teaching project";
      if (/large equipment|equipment fund/.test(f)) return "Equipment grant";
      return "Grant";
    }

    function roleShort(role, key) {
      var r = String(role || "");
      if (/principal investigator/i.test(r) || key === "pi") return "PI";
      if (/co-investigator|co-principal/i.test(r) || key === "coi") return "Co-I";
      if (/key|member|researcher/i.test(r) || key === "key") return "Key member";
      if (key === "teaching") return "Co-I";
      return r || "Investigator";
    }

    function grantBlurb(g) {
      var bits = [];
      if (g.amount) bits.push("Project Total: " + g.amount + ".");
      bits.push(g.title);
      return bits.join(" ");
    }

    function allFundedProjects() {
      var flat = [];
      grantBuckets.forEach(function (b) {
        (b.items || []).forEach(function (g) {
          flat.push({
            key: b.key,
            tag: grantTypeTag(b.key, g.funder),
            title: g.title,
            years: g.years,
            funder: g.funder,
            amount: g.amount,
            role: g.role,
            roleShort: roleShort(g.role, b.key),
            blurb: grantBlurb(g),
            startYear: parseGrantStartYear(g.years),
            amountNum: parseGrantAmount(g.amount)
          });
        });
      });
      return flat;
    }

    function renderFundedList() {
      var root = document.getElementById("grantsRoot");
      var emptyEl = document.getElementById("grantEmpty");
      var countEl = document.getElementById("grantCount");
      if (!root) return;

      var q = grantQuery.trim().toLowerCase();
      var items = allFundedProjects().filter(function (g) {
        if (grantFilter !== "all" && g.key !== grantFilter) return false;
        if (!q) return true;
        var hay = (g.title + " " + g.funder + " " + g.role + " " + g.tag + " " + (g.amount || "")).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      items.sort(function (a, b) {
        if (grantSort === "oldest") return a.startYear - b.startYear || a.title.localeCompare(b.title);
        if (grantSort === "amount") return b.amountNum - a.amountNum || b.startYear - a.startYear;
        return b.startYear - a.startYear || a.title.localeCompare(b.title);
      });

      if (countEl) {
        countEl.textContent = items.length + (items.length === 1 ? " project" : " projects");
      }

      if (!items.length) {
        root.innerHTML = "";
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;

      var peopleIcon =
        '<svg class="fund-card__people-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<circle cx="9" cy="8" r="2.4"/><circle cx="16" cy="9" r="2"/><path d="M4.5 17.5c.6-2.2 2.3-3.4 4.5-3.4s3.9 1.2 4.5 3.4"/>' +
        '<path d="M13.2 17.2c.4-1.5 1.5-2.4 3-2.4 1.3 0 2.3.7 2.8 1.9"/>' +
        "</svg>";

      root.innerHTML = items.map(function (g, i) {
        var id = "fund-more-" + i;
        return '<li class="fund-card">' +
          '<div class="fund-card__top">' +
            '<p class="fund-card__tag">' + esc(g.tag) + "</p>" +
            '<p class="fund-card__when">' + esc(g.years) + "</p>" +
          "</div>" +
          '<h3 class="fund-card__title">' + esc(g.title) + "</h3>" +
          '<p class="fund-card__venue">' + esc(g.funder) + "</p>" +
          '<p class="fund-card__role">' + peopleIcon + "<span>" + esc(g.roleShort) + "</span></p>" +
          '<div class="fund-card__expand">' +
            '<p class="fund-card__blurb" id="' + id + '">' + esc(g.blurb) + "</p>" +
            '<button type="button" class="fund-card__toggle" hidden aria-expanded="false" aria-controls="' + id + '">… See more</button>' +
          "</div>" +
        "</li>";
      }).join("");
      revealExpandToggles(root);
    }

    renderFundedList();

    var grantsRoot = document.getElementById("grantsRoot");
    if (grantsRoot) {
      grantsRoot.addEventListener("click", function (e) {
        var btn = e.target.closest(".fund-card__toggle");
        if (!btn || !grantsRoot.contains(btn)) return;
        var card = btn.closest(".fund-card");
        if (!card) return;
        var open = card.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "… See less" : "… See more";
      });
    }

    var grantChips = document.getElementById("grantChips");
    if (grantChips) {
      grantChips.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-grant]");
        if (!btn) return;
        grantFilter = btn.getAttribute("data-grant");
        Array.prototype.forEach.call(grantChips.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        renderFundedList();
      });
    }

    var searchEl = document.getElementById("grantSearch");
    if (searchEl) {
      searchEl.addEventListener("input", function () {
        grantQuery = searchEl.value;
        renderFundedList();
      });
    }

    var sortEl = document.getElementById("grantSort");
    if (sortEl) {
      sortEl.addEventListener("change", function () {
        grantSort = sortEl.value;
        renderFundedList();
      });
    }
  }

  if (page === "field") {
    var preview = document.getElementById("fieldLeadershipPreview");
    if (preview && typeof FIELD_LEADERSHIP !== "undefined") {
      preview.innerHTML = FIELD_LEADERSHIP.map(function (f) {
        return recordHtml(f.title, f.years, f.note, "");
      }).join("");
    }

    var gallery = document.getElementById("fieldGallery");
    var fieldEmpty = document.getElementById("fieldEmpty");
    var surveys = typeof FIELD_SURVEYS !== "undefined" ? FIELD_SURVEYS : [];
    if (gallery) {
      if (!surveys.length) {
        gallery.innerHTML = "";
        if (fieldEmpty) fieldEmpty.hidden = false;
      } else {
        if (fieldEmpty) fieldEmpty.hidden = true;
        gallery.innerHTML = surveys.map(function (s) {
          return '<figure class="gallery-card">' +
            '<div class="gallery-card__media">' +
              '<img src="' + esc(s.image) + '" alt="' + esc(s.title || "Field survey") + '" loading="lazy">' +
            '</div>' +
            '<figcaption class="gallery-card__meta">' +
              '<p class="gallery-card__title">' + esc(s.title) + '</p>' +
              '<p class="gallery-card__place">' + esc([s.place, s.year].filter(Boolean).join(" - ")) + '</p>' +
              (s.caption ? '<p class="gallery-card__caption">' + esc(s.caption) + '</p>' : '') +
            '</figcaption>' +
          '</figure>';
        }).join("");
      }
    }
  }

  if ((page === "supervision" || page === "team" || page === "people") && typeof PEOPLE !== "undefined") {
    var groups = [
      { key: "phd", label: "PhD students" },
      { key: "mphil", label: "MPhil students" },
      { key: "msc", label: "MSc students" },
      { key: "bsc", label: "BSc students" },
      { key: "staff", label: "Research staff" }
    ];
    var peopleRoot = document.getElementById("peopleRoot");
    var peopleTabs = document.getElementById("peopleTabs");
    var currentFilter = "all";

    function renderPeople(filter) {
      if (!peopleRoot) return;
      peopleRoot.innerHTML = groups.map(function (g) {
        var items = PEOPLE[g.key] || [];
        if (filter !== "all" && filter !== g.key) return "";
        if (!items.length) return "";
        var countLabel = g.key === "staff"
          ? (items.length === 1 ? " member" : " members")
          : (items.length === 1 ? " student" : " students");
        return '<section class="people-group" data-group="' + g.key + '">' +
          '<h2 class="people-group__title">' + esc(g.label) + '</h2>' +
          '<p class="people-group__count">' + items.length + countLabel + '</p>' +
          '<ul class="person-list">' +
            items.map(function (p) {
              return '<li class="person">' +
                '<span class="person__years">' + esc(p.years) + '</span>' +
                '<p class="person__topic">' + esc(p.topic) + '</p>' +
                '<p class="person__role">' + esc(p.role) + '</p>' +
              '</li>';
            }).join("") +
          '</ul>' +
        '</section>';
      }).join("");
    }

    renderPeople(currentFilter);

    if (peopleTabs) {
      peopleTabs.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-filter]");
        if (!btn) return;
        currentFilter = btn.getAttribute("data-filter");
        Array.prototype.forEach.call(peopleTabs.querySelectorAll(".subtabs__tab"), function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderPeople(currentFilter);
      });
    }
  }

  enhanceExternalLinks();

})();
