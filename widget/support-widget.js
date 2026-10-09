// Floating support icon + AI chat. Reads the current page's text and sends it to the Worker as context.
(function () {
  var s = document.currentScript;
  var API = s && s.getAttribute("data-api");
  if (!API) return;

  var css = document.createElement("style");
  css.textContent =
    "#bpr-sw-btn{position:fixed;bottom:20px;left:20px;z-index:99999;width:56px;height:56px;border-radius:50%;border:2px solid #39FF14;background:#050505;color:#39FF14;font-size:26px;cursor:pointer;box-shadow:0 0 16px rgba(57,255,20,.5)}" +
    "#bpr-sw-box{position:fixed;bottom:88px;left:20px;z-index:99999;width:min(340px,calc(100vw - 40px));height:440px;max-height:calc(100vh - 110px);display:none;flex-direction:column;background:#0a0a0a;border:1px solid #39FF14;border-radius:14px;overflow:hidden;font:15px system-ui,sans-serif;direction:rtl;color:#eee}" +
    "#bpr-sw-box.open{display:flex}#bpr-sw-head{padding:12px 14px;background:#111;color:#39FF14;font-weight:700}" +
    "#bpr-sw-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".bpr-m{padding:8px 12px;border-radius:10px;max-width:85%;white-space:pre-wrap;line-height:1.5}" +
    ".bpr-u{align-self:flex-start;background:#39FF14;color:#000}.bpr-a{align-self:flex-end;background:#1a1a1a}" +
    "#bpr-sw-form{display:flex;border-top:1px solid #222}#bpr-sw-in{flex:1;padding:12px;background:#000;color:#fff;border:0;outline:0;font:inherit}" +
    "#bpr-sw-send{padding:0 16px;background:#39FF14;color:#000;border:0;font-weight:700;cursor:pointer}";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.id = "bpr-sw-btn"; btn.setAttribute("aria-label", "الدعم"); btn.textContent = "💬";
  var box = document.createElement("div");
  box.id = "bpr-sw-box";
  box.innerHTML = '<div id="bpr-sw-head">الدعم ديال BPR</div><div id="bpr-sw-log"></div>' +
    '<form id="bpr-sw-form"><input id="bpr-sw-in" placeholder="سول سؤالك..." autocomplete="off"><button id="bpr-sw-send">إرسال</button></form>';
  document.body.appendChild(btn); document.body.appendChild(box);

  var log = box.querySelector("#bpr-sw-log"), form = box.querySelector("#bpr-sw-form"), input = box.querySelector("#bpr-sw-in");
  var history = [];

  function add(role, text) {
    var d = document.createElement("div");
    d.className = "bpr-m " + (role === "user" ? "bpr-u" : "bpr-a");
    d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function pageText() {
    var c = document.body.cloneNode(true);
    c.querySelectorAll("script,style,noscript,#bpr-sw-box,#bpr-sw-btn,#wpadminbar").forEach(function (n) { n.remove(); });
    return (c.textContent || "").replace(/\s+/g, " ").trim().slice(0, 12000);
  }

  add("assistant", "مرحبا! سولني على أي حاجة ف هاد الصفحة.");
  btn.onclick = function () { box.classList.toggle("open"); if (box.classList.contains("open")) input.focus(); };

  form.onsubmit = function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    input.value = ""; add("user", q); history.push({ role: "user", content: q });
    var wait = add("assistant", "...");
    fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, page: { text: pageText() } }),
    }).then(function (r) { return r.json(); }).then(function (d) {
      var t = d.reply || "وقع مشكل، عاود من بعد.";
      wait.textContent = t; if (d.reply) history.push({ role: "assistant", content: t });
    }).catch(function () { wait.textContent = "وقع مشكل ف الاتصال، عاود من بعد."; });
  };
})();
