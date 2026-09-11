// js/wheel.js

const COLORS = [
  '#e63946', '#f1a208', '#2a9d8f', '#457b9d', '#ff6b6b',
  '#6a4c93', '#43aa8b', '#f3722c', '#577590', '#f9844a',
];

export function pickWinnerIndex(n) {
  return Math.floor(Math.random() * n);
}

export class Wheel {
  constructor(canvas, restaurants) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.restaurants = restaurants;
    this.rotation = 0;
    this._spinning = false;
  }

  draw() {
    const { ctx, canvas, restaurants, rotation } = this;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;
    const sliceAngle = (2 * Math.PI) / restaurants.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    restaurants.forEach((r, i) => {
      const start = i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      let label = r.name;
      if (label.length > 8) label = label.slice(0, 7) + '…';
      ctx.fillText(label, radius - 8, 4);
      ctx.restore();
    });

    ctx.restore();
  }

  spin(onFinish) {
    // 重入保護：若正在旋轉中，直接返回，不啟動新動畫
    if (this._spinning) return;

    this._spinning = true;
    const n = this.restaurants.length;
    const winnerIndex = pickWinnerIndex(n);
    const sliceAngle = (2 * Math.PI) / n;
    const winnerCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    // 指針固定在 -90 度（正上方）；多轉 5 圈製造轉動感
    const targetRotation = -Math.PI / 2 - winnerCenter + Math.PI * 2 * 5;
    const startRotation = this.rotation;
    const duration = 4000;
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      this.rotation = startRotation + (targetRotation - startRotation) * eased;
      this.draw();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this._spinning = false;
        onFinish(this.restaurants[winnerIndex]);
      }
    };
    requestAnimationFrame(step);
  }
}
