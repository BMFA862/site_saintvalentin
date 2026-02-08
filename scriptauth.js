// ===============================
// GESTION DU STOCKAGE (JSONBLOB)
// ===============================

// 🔴 IMPORTANT : Remplacez l'ID ci-dessous par celui que vous avez créé sur jsonblob.com
const BLOB_ID = "019c3e52-a59b-7ae1-902b-660da6f29842"; 
const API_URL = `https://jsonblob.com/${BLOB_ID}`;
// Rendre l'URL accessible globalement pour script2.js
window.API_URL = API_URL;

// 2. LIRE
async function lireCompteur() {
    try {
        // cache: 'no-store' force le navigateur à récupérer la vraie valeur
        const response = await fetch(API_URL, { cache: "no-store" });
        const data = await response.json();
        return data.visites || 0;
    } catch (error) {
        console.error("Erreur lecture fichier:", error);
        return 0;
    }
}

// 3. REMETTRE À ZÉRO
async function resetCompteur() {
    try {
        // On écrase le fichier avec 0
        const newData = { "visites": 0 };
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        return 0;
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
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
