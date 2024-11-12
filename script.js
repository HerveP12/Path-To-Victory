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

// Toggle rules display
function toggleRules() {
  const rulesContainer = document.getElementById("rules");
  const button = document.querySelector(".btn-toggle-rules");

  if (rulesContainer.style.display === "none") {
    rulesContainer.style.display = "block";
    button.innerText = "Hide Rules & Payouts";
  } else {
    rulesContainer.style.display = "none";
    button.innerText = "Show Rules & Payouts";
  }
}

// Place Path Bet
function placePathBet() {
  const amount = parseInt(document.getElementById("path-bet-amount").value);
  if (amount > 0 && amount <= playerBalance) {
    pathBet = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
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
  } else {
    alert("Invalid bet amount. Make sure it's within your balance.");
  }
}

// Place Doubles Bet with Dropdown Validation
function placeDoublesBet() {
  const amount = parseInt(document.getElementById("doubles-bet-amount").value);
  const chosenDouble = document.getElementById("doubles-choice").value;
  if (amount > 0 && amount <= playerBalance && chosenDouble) {
    doublesBet[chosenDouble] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
  } else {
    alert(
      "Invalid bet amount or choice. Make sure to select a valid option and check your balance."
    );
  }
}

// Place Finish Bet with Dropdown Validation
function placeFinishBet() {
  const amount = parseInt(document.getElementById("finish-bet-amount").value);
  const chosenFinish = document.getElementById("finish-choice").value;
  if (amount > 0 && amount <= playerBalance && chosenFinish) {
    finishBet[chosenFinish] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
  } else {
    alert(
      "Invalid bet amount or choice. Make sure to select a valid option and check your balance."
    );
  }
}

// Place Roll Bet with Dropdown Validation
function placeRollBet() {
  const amount = parseInt(document.getElementById("roll-bet-amount").value);
  const chosenRoll = document.getElementById("roll-choice").value;
  if (amount > 0 && amount <= playerBalance && chosenRoll) {
    rollBet[chosenRoll] = amount;
    playerBalance -= amount;
    updateBalanceDisplay();
    updateActiveBetsDisplay();
  } else {
    alert(
      "Invalid bet amount or choice. Make sure to select a valid option and check your balance."
    );
  }
}

// Roll Dice with Animation
function rollDice() {
  if (!gameActive) return;

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

  const dice1Elem = document.getElementById("dice-1");
  const dice2Elem = document.getElementById("dice-2");

  dice1Elem.classList.add("dice-roll");
  dice2Elem.classList.add("dice-roll");

  const rollDuration = 1000;
  const rollingInterval = setInterval(() => {
    dice1Elem.innerText = diceFaces[Math.floor(Math.random() * 6) + 1];
    dice2Elem.innerText = diceFaces[Math.floor(Math.random() * 6) + 1];
  }, 100);

  setTimeout(() => {
    clearInterval(rollingInterval);

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
      handleDoubles(dice1);
      resolveBustBet(true); // Check bust bet for doubles
      resolveRollBet(difference); // Resolve roll bet specifically for doubles
      if (markerPosition === 0) {
        endGame(); // End the game if marker is at space 0 due to doubles
      }
    } else {
      moveMarker(difference);
      resolveBets();
      if (markerPosition >= 10) {
        endGame(); // Only end game when marker reaches or exceeds 10
      }
    }

    isFirstRoll = false;
  }, rollDuration);
}

// Resolve non-doubles bets if no double was rolled
function resolveBets() {
  resolvePathBet();
  resolveRollBet();
  resolveBustBet();
  checkEndOfRound();
}

// Handle Doubles Logic for Rolls
function handleDoubles(diceValue) {
  let resultMessage = `Doubles rolled! Marker ends at space ${markerPosition}.`;

  // Disable further actions until the game resets
  gameActive = false;
  disableButtons();

  // Check if a finish bet is active and resolve it based on the marker position
  const targetFinishSpace =
    Object.keys(finishBet).length > 0
      ? parseInt(Object.keys(finishBet)[0], 10)
      : null;

  if (targetFinishSpace !== null) {
    if (markerPosition === targetFinishSpace) {
      resolveFinishBet(true); // Win if on the exact chosen finish space
      resultMessage += ` Finish Bet wins on Space ${targetFinishSpace}.`;
    } else {
      resolveFinishBet(false); // Lose if not on the chosen space
      resultMessage += ` Finish Bet lost. The marker exceeded Space ${targetFinishSpace}.`;
    }
  }

  // Check if a doubles bet was placed
  const chosenDouble = `${diceValue}-${diceValue}`;
  if (doublesBet[chosenDouble]) {
    const payout = doublesBet[chosenDouble] * 9;
    playerBalance += payout + doublesBet[chosenDouble];
    totalWinnings += payout;
    resultMessage += ` You won $${payout} on Doubles Bet for ${chosenDouble}.`;
    doublesBet = {}; // Reset doubles bets after win
    betsResolved++;
  } else if (Object.keys(doublesBet).length > 0) {
    resultMessage += ` You lost your Doubles Bet.`;
    doublesBet = {};
    betsResolved++;
  }

  // Roll Bet on doubles check
  if (rollBet["doubles"]) {
    const payout = rollBet["doubles"] * 4;
    playerBalance += payout; // Correct payout calculation
    totalWinnings += payout;
    resultMessage += ` You won $${payout} on Roll Bet for Doubles.`;
    betsResolved++;
  }
  // Disable all buttons to prevent further actions
  function disableButtons() {
    document.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
  }

  // Enable all buttons after the game resets
  function enableButtons() {
    document.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
    });
  }

  // Reset Game after each round
  function resetGame() {
    markerPosition = 0;
    totalWinnings = 0;
    betsResolved = 0;
    gameActive = true;

    document.getElementById("dice-result").innerText = "Dice Result: -";
    document.getElementById("game-result").innerText = "Result: -";

    document.querySelectorAll(".path-space").forEach((space) => {
      space.classList.remove("active");
    });

    resetBets();
    updateBalanceDisplay();
    updateActiveBetsDisplay();
    enableButtons(); // Re-enable buttons after resetting the game
  }
  // Display the complete result message, including doubles rolled and payout details
  document.getElementById("game-result").innerText = resultMessage;

  // Highlight the marker's position
  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });
  const currentSpace = document.getElementById(`space-${markerPosition}`);
  if (currentSpace) {
    currentSpace.classList.add("active");
  }

  // Add a delay before resetting the game to display results
  setTimeout(resetGame, 2000); // Delay of 3 seconds before resetting the game
}

// Move Marker based on dice roll and check for finish bet win/loss
function moveMarker(spaces) {
  markerPosition += spaces;
  if (markerPosition > 14) markerPosition = 14;

  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });

  const currentSpace = document.getElementById(`space-${markerPosition}`);
  currentSpace.classList.add("active");

  // Check if finish bet should resolve based on marker position
  const targetFinishSpace =
    Object.keys(finishBet).length > 0
      ? parseInt(Object.keys(finishBet)[0], 10)
      : null;

  if (targetFinishSpace !== null) {
    if (markerPosition === targetFinishSpace) {
      resolveFinishBet(true); // Win on exact match
      endGame();
      return;
    } else if (markerPosition > targetFinishSpace) {
      resolveFinishBet(false); // Lose if passed the chosen space
      endGame();
      return;
    }
  }

  if (markerPosition >= 10) {
    endGame();
  } else {
    resolvePathBet();
    resolveRollBet(spaces);
    checkEndOfRound();
  }
}

// Resolve Finish Bet
function resolveFinishBet(isWin) {
  for (let space in finishBet) {
    const payout = finishBet[space] * getFinishPayout(space);
    if (isWin) {
      playerBalance += payout + finishBet[space];
      totalWinnings += payout;
      document.getElementById(
        "game-result"
      ).innerText += ` Finish Bet wins $${payout} on Space ${space}.`;
    } else {
      document.getElementById(
        "game-result"
      ).innerText += ` Finish Bet lost. The marker exceeded Space ${space}.`;
    }
    delete finishBet[space];
    betsResolved++;
  }
}

// Resolve Path Bet
function resolvePathBet() {
  if (pathBet > 0 && markerPosition >= 10) {
    let payout = pathBet; // Set to 1:1 payout (original bet amount)
    if (markerPosition === 14) payout = pathBet * 4;
    else if (markerPosition === 13) payout = pathBet * 3;

    playerBalance += payout + pathBet; // Return bet amount and winnings
    totalWinnings += payout;
    document.getElementById(
      "game-result"
    ).innerText += ` Path Bet wins $${payout}.`;
    pathBet = 0; // Reset path bet after resolving
    betsResolved++;
  }
}

// Resolve Roll Bet (Exact Spaces)
function resolveRollBet(spaces) {
  for (let roll in rollBet) {
    if (roll == spaces) {
      const payout = rollBet[roll] * getRollPayout(roll);
      playerBalance += payout + rollBet[roll];
      totalWinnings += payout;
      document.getElementById(
        "game-result"
      ).innerText += ` Roll Bet wins $${payout} for ${roll} spaces.`;
    } else {
      document.getElementById(
        "game-result"
      ).innerText += ` Roll Bet lost for ${roll} spaces.`;
    }
    delete rollBet[roll]; // Reset roll bet after resolving
    betsResolved++;
  }
  checkEndOfRound();
}

// Resolve Bust Bet with specific conditions
function resolveBustBet(doublesRolled) {
  if (bustBet > 0) {
    if (markerPosition >= 10) {
      document.getElementById(
        "game-result"
      ).innerText += ` Bust Bet loses as 10+ points were scored.`;
      bustBet = 0;
      betsResolved++;
    } else if (doublesRolled) {
      if (isFirstRoll) {
        document.getElementById(
          "game-result"
        ).innerText += ` Bust Bet pushes on first roll doubles.`;
      } else {
        const payout = bustBet;
        playerBalance += payout + bustBet;
        totalWinnings += payout;
        document.getElementById(
          "game-result"
        ).innerText += ` Bust Bet wins $${payout}.`;
        bustBet = 0;
        betsResolved++;
      }
    }
  }
  checkEndOfRound();
}

// End game if marker reaches or exceeds the chosen finish space or 10
function endGame() {
  const targetSpace =
    Object.keys(finishBet).length > 0
      ? parseInt(Object.keys(finishBet)[0], 10)
      : 10;

  if (markerPosition >= targetSpace) {
    resolveFinishBet(); // Only evaluate finish bet at the end of the game
    resolvePathBet();
    resolveBustBet(false);
    checkEndOfRound();
  }
}

// Updated checkEndOfRound to handle round resets
function checkEndOfRound() {
  const activeBets =
    (pathBet > 0 ? 1 : 0) +
    (bustBet > 0 ? 1 : 0) +
    Object.keys(doublesBet).length +
    Object.keys(finishBet).length +
    Object.keys(rollBet).length;

  if (betsResolved >= activeBets) {
    gameActive = false;
    setTimeout(function () {
      document.getElementById(
        "game-result"
      ).innerText += ` Total Winnings: $${totalWinnings}`;
      setTimeout(resetGame, 3000);
    }, 3000);
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
  totalWinnings = 0;
  betsResolved = 0;
  gameActive = true;

  document.getElementById("dice-result").innerText = "Dice Result: -";
  document.getElementById("game-result").innerText = "Result: -";

  document.querySelectorAll(".path-space").forEach((space) => {
    space.classList.remove("active");
  });

  resetBets();
  updateBalanceDisplay();
  updateActiveBetsDisplay();
}

// Reset Bets
function resetBets() {
  pathBet = 0;
  bustBet = 0;
  doublesBet = {};
  finishBet = {};
  rollBet = {};

  document.getElementById("path-bet-amount").value = "";
  document.getElementById("bust-bet-amount").value = "";
  document.getElementById("doubles-bet-amount").value = "";
  document.getElementById("finish-bet-amount").value = "";
  document.getElementById("roll-bet-amount").value = "";
  document.getElementById("finish-choice").value = "";
  document.getElementById("doubles-choice").value = "";
  document.getElementById("roll-choice").value = "";
}
