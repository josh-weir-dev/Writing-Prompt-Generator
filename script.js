import { settings } from "./data/settings.js";
import { characters } from "./data/characters.js";
import { conflicts } from "./data/conflicts.js";

let currentStreak = parseInt(localStorage.getItem("currentStreak")) || 0;
let lastPromptDate = localStorage.getItem("lastPromptDate");

const streakSound = new Audio("confetti.mp3");

const streakDisplay = document.createElement("div");
streakDisplay.id = "streakDisplay";
streakDisplay.style.fontWeight = "bold";
streakDisplay.style.textAlign = "center";
streakDisplay.style.marginBottom = "20px";

const promptBuilder = document.getElementById("prompt-builder");
promptBuilder.parentNode.insertBefore(streakDisplay, promptBuilder);

let confettiContainer = document.getElementById("confetti-container");
if (!confettiContainer) {
    confettiContainer = document.createElement("div");
    confettiContainer.id = "confetti-container";
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = "0";
    confettiContainer.style.left = "0";
    confettiContainer.style.width = "100%";
    confettiContainer.style.height = "100%";
    confettiContainer.style.pointerEvents = "none";
    confettiContainer.style.overflow = "hidden";
    confettiContainer.style.zIndex = "9999";
    document.body.appendChild(confettiContainer);
}

function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

function triggerConfetti(count = 30) {
    console.log("confetti");
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        // Random position
        confetti.style.left = Math.random() * window.innerWidth + "px";

        // Random color
        const colors = ["#ffd6a5", "#ffb347", "#ff6b6b", "#f9c74f"];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random size
        const size = Math.random() * 8 + 4; // 4px-12px
        confetti.style.width = size + "px";
        confetti.style.height = size + "px";

        // Random animation duration
        const duration = Math.random() * 1 + 1.5; // 1.5s-2.5s
        confetti.style.animation = `fall ${duration}s linear forwards`;

        // Add rotation for fun
        const rotation = Math.random() * 360;
        confetti.style.transform = `rotate(${rotation}deg)`;

        confettiContainer.appendChild(confetti);

        // Remove after animation
        confetti.addEventListener("animationend", () => confetti.remove());
    }
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}
.confetti {
    position: absolute;
    border-radius: 2px;
    opacity: 0.9;
}
`;
document.head.appendChild(style);

function displayStreak(){
    streakDisplay.textContent = `🔥 Current Streak: ${currentStreak} day${currentStreak > 1 ? "s" : ""}`;
}

function updateStreak() {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    let streakIncreased = false;

    if (lastPromptDate === today) {
    } else if (lastPromptDate === yesterday) {
        currentStreak++;
        streakIncreased = true;
    } else {
        if (currentStreak == 0){
            streakIncreased = true;
        }
        currentStreak = 1;
    }

    lastPromptDate = today;

    localStorage.setItem("currentStreak", currentStreak);
    localStorage.setItem("lastPromptDate", lastPromptDate);

    displayStreak();

    if (streakIncreased){
        triggerConfetti();
        streakSound.play();
    } 
}

displayStreak();

let currentCharacter = "";
let currentConflict = "";

function random(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function updatePrompt(){
    if (!currentCharacter || !currentConflict){
        return;
    }
    const prompt = `${currentCharacter} in a ${settingSelect.value} ${currentConflict}.`;
    promptOutput.textContent = prompt;
}

const genreSelect = document.getElementById("genre");
const settingSelect = document.getElementById("setting");
const promptOutput = document.getElementById("promptOutput");

function populateSettings(){
    const genre = genreSelect.value;
    console.log("populateSettings called. Selected genre:", genre);
    settingSelect.innerHTML = "";
    settings[genre].forEach(setting => {
        const option = document.createElement("option");
        option.textContent = setting;
        settingSelect.appendChild(option);
    });
}

populateSettings();

genreSelect.addEventListener("change", populateSettings);
settingSelect.addEventListener("change", updatePrompt);

document.getElementById("generatePrompt").addEventListener("click", () => {
    const genre = genreSelect.value;

    const character = random(characters[genre]);
    const conflict = random(conflicts[genre]);
    const setting = settingSelect.value;

    const prompt = `${character} in a ${setting} ${conflict}.`;

    promptOutput.textContent = prompt;

    currentCharacter = character;
    currentConflict = conflict;

    updateStreak();
})

document.getElementById("randomCharacter").addEventListener("click", () => {
    currentCharacter = random(characters[genreSelect.value]);
    updatePrompt();
})

document.getElementById("randomConflict").addEventListener("click", () =>{
    currentConflict = random(conflicts[genreSelect.value]);
    updatePrompt();
})

function loadSavedPrompts(){
    const saved = JSON.parse(localStorage.getItem("savedPrompts")) || [];
    return saved;
}

function savePrompts(prompts){
    localStorage.setItem("savedPrompts", JSON.stringify(prompts));
}

function renderSavedPrompts(){
    const saved = loadSavedPrompts();
    const ul = document.getElementById("savedPrompts");
    ul.innerHTML = "";

    saved.forEach((prompt, index) =>{
        const li = document.createElement("li");
        li.textContent = prompt;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.addEventListener("click", () =>{
            saved.splice(index, 1);
            savePrompts(saved);
            renderSavedPrompts();
        });

        li.appendChild(deleteBtn);
        ul.appendChild(li);
    });
}

document.getElementById("savePrompt").addEventListener("click", () =>{
    const prompt = promptOutput.textContent.trim();
    if (!prompt) return;

    const saved = loadSavedPrompts();
    saved.push(prompt);
    savePrompts(saved);
    renderSavedPrompts();
});

document.getElementById("copyPrompt").addEventListener("click", () =>{
    const prompt = promptOutput.textContent.trim();
    if (!prompt) return;

    navigator.clipboard.writeText(prompt)
        .then(() => alert("Prompt copied to clipboard!"))
        .catch(err => console.error("Failed to copy prompt:". err));
});

renderSavedPrompts();
