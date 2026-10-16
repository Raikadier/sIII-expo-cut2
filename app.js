/* ============================================================
   MOTOR DE LA HISTORIA
   Para cambiar el guion, edita scenes.js. No hace falta tocar esto.
   ============================================================ */
(function () {
  "use strict";

  var STORY = window.STORY;
  if (!STORY) {
    document.body.innerHTML =
      "<p style='padding:2rem;font:16px system-ui'>No se encontro scenes.js</p>";
    return;
  }

  /* Geometria de los nodos, en unidades del viewBox del SVG. */
  var NODE_HW = 10;   // semiancho
  var NODE_HH = 4.5;  // semialto
  var LABEL_OFF = 2.6; // cuanto se separa una etiqueta de su arista

  var state = { scene: 0, beat: 0, notes: false, ref: false };
  var quizAnswered = {}; // "idEscena:indicePregunta" -> indiceOpcion

  /* ---------------- utilidades ---------------- */

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function el(tag, cls, textOrHtml) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (textOrHtml != null) node.innerHTML = textOrHtml;
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    return node;
  }

  var JAVA_KEYWORDS = {
    "public": 1, "private": 1, "protected": 1, "class": 1, "interface": 1,
    "extends": 1, "implements": 1, "new": 1, "return": 1, "void": 1, "if": 1,
    "else": 1, "while": 1, "for": 1, "final": 1, "static": 1, "this": 1,
    "super": 1, "import": 1, "package": 1, "throws": 1, "throw": 1, "try": 1,
    "catch": 1, "boolean": 1, "int": 1, "long": 1, "double": 1, "float": 1,
    "char": 1, "null": 1, "true": 1, "false": 1
  };

  function highlightJava(src) {
    var pattern = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|\b[A-Za-z_$][A-Za-z0-9_$]*\b|\b\d+(?:\.\d+)?\b/g;
    var out = "";
    var last = 0;
    var m;
    while ((m = pattern.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      var token = m[0];
      var cls;
      if (token.indexOf("//") === 0 || token.indexOf("/*") === 0) cls = "c";
      else if (token.charAt(0) === '"') cls = "s";
      else if (/^[0-9]/.test(token)) cls = "n";
      else if (JAVA_KEYWORDS[token]) cls = "k";
      else if (/^[A-Z]/.test(token)) cls = "y";
      else cls = "i";
      out += '<span class="tok-' + cls + '">' + esc(token) + "</span>";
      last = m.index + token.length;
    }
    out += esc(src.slice(last));
    return out;
  }

  /* Recorta el segmento centro-a-centro hasta el borde del rectangulo. */
  function edgeEndpoints(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var tx = dx === 0 ? Infinity : NODE_HW / Math.abs(dx);
    var ty = dy === 0 ? Infinity : NODE_HH / Math.abs(dy);
    var t = Math.min(tx, ty);
    return {
      x1: a.x + dx * t,
      y1: a.y + dy * t,
      x2: b.x - dx * t,
      y2: b.y - dy * t
    };
  }

  /* ---------------- navegacion ---------------- */

  function stepCount(scene) {
    return scene.beats && scene.beats.length ? scene.beats.length : 1;
  }

  function totalSteps() {
    return STORY.scenes.reduce(function (acc, s) { return acc + stepCount(s); }, 0);
  }

  function stepsBefore(index) {
    var acc = 0;
    for (var i = 0; i < index; i++) acc += stepCount(STORY.scenes[i]);
    return acc;
  }

  function atStart() {
    return state.scene === 0 && state.beat === 0;
  }

  function atEnd() {
    var last = STORY.scenes.length - 1;
    return state.scene === last && state.beat === stepCount(STORY.scenes[last]) - 1;
  }

  function next() {
    if (atEnd()) return;
    if (state.beat < stepCount(STORY.scenes[state.scene]) - 1) {
      state.beat++;
    } else {
      state.scene++;
      state.beat = 0;
    }
    render();
  }

  function prev() {
    if (atStart()) return;
    if (state.beat > 0) {
      state.beat--;
    } else {
      state.scene--;
      state.beat = stepCount(STORY.scenes[state.scene]) - 1;
    }
    render();
  }

  function goToScene(index) {
    if (index < 0 || index >= STORY.scenes.length) return;
    state.scene = index;
    state.beat = 0;
    render();
  }

  /* ---------------- renderizadores por tipo ---------------- */

  function renderCover(scene, host) {
    var box = el("div", "cover");
    box.appendChild(el("p", "cover-kicker", esc(scene.chapter)));
    box.appendChild(el("h1", "cover-title", esc(scene.title)));
    box.appendChild(el("p", "cover-sub", esc(scene.subtitle)));
    box.appendChild(el("p", "cover-narration", esc(scene.narration)));
    box.appendChild(el("p", "cover-meta",
      esc(STORY.meta.course) + " &middot; " + esc(STORY.meta.author)));
    host.appendChild(box);
  }

  function renderGraph(scene, host, beat) {
    var graph = scene.graph;
    var byId = {};
    graph.nodes.forEach(function (n) { byId[n.id] = n; });

    var activeNodes = beat.active || [];
    var countedNodes = beat.counted || [];
    var activeEdges = beat.edges || [];

    var svg = svgEl("svg", {
      viewBox: graph.viewBox || "0 0 100 70",
      "class": "graph-svg",
      role: "img",
      "aria-label": "Grafo de colaboraciones entre las clases de la empresa"
    });

    /* Los marcadores se construyen con createElementNS, no con innerHTML:
       innerHTML sobre elementos SVG no es fiable en todos los navegadores.
       Ademas el fill va explicito: currentColor dentro de un <marker> no
       hereda del elemento que lo referencia. */
    var defs = svgEl("defs");
    [
      ["arrowhead", "#2b3a4c"],
      ["arrowhead-on", "#7ee0c0"],
      ["arrowhead-warn", "#e0a33c"]
    ].forEach(function (spec) {
      var marker = svgEl("marker", {
        id: spec[0],
        viewBox: "0 0 6 6",
        refX: "5.5",
        refY: "3",
        markerWidth: "5",
        markerHeight: "5",
        orient: "auto-start-reverse"
      });
      marker.appendChild(svgEl("path", {
        d: "M0,0 L6,3 L0,6 z",
        fill: spec[1]
      }));
      defs.appendChild(marker);
    });
    svg.appendChild(defs);

    (graph.edges || []).forEach(function (edge) {
      var a = byId[edge.from];
      var b = byId[edge.to];
      if (!a || !b) return;
      var p = edgeEndpoints(a, b);
      var isOn = activeEdges.indexOf(edge.id) !== -1;

      var cls = "edge";
      if (edge.muted) cls += " edge-muted";
      if (edge.warning) cls += " edge-warn";
      if (isOn) cls += " edge-on";

      /* Una arista de aviso activa tambien se pinta en ambar (ver .edge-on.edge-warn),
         asi que la punta tiene que ser la misma en los dos casos. */
      var markerId = edge.warning ? "arrowhead-warn"
        : (isOn ? "arrowhead-on" : "arrowhead");

      var line = svgEl("line", {
        x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2,
        "class": cls,
        "marker-end": "url(#" + markerId + ")"
      });
      svg.appendChild(line);

      if (edge.label) {
        /* La etiqueta va en el punto medio del segmento visible, desplazada
           perpendicularmente: si se deja sobre la linea, el texto se solapa
           con las cajas de los nodos y queda tapado (los nodos se dibujan
           despues de las aristas). */
        var mx = (p.x1 + p.x2) / 2;
        var my = (p.y1 + p.y2) / 2;
        var edx = p.x2 - p.x1;
        var edy = p.y2 - p.y1;
        var elen = Math.sqrt(edx * edx + edy * edy) || 1;

        var label = svgEl("text", {
          x: mx + (edy / elen) * LABEL_OFF,
          y: my - (edx / elen) * LABEL_OFF,
          "class": "edge-label" + (isOn ? " edge-label-on" : ""),
          "text-anchor": "middle"
        });
        label.textContent = edge.label;
        svg.appendChild(label);
      }
    });

    graph.nodes.forEach(function (node) {
      var cls = "node node-" + (node.kind || "class");
      if (node.muted) cls += " node-muted";
      if (countedNodes.indexOf(node.id) !== -1) cls += " node-counted";
      if (activeNodes.indexOf(node.id) !== -1) cls += " node-active";

      var group = svgEl("g", {
        "class": cls,
        transform: "translate(" + node.x + "," + node.y + ")"
      });

      group.appendChild(svgEl("rect", {
        x: -NODE_HW, y: -NODE_HH,
        width: NODE_HW * 2, height: NODE_HH * 2,
        rx: 1.6, "class": "node-box"
      }));

      var name = svgEl("text", {
        "class": "node-label", "text-anchor": "middle", y: -0.2
      });
      name.textContent = node.label;
      group.appendChild(name);

      var role = svgEl("text", {
        "class": "node-role", "text-anchor": "middle", y: 3.2
      });
      role.textContent = node.role;
      group.appendChild(role);

      svg.appendChild(group);
    });

    var stage = el("div", "stage-graph");
    stage.appendChild(svg);

    if (beat.hud) {
      var hud = el("div", "hud" + (beat.hud.warn ? " hud-warn" : ""));
      hud.appendChild(el("span", "hud-label", esc(beat.hud.label)));
      hud.appendChild(el("span", "hud-value", esc(beat.hud.value)));
      if (beat.hud.delta) hud.appendChild(el("span", "hud-delta", esc(beat.hud.delta)));
      if (beat.hud.warn) hud.appendChild(el("span", "hud-warn-text", esc(beat.hud.warn)));
      stage.appendChild(hud);
    }

    host.appendChild(stage);
  }

  function renderTable(scene, host) {
    var data = scene.table;
    var wrap = el("div", "table-wrap");
    var table = el("table", "mtable");

    var thead = el("thead");
    var headRow = el("tr");
    data.headers.forEach(function (h, i) {
      headRow.appendChild(el("th", i === 0 ? "th-first" : "", esc(h)));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el("tbody");
    data.rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (cell, i) {
        tr.appendChild(el("td", i === 0 ? "td-first" : "", esc(cell)));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    host.appendChild(wrap);

    if (data.warnings && data.warnings.length) {
      var box = el("div", "warnings");
      box.appendChild(el("p", "warnings-title", "Advertencias"));
      var ul = el("ul");
      data.warnings.forEach(function (w) { ul.appendChild(el("li", null, esc(w))); });
      box.appendChild(ul);
      host.appendChild(box);
    }
  }

  function renderCode(scene, host) {
    var grid = el("div", "code-grid");
    [["before", scene.code.before], ["after", scene.code.after]].forEach(function (pair) {
      var panel = el("div", "code-panel code-" + pair[0]);
      panel.appendChild(el("div", "code-label", esc(pair[1].label)));
      var pre = el("pre", "code-block");
      var code = el("code");
      code.innerHTML = highlightJava(pair[1].source);
      pre.appendChild(code);
      panel.appendChild(pre);
      grid.appendChild(panel);
    });
    host.appendChild(grid);
  }

  function renderQuiz(scene, host) {
    var wrap = el("div", "quiz");

    scene.quiz.questions.forEach(function (item, qi) {
      var key = scene.id + ":" + qi;
      var chosen = quizAnswered[key];

      var card = el("div", "quiz-card");
      card.appendChild(el("p", "quiz-q", (qi + 1) + ". " + esc(item.q)));

      var options = el("div", "quiz-options");
      item.options.forEach(function (option, oi) {
        var btn = el("button", "quiz-opt");
        btn.type = "button";
        btn.textContent = option;

        if (chosen == null) {
          btn.addEventListener("click", function () {
            quizAnswered[key] = oi;
            render();
          });
        } else {
          btn.disabled = true;
          if (oi === item.correct) btn.classList.add("is-correct");
          else if (oi === chosen) btn.classList.add("is-wrong");
        }
        options.appendChild(btn);
      });
      card.appendChild(options);

      if (chosen != null) {
        var ok = chosen === item.correct;
        card.appendChild(el("p", "quiz-why " + (ok ? "ok" : "bad"),
          "<strong>" + (ok ? "Correcto. " : "Incorrecto. ") + "</strong>" + esc(item.why)));
      }

      wrap.appendChild(card);
    });

    host.appendChild(wrap);
  }

  function renderClosing(scene, host) {
    var box = el("div", "closing");
    var ol = el("ol", "points");
    scene.points.forEach(function (p) { ol.appendChild(el("li", null, esc(p))); });
    box.appendChild(ol);

    if (scene.sources && scene.sources.length) {
      var src = el("div", "sources");
      src.appendChild(el("p", "sources-title", "Fuentes"));
      var ul = el("ul");
      scene.sources.forEach(function (s) { ul.appendChild(el("li", null, esc(s))); });
      src.appendChild(ul);
      box.appendChild(src);
    }
    host.appendChild(box);
  }

  /* ---------------- render principal ---------------- */

  function render() {
    var scene = STORY.scenes[state.scene];
    var beats = scene.beats && scene.beats.length ? scene.beats : [{}];
    if (state.beat >= beats.length) state.beat = beats.length - 1;
    var beat = beats[state.beat] || {};

    document.getElementById("chapter").textContent = scene.chapter || "";
    document.getElementById("title").textContent = scene.title || "";
    document.getElementById("narration").textContent = beat.say || scene.narration || "";

    var stage = document.getElementById("stage");
    stage.innerHTML = "";
    stage.className = "stage stage-" + scene.kind;

    if (scene.kind === "cover") renderCover(scene, stage);
    else if (scene.kind === "graph") renderGraph(scene, stage, beat);
    else if (scene.kind === "table") renderTable(scene, stage);
    else if (scene.kind === "code") renderCode(scene, stage);
    else if (scene.kind === "quiz") renderQuiz(scene, stage);
    else if (scene.kind === "closing") renderClosing(scene, stage);

    var side = document.getElementById("concept");
    side.innerHTML = "";
    var concept = beat.concept || scene.concept;
    if (concept) {
      var box = el("div", "concept");
      box.appendChild(el("p", "concept-term", esc(concept.term)));
      if (concept.body) box.appendChild(el("p", "concept-body", esc(concept.body)));
      if (concept.formula) box.appendChild(el("p", "concept-formula", esc(concept.formula)));
      side.appendChild(box);
    } else {
      side.appendChild(el("div", "concept concept-empty",
        '<p class="concept-body">' + esc(STORY.meta.hint) + "</p>"));
    }

    document.getElementById("notes-text").textContent =
      beat.note || "Sin notas para esta escena.";
    document.getElementById("notes").classList.toggle("open", state.notes);
    document.getElementById("ref").classList.toggle("open", state.ref);

    var done = stepsBefore(state.scene) + state.beat + 1;
    document.getElementById("progress-fill").style.width =
      (done / totalSteps() * 100) + "%";
    document.getElementById("progress-text").textContent =
      (state.scene + 1) + "/" + STORY.scenes.length +
      (beats.length > 1 ? " · paso " + (state.beat + 1) + "/" + beats.length : "");

    document.getElementById("btn-prev").disabled = atStart();
    document.getElementById("btn-next").disabled = atEnd();
  }

  /* ---------------- acciones de interfaz ---------------- */

  function toggleNotes() {
    state.notes = !state.notes;
    document.getElementById("notes").classList.toggle("open", state.notes);
    document.getElementById("btn-notes").setAttribute("aria-pressed", String(state.notes));
  }

  function toggleRef() {
    state.ref = !state.ref;
    document.getElementById("ref").classList.toggle("open", state.ref);
    document.getElementById("btn-ref").setAttribute("aria-pressed", String(state.ref));
  }

  function ignore() { /* el navegador puede rechazar la peticion */ }

  function toggleFull() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        var request = document.documentElement.requestFullscreen();
        if (request && request.catch) request.catch(ignore);
      }
    } else if (document.exitFullscreen) {
      var exit = document.exitFullscreen();
      if (exit && exit.catch) exit.catch(ignore);
    }
  }

  function onKey(event) {
    var k = event.key;

    if (k === "Escape") {
      if (state.ref) { toggleRef(); return; }
      if (state.notes) { toggleNotes(); return; }
      return;
    }
    if (k === "s" || k === "S") { toggleNotes(); return; }
    if (k === "r" || k === "R") { toggleRef(); return; }
    if (k === "f" || k === "F") { toggleFull(); return; }
    if (k === "Home") { goToScene(0); return; }
    if (k === "End") { goToScene(STORY.scenes.length - 1); return; }

    if (state.ref || state.notes) return;

    if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Enter" || k === "n") {
      event.preventDefault();
      next();
      return;
    }
    if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace" || k === "p") {
      event.preventDefault();
      prev();
    }
  }

  function bindSwipe(node) {
    var x0 = null;
    node.addEventListener("touchstart", function (e) {
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    node.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { (dx < 0 ? next : prev)(); }
      x0 = null;
    }, { passive: true });
  }

  function init() {
    document.getElementById("btn-next").addEventListener("click", next);
    document.getElementById("btn-prev").addEventListener("click", prev);
    document.getElementById("btn-notes").addEventListener("click", toggleNotes);
    document.getElementById("btn-ref").addEventListener("click", toggleRef);
    document.getElementById("btn-full").addEventListener("click", toggleFull);
    document.getElementById("notes-close").addEventListener("click", toggleNotes);
    document.getElementById("ref-close").addEventListener("click", toggleRef);
    document.addEventListener("keydown", onKey);
    bindSwipe(document.getElementById("stage"));
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
