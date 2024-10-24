let markerPosition = 0;
let gameActive = true;
let pathBet = 0;
let bustBet = 0;
let doublesBet = {};
let finishBet = {};
let rollBet = {};
let playerBalance = 10000; // Starting balance

// Dice face mapping
const diceFaces = ["🎲", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // Using dice emoji faces for 1-6

// Update the player's balance display
function updateBalanceDisplay() {
  document.getElementById("player-balance").innerText =
    playerBalance.toLocaleString();
}

// Create the path spaces
function createPath() {
  const pathContainer = document.getElementById("path");
  for (let i = 1; i <= 14; i++) {
    const space = document.createElement("div");
    space.classList.add("path-space");
    space.id = `space-${i}`;
    space.innerText = i;

    pathContainer.appendChild(space);
  }
}

// Initialize the game by creating the path
window.onload = function () {
  createPath();
  updateBalanceDisplay();
};

// Place Path Bet
function placePathBet() {
  const amount = parseInt(document.getElementById("path-bet-amount").value);
  if (amount > 0 && amount <= playerBalance) {
    pathBet = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    alert(`Path Bet placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Bust Bet
function placeBustBet() {
  const amount = parseInt(document.getElementById("bust-bet-amount").value);
  if (amount > 0 && amount <= playerBalance) {
    bustBet = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    alert(`Bust Bet placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Doubles Bet
function placeDoublesBet() {
  const amount = parseInt(document.getElementById("doubles-bet-amount").value);
  const chosenDouble = document.getElementById("doubles-choice").value;
  if (amount > 0 && amount <= playerBalance) {
    doublesBet[chosenDouble] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    alert(`Doubles Bet on ${chosenDouble} placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Finish Bet
function placeFinishBet() {
  const amount = parseInt(document.getElementById("finish-bet-amount").value);
  const chosenFinish = document.getElementById("finish-choice").value;
  if (amount > 0 && amount <= playerBalance) {
    finishBet[chosenFinish] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    alert(`Finish Bet on Space ${chosenFinish} placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Roll Bet
function placeRollBet() {
  const amount = parseInt(document.getElementById("roll-bet-amount").value);
  const chosenRoll = document.getElementById("roll-choice").value;
  if (amount > 0 && amount <= playerBalance) {
    rollBet[chosenRoll] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    alert(`Roll Bet on ${chosenRoll} placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Roll Dice with Animation
function rollDice() {
  if (!gameActive) return;

  // Show dice rolling animation
  const dice1Elem = document.getElementById("dice-1");
  const dice2Elem = document.getElementById("dice-2");

  dice1Elem.classList.add("dice-roll");
  dice2Elem.classList.add("dice-roll");

  // Fake rolling effect: display random dice faces for a while before the final result
  const rollDuration = 1000; // Time for rolling animation (1 second)
  const rollingInterval = setInterval(() => {
    dice1Elem.innerText = diceFaces[Math.floor(Math.random() * 6) + 1];
    dice2Elem.innerText = diceFaces[Math.floor(Math.random() * 6) + 1];
  }, 100); // Random dice face every 100ms

  setTimeout(() => {
    clearInterval(rollingInterval); // Stop the random dice face changes

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const result = dice1 + " and " + dice2;

    dice1Elem.innerText = diceFaces[dice1];
    dice2Elem.innerText = diceFaces[dice2];

    document.getElementById("dice-result").innerText = `Dice Result: ${result}`;

    const difference = Math.abs(dice1 - dice2);
    dice1Elem.classList.remove("dice-roll");
    dice2Elem.classList.remove("dice-roll");

    if (dice1 === dice2) {
      endGame("doubles", dice1);
    } else {
      moveMarker(difference);
    }
  }, rollDuration); // Dice rolls for 1 second before showing final result
}

// Move Marker based on dice roll
function moveMarker(spaces) {
  markerPosition += spaces;
  if (markerPosition > 14) markerPosition = 14;

  // Clear previous marker
  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });

  // Smooth marker movement
  const currentSpace = document.getElementById(`space-${markerPosition}`);
  currentSpace.classList.add("active");

  if (markerPosition >= 10) {
    endGame("path");
  }
}

// End Game
function endGame(outcome, rolledDouble = null) {
  gameActive = false;
  let resultMessage = "";

  if (outcome === "doubles") {
    resultMessage = `Doubles rolled! Marker ends at space ${markerPosition}.`;

    // Pay out Doubles Bet (9:1)
    if (rolledDouble && doublesBet[`${rolledDouble}-${rolledDouble}`]) {
      const payout = doublesBet[`${rolledDouble}-${rolledDouble}`] * 9;
      playerBalance += payout;
      alert(`You won $${payout} on Doubles!`);
    }

    // Payout Bust Bet if not on first roll
    if (markerPosition > 0 && bustBet > 0) {
      playerBalance += bustBet * 2;
      alert(`You won $${bustBet * 2} on Bust!`);
    }

    resetBets();
  } else if (outcome === "path") {
    resultMessage = `Marker reached space ${markerPosition} (10 or more).`;

    // Pay out Path Bet
    let payout = pathBet;
    if (markerPosition === 14) payout *= 4;
    else if (markerPosition === 13) payout *= 3;
    else payout *= 2;

    playerBalance += payout;
    alert(`You won $${payout} on Path Bet!`);

    resetBets();
  }

  document.getElementById("game-result").innerText = resultMessage;
  updateBalanceDisplay();
}

// Reset Bets
function resetBets() {
  pathBet = 0;
  bustBet = 0;
  doublesBet = {};
  finishBet = {};
  rollBet = {};
}

// Reset Game
function resetGame() {
  markerPosition = 0;
  gameActive = true;
  document.getElementById("dice-result").innerText = "Dice Result: -";
  document.getElementById("game-result").innerText = "Result: -";

  // Clear the active marker
  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });

  resetBets();
  updateBalanceDisplay();
}
