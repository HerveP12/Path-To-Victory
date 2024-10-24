let markerPosition = 0;
let gameActive = true;
let pathBet = 0;
let bustBet = 0;
let doublesBet = {}; // Bet on specific double (e.g., 1-1, 2-2, etc.)
let finishBet = {};
let rollBet = {}; // Bet on exact spaces moved or doubles
let playerBalance = 10000; // Start player with $10,000
let betsResolved = 0; // Counter to track resolved bets
let totalWinnings = 0; // Track total winnings for the round

// Dice face mapping
const diceFaces = ["🎲", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // Dice faces 1-6

// Update player's balance display
function updateBalanceDisplay() {
  document.getElementById("player-balance").innerText =
    playerBalance.toLocaleString();
}

// Update active bet spots display
function updateActiveBetsDisplay() {
  const activeBets = [];
  if (pathBet > 0) activeBets.push("Path Bet");
  if (bustBet > 0) activeBets.push("Bust Bet");
  if (Object.keys(doublesBet).length > 0) activeBets.push("Doubles Bet");
  if (Object.keys(finishBet).length > 0) activeBets.push("Finish Bet");
  if (Object.keys(rollBet).length > 0) activeBets.push("Roll Bet");

  document.getElementById("active-bets").innerText = `Active Bets: ${
    activeBets.length > 0 ? activeBets.join(", ") : "None"
  }`;
}

// Create the path spaces
function createPath() {
  const pathContainer = document.getElementById("path");
  pathContainer.innerHTML = ""; // Clear previous path
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
  updateActiveBetsDisplay();
};

// Place Path Bet
function placePathBet() {
  const amount = parseInt(document.getElementById("path-bet-amount").value);
  if (amount > 0 && amount <= playerBalance) {
    pathBet = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
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
    updateActiveBetsDisplay();
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
    updateActiveBetsDisplay();
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
    updateActiveBetsDisplay();
    alert(`Finish Bet on Space ${chosenFinish} placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Roll Bet (Exact Spaces or Doubles)
function placeRollBet() {
  const amount = parseInt(document.getElementById("roll-bet-amount").value);
  const chosenRoll = document.getElementById("roll-choice").value; // Either "doubles" or "exact spaces"
  if (amount > 0 && amount <= playerBalance) {
    rollBet[chosenRoll] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
    alert(`Roll Bet on ${chosenRoll} placed for $${amount}`);
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Roll Dice with Animation
function rollDice() {
  if (!gameActive) return;

  // Ensure at least one bet is placed before rolling the dice
  if (
    pathBet === 0 &&
    bustBet === 0 &&
    Object.keys(doublesBet).length === 0 &&
    Object.keys(finishBet).length === 0 &&
    Object.keys(rollBet).length === 0
  ) {
    alert("Please place a bet before rolling the dice.");
    return;
  }

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
      handleDoubles(dice1); // Handle doubles with proper logic
    } else {
      moveMarker(difference); // Move the marker based on the difference between dice
    }
  }, rollDuration); // Dice rolls for 1 second before showing final result
}

// Handle Doubles Logic for Roll Bet
function handleDoubles(diceValue) {
  let resultMessage = `Doubles rolled! Marker ends at space ${markerPosition}.`;

  // Pay out only if the specific double the player bet on was rolled
  if (doublesBet[`${diceValue}-${diceValue}`]) {
    const payout = doublesBet[`${diceValue}-${diceValue}`] * 9; // 9x payout (winnings only)
    playerBalance += payout + doublesBet[`${diceValue}-${diceValue}`]; // Add original bet + winnings
    totalWinnings += payout; // Track winnings for this round
    resultMessage += ` You won $${payout} on Doubles Bet for ${diceValue}-${diceValue}.`;
  } else if (Object.keys(doublesBet).length > 0) {
    resultMessage += ` You lost your Doubles Bet.`; // Only show if a Doubles bet was placed
  }

  // Check and pay out for Bust Bet
  if (bustBet > 0 && markerPosition > 0) {
    const payout = bustBet * 1; // Winnings equal to original bet
    playerBalance += payout + bustBet; // Add original bet + winnings
    totalWinnings += payout; // Track winnings for this round
    resultMessage += ` You won $${payout} on Bust Bet.`;
  } else if (bustBet > 0 && markerPosition === 0) {
    resultMessage += ` Bust Bet pushes as it was the first roll.`;
  }

  // Check for Roll Bet on doubles (if the player bet on doubles specifically)
  if (rollBet["doubles"]) {
    const payout = rollBet["doubles"] * 4; // 4x payout (winnings only)
    playerBalance += payout + rollBet["doubles"]; // Add original bet + winnings
    totalWinnings += payout;
    resultMessage += ` You won $${payout} on Roll Bet for Doubles.`;
  } else if (rollBet["doubles"]) {
    resultMessage += ` You lost your Roll Bet for Doubles.`;
  }

  // Update game results and check for round end
  document.getElementById("game-result").innerText = resultMessage;
  betsResolved++;
  checkEndOfRound();
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

  // Check if the marker has hit the end of the path (10-14)
  if (markerPosition >= 10) {
    endGame();
  } else {
    // Resolve bets: Finish Bet, Path Bet, Roll Bet
    resolveFinishBet();
    resolvePathBet();
    resolveRollBet(spaces);

    checkEndOfRound();
  }
}

// Resolve Path Bet
function resolvePathBet() {
  if (pathBet > 0 && markerPosition >= 10) {
    let payout = pathBet * 1; // Payout = winnings only (1x the bet amount)
    if (markerPosition === 14)
      payout = pathBet * 4; // 4x winnings for space 14 (not 5x)
    else if (markerPosition === 13) payout = pathBet * 3; // 3x winnings for space 13

    playerBalance += payout + pathBet; // Add original bet + winnings
    totalWinnings += payout;
    document.getElementById(
      "game-result"
    ).innerText += ` Path Bet wins $${payout}.`;
    betsResolved++;
  }
}

// Resolve Finish Bet
function resolveFinishBet() {
  for (let space in finishBet) {
    if (markerPosition == space) {
      // Marker must exactly land on the finish bet space
      const payout = finishBet[space] * getFinishPayout(space); // Winnings based on finish bet multiplier
      playerBalance += payout + finishBet[space]; // Add original bet + winnings
      totalWinnings += payout;
      document.getElementById(
        "game-result"
      ).innerText += ` Finish Bet wins $${payout} on Space ${space}.`;
      betsResolved++;
    } else if (markerPosition > space) {
      // If marker moves past the finish bet space
      document.getElementById(
        "game-result"
      ).innerText += ` Finish Bet lost on Space ${space}.`;
      betsResolved++;
    }
  }
}

// Resolve Roll Bet (Exact Spaces)
function resolveRollBet(spaces) {
  for (let roll in rollBet) {
    if (roll == spaces) {
      const payout = rollBet[roll] * getRollPayout(roll); // Winnings based on roll bet multiplier
      playerBalance += payout + rollBet[roll]; // Add original bet + winnings
      totalWinnings += payout;
      document.getElementById(
        "game-result"
      ).innerText += ` Roll Bet wins $${payout} for ${roll} spaces.`;
      betsResolved++;
    } else if (rollBet[roll] > 0) {
      document.getElementById(
        "game-result"
      ).innerText += ` Roll Bet lost for ${roll} spaces.`;
      betsResolved++;
    }
  }
}

// End game if marker reaches Path 10-14
function endGame() {
  resolvePathBet();
  checkEndOfRound();
}

// Check if all bets are resolved before resetting the game
function checkEndOfRound() {
  if (
    betsResolved === 3 ||
    betsResolved ===
      Object.keys(rollBet).length +
        Object.keys(finishBet).length +
        (pathBet > 0 ? 1 : 0)
  ) {
    setTimeout(function () {
      alert(`Round Over. Total Winnings: $${totalWinnings}`);
      resetGame();
    }, 3000); // Show results for 3 seconds before resetting
  }
}

// Get Finish Bet Payout Multiplier
function getFinishPayout(space) {
  const payouts = {
    1: 20,
    2: 18,
    3: 17,
    4: 17,
    5: 18,
    6: 22,
    7: 22,
    8: 25,
    9: 25,
    10: 4,
    11: 7,
    12: 12,
    13: 25,
    14: 80,
  };
  return payouts[space] || 1;
}

// Get Roll Bet Payout Multiplier
function getRollPayout(roll) {
  const payouts = {
    1: 2,
    2: 3,
    3: 4,
    4: 7,
    5: 15,
  };
  return payouts[roll] || 1;
}

// Reset Game after each round
function resetGame() {
  markerPosition = 0;
  totalWinnings = 0; // Reset total winnings
  betsResolved = 0; // Reset bets resolved
  gameActive = true;

  // Reset the display
  document.getElementById("dice-result").innerText = "Dice Result: -";
  document.getElementById("game-result").innerText = "Result: -";

  // Clear the active marker
  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });

  // Reset all bets
  resetBets();
  updateBalanceDisplay();
}

// Reset Bets
function resetBets() {
  pathBet = 0;
  bustBet = 0;
  doublesBet = {};
  finishBet = {};
  rollBet = {};
  updateActiveBetsDisplay();

  // Clear the input fields
  document.getElementById("path-bet-amount").value = "";
  document.getElementById("bust-bet-amount").value = "";
  document.getElementById("doubles-bet-amount").value = "";
  document.getElementById("finish-bet-amount").value = "";
  document.getElementById("roll-bet-amount").value = "";
  document.getElementById("finish-choice").value = "";
  document.getElementById("doubles-choice").value = "";
  document.getElementById("roll-choice").value = "";
}

