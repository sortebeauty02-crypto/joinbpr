# joinbpr support chat

- `widget/support-widget.js`: floating support icon + chat. Sends the visible page text to the Worker as context.
- `worker/`: Cloudflare Worker that calls the Claude API (key stays server-side).

## Deploy
1. `cd worker && npx wrangler deploy`
2. `npx wrangler secret put ANTHROPIC_API_KEY`
3. Host `widget/support-widget.js` and add to the site (WordPress: a footer-scripts plugin):
   `<script src="https://YOUR-HOST/support-widget.js" data-api="https://bpr-support.YOUR-SUBDOMAIN.workers.dev" defer></script>`
4. Allowed origins are listed at the top of `worker/index.js`.
