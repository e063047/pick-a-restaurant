// js/app.js
function pad(n) {
  return String(n).padStart(2, '0');
}

const now = new Date();
document.getElementById('date-input').value =
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
document.getElementById('time-input').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

console.log('app loaded');
