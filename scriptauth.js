// ===============================
// GESTION DU STOCKAGE (JSONBIN.IO)
// ===============================

// 🔴 IMPORTANT : Créez un compte sur jsonbin.io, créez un bin avec { "visites": 0 }
// Copiez le BIN ID et la X-Master-Key (API Key) ici.
const BIN_ID = "6988e136ae596e708f1b0340"; // Nécessaire pour identifier votre bin
const API_KEY = "$2a$10$LI5N796XESwz7KCVuYaCm.COp5F81biddeU2ztyRm7nLI1SZClhbW"; // Nécessaire pour lire/modifier les données privées

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Rendre accessibles globalement
window.JSONBIN_API_URL = API_URL;
window.JSONBIN_API_KEY = API_KEY;

// 2. LIRE
async function lireCompteur() {
    try {
        const response = await fetch(API_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!response.ok) throw new Error("Erreur HTTP");
        const data = await response.json();
        // JSONBin v3 retourne les données dans l'objet "record"
        return data.record.visites || 0;
    } catch (error) {
        console.error("Erreur lecture compteur:", error);
        return "error";
    }
}

// 3. REMETTRE À ZÉRO
async function resetCompteur() {
    try {
        const newData = { "visites": 0 };
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
            body: JSON.stringify(newData)
        });
        return 0;
    } catch (error) {
        console.error("Erreur reset compteur:", error);
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
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
