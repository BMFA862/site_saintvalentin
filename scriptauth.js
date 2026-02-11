// ===============================
// GESTION DU STOCKAGE (JSONBIN.IO)
// ===============================

// 🔴 IMPORTANT : Créez un compte sur jsonbin.io, créez un bin avec { "visites": 0 }
// Copiez le BIN ID et la X-Access-Key (API Key) ici.
const BIN_ID = "6988e136ae596e708f1b0340"; // Nécessaire pour identifier votre bin
const API_KEY = "$2a$10$IOC9DDROugeavpEpMgCoteJ9Z/LI0UGMBx0.4TS8ZRMM4VkKXiOTS"; // Nécessaire pour lire/modifier les données privées

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Rendre accessibles globalement
window.JSONBIN_API_URL = API_URL;
window.JSONBIN_API_KEY = API_KEY;

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// 2. LIRE
async function lireCompteur() {
    try {
        const response = await fetch(API_URL, { headers: { 'X-Access-Key': API_KEY } });
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
            headers: { 'Content-Type': 'application/json', 'X-Access-Key': API_KEY },
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

const CORRECT_PASSWORD_HASH = "82c54848684abada2a27edb35393413bb6adae9fb641f07cffd1802e22fb51a9"; 

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
        
        hashPassword(accessData.passwordTest).then(function(result){
            if (result === CORRECT_PASSWORD_HASH) {
                console.log("Mot de passe correct");
            } else {
                console.log("Mot de passe incorect");
                window.location.href = "mdp.html";
                return;
            }
        });

        // Accès valide - l'utilisateur peut rester sur la page protégée
        console.log(`Accès autorisé pour l'appareil: ${accessData.deviceId}`);
        window.isAuthorized = true;
        window.authorizedDeviceId = accessData.deviceId;
        window.authorizationExpires = accessData.expiresAt;
    }
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
