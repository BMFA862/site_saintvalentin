// ===============================
// GESTION DU STOCKAGE (CountAPI)
// ===============================

// Espace de nom unique (modifiez si nécessaire)
const NAMESPACE = "saint-valentin-bmfa862"; 
const KEY = "visites";

// URLs de l'API CountAPI
window.COUNT_API_HIT = `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;
window.COUNT_API_GET = `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`;

// 2. LIRE
async function lireCompteur() {
    try {
        const response = await fetch(window.COUNT_API_GET);
        const data = await response.json();
        return data.value || 0;
    } catch (error) {
        console.error("Erreur lecture compteur:", error);
        return 0;
    }
}

// 3. REMETTRE À ZÉRO
async function resetCompteur() {
    try {
        // Note: Le reset ne fonctionne que si la clé a été créée avec enable_reset=1
        // On tente de définir la valeur à 0
        const response = await fetch(`https://api.countapi.xyz/set/${NAMESPACE}/${KEY}?value=0`);
        const data = await response.json();
        return data.value;
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
