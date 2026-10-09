/* BPR Support Chat: floating support icon + chat answering from the current page's text. */
(function () {
  "use strict";
  var cfg = window.BPR_SC;
  if (!cfg || !cfg.api || document.getElementById("bpr-sw-btn")) return;

  var css = document.createElement("style");
  css.textContent =
    "#bpr-sw-btn{position:fixed;bottom:20px;left:20px;z-index:99999;width:58px;height:58px;border-radius:50%;border:2px solid #39FF14;background:#050505;color:#39FF14;font-size:26px;line-height:1;cursor:pointer;box-shadow:0 0 16px rgba(57,255,20,.5)}" +
    "#bpr-sw-box{position:fixed;bottom:90px;left:20px;z-index:99999;width:min(340px,calc(100vw - 40px));height:440px;max-height:calc(100vh - 110px);display:none;flex-direction:column;background:#0a0a0a;border:1px solid #39FF14;border-radius:14px;overflow:hidden;font:15px system-ui,-apple-system,sans-serif;direction:rtl;color:#eee;box-shadow:0 8px 30px rgba(0,0,0,.6)}" +
    "#bpr-sw-box.open{display:flex}" +
    "#bpr-sw-head{padding:12px 14px;background:#111;color:#39FF14;font-weight:700;display:flex;justify-content:space-between;align-items:center}" +
    "#bpr-sw-close{background:none;border:0;color:#39FF14;font-size:20px;cursor:pointer;line-height:1}" +
    "#bpr-sw-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".bpr-m{padding:8px 12px;border-radius:10px;max-width:85%;white-space:pre-wrap;line-height:1.5;word-break:break-word}" +
    ".bpr-u{align-self:flex-start;background:#39FF14;color:#000}" +
    ".bpr-a{align-self:flex-end;background:#1a1a1a}" +
    "#bpr-sw-form{display:flex;border-top:1px solid #222}" +
    "#bpr-sw-in{flex:1;min-width:0;padding:12px;background:#000;color:#fff;border:0;outline:0;font:inherit}" +
    "#bpr-sw-send{padding:0 16px;background:#39FF14;color:#000;border:0;font-weight:700;cursor:pointer}" +
    "#bpr-sw-send:disabled{opacity:.5;cursor:default}";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.id = "bpr-sw-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "الدعم");
  btn.textContent = "💬";

  var box = document.createElement("div");
  box.id = "bpr-sw-box";
  box.innerHTML =
    '<div id="bpr-sw-head"><span>الدعم ديال BPR</span><button id="bpr-sw-close" type="button" aria-label="إغلاق">×</button></div>' +
    '<div id="bpr-sw-log"></div>' +
    '<form id="bpr-sw-form"><input id="bpr-sw-in" placeholder="سول سؤالك..." autocomplete="off" maxlength="1000"><button id="bpr-sw-send" type="submit">إرسال</button></form>';

  document.body.appendChild(btn);
  document.body.appendChild(box);

  var log = box.querySelector("#bpr-sw-log");
  var form = box.querySelector("#bpr-sw-form");
  var input = box.querySelector("#bpr-sw-in");
  var send = box.querySelector("#bpr-sw-send");
  var history = [];
  var busy = false;

  function add(role, text) {
    var d = document.createElement("div");
    d.className = "bpr-m " + (role === "user" ? "bpr-u" : "bpr-a");
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function pageText() {
    var clone = document.body.cloneNode(true);
    var junk = clone.querySelectorAll("script,style,noscript,iframe,svg,#bpr-sw-box,#bpr-sw-btn,#wpadminbar");
    for (var i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
    var text = (document.title ? document.title + "\n" : "") + (clone.textContent || "");
    return text.replace(/\s+/g, " ").trim().slice(0, 12000);
  }

  function toggle(open) {
    box.classList.toggle("open", open);
    if (box.classList.contains("open")) input.focus();
  }

  add("assistant", "مرحبا! سولني على أي حاجة ف هاد الصفحة.");
  btn.addEventListener("click", function () { toggle(); });
  box.querySelector("#bpr-sw-close").addEventListener("click", function () { toggle(false); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || busy) return;
    busy = true;
    send.disabled = true;
    input.value = "";
    add("user", q);
    history.push({ role: "user", content: q });
    var wait = add("assistant", "...");

    fetch(cfg.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, page: { url: location.href, text: pageText() } })
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, d: d }; }, function () { return { ok: false, d: null }; });
      })
      .then(function (res) {
        if (res.ok && res.d && res.d.reply) {
          wait.textContent = res.d.reply;
          history.push({ role: "assistant", content: res.d.reply });
        } else {
          history.pop(); // keep the conversation sent to the API alternating user/assistant
          wait.textContent = (res.d && res.d.message) || "وقع مشكل، عاود من بعد.";
        }
      })
      .catch(function () {
        history.pop();
        wait.textContent = "وقع مشكل ف الاتصال، عاود من بعد.";
      })
      .then(function () {
        busy = false;
        send.disabled = false;
        log.scrollTop = log.scrollHeight;
      });
  });
})();
