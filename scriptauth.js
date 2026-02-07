// ===============================
// GESTION DU STOCKAGE JSON (COMPTEUR)
// ===============================

const STORAGE_CONFIG = {
    namespace: 'saint-valentin-benjamin-app',
    filename: 'compteur.json' // Simule le nom du fichier JSON
};

// 1. ÉCRIRE (+1) dans le fichier distant
function incrementerCompteur() {
    // Utilisation de countapi.xyz qui permet le reset
    const url = `https://api.countapi.xyz/hit/${STORAGE_CONFIG.namespace}/${STORAGE_CONFIG.filename}`;
    fetch(url)
        .then(response => response.json())
        .then(data => console.log("Nouveau fichier JSON mis à jour. Total:", data.value))
        .catch(err => console.error("Erreur écriture fichier:", err));
}

// 2. LIRE le fichier distant
async function lireCompteur() {
    const url = `https://api.countapi.xyz/get/${STORAGE_CONFIG.namespace}/${STORAGE_CONFIG.filename}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.value || 0;
    } catch (error) {
        console.error("Erreur lecture fichier:", error);
        return 0;
    }
}

// 3. REMETTRE À ZÉRO (RESET)
async function resetCompteur() {
    const url = `https://api.countapi.xyz/set/${STORAGE_CONFIG.namespace}/${STORAGE_CONFIG.filename}?value=0`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error("Erreur reset fichier:", error);
        return null;
    }
}

// ===============================
// GESTION DE L'AUTHENTIFICATION
// ===============================

function checkAuthentication() {
    const currentPage = decodeURIComponent(window.location.pathname).toLowerCase();
    
    const isIndexPage = currentPage.indexOf("index.html") !== -1 || currentPage === "/" || currentPage.endsWith("/");
    const isProtectedPage = currentPage.endsWith("admin.html");
    
    // --- LOGIQUE PAGE ADMIN ---
    if (isProtectedPage) {
        const storedAccess = localStorage.getItem('pageAccess');
        
        // Si pas d'accès stocké, rediriger vers mdp.html
        if (!storedAccess) {
            window.location.href = 'mdp.html';
            return;
        }
        
        const accessData = JSON.parse(storedAccess);
        
        // Vérifier si l'accès a expiré
        if (accessData.expiresAt <= Date.now()) {
            // L'accès a expiré, nettoyer et rediriger
            localStorage.removeItem('pageAccess');
            window.location.href = 'mdp.html';
            return;
        }
        
        // Accès valide - l'utilisateur peut rester sur la page protégée
        console.log(`Accès autorisé pour l'appareil: ${accessData.deviceId}`);
        window.isAuthorized = true;
        window.authorizedDeviceId = accessData.deviceId;
        window.authorizationExpires = accessData.expiresAt;
    }

    // --- LOGIQUE PAGE INDEX (COMPTEUR) ---
    if (isIndexPage) {
        incrementerCompteur();
    }
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
