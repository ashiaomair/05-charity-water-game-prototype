const splashScreen = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-btn');
const gameUI = document.getElementById('game-ui');
const waterCountSpan = document.getElementById('water-count');
const buildBtn = document.getElementById('build-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const villageArea = document.getElementById('village-area');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

let waterDrops = 1000;
let buildings = [];
let villagers = [];
let selectedBuilding = null;

startBtn.onclick = () => {
  splashScreen.style.display = 'none';
  gameUI.style.display = 'block';
  initGame();
};

function updateWaterUI() {
  waterCountSpan.textContent = waterDrops;
}

function placeBuilding(type, x, y, upgraded = false) {
  const div = document.createElement('div');
  div.classList.add('building');
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.style.backgroundImage = `url('images/${type}${upgraded ? '-upgraded' : ''}.png')`;
  div.onclick = () => {
    selectedBuilding = buildings.find(b => b.x === x && b.y === y);
    showFeedback(`Selected ${type}`);
  };
  villageArea.appendChild(div);
  buildings.push({ type, x, y, upgraded });
}

function placeVillager(x, y) {
  const v = document.createElement('div');
  v.classList.add('villager');
  v.style.left = x + 'px';
  v.style.top = y + 'px';
  v.style.backgroundImage = "url('images/villager.png')";
  v.onclick = () => {
    waterDrops += 10;
    updateWaterUI();
    showFeedback('+10 Water Drops!');
    checkWinCondition();
  };
  villageArea.appendChild(v);
  villagers.push(v);
}

function initGame() {
  waterDrops = 1000;
  buildings = [];
  villagers = [];
  villageArea.innerHTML = '';
  updateWaterUI();
  placeBuilding('hut', 100, 200);
  placeBuilding('well', 300, 150);
  placeVillager(150, 250);
  placeVillager(350, 220);
  placeVillager(250, 100);
  startWellTimers();
}

function startWellTimers() {
  buildings.forEach(b => {
    if (b.type === 'well') {
      setInterval(() => {
        let amt = b.upgraded ? 10 : 5;
        waterDrops += amt;
        updateWaterUI();
        showFeedback(`+${amt} Water Drops!`);
        checkWinCondition();
      }, 10000);
    }
  });
}

buildBtn.onclick = () => {
  const choice = prompt("Build what? (house, tree, pump)");
  if (!choice) return;
  let cost = 0;
  let type = '';
  if (choice === 'house') { cost = 30; type = 'hut'; }
  else if (choice === 'tree') { cost = 10; type = 'tree'; }
  else if (choice === 'pump') { cost = 40; type = 'well'; }
  else return;

  if (waterDrops < cost) {
    showFeedback("Not enough water drops!");
    return;
  }

  waterDrops -= cost;
  updateWaterUI();
  const x = Math.random() * 500;
  const y = Math.random() * 300;
  placeBuilding(type, x, y);
  showFeedback(`Built ${choice}!`);
  checkWinCondition();
};

upgradeBtn.onclick = () => {
  if (!selectedBuilding) {
    showFeedback("No building selected!");
    return;
  }
  const cost = 20;
  if (waterDrops < cost) {
    showFeedback("Not enough water drops to upgrade!");
    return;
  }
  selectedBuilding.upgraded = true;
  waterDrops -= cost;
  updateWaterUI();
  showFeedback("Building upgraded!");
  villageArea.innerHTML = '';
  buildings.forEach(b => placeBuilding(b.type, b.x, b.y, b.upgraded));
  villagers.forEach(v => villageArea.appendChild(v));
  selectedBuilding = null;
  checkWinCondition();
};

function showFeedback(msg) {
  const fm = document.getElementById('feedback-message');
  fm.textContent = msg;
  fm.classList.add('show');
  setTimeout(() => {
    fm.classList.remove('show');
  }, 1500);
}

document.getElementById('reset-btn').onclick = () => {
  if (confirm('Reset your village?')) {
    initGame();
    showFeedback('Village reset!');
  }
};

function checkWinCondition() {
  if (waterDrops >= 1000 && buildings.every(b => b.upgraded)) {
    modal.style.display = 'flex';
  }
}

modalClose.onclick = () => {
  modal.style.display = 'none';
};
