// router.js - Classification routing logic

function handleClassification(result, originalInput) {
  renderResults(result);
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
