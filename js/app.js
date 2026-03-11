// app.js - Main entry point

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth() || !isSessionValid()) {
    window.location.href = 'index.html';
    return;
  }

  // Check for incoming context
  checkIncomingContext();

  // Generate button handler
  const generateBtn = document.getElementById('generate-btn');
  const businessInput = document.getElementById('business-input');

  generateBtn.addEventListener('click', async () => {
    const input = businessInput.value.trim();

    if (input.length < 50) {
      alert('Please provide more detail about your business situation (at least 50 characters).');
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').classList.add('hidden');
    generateBtn.querySelector('.btn-loading').classList.remove('hidden');

    try {
      const result = await callGroq(input);
      handleClassification(result, input);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong: ' + error.message);
    } finally {
      // Reset button state
      generateBtn.disabled = false;
      generateBtn.querySelector('.btn-text').classList.remove('hidden');
      generateBtn.querySelector('.btn-loading').classList.add('hidden');
    }
  });

  // Logout handler
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('nd_authenticated');
    localStorage.removeItem('nd_auth_time');
    window.location.href = 'index.html';
  });
});
