// ===============================
// PARAMÈTRES CONFIGURABLES
// ===============================

// Score et victoire
let score = 0;
const MAX_SCORE = 70;
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
// GESTION DU COMPTEUR (JSONBIN.IO)
// ===============================
async function incrementerCompteur() {
    // Sécurité : on récupère l'URL globale définie dans scriptauth.js
    const url = window.JSONBIN_API_URL;
    const key = window.JSONBIN_API_KEY;
    
    if (!url) {
        console.error("❌ ERREUR : JSONBIN non configuré. Remplissez BIN_ID et API_KEY dans scriptauth.js");
        return;
    }

    try {
        // 1. Lire la valeur actuelle
        const response = await fetch(url, { headers: { 'X-Access-Key': key } });
        let data = await response.json();
        
        let currentVisits = data.record.visites || 0;

        // 2. Incrémenter
        let newVisits = currentVisits + 1;
        
        // 3. Sauvegarder (PUT met à jour tout le JSON)
        await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Access-Key': key },
            body: JSON.stringify({ "visites": newVisits })
        });
        
        console.log(`✅ Visite comptabilisée ! Nouveau total : ${newVisits}`);
    } catch (err) {
        console.error("❌ Erreur réseau compteur:", err);
    }
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
    // Lancer le compteur de visites
    incrementerCompteur();

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

    // ===============================
    // GESTION DU CHARGEMENT (LOADER)
    // ===============================
    const loadingScreen = document.getElementById("loadingScreen");
    const preloadPromises = [];

    // 1. Précharger la vidéo de victoire
    const victoryVideo = document.getElementById("victoryImage");
    if (victoryVideo) {
        victoryVideo.src = VICTORY_IMAGE;
        victoryVideo.preload = "auto";
        
        const videoPromise = new Promise((resolve) => {
            let resolved = false;
            let checkProgress; // Déclaration préalable pour l'utiliser dans done()

            const done = () => { 
                if (!resolved) { 
                    resolved = true; 
                    // Nettoyage : on arrête d'écouter les événements une fois fini
                    victoryVideo.removeEventListener('progress', checkProgress);
                    victoryVideo.removeEventListener('loadedmetadata', checkProgress);
                    victoryVideo.removeEventListener('error', done);
                    resolve(); 
                } 
            };

            checkProgress = () => {
                if (resolved) return;
                
                // Si la durée n'est pas encore connue, on attend
                if (!victoryVideo.duration) return;

                let percent = 0;
                if (victoryVideo.buffered.length > 0) {
                    // Calcul du pourcentage chargé (fin du buffer / durée totale)
                    percent = victoryVideo.buffered.end(victoryVideo.buffered.length - 1) / victoryVideo.duration;
                }

                // Si > 60% (0.6) ou si la vidéo est totalement chargée
                if (percent >= 0.6 || victoryVideo.readyState === 4) {
                    done();
                }
            };

            victoryVideo.addEventListener('progress', checkProgress);
            victoryVideo.addEventListener('loadedmetadata', checkProgress);
            victoryVideo.addEventListener('error', done);
            
            // Timeout de sécurité augmenté à 15s pour laisser le temps de charger 60%
            setTimeout(done, 15000);

            // Vérification immédiate (si déjà en cache)
            checkProgress();
        });
        preloadPromises.push(videoPromise);

        try { victoryVideo.load(); } catch (e) {}
    }

    // 2. Précharger les images du jeu
    const imageList = Array.isArray(images) ? images : [images];
    imageList.forEach(src => {
        const p = new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
        });
        preloadPromises.push(p);
    });

    // 3. Masquer l'écran de chargement une fois tout prêt
    Promise.all(preloadPromises).then(() => {
        // Petit délai pour la fluidité visuelle
        setTimeout(() => {
            if (loadingScreen) loadingScreen.classList.add("hidden");
        }, 500);
    });

    // Désactiver le double-tap / double-click qui zoome la page sur navigateurs Apple
    (function disableAppleDoubleTapZoom() {
        const ua = navigator.userAgent || "";
        const isApple = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (!isApple) return;

        // S'assurer qu'une meta viewport existe et empêcher le zoom (note: impacte l'accessibilité)
        const viewportContent = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
        let meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.setAttribute('content', viewportContent);
        } else {
            meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = viewportContent;
            document.head.appendChild(meta);
        }

        // Empêcher le double-clic (desktop Safari) de déclencher l'action par défaut
        window.addEventListener('dblclick', function (e) {
            e.preventDefault();
        }, { passive: false });
    })();
});