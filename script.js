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
let wellCooldowns = {};



// When the user clicks Start, show animated water droplets and seamlessly reveal the game
startBtn.onclick = () => {
  const dropletOverlay = document.getElementById('droplet-transition');
  dropletOverlay.style.display = 'block';

  // Instantly show the game UI under the splash screen
  gameUI.style.display = 'flex';
  initGame();

  // Charity: Water blue color from guidelines
  const dropletBlue = '#005baa';
  const dropletCount = 18;
  for (let i = 0; i < dropletCount; i++) {
    const droplet = document.createElement('div');
    droplet.className = 'droplet';
    droplet.style.left = (10 + Math.random() * 80) + 'vw';
    droplet.style.animationDelay = (Math.random() * 0.5) + 's';
    droplet.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 6C32 6 12 30 12 44C12 54.4934 21.5066 62 32 62C42.4934 62 52 54.4934 52 44C52 30 32 6 32 6Z" fill="${dropletBlue}" stroke="#003366" stroke-width="2"/>
        <ellipse cx="38" cy="26" rx="4" ry="8" fill="#fff" fill-opacity="0.4"/>
      </svg>
    `;
    dropletOverlay.appendChild(droplet);
  }

  // Fade out the splash screen as droplets fall
  splashScreen.style.transition = 'opacity 0.7s';
  splashScreen.style.opacity = '1';
  setTimeout(() => {
    splashScreen.style.opacity = '0';
  }, 200); // Start fading after droplets begin

  // Remove splash from layout after fade
  setTimeout(() => {
    splashScreen.style.display = 'none';
    dropletOverlay.innerHTML = '';
    dropletOverlay.style.display = 'none';
  }, 1200); // Match droplet animation
};

function updateWaterUI() {
  waterCountSpan.textContent = waterDrops;
}

// Place a building. If draggable is true, allow the user to drag and place it once.
function placeBuilding(type, x, y, upgraded = false, draggable = false) {
  const div = document.createElement('div');
  div.classList.add('building');
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.style.backgroundImage = `url('img/${type}${upgraded ? '-upgraded' : ''}.png')`;

  const buildingData = { type, x, y, upgraded };
  buildings.push(buildingData);

  div.onclick = (e) => {
    e.stopPropagation();
    selectedBuilding = buildingData;

    if (type === 'well') {
      // Use a unique key for each well based on its position
      const wellKey = `${x},${y}`;
      const now = Date.now();
      if (!wellCooldowns[wellKey] || now - wellCooldowns[wellKey] >= 120000) {
        // 2 minutes = 120000 ms
        const amt = upgraded ? 10 : 5;
        waterDrops += amt;
        updateWaterUI();
        showFeedback(`+${amt} Water Drops!`);
        checkWinCondition();
        wellCooldowns[wellKey] = now;
      } else {
        showFeedback("Water can only be pumped every 2 minutes!");
      }
    } else {
      showFeedback(`Selected ${type}`);
    }
  };

  // Only allow dragging if draggable is true (for newly built huts/wells)
  if (draggable && (type === 'hut' || type === 'well')) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      selectedBuilding = buildingData;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const rect = villageArea.getBoundingClientRect();
      const newX = e.clientX - rect.left - offsetX;
      const newY = e.clientY - rect.top - offsetY;
      div.style.left = newX + 'px';
      div.style.top = newY + 'px';
      buildingData.x = newX;
      buildingData.y = newY;
    };
    const onMouseUp = () => {
      isDragging = false;
      // After first placement, remove drag listeners so it can't be moved again
      div.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      div.style.cursor = '';
    };
    div.addEventListener('mousedown', onMouseDown);
    div.style.cursor = 'grab';
  }

  villageArea.appendChild(div);
}

function placeVillager(x, y) {
  const v = document.createElement('div');
  v.classList.add('villager');
  v.style.left = x + 'px';
  v.style.top = y + 'px';
  v.style.backgroundImage = "url('img/villager.png')";
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
  selectedBuilding = null;
  villageArea.innerHTML = '';
  updateWaterUI();
  wellCooldowns = {}; // Reset well cooldowns on new game

  const treePositions = [
    {x: 30, y: 50}, {x: 60, y: 300}, {x: 80, y: 200}, {x: 110, y: 110}, {x: 110, y: 320},
    {x: 350, y: 500}, {x: 570, y: 30}, {x: 200, y: 520}, {x: 350, y: 600}, {x: 470, y: 520}, {x: 570, y: 570},
    {x: 800, y: 60}, {x: 950, y: 110}, {x: 840, y: 160}, {x: 900, y: 200}, {x: 1200, y: 50}, {x: 1300, y: 300},
    {x: 1200, y: 400}, {x: 520, y: 350}, {x: 830, y: 500}, {x: 800, y: 400}, {x: 1000, y: 300}
  ];
  treePositions.forEach(pos => placeTree(pos.x, pos.y));

  // Initial hut, well, and villager are NOT draggable
  placeBuilding('hut', 250, 80, false, false);
  placeBuilding('well', 400, 80, false, false);
  placeVillager(345, 150);
}

function placeTree(x, y) {
  const existing = document.querySelector(
    `.tree[data-x='${x}'][data-y='${y}']`
  );
  if (existing) return;
  const tree = document.createElement('div');
  tree.classList.add('tree');
  tree.style.left = x + 'px';
  tree.style.top = y + 'px';
  tree.style.backgroundImage = "url('img/tree.png')";
  tree.style.position = 'absolute';
  tree.style.width = '64px';
  tree.style.height = '64px';
  tree.style.backgroundSize = 'contain';
  tree.style.backgroundRepeat = 'no-repeat';
  tree.style.pointerEvents = 'none';
  tree.setAttribute('data-x', x);
  tree.setAttribute('data-y', y);
  villageArea.appendChild(tree);
}

buildBtn.onclick = () => {
  // Only allow building house or pump
  const choice = prompt("Build what? (house, pump)");
  if (!choice) return;
  let cost = 0;
  let type = '';
  if (choice === 'house') { cost = 30; type = 'hut'; }
  else if (choice === 'pump') { cost = 40; type = 'well'; }
  else return;

  if (waterDrops < cost) {
    showFeedback("Not enough water drops!");
    return;
  }

  // Let the user place the new building anywhere on the screen
  showFeedback('Click anywhere to place your ' + choice + '!');
  const onPlace = (e) => {
    // Only allow placing inside the village area
    const rect = villageArea.getBoundingClientRect();
    const x = e.clientX - rect.left - 32; // Center the building
    const y = e.clientY - rect.top - 32;
    // Only place if inside bounds
    if (x < 0 || y < 0 || x > rect.width - 64 || y > rect.height - 64) {
      showFeedback('Place inside the village area!');
      return;
    }
    waterDrops -= cost;
    updateWaterUI();
    placeBuilding(type, x, y, false, true); // draggable=true for new buildings
    showFeedback(`Built ${choice}!`);
    checkWinCondition();
    villageArea.removeEventListener('click', onPlace);
  };
  villageArea.addEventListener('click', onPlace);
};


// Upgrade logic for wall and house (hut)

upgradeBtn.onclick = () => {
  // Ask user what to upgrade, with cost info
  const choice = prompt("What do you want to upgrade? (wall: 80 water drops, house: 70 water drops)");
  if (!choice) return;
  if (choice.toLowerCase() === 'wall') {
    if (waterDrops < 80) {
      showFeedback("Not enough water drops to upgrade the wall!");
      return;
    }
    waterDrops -= 80;
    updateWaterUI();
    villageArea.style.backgroundImage =
      "url('img/upgradedwall.png'), url('img/grass-background.png')";
    // Remove any outline or border from the wall (if present)
    villageArea.style.outline = '';
    villageArea.style.border = '';

    // Remove trees that touch the upgraded wall area
    // Define upgraded wall bounds (adjust as needed to match your wall image)
    const wallX = 110; // left offset in CSS background-position
    const wallY = 0;   // top offset
    const wallWidth = 520;
    const wallHeight = 320;
    // Remove trees that overlap/touch the wall area
    Array.from(villageArea.getElementsByClassName('tree')).forEach(tree => {
      const treeX = parseInt(tree.style.left);
      const treeY = parseInt(tree.style.top);
      const treeW = parseInt(tree.style.width) || 64;
      const treeH = parseInt(tree.style.height) || 64;
      // Check for overlap
      if (
        treeX + treeW > wallX &&
        treeX < wallX + wallWidth &&
        treeY + treeH > wallY &&
        treeY < wallY + wallHeight
      ) {
        tree.remove();
      }
    });

    showFeedback("Wall upgraded!");
    checkWinCondition();
    return;
  }
  // --- Hut upgrade logic ---
  if (choice.toLowerCase() === 'house' || choice.toLowerCase() === 'hut') {
    const huts = buildings.filter(b => b.type === 'hut' && !b.upgraded);
    if (huts.length === 0) {
      showFeedback("No house to upgrade!");
      return;
    }
    if (waterDrops < 70) {
      showFeedback("Not enough water drops to upgrade the house!");
      return;
    }
    if (huts.length === 1) {
      // Only one hut, upgrade it directly
      huts[0].upgraded = true;
      waterDrops -= 70;
      updateWaterUI();
      // Remove all buildings and villagers, not trees
      Array.from(villageArea.children).forEach(child => {
        if (!child.classList.contains('tree')) {
          villageArea.removeChild(child);
        }
      });
      // Re-place all buildings, using smaller upgraded hut image
      buildings.forEach(b => {
        if (b.type === 'hut') {
          const div = document.createElement('div');
          div.classList.add('building');
          div.style.left = b.x + 'px';
          div.style.top = b.y + 'px';
          if (b.upgraded) {
            div.style.backgroundImage = "url('img/upgradedhut.png')";
            div.style.width = '60px';
            div.style.height = '60px';
          } else {
            div.style.backgroundImage = "url('img/hut.png')";
            div.style.width = '64px';
            div.style.height = '64px';
          }
          villageArea.appendChild(div);
        } else {
          placeBuilding(b.type, b.x, b.y, b.upgraded);
        }
      });
      villagers.forEach(v => villageArea.appendChild(v));
      selectedBuilding = null;
      showFeedback("House upgraded!");
      checkWinCondition();
      return;
    }
    // More than one hut: ask user to click which hut to upgrade
    showFeedback("Click the house you want to upgrade");
    // Add a highlight effect to all huts
    const hutDivs = Array.from(villageArea.children).filter(child => {
      return child.classList.contains('building') && child.style.backgroundImage.includes('hut.png');
    });
    hutDivs.forEach(div => {
      div.style.outline = '3px solid #f9d342';
      div.style.cursor = 'pointer';
    });
    // Add a one-time click handler to each hut
    hutDivs.forEach((div, idx) => {
      const handler = () => {
        // Remove highlight from all huts
        hutDivs.forEach(d => {
          d.style.outline = '';
          d.style.cursor = '';
          d.onclick = null;
        });
        // Upgrade the selected hut
        huts[idx].upgraded = true;
        waterDrops -= 70;
        updateWaterUI();
        // Remove all buildings and villagers, not trees
        Array.from(villageArea.children).forEach(child => {
          if (!child.classList.contains('tree')) {
            villageArea.removeChild(child);
          }
        });
        // Re-place all buildings, using smaller upgraded hut image
        buildings.forEach(b => {
          if (b.type === 'hut') {
            const div2 = document.createElement('div');
            div2.classList.add('building');
            div2.style.left = b.x + 'px';
            div2.style.top = b.y + 'px';
            if (b.upgraded) {
              div2.style.backgroundImage = "url('img/upgradedhut.png')";
              div2.style.width = '55px';
              div2.style.height = '55px';
            } else {
              div2.style.backgroundImage = "url('img/hut.png')";
              div2.style.width = '64px';
              div2.style.height = '64px';
            }
            villageArea.appendChild(div2);
          } else {
            placeBuilding(b.type, b.x, b.y, b.upgraded);
          }
        });
        villagers.forEach(v => villageArea.appendChild(v));
        selectedBuilding = null;
        showFeedback("House upgraded!");
        checkWinCondition();
      };
      div.onclick = handler;
    });
    return;
  }
  showFeedback("Please enter 'wall' or 'house'.");
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

// Responsive: Remove river and trees, center main features on small screens
function handleMobileLayout() {
  const isMobile = window.innerWidth <= 700;
  const river = document.getElementById('river-container');
  const trees = document.querySelectorAll('.tree');

  if (isMobile) {
    // Make river horizontal and move it to bottom
    if (river) {
      river.style.top = 'auto';
      river.style.bottom = '0';
      river.style.left = '0';
      river.style.right = '0';
      river.style.width = '100%';
      river.style.height = '80px';
      river.style.transform = 'none';
    }

    // Keep just a few trees for visual balance
    trees.forEach((tree, index) => {
      if (index > 5) tree.remove();
    });

    // Ensure main buildings stay visible and large enough
    document.querySelectorAll('.building, .villager').forEach(el => {
      el.style.width = '56px';
      el.style.height = '56px';
    });
  } else {
    // Reset river to vertical in center
    if (river) {
      river.style.top = '60px';
      river.style.left = '50%';
      river.style.transform = 'translateX(-50%)';
      river.style.width = '120px';
      river.style.height = 'calc(100dvh - 60px)';
    }

    // Reset building and villager sizes
    document.querySelectorAll('.building, .villager').forEach(el => {
      el.style.width = '64px';
      el.style.height = '64px';
    });
  }
}
window.addEventListener('resize', handleMobileLayout);
window.addEventListener('DOMContentLoaded', handleMobileLayout);
