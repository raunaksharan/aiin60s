// auth.js - Passcode validation (calls server-side API)

function checkAuth() {
  return localStorage.getItem('nd_authenticated') === 'true';
}

function setAuth() {
  localStorage.setItem('nd_authenticated', 'true');
  localStorage.setItem('nd_auth_time', Date.now());
}

function isSessionValid() {
  const authTime = localStorage.getItem('nd_auth_time');
  if (!authTime) return false;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return (Date.now() - parseInt(authTime)) < thirtyDays;
}

// Landing page logic — only runs on index.html
if (document.getElementById('submit-code')) {
  // Auto-redirect if already authenticated
  if (checkAuth() && isSessionValid()) {
    window.location.href = 'app.html';
  }

  const submitBtn = document.getElementById('submit-code');
  const passcodeInput = document.getElementById('passcode');
  const errorMsg = document.getElementById('error-msg');

  async function handleSubmit() {
    const code = passcodeInput.value.trim();
    if (!code) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (data.valid) {
        setAuth();
        window.location.href = 'app.html';
      } else {
        errorMsg.classList.remove('hidden');
        passcodeInput.value = '';
        passcodeInput.focus();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Prompts →';
      }
    } catch (err) {
      errorMsg.textContent = 'Network error. Please try again.';
      errorMsg.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get My Prompts →';
    }
  }

  submitBtn.addEventListener('click', handleSubmit);
  passcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
}
