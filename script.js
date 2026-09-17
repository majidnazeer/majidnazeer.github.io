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
     LIVE CITATION METRICS (OpenAlex — Scholar has no public API)
     ======================================================= */

  function formatCount(n) {
    return Number(n).toLocaleString("en-US");
  }

  function loadLiveMetrics() {
    var cit = document.getElementById("statCitations");
    var h = document.getElementById("statHIndex");
    var i10 = document.getElementById("statI10");
    if (!cit || !h || !i10) return;

    /* h-index and i10 stay on Google Scholar figures (OpenAlex often differs). */
    h.textContent = h.getAttribute("data-fallback") || "27";
    i10.textContent = i10.getAttribute("data-fallback") || "41";

    var url =
      "https://api.openalex.org/authors/orcid:0000-0002-7631-1599" +
      "?mailto=majid.nazeer@connect.polyu.hk";

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("OpenAlex " + res.status);
        return res.json();
      })
      .then(function (data) {
        var citations = data.cited_by_count;
        if (citations != null) cit.textContent = formatCount(citations);
      })
      .catch(function () { /* keep fallback figures in HTML */ });
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

  /* Scrollspy — home page sections only */
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
     PUBLICATIONS (home page)
     ======================================================= */

  function stripTags(s) { return s.replace(/<[^>]+>/g, ""); }

  var pubTypeFilter = "all";
  var typeLabels = {
    journal: "Journal",
    chapter: "Book chapter",
    conference: "Conference"
  };

  /* Surnames / tokens for supervised students (People page + known first authors). */
  var STUDENT_TOKENS = [
    "sattar", "mahmood", "umar", "zohaib", "amin", "adeniran",
    "ahsan", "qureshi", "waqas", "raza", "kwok", "borsah"
  ];

  function nazeerIsFirstAuthor(authors) {
    var first = stripTags(authors || "").split(",")[0].trim();
    return /^Nazeer\b/i.test(first);
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

    if (explicit.indexOf("corresponding") !== -1 || p.corresponding === true || nazeerIsFirstAuthor(p.authors)) {
      roles.push("corresponding");
    }
    if (explicit.indexOf("speaker") !== -1 || p.speaker === true ||
        (kind === "conference" && nazeerIsFirstAuthor(p.authors))) {
      roles.push("speaker");
    }
    if (explicit.indexOf("student-lead") !== -1 || p.studentLead === true ||
        (firstAuthorIsStudent(p.authors) && !nazeerIsFirstAuthor(p.authors))) {
      roles.push("student-lead");
    }

    /* Deduplicate while keeping order */
    return roles.filter(function (r, i) { return roles.indexOf(r) === i; });
  }

  var roleLabels = {
    corresponding: "Corresponding",
    speaker: "Speaker",
    "student-lead": "Student lead"
  };

  function roleBadgesHtml(roles) {
    if (!roles.length) return "";
    return '<span class="pub__roles">' + roles.map(function (r) {
      return '<span class="pub__role pub__role--' + r + '">' + (roleLabels[r] || r) + "</span>";
    }).join("") + "</span>";
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
      var roles = pubRoleList(p).join(" ");
      var hay = (p.title + " " + stripTags(p.authors) + " " + stripTags(p.venue || "") + " " + (p.doi || "") + " " + p.year + " " + t + " " + roles).toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    shown.sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
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
        var meta = parts.join(" · ");
        var kind = p.type || "journal";
        var badge = '<span class="pub__type">' + (typeLabels[kind] || kind) + "</span>";
        var roles = roleBadgesHtml(pubRoleList(p));
        return '<li class="pub">' +
          '<div class="pub__badges">' + badge + roles + "</div>" +
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

      return '<li class="resource-card" style="--delay:' + (i * 60) + 'ms">' +
        '<a class="resource-card__link" href="' + item.url + '" rel="noopener">' +
          icon +
          '<div class="resource-card__body">' +
            '<h3 class="resource-card__title">' + item.title + '</h3>' +
            (meta ? '<span class="resource-card__meta">' + meta + '</span>' : '') +
            (item.desc ? '<p class="resource-card__desc">' + item.desc + '</p>' : '') +
          '</div>' +
          '<span class="resource-card__arrow" aria-hidden="true">→</span>' +
        '</a>' +
      '</li>';
    }).join("");
  }

  if (page === "codes") {
    renderResources(typeof CODES !== "undefined" ? CODES : [], "codeList", "codeEmpty", "code");
  }
  if (page === "datasets") {
    renderResources(typeof DATASETS !== "undefined" ? DATASETS : [], "datasetList", "datasetEmpty", "dataset");
  }
  if (page === "resources") {
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

  function recordHtml(title, when, org, note) {
    return '<li class="record">' +
      (when ? '<span class="record__when">' + esc(when) + '</span>' : '') +
      '<p class="record__title">' + esc(title) + '</p>' +
      (org ? '<p class="record__org">' + esc(org) + '</p>' : '') +
      (note ? '<p class="record__note">' + esc(note) + '</p>' : '') +
    '</li>';
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

  if (page === "cv") {
    var posEl = document.getElementById("positionsList");
    if (posEl && typeof POSITIONS !== "undefined") {
      posEl.innerHTML = POSITIONS.map(function (p) {
        return recordHtml(p.role, p.years, p.org, "");
      }).join("");
    }

    var eduEl = document.getElementById("educationList");
    if (eduEl && typeof EDUCATION !== "undefined") {
      eduEl.innerHTML = EDUCATION.map(function (e) {
        return recordHtml(e.degree, e.years, e.place, e.note);
      }).join("");
    }

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

    var grantBuckets = [
      { key: "pi", label: "Principal Investigator", items: typeof GRANTS_PI !== "undefined" ? GRANTS_PI : [] },
      { key: "coi", label: "Co-Principal / Co-Investigator / Member", items: typeof GRANTS_COI !== "undefined" ? GRANTS_COI : [] },
      { key: "key", label: "Key team member / researcher", items: typeof GRANTS_KEY !== "undefined" ? GRANTS_KEY : [] },
      { key: "teaching", label: "Teaching project awards", items: typeof GRANTS_TEACHING !== "undefined" ? GRANTS_TEACHING : [] }
    ];

    var grantImages = [
      "assets/grants/blue-carbon.svg",
      "assets/grants/vegetation.svg",
      "assets/grants/forest-canopy.svg"
    ];
    var grantTones = ["teal", "moss", "slate"];

    function grantImageFor(title, index) {
      var s = String(title || "").toLowerCase();
      if (/blue carbon|wetland|mangrove|water quality|coastal|bathym|hydrolog|sha lo tung/.test(s)) {
        return grantImages[0];
      }
      if (/vegetation|tree|forest|canopy|biomass|spectral|slives|land cover|landslide/.test(s)) {
        return grantImages[1];
      }
      if (/carbon|climate|urban|air|aerosol|mobility|education|flipped/.test(s)) {
        return grantImages[2];
      }
      return grantImages[index % grantImages.length];
    }

    function renderGrants(filter) {
      var root = document.getElementById("grantsRoot");
      if (!root) return;

      var flat = [];
      grantBuckets.forEach(function (b) {
        if (filter !== "all" && filter !== b.key) return;
        (b.items || []).forEach(function (g) {
          flat.push(g);
        });
      });

      if (!flat.length) {
        root.innerHTML = '<p class="empty">No grants in this category.</p>';
        return;
      }

      root.innerHTML = flat.map(function (g, i) {
        var tone = grantTones[i % grantTones.length];
        var img = grantImageFor(g.title, i);
        return '<article class="gcard gcard--' + tone + '" title="' + esc(g.title) + '">' +
          '<div class="gcard__media" aria-hidden="true">' +
            '<img src="' + esc(img) + '" alt="">' +
            '<span class="gcard__wash"></span>' +
          '</div>' +
          '<div class="gcard__body">' +
            '<p class="gcard__meta">' + esc(g.role) + ' · ' + esc(g.years) + '</p>' +
            '<h3 class="gcard__title">' + esc(g.title) + '</h3>' +
            '<p class="gcard__foot">' +
              (g.amount ? esc(g.amount) : '') +
              '<span>' + esc(g.funder) + '</span>' +
            '</p>' +
          '</div>' +
        '</article>';
      }).join("");
    }

    renderGrants("all");
    var grantChips = document.getElementById("grantChips");
    if (grantChips) {
      grantChips.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-grant]");
        if (!btn) return;
        Array.prototype.forEach.call(grantChips.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        renderGrants(btn.getAttribute("data-grant"));
      });
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

    var teachEl = document.getElementById("teachingList");
    if (teachEl && typeof TEACHING !== "undefined") {
      teachEl.innerHTML = TEACHING.map(function (t) {
        return recordHtml(t.title, t.years, t.note, "");
      }).join("");
    }

    var teachGrantEl = document.getElementById("teachingGrantList");
    if (teachGrantEl && typeof GRANTS_TEACHING !== "undefined") {
      teachGrantEl.innerHTML = GRANTS_TEACHING.map(function (g) {
        return recordHtml(g.title, g.years, g.funder + (g.amount ? " · " + g.amount : ""), g.role);
      }).join("");
    }

    var deptEl = document.getElementById("deptServiceList");
    if (deptEl && typeof DEPT_SERVICE !== "undefined") {
      deptEl.innerHTML = DEPT_SERVICE.map(function (s) {
        return recordHtml(s.title, s.years, s.note, "");
      }).join("");
    }

    var svcEl = document.getElementById("serviceList");
    if (svcEl && typeof SERVICE_HIGHLIGHTS !== "undefined") {
      svcEl.innerHTML = SERVICE_HIGHLIGHTS.map(function (s) {
        return recordHtml(s.title, s.years, s.note, "");
      }).join("");
    }

    var examEl = document.getElementById("examsList");
    if (examEl && typeof EXTERNAL_EXAMS !== "undefined") {
      examEl.innerHTML = EXTERNAL_EXAMS.map(function (x) {
        return '<li class="record">' +
          '<span class="record__when">' + esc(x.years) + '</span>' +
          '<p class="role-tag">' + esc(x.degree) + ' · External examiner</p>' +
          '<p class="record__title">' + esc(x.name) + '</p>' +
          '<p class="record__org">' + esc(x.place) + '</p>' +
          '<p class="record__note">' + esc(x.topic) + '</p>' +
        '</li>';
      }).join("");
    }

    var engEl = document.getElementById("engagementList");
    if (engEl && typeof ENGAGEMENT !== "undefined") {
      engEl.innerHTML = ENGAGEMENT.map(function (e) {
        return recordHtml(e.title, e.years, e.note, "");
      }).join("");
    }

    var fieldEl = document.getElementById("fieldLeadershipList");
    if (fieldEl && typeof FIELD_LEADERSHIP !== "undefined") {
      fieldEl.innerHTML = FIELD_LEADERSHIP.map(function (f) {
        return recordHtml(f.title, f.years, f.note, "");
      }).join("");
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
              '<p class="gallery-card__place">' + esc([s.place, s.year].filter(Boolean).join(" · ")) + '</p>' +
              (s.caption ? '<p class="gallery-card__caption">' + esc(s.caption) + '</p>' : '') +
            '</figcaption>' +
          '</figure>';
        }).join("");
      }
    }
  }

  if (page === "people" && typeof PEOPLE !== "undefined") {
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
        return '<section class="people-group" data-group="' + g.key + '">' +
          '<h2 class="people-group__title">' + esc(g.label) + '</h2>' +
          '<p class="people-group__count">' + items.length + (items.length === 1 ? " person" : " people") + '</p>' +
          '<ul class="person-list">' +
            items.map(function (p) {
              return '<li class="person">' +
                '<span class="person__years">' + esc(p.years) + '</span>' +
                '<p class="person__name">' + esc(p.name) +
                  '<span class="person__role">' + esc(p.role) + '</span></p>' +
                '<p class="person__topic">' + esc(p.topic) + '</p>' +
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

})();
