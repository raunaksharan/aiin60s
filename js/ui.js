// ui.js - Results rendering

function renderResults(result) {
  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.remove('hidden');

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  resultsSection.innerHTML = `
    <div class="results-container">

      <!-- Business Summary -->
      <div class="summary-card">
        <h2>Your Situation</h2>
        <p>${escapeHtml(result.business_summary)}</p>
      </div>

      <!-- Prompts Section -->
      <div class="prompts-section">
        <h2>Your 10 AI Prompts</h2>
        <p class="section-subtitle">Copy-paste ready. Use with ChatGPT, Claude, or any AI tool.</p>

        <div class="prompts-grid">
          ${renderPromptsByCategory(result.prompts)}
        </div>
      </div>

      <!-- Agents Section -->
      <div class="agents-section">
        <h2>Want Us to Build This For You?</h2>
        <p class="section-subtitle">Our team can deploy these agents for your business in 1 week.</p>

        <div class="agents-grid">
          ${result.recommended_agents.map(agent => `
            <div class="agent-card">
              <h3>${escapeHtml(agent.name)}</h3>
              <p class="agent-does">${escapeHtml(agent.does)}</p>
              <div class="agent-metrics">
                <div class="metric">
                  <span class="metric-value">${escapeHtml(agent.time_saved)}</span>
                  <span class="metric-label">Time Saved</span>
                </div>
                <div class="metric">
                  <span class="metric-value">${escapeHtml(agent.roi_impact)}</span>
                  <span class="metric-label">Impact</span>
                </div>
              </div>
              <p class="agent-why">${escapeHtml(agent.why_for_you)}</p>
            </div>
          `).join('')}
        </div>

        <!-- Total ROI -->
        <div class="roi-summary">
          <h3>Combined Impact</h3>
          <p>${escapeHtml(result.total_roi_summary)}</p>
        </div>

        <!-- Deep Dive Links -->
        <div class="deep-dive-section">
          <p class="deep-dive-heading">Want to go deeper?</p>
          <div class="deep-dive-cards">
            <a href="https://notiondemandforecast.info" target="_blank" rel="noopener" class="deep-dive-card">
              <span class="dd-icon">📈</span>
              <span class="dd-label">Demand Forecasting & Inventory Planning</span>
              <span class="dd-arrow">→</span>
            </a>
            <a href="https://notiondemandml.info" target="_blank" rel="noopener" class="deep-dive-card">
              <span class="dd-icon">🤖</span>
              <span class="dd-label">Machine Learning & Predictive Analytics</span>
              <span class="dd-arrow">→</span>
            </a>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-section">
          <h3>Ready to automate?</h3>
          <div class="cta-buttons">
            <a href="https://calendly.com/team-notiondemand" target="_blank" class="cta-primary">
              Book a Strategy Call (DFY)
            </a>
          </div>
          <p class="cta-note">Done-For-You: ₹1L – ₹3L | Done-With-You available</p>
          <p class="cta-contact">Contact us: <a href="mailto:team@notiondemand.com">team@notiondemand.com</a> | Ph: <a href="tel:+919082673098">+91 9082673098</a></p>
        </div>
      </div>

    </div>
  `;

  // Add copy functionality to prompts
  addCopyListeners();
}

function renderPromptsByCategory(prompts) {
  const categories = {
    quick_win: { title: 'Quick Wins', icon: '⚡', prompts: [] },
    data_clarity: { title: 'Data Clarity', icon: '📊', prompts: [] },
    implementation: { title: 'Implementation', icon: '🔧', prompts: [] },
    scale: { title: 'Scale', icon: '🚀', prompts: [] }
  };

  prompts.forEach(p => {
    if (categories[p.category]) {
      categories[p.category].prompts.push(p);
    }
  });

  let html = '';

  for (const [key, cat] of Object.entries(categories)) {
    if (cat.prompts.length === 0) continue;

    html += `
      <div class="prompt-category">
        <h3>${cat.icon} ${cat.title}</h3>
        ${cat.prompts.map((p, i) => {
          const pr = p.prompt;
          const isStructured = pr && typeof pr === 'object';
          const fullPromptText = isStructured
            ? `ROLE: ${pr.role}\n\nCONTEXT: ${pr.context}\n\nTASK: ${pr.task}\n\nSTEPS: ${pr.steps}\n\nCONSTRAINTS: ${pr.constraints}\n\nOUTPUT: ${pr.output}`
            : (typeof pr === 'string' ? pr : '');
          return `
          <div class="prompt-card">
            <div class="prompt-header">
              <span class="prompt-title">${escapeHtml(p.title)}</span>
              <button class="copy-btn" data-prompt="${escapeHtml(fullPromptText)}">Copy</button>
            </div>
            ${isStructured ? `
              <div class="prompt-decomposed">
                <div class="pd-row"><span class="pd-label">🎭 Role</span><span class="pd-value">${escapeHtml(pr.role)}</span></div>
                <div class="pd-row"><span class="pd-label">🏢 Context</span><span class="pd-value">${escapeHtml(pr.context)}</span></div>
                <div class="pd-row"><span class="pd-label">🎯 Task</span><span class="pd-value">${escapeHtml(pr.task)}</span></div>
                <div class="pd-row"><span class="pd-label">📋 Steps</span><span class="pd-value pd-steps">${escapeHtml(pr.steps)}</span></div>
                <div class="pd-row"><span class="pd-label">⚠️ Constraints</span><span class="pd-value">${escapeHtml(pr.constraints)}</span></div>
                <div class="pd-row pd-output-row"><span class="pd-label">📤 Output</span><span class="pd-value">${escapeHtml(pr.output)}</span></div>
              </div>
            ` : `<p class="prompt-text">${escapeHtml(fullPromptText)}</p>`}
            <p class="prompt-why">${escapeHtml(p.why)}</p>
          </div>
        `}).join('')}
      </div>
    `;
  }

  return html;
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function addCopyListeners() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      // Decode HTML entities back to plain text for clipboard
      const div = document.createElement('div');
      div.innerHTML = prompt;
      const plainText = div.textContent;
      navigator.clipboard.writeText(plainText).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
  });
}
