// ===============================
// GESTION DU STOCKAGE (npoint.io)
// ===============================

// 🔴 IMPORTANT : Remplacez l'ID ci-dessous par celui que vous avez créé sur npoint.io
const BIN_ID = "48fbbe443444c9b9a76b"; 
const API_URL = `https://api.npoint.io/${BIN_ID}`;
// Rendre l'URL accessible globalement
window.NPOINT_API_URL = API_URL;

// 2. LIRE
async function lireCompteur() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.visites || 0;
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
