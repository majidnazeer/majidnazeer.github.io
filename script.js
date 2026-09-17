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

    var fieldEl = document.getElementById("fieldLeadershipList");
    if (fieldEl && typeof FIELD_LEADERSHIP !== "undefined") {
      fieldEl.innerHTML = FIELD_LEADERSHIP.map(function (f) {
        return recordHtml(f.title, f.years, f.note, "");
      }).join("");
    }
  }

  if (page === "service") {
    function parseServiceYear(years) {
      var m = String(years || "").match(/(\d{4})/g);
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
            startYear: parseServiceYear(s.years)
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
            startYear: parseServiceYear(s.years)
          });
        });
      }

      if (typeof EXTERNAL_EXAMS !== "undefined") {
        EXTERNAL_EXAMS.forEach(function (x) {
          items.push({
            key: "examining",
            tag: "External examination",
            title: x.name,
            years: x.years,
            venues: x.place ? [x.place] : [],
            role: x.degree + " · External examiner",
            summary: x.topic || "",
            startYear: parseServiceYear(x.years)
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
            startYear: parseServiceYear(e.years)
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
        if (serviceSort === "oldest") return a.startYear - b.startYear || a.title.localeCompare(b.title);
        return b.startYear - a.startYear || a.title.localeCompare(b.title);
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
              '<button type="button" class="fund-card__toggle" aria-expanded="false" aria-controls="' + id + '">… See more</button>' +
            "</div>"
          ) : "") +
        "</li>";
      }).join("");
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
      if (/seed funding|preliminary research|research institute|risud|state key laboratory|carbon neutrality funding|polyu$|the hong kong polytechnic university/.test(f) &&
          !/research grants council|collaborative research fund|nsfc|national natural|countryside|environment and ecology|otto poon|kuwait|ugc|university grants/.test(f)) {
        return "Internal research grant";
      }
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
            '<button type="button" class="fund-card__toggle" aria-expanded="false" aria-controls="' + id + '">… See more</button>' +
          "</div>" +
        "</li>";
      }).join("");
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
