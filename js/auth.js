// auth.js - Passcode validation

const VALID_PASSCODES = [
  'NOTIONAI2024',
  'EARLYADOPTER',
  // Add codes as needed
];

function validatePasscode(code) {
  return VALID_PASSCODES.includes(code.toUpperCase().trim());
}

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

  function handleSubmit() {
    const code = passcodeInput.value;
    if (validatePasscode(code)) {
      setAuth();
      window.location.href = 'app.html';
    } else {
      errorMsg.classList.remove('hidden');
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  }

  submitBtn.addEventListener('click', handleSubmit);
  passcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
}
