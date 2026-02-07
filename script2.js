// ===============================
// PARAMÈTRES CONFIGURABLES
// ===============================

// Score et victoire
let score = 0;
const MAX_SCORE = 50;
let victoryShown = false;
const VICTORY_IMAGE = "img/vidéo saint valentin 1.mp4"; // À remplacer par votre image de victoire

// Fourchette de taille (en pixels)
const MIN_SIZE = 50;
const MAX_SIZE = 200;

// Fourchette d'angle (en degrés)
const MIN_ROT = -30;
const MAX_ROT = 30;

// Débordement maximal autorisé (en pixels)
const MAX_OVERFLOW = 50;

// Liste des images possibles (ou une seule)
const images = [
    "img/1.png",
    "img/2.png",
    "img/3.png",
    "img/4.png",
    "img/5.png",
    "img/6.png",
    "img/7.png",
];
// Nombre aléatoire dans une fourchette
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// Choisir une image aléatoire si tableau
function pickImage() {
    return Array.isArray(images)
        ? images[Math.floor(Math.random() * images.length)]
        : images;
}

// ===============================
// FONCTIONS DE GESTION DU SCORE
// ===============================

function updateScore() {
    score++;
    const scoreDisplay = document.getElementById("scoreDisplay");
    
    if (score < MAX_SCORE) {
        scoreDisplay.textContent = `Score : ${score}/${MAX_SCORE}`;
    } else {
        scoreDisplay.textContent = `Score : ${score}`;
        if (!victoryShown) {
            showVictory();
            victoryShown = true;
        }
    }
}

function showVictory() {
    const victoryScreen = document.getElementById("victoryScreen");
    const victoryVideo = document.getElementById("victoryImage");
    
    victoryScreen.classList.remove("hidden");
    victoryVideo.src = VICTORY_IMAGE;
    victoryVideo.loop = true;
    victoryVideo.play();
    
    // Désactiver le bouton
    const btn = document.getElementById("monBouton");
    btn.disabled = true;
}

function closeVictory() {
    const victoryScreen = document.getElementById("victoryScreen");
    victoryScreen.classList.add("hidden");
    
    // Réactiver le bouton
    const btn = document.getElementById("monBouton");
    btn.disabled = false;
}

// ===============================
// FONCTION PRINCIPALE
// ===============================

function spawnRandomImage() {
    const img = document.createElement("img");
    img.src = pickImage();
    img.style.position = "absolute";
    img.style.pointerEvents = "none"; // pour éviter de bloquer les clics

    // Taille aléatoire
    const size = rand(MIN_SIZE, MAX_SIZE);
    img.style.width = size + "px";
    img.style.height = "auto";

    // Rotation aléatoire
    const rot = rand(MIN_ROT, MAX_ROT);
    img.style.transform = `rotate(${rot}deg)`;

    // Position aléatoire dans la fenêtre
    const maxX = window.innerWidth - size + MAX_OVERFLOW;
    const maxY = window.innerHeight - size + MAX_OVERFLOW;

    const x = rand(-MAX_OVERFLOW, maxX);
    const y = rand(-MAX_OVERFLOW, maxY);

    img.style.left = x + "px";
    img.style.top = y + "px";

    // Ajout à la page
    document.body.appendChild(img);
}

// ===============================
// ÉCOUTE DU BOUTON HTML
// ===============================

// Exemple : bouton avec id="spawnBtn"
document.addEventListener("DOMContentLoaded", () => {
    // Supporte l'image bouton avec ID monBouton
    const btn = document.getElementById("monBouton");
    if (btn) {
        btn.addEventListener("click", () => {
            spawnRandomImage();
            updateScore();
        });
    }
    
    // Bouton fermer l'écran de victoire
    const closeBtn = document.getElementById("closeVictory");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeVictory);
    }

    // Précharger la vidéo de victoire dès le chargement initial de la page
    const victoryVideo = document.getElementById("victoryImage");
    if (victoryVideo) {
        victoryVideo.src = VICTORY_IMAGE;
        victoryVideo.preload = "auto";
        // Appeler load() pour demander explicitement au navigateur de commencer le téléchargement
        try {
            victoryVideo.load();
        } catch (e) {
            // Sinon, laisser le navigateur gérer le préchargement
        }
    }
});