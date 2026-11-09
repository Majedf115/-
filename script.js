// ===== القائمة في الجوال =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ===== محاكاة جزيئات الغاز =====
const canvas = document.getElementById('gasCanvas');
const ctx = canvas.getContext('2d');
const particles = [];
let hits = 0;

for (let i = 0; i < 30; i++) {
  particles.push({
    x: Math.random() * 320 + 20,
    y: Math.random() * 320 + 20,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    r: 7,
    flash: 0
  });
}

function animateGas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x - p.r < 0 || p.x + p.r > canvas.width) { p.vx *= -1; p.flash = 10; hits++; }
    if (p.y - p.r < 0 || p.y + p.r > canvas.height) { p.vy *= -1; p.flash = 10; hits++; }
    p.x = Math.max(p.r, Math.min(canvas.width - p.r, p.x));
    p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.flash > 0 ? '#f97316' : '#0284c7';
    ctx.fill();
    if (p.flash > 0) p.flash--;
  });

  ctx.fillStyle = '#075985';
  ctx.font = 'bold 15px Tajawal';
  ctx.textAlign = 'right';
  ctx.fillText('عدد التصادمات بالجدران: ' + hits, canvas.width - 12, 24);
  requestAnimationFrame(animateGas);
}
animateGas();

// ===== البارومتر =====
const baroSlider = document.getElementById('baroSlider');
const baroMercury = document.getElementById('baroMercury');
const baroValue = document.getElementById('baroValue');

function updateBaro() {
  const v = +baroSlider.value;
  baroMercury.style.height = (v / 800) * 100 + '%';
  baroValue.textContent = v + ' mmHg';
}
baroSlider.addEventListener('input', updateBaro);
updateBaro();

// ===== المانومتر =====
const manoSlider = document.getElementById('manoSlider');
const hgLeft = document.getElementById('hgLeft');   // جهة الغاز
const hgRight = document.getElementById('hgRight'); // الجهة الأخرى
const manoValue = document.getElementById('manoValue');

function updateMano() {
  const d = +manoSlider.value;
  const base = 50; // نسبة مئوية
  hgLeft.style.height = (base - d / 4) + '%';
  hgRight.style.height = (base + d / 4) + '%';
  manoValue.textContent = 'فرق الارتفاع: ' + d + ' mm  =  ضغط ' + d + ' mmHg';
}
manoSlider.addEventListener('input', updateMano);
updateMano();

// ===== حاسبة التحويل =====
// كل الوحدات تُحوَّل أولاً إلى الباسكال
const toPa = {
  Pa: 1,
  kPa: 1000,
  atm: 101325,
  mmHg: 101325 / 760,
  Torr: 101325 / 760
};

const convValue = document.getElementById('convValue');
const convUnit = document.getElementById('convUnit');
const convResults = document.getElementById('convResults');

function formatNum(n) {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1e7 || Math.abs(n) < 1e-4) return n.toExponential(4);
  return parseFloat(n.toFixed(5)).toLocaleString('en-US', { maximumFractionDigits: 5 });
}

function convert() {
  const value = parseFloat(convValue.value);
  const from = convUnit.value;
  convResults.innerHTML = '';

  if (isNaN(value)) {
    convResults.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#dc2626">الرجاء إدخال رقم صحيح</p>';
    return;
  }

  const pa = value * toPa[from];
  Object.keys(toPa).forEach(unit => {
    if (unit === from) return;
    const box = document.createElement('div');
    box.className = 'result-box';
    box.innerHTML = `<div class="val">${formatNum(pa / toPa[unit])}</div><div class="unit">${unit}</div>`;
    convResults.appendChild(box);
  });
}
convValue.addEventListener('input', convert);
convUnit.addEventListener('change', convert);
convert();

// ===== الاختبار =====
const questions = [
  {
    q: '1) ما وحدة الضغط في النظام الدولي للوحدات (SI)؟',
    options: ['الضغط الجوي atm', 'الباسكال Pa', 'المليمتر زئبق mmHg', 'التور Torr'],
    answer: 1,
    explain: 'الباسكال (Pa) هو وحدة الضغط في النظام الدولي، ويساوي 1 N/m².'
  },
  {
    q: '2) الضغط الجوي عند مستوى سطح البحر 1 atm يساوي:',
    options: ['760 mmHg', '101.3 Pa', '1000 Torr', '7.6 mmHg'],
    answer: 0,
    explain: '1 atm = 760 mmHg = 760 Torr = 101.3 kPa.'
  },
  {
    q: '3) حوّل 380 mmHg إلى وحدة atm:',
    options: ['2 atm', '0.38 atm', '0.5 atm', '1.5 atm'],
    answer: 2,
    explain: '380 ÷ 760 = 0.5 atm.'
  }
];

const quizContainer = document.getElementById('quizContainer');
const scoreText = document.getElementById('scoreText');
let score = 0;
let answered = 0;

function renderQuiz() {
  score = 0;
  answered = 0;
  scoreText.textContent = '';
  quizContainer.innerHTML = '';

  questions.forEach((item, qi) => {
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `<h4>${item.q}</h4><div class="options"></div><p class="feedback"></p>`;
    const optionsDiv = div.querySelector('.options');
    const feedback = div.querySelector('.feedback');

    item.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        const all = optionsDiv.querySelectorAll('.option');
        all.forEach(b => (b.disabled = true));
        all[item.answer].classList.add('correct');

        if (oi === item.answer) {
          score++;
          feedback.className = 'feedback ok';
          feedback.textContent = '✔ إجابة صحيحة! ' + item.explain;
        } else {
          btn.classList.add('wrong');
          feedback.className = 'feedback no';
          feedback.textContent = '✘ إجابة خاطئة. ' + item.explain;
        }

        answered++;
        if (answered === questions.length) showScore();
      });
      optionsDiv.appendChild(btn);
    });

    quizContainer.appendChild(div);
  });
}

function showScore() {
  const msg = score === questions.length ? '🎉 ممتاز!'
            : score >= 2 ? '👍 جيد جداً'
            : '📘 راجع الدرس وحاول مرة أخرى';
  scoreText.textContent = `نتيجتك: ${score} من ${questions.length} — ${msg}`;
}

document.getElementById('resetQuiz').addEventListener('click', renderQuiz);
renderQuiz();
