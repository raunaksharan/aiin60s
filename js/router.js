// router.js - Classification routing logic

const REDIRECT_MESSAGES = {
  forecasting: {
    label: 'Demand Forecasting & Inventory',
    url: 'https://notiondemandforecast.info',
    reason: 'Your situation involves demand planning and forecasting. We have a dedicated tool for that — opening it in a new tab.'
  },
  ml: {
    label: 'Machine Learning & Predictive Analytics',
    url: 'https://notiondemandml.info',
    reason: 'Your situation involves ML and predictive analytics. We have a dedicated tool for that — opening it in a new tab.'
  }
};

function handleClassification(result, originalInput) {
  const classification = result.classification;
  const encodedInput = encodeURIComponent(originalInput);

  // Always render prompts + agents on this page
  renderResults(result);

  // For forecasting/ml, also open the specialist site in a new tab with a banner
  if (classification === 'forecasting' || classification === 'ml') {
    const meta = REDIRECT_MESSAGES[classification];
    showRedirectBanner(meta, encodedInput);
  }
}

function showRedirectBanner(meta, encodedInput) {
  const banner = document.createElement('div');
  banner.className = 'redirect-banner';
  banner.innerHTML = `
    <div class="redirect-banner-inner">
      <div>
        <strong>We also detected a ${meta.label} need.</strong>
        <span>${meta.reason}</span>
      </div>
      <a href="${meta.url}?context=${encodedInput}" target="_blank" rel="noopener" class="redirect-banner-btn">
        Open Specialist Tool →
      </a>
      <button class="redirect-banner-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  document.querySelector('main').prepend(banner);
}

// Check for incoming context from other sites (if needed)
function checkIncomingContext() {
  const params = new URLSearchParams(window.location.search);
  const context = params.get('context');

  if (context) {
    const inputBox = document.getElementById('business-input');
    if (inputBox) {
      inputBox.value = decodeURIComponent(context);
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkIncomingContext);
