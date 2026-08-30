export const LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Profile Resolver API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0b0f19 0%, #111827 100%);
      --accent-blue: #38bdf8;
      --accent-indigo: #6366f1;
      --accent-purple: #a855f7;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --card-bg: rgba(17, 24, 39, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 4rem 1rem;
      overflow-x: hidden;
      position: relative;
    }

    /* Ambient background glows */
    body::before {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      top: -100px;
      left: -100px;
      z-index: 0;
      pointer-events: none;
    }

    body::after {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
      bottom: -150px;
      right: -100px;
      z-index: 0;
      pointer-events: none;
    }

    .container {
      max-width: 900px;
      width: 100%;
      z-index: 1;
    }

    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(to right, var(--accent-blue), var(--accent-indigo), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
      letter-spacing: -0.025em;
    }

    p.subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .badge-row {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid var(--card-border);
    }

    .badge.active {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .badge.inactive {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .badge.tech {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .grid {
        grid-template-columns: 1.2fr 0.8fr;
      }
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 2rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
      transition: border-color 0.3s ease;
    }

    .card:hover {
      border-color: rgba(99, 102, 241, 0.25);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
    }

    input[type="text"] {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 0.85rem 1rem;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
    }

    input[type="text"]:focus {
      border-color: var(--accent-indigo);
      background: rgba(255, 255, 255, 0.06);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    button {
      background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.85rem 1.5rem;
      font-weight: 600;
      font-family: inherit;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      margin-left: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .response-section {
      margin-top: 1.5rem;
      display: none;
      animation: fadeIn 0.3s ease forwards;
    }

    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .status-indicator {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }

    .status-indicator.success {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }

    .status-indicator.error {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }

    pre {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      max-height: 350px;
      color: #e5e7eb;
    }

    /* Links/Actions Card */
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      color: var(--text-main);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--accent-indigo);
      transform: translateX(4px);
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: 0.5rem;
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-indigo);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .curl-box {
      margin-top: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 1rem;
      position: relative;
    }

    .curl-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text-muted);
      white-space: pre-wrap;
      word-break: break-all;
    }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      border-radius: 0.35rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      color: var(--text-main);
      cursor: pointer;
      margin: 0;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .spinner {
      animation: rotate 1s linear infinite;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
    }

    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }

    /* Custom scrollbar styling to look clean and dark */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 99px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .profile-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 2rem;
      backdrop-filter: blur(12px);
      margin-top: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      text-align: left;
    }

    .profile-card:hover {
      border-color: rgba(99, 102, 241, 0.25);
    }

    .profile-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-blue);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.75rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 520px) {
      .profile-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .profile-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .profile-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      word-break: break-all;
    }

    .profile-value a {
      color: var(--accent-indigo);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .profile-value a:hover {
      color: var(--accent-blue);
    }
  </style>
</head>
<body>

<div class="container">
  <header>
    <h1>🔗 LinkedIn Profile Resolver</h1>
    <p class="subtitle">A reverse-engineered browserless API for resolving public LinkedIn profiles into clean, structured JSON.</p>
    
    <div class="badge-row">
      <div id="statusBadge" class="badge">Checking Cookie Session...</div>
      <div class="badge tech">Fastify v5</div>
      <div class="badge tech">TypeScript</div>
      <div class="badge tech">Zod</div>
    </div>
  </header>

  <div class="grid">
    <!-- Playground Card -->
    <div class="card">
      <div class="card-title">🧪 API Playground</div>
      <div class="form-group">
        <label for="profileUrl">LinkedIn Profile URL</label>
        <div class="input-wrapper">
          <input type="text" id="profileUrl" placeholder="https://www.linkedin.com/in/williamhgates" value="https://www.linkedin.com/in/williamhgates">
          <button id="resolveBtn" onclick="resolveProfile()">
            <span>Resolve</span>
          </button>
        </div>
      </div>

      <div class="response-section" id="responseSection">
        <div class="response-header">
          <label>API Response</label>
          <span id="responseStatus" class="status-indicator"></span>
        </div>
        <pre><code id="responseCode"></code></pre>
      </div>
    </div>

    <!-- Actions & Quick Docs -->
    <div class="card">
      <div class="card-title">📖 Reference & Guides</div>
      <div class="actions-list">
        <a href="https://github.com/Jayanthmurala/TrossLinkedInProfileAPI" class="action-btn" target="_blank">
          <div class="action-icon">🐱</div>
          <div>
            <div>GitHub Repository</div>
            <div style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">View project source code</div>
          </div>
        </a>

        <a href="/docs" class="action-btn" target="_blank">
          <div class="action-icon">📘</div>
          <div>
            <div>Swagger UI Docs</div>
            <div style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">Explore interactive API routes</div>
          </div>
        </a>
        
        <a href="/ready" class="action-btn" target="_blank">
          <div class="action-icon">⚙️</div>
          <div>
            <div>Check Readiness</div>
            <div style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">Inspect backend cookie status</div>
          </div>
        </a>
        
        <a href="/health" class="action-btn" target="_blank">
          <div class="action-icon">❤️</div>
          <div>
            <div>Health check</div>
            <div style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">Check system container status</div>
          </div>
        </a>
      </div>

      <div class="curl-box">
        <button class="copy-btn" onclick="copyCurl()">Copy</button>
        <div class="curl-text" id="curlCode">curl -X POST http://localhost:3000/v1/profiles/resolve \
  -H "Content-Type: application/json" \
  -d '{"profileUrl":"https://www.linkedin.com/in/williamhgates"}'</div>
      </div>
    </div>
  </div>

  <footer>
    <div class="profile-card">
      <div class="profile-title">
        👤 Developer Profile
      </div>
      <div class="profile-grid">
        <div class="profile-item">
          <span class="profile-label">Name</span>
          <span class="profile-value">Jayanth Murala</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Email</span>
          <span class="profile-value"><a href="mailto:jayanthmurala1@gmail.com">jayanthmurala1@gmail.com</a></span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Phone</span>
          <span class="profile-value"><a href="tel:+919392971945">+91 9392971945</a></span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Portfolio</span>
          <span class="profile-value"><a href="https://jayanthmurala.com" target="_blank">jayanthmurala.com</a></span>
        </div>
        <div class="profile-item">
          <span class="profile-label">GitHub</span>
          <span class="profile-value"><a href="https://github.com/Jayanthmurala" target="_blank">github.com/Jayanthmurala</a></span>
        </div>
        <div class="profile-item">
          <span class="profile-label">LinkedIn</span>
          <span class="profile-value"><a href="https://linkedin.com/in/jayanthmurala" target="_blank">linkedin.com/in/jayanthmurala</a></span>
        </div>
        <div class="profile-item" style="grid-column: span 1;">
          <span class="profile-label">Resume</span>
          <span class="profile-value"><a href="https://drive.google.com/file/d/1-32BsURpK_c2q-6GUlLT6afryX9VBvbj/view" target="_blank">View Resume 📄</a></span>
        </div>
      </div>
    </div>
    <div style="margin-top: 2rem; font-size: 0.75rem; color: var(--text-muted);">
      LinkedIn Profile Resolver API &bull; Built in Node.js &bull; Open-source
    </div>
  </footer>
</div>

<script>
  // Update port in cURL block dynamically if running on a different port/host
  const currentOrigin = window.location.origin;
  document.getElementById('curlCode').textContent = 'curl -X POST ' + currentOrigin + '/v1/profiles/resolve \\\n  -H "Content-Type: application/json" \\\n  -d \'{"profileUrl":"https://www.linkedin.com/in/williamhgates"}\'';

  // Fetch status badge from readiness endpoint
  fetch('/ready')
    .then(r => r.json())
    .then(data => {
      const badge = document.getElementById('statusBadge');
      if (data.linkedinConfigured) {
        badge.className = 'badge active';
        badge.innerHTML = '🟢 Session Connected';
      } else {
        badge.className = 'badge inactive';
        badge.innerHTML = '🔴 Session Disconnected';
      }
    })
    .catch(() => {
      const badge = document.getElementById('statusBadge');
      badge.className = 'badge inactive';
      badge.innerHTML = '🔴 Service Unavailable';
    });

  function copyCurl() {
    const text = document.getElementById('curlCode').textContent;
    navigator.clipboard.writeText(text);
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  }

  async function resolveProfile() {
    const input = document.getElementById('profileUrl');
    const btn = document.getElementById('resolveBtn');
    const section = document.getElementById('responseSection');
    const code = document.getElementById('responseCode');
    const status = document.getElementById('responseStatus');
    const originalBtnHtml = btn.innerHTML;

    if (!input.value.trim()) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
    section.style.display = 'none';

    try {
      const res = await fetch('/v1/profiles/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: input.value.trim() })
      });
      
      const data = await res.json();
      code.textContent = JSON.stringify(data, null, 2);
      
      if (res.ok) {
        status.className = 'status-indicator success';
        status.textContent = 'HTTP ' + res.status + ' OK';
      } else {
        status.className = 'status-indicator error';
        status.textContent = 'HTTP ' + res.status + ' Error';
      }
    } catch (err) {
      code.textContent = JSON.stringify({ error: err.message }, null, 2);
      status.className = 'status-indicator error';
      status.textContent = 'Network Error';
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
      section.style.display = 'block';
    }
  }
</script>

</body>
</html>`;