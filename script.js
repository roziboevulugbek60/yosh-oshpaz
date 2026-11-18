
const $ = id => document.getElementById(id);

const recipes = [
  { name: "Pizza", emoji: "🍕", ingredients: ["🧀 Pishloq", "🍅 Pomidor", "🍞 Xamir"], reward: 100 },
  { name: "Burger", emoji: "🍔", ingredients: ["🍞 Bulochka", "🥩 Go‘sht", "🥬 Salat"], reward: 120 },
  { name: "Lavash", emoji: "🌯", ingredients: ["🫓 Lavash", "🥩 Go‘sht", "🥒 Bodring"], reward: 130 },
  { name: "Salat", emoji: "🥗", ingredients: ["🥒 Bodring", "🍅 Pomidor", "🥬 Salat"], reward: 90 },
  { name: "Tort", emoji: "🎂", ingredients: ["🥚 Tuxum", "🥛 Sut", "🍫 Shokolad"], reward: 150 },
  { name: "Hot-dog", emoji: "🌭", ingredients: ["🌭 Sosiska", "🍞 Bulochka", "🥫 Sous"], reward: 110 },
  { name: "Sushi", emoji: "🍣", ingredients: ["🍚 Guruch", "🐟 Baliq", "🥑 Avokado"], reward: 160 },
  { name: "Muzqaymoq", emoji: "🍨", ingredients: ["🥛 Sut", "🍓 Qulupnay", "🍫 Shokolad"], reward: 100 }
];

const customers = [
  { name: "Ali", emoji: "👦", text: "Menga mazali taom tayyorlab bering!" },
  { name: "Madina", emoji: "👩", text: "Bugun juda och qoldim!" },
  { name: "Jasur", emoji: "🧔", text: "Eng yaxshi taomingizdan buyurtma beraman!" },
  { name: "Malika", emoji: "👧", text: "Iltimos, tezroq tayyorlang!" },
  { name: "Bobur", emoji: "👨", text: "Oshpazning mahoratini sinab ko‘ramiz!" }
];

let score = 0;
let record = Number(localStorage.getItem("chefRecord")) || 0;
let totalMeals = 0;
let successCount = 0;
let level = 1;
let restaurantCount = 1;
let time = 90;
let currentRecipe = 0;
let selected = [];
let gameStarted = false;
let timerInterval = null;
let soundEnabled = true;

$("record").textContent = record;

function sound(frequency = 500, duration = 0.12) {
  if (!soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    oscillator.onended = () => ctx.close();
  } catch (e) {
    console.log("Audio ishlamadi");
  }
}

function updateStats() {
  $("score").textContent = score;
  $("record").textContent = record;
  $("totalMeals").textContent = totalMeals;
  $("successCount").textContent = successCount;
  $("restaurantCount").textContent = restaurantCount;
  $("levelResult").textContent = level;
  $("level").textContent = level + "-bosqich";

  const progress = score % 300;
  $("progress").style.width = (progress / 300 * 100) + "%";
  $("progressText").textContent = progress + " / 300";

  if (score > record) {
    record = score;
    localStorage.setItem("chefRecord", record);
    $("record").textContent = record;
  }
}

function renderRecipes() {
  $("recipeList").innerHTML = recipes.map((r, i) => `
    <div class="recipe">
      <span>${r.emoji}</span>
      <h3>${r.name}</h3>
      <p>⭐ ${r.reward} ball</p>
    </div>
  `).join("");
}

function newOrder() {
  currentRecipe = Math.floor(Math.random() * recipes.length);
  selected = [];

  const recipe = recipes[currentRecipe];
  const customer = customers[Math.floor(Math.random() * customers.length)];

  $("customerName").textContent = customer.name;
  $("customerAvatar").textContent = customer.emoji;
  $("customerText").textContent = customer.text;

  $("orderPicture").textContent = recipe.emoji;
  $("orderName").textContent = recipe.name;
  $("orderReward").textContent = "Mukofot: " + recipe.reward + " ball";

  $("ingredients").innerHTML = recipe.ingredients.map((item, i) => `
    <button class="ingredient" data-index="${i}">${item}</button>
  `).join("");

  document.querySelectorAll(".ingredient").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      if (selected.includes(index)) {
        selected = selected.filter(x => x !== index);
        button.classList.remove("selected");
      } else {
        selected.push(index);
        button.classList.add("selected");
        sound(600, 0.08);
      }

      $("cookBtn").disabled = selected.length !== recipe.ingredients.length;
      $("feedback").textContent =
        selected.length + " / " + recipe.ingredients.length + " masalliq tanlandi";
    });
  });

  $("cookBtn").disabled = true;
  $("feedback").textContent = "Barcha masalliqlarni tanlang!";
  $("plate").textContent = "🍽️";
}

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  time = 90;
  $("timer").textContent = time;
  $("gameStatus").textContent = "O‘yin davom etmoqda";
  $("startBtn").textContent = "▶ O‘YIN DAVOM ETMOQDA";

  newOrder();
  sound(700);

  timerInterval = setInterval(() => {
    time--;
    $("timer").textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function cookFood() {
  if (!gameStarted || selected.length !== recipes[currentRecipe].ingredients.length) return;

  const recipe = recipes[currentRecipe];
  $("cookBtn").disabled = true;
  $("plate").textContent = "🔥";
  $("feedback").textContent = "Taom tayyorlanmoqda...";
  sound(350, 0.2);

  setTimeout(() => {
    score += recipe.reward;
    totalMeals++;
    successCount++;

    const oldLevel = level;
    level = Math.floor(score / 300) + 1;

    $("plate").textContent = recipe.emoji;
    $("feedback").textContent = "Ajoyib! " + recipe.name + " tayyor!";

    updateStats();
    sound(850, 0.2);

    if (level > oldLevel) {
      $("modalEmoji").textContent = "🏆";
      $("modalTitle").textContent = "Yangi bosqich!";
      $("modalText").textContent = level + "-bosqich ochildi. Barakalla!";
    } else {
      $("modalEmoji").textContent = "🎉";
      $("modalTitle").textContent = "Buyurtma bajarildi!";
      $("modalText").textContent = recipe.name + " tayyorlandi. +" + recipe.reward + " ball!";
    }

    $("resultModal").classList.add("show");
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameStarted = false;

  $("gameStatus").textContent = "O‘yin tugadi";
  $("startBtn").textContent = "🔄 QAYTA BOSHLASH";

  $("modalEmoji").textContent = "⏰";
  $("modalTitle").textContent = "Vaqt tugadi!";
  $("modalText").textContent =
    "Natijangiz: " + score + " ball. Tayyorlangan taomlar: " + totalMeals;

  $("nextBtn").textContent = "Qayta o‘ynash";
  $("resultModal").classList.add("show");
  sound(250, 0.4);
}

function nextOrder() {
  $("resultModal").classList.remove("show");

  if (!gameStarted) {
    score = 0;
    totalMeals = 0;
    successCount = 0;
    level = 1;
    updateStats();
    startGame();
  } else {
    newOrder();
    $("nextBtn").textContent = "Davom etish ➜";
  }
}

$("startBtn").addEventListener("click", () => {
  if (!gameStarted) {
    if (timerInterval) clearInterval(timerInterval);
    score = 0;
    totalMeals = 0;
    successCount = 0;
    level = 1;
    updateStats();
    startGame();
  }
});

$("cookBtn").addEventListener("click", cookFood);
$("nextBtn").addEventListener("click", nextOrder);

$("upgradeBtn").addEventListener("click", () => {
  if (restaurantCount >= 4) {
    $("feedback").textContent = "Barcha restoranlar ochilgan!";
    sound(250);
    return;
  }

  if (score < 500) {
    $("feedback").textContent = "Restoran uchun 500 ball kerak!";
    sound(250);
    return;
  }

  score -= 500;
  restaurantCount++;

  const names = [
    "Kichik oshxona",
    "Pizza restorani",
    "Burger restorani",
    "Super restoran"
  ];

  const descriptions = [
    "Birinchi restoraning.",
    "Yangi pizza restorani ochildi!",
    "Burger restorani ham seniki!",
    "Eng katta restoraning ochildi!"
  ];

  $("restaurantName").textContent = names[restaurantCount - 1];
  $("restaurantInfo").textContent = descriptions[restaurantCount - 1];
  $("upgradeBtn").textContent = restaurantCount >= 4
    ? "🏆 Barcha restoranlar ochildi!"
    : "🔓 Yangi restoran ochish — 500 ball";

  updateStats();
  $("feedback").textContent = "Yangi restoran ochildi!";
  sound(900, 0.3);
});

const outfitNames = {
  "👨‍🍳": "Oddiy oshpaz",
  "🧑‍🍳": "Professional oshpaz",
  "👩‍🍳": "Bosh oshpaz",
  "🥷": "Maxfiy oshpaz"
};

document.querySelectorAll(".clothes-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".clothes-btn").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");

    const outfit = button.dataset.clothes;
    $("chefOutfit").textContent = outfitNames[outfit];
    $("chef").textContent = outfit;
    sound(650);
  });
});

renderRecipes();
updateStats();
newOrder();
$("cookBtn").disabled = true;
