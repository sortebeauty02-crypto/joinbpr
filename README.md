# joinbpr support chat

A floating support icon with an AI assistant that answers visitors' questions from the content of the page they are on. Three ways to run the backend; the WordPress plugin is the recommended one.

## Option 1 (recommended): WordPress plugin

`wordpress/bpr-support-chat/` — ready-made zip at `wordpress/bpr-support-chat.zip`.

1. WordPress admin → **Plugins → Add New → Upload Plugin** → choose the zip → **Install Now** → **Activate**.
2. **Settings → BPR Support Chat** → paste your Claude API key (from console.anthropic.com) → **Save**.
3. Open the site: the green 💬 icon appears bottom-left.

The key is stored in `wp_options` (never sent to the browser). The settings page also shows the last upstream error (bad key, no credit, …). Limits: 20 questions per visitor per 10 minutes, 500 per day site-wide (`bpr_sc_daily_limit` filter). Uses `wp_remote_post` on purpose (no Composer on shared hosting).

Rebuild the zip after editing the plugin: `python3 -c "import shutil; shutil.make_archive('wordpress/bpr-support-chat','zip','wordpress','bpr-support-chat')"`.

## Option 2: Cloudflare Worker

`worker/` + `widget/support-widget.js`.

1. `cd worker && npx wrangler deploy`
2. `npx wrangler secret put ANTHROPIC_API_KEY`
3. Host `widget/support-widget.js` and add to the site:
   `<script src="https://YOUR-HOST/support-widget.js" data-api="https://bpr-support.YOUR-SUBDOMAIN.workers.dev" defer></script>`
4. Allowed origins are listed at the top of `worker/index.js`.

## Option 3: plain PHP on Hostinger

`hostinger/support-chat.php` + `widget/support-widget.js`.

1. Upload `support-chat.php` to `public_html/`.
2. Create `support-chat-key.txt` one level ABOVE `public_html/` containing only the API key.
3. Script tag as in option 2 with `data-api="https://joinbpr.com/support-chat.php"`.

## Model

Default is `claude-opus-5-5`; the plugin has a dropdown (Opus 5.5 / Sonnet 5.5 / Haiku 5.5). For options 2 and 3 change the `MODEL` constant.
