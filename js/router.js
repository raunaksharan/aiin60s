// router.js - Classification routing logic

function handleClassification(result, originalInput) {
  const classification = result.classification;
  const encodedInput = encodeURIComponent(originalInput);

  switch (classification) {
    case 'forecasting':
      window.location.href = `https://notiondemandforecast.info?context=${encodedInput}`;
      break;

    case 'ml':
      window.location.href = `https://notiondemandml.info?context=${encodedInput}`;
      break;

    case 'agents':
      renderResults(result);
      break;

    default:
      // Default to agents if unclear
      renderResults(result);
  }
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
