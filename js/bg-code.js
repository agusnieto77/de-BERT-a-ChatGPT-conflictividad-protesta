/**
 * MatrixRain — fondo decorativo estilo Matrix
 * Lluvia de caracteres cayendo por los margenes laterales.
 * Version densa, lenta, irregular, sin solapamiento.
 */
(function () {
  'use strict';

  // Pool de caracteres: katakana, simbolos, letras, numeros
  const CHARS = (
    'アイウエオカキクケコサシスセソ' +
    'タチツテトナニヌネノハヒフヘホ' +
    'マミムメモヤユヨラリルレロワヲン' +
    '0123456789' +
    '<>{}[]()=/+-*&|;:.,' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  ).split('');

  const BRIGHT_CHARS = CHARS.slice(0, 50);

  function randChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function randBright() {
    return BRIGHT_CHARS[Math.floor(Math.random() * BRIGHT_CHARS.length)];
  }

  // Configuracion
  const COLUMNS_PER_SIDE = 8;   // 8 columnas por lado -> 16 totales
  const MARGIN_WIDTH = 200;     // ancho del margen lateral donde llueve

  // Generar posiciones horizontales fijas (no aleatorias) para que las
  // columnas no se superpongan entre si. Distribuimos en el ancho del margen.
  function generatePositions(count) {
    const usable = MARGIN_WIDTH - 20; // margen de 10px a cada lado
    const step = usable / (count + 1);
    const positions = [];
    for (let i = 0; i < count; i++) {
      // Anadir jitter pequeno para que se vea natural, no perfecto
      const jitter = (Math.random() - 0.5) * 8;
      positions.push(10 + step * (i + 1) + jitter);
    }
    return positions;
  }

  function createRain() {
    let container = document.querySelector('.matrix-rain');
    if (!container) {
      container = document.createElement('div');
      container.className = 'matrix-rain';
      container.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(container, document.body.firstChild);
    }
    return container;
  }

  function createColumn(side) {
    const col = document.createElement('div');
    col.className = 'matrix-rain-col ' + side;

    // Largo MUY variable: 8 a 45 caracteres (algunas cortas, otras largas)
    const length = 8 + Math.floor(Math.random() * 38);
    col.style.setProperty('--len', length);

    for (let i = 0; i < length; i++) {
      const ch = document.createElement('span');
      ch.className = 'matrix-rain-char';
      // Las primeras 3 con mas probabilidad de ser "brillantes" (cabeza)
      ch.textContent = i < 3 ? randBright() : randChar();
      // Flicker con delays distintos por caracter para que no parpadeen al unisono
      ch.style.animationDelay = (-Math.random() * 8) + 's';
      ch.style.animationDuration = (3.5 + Math.random() * 5) + 's';
      col.appendChild(ch);
    }

    // Cambiar caracteres periodicamente para dar sensacion de "escritura"
    setInterval(() => {
      const chars = col.querySelectorAll('.matrix-rain-char');
      chars.forEach((ch, idx) => {
        if (Math.random() < 0.08) {
          ch.textContent = idx < 3 ? randBright() : randChar();
        }
      });
    }, 600 + Math.random() * 800);

    return col;
  }

  function spawnColumn(container, side, position) {
    const col = createColumn(side);
    // Posicion horizontal fija
    if (side === 'left') {
      col.style.left = position + 'px';
    } else {
      col.style.right = position + 'px';
    }
    // Velocidad MUY lenta: 25 a 55 segundos
    const duration = 25 + Math.random() * 30;
    col.style.animationDuration = duration + 's';
    // Delay inicial aleatorio amplio (las columnas arrancan desfasadas)
    col.style.animationDelay = (-Math.random() * duration) + 's';
    container.appendChild(col);
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;

    const container = createRain();
    container.innerHTML = '';

    const leftPositions = generatePositions(COLUMNS_PER_SIDE);
    const rightPositions = generatePositions(COLUMNS_PER_SIDE);

    leftPositions.forEach((pos, i) => {
      setTimeout(() => spawnColumn(container, 'left', pos), i * 250);
    });
    rightPositions.forEach((pos, i) => {
      setTimeout(() => spawnColumn(container, 'right', pos), i * 250 + 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
