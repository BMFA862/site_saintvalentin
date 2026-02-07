// ===============================
// PROTECTION D'AUTHENTIFICATION
// ===============================

// Configuration du compteur global (API externe pour GitHub Pages)
window.COUNTER_NAMESPACE = 'saint-valentin-benjamin-app'; // Identifiant unique du projet
window.COUNTER_KEY = 'global-visits'; // Changez ce nom (ex: global-visits-v2) pour réinitialiser le compteur

// Fonction pour compter les visites sur index.html
function countVisit() {
    // Utilisation de counterapi.dev (gratuit, sans compte, stable)
    fetch(`https://api.counterapi.dev/v1/${window.COUNTER_NAMESPACE}/${window.COUNTER_KEY}/up`)
        .then(response => response.json())
        .then(data => console.log("Visite comptabilisée:", data.count))
        .catch(err => console.error("Erreur compteur:", err));
}

// Vérifier l'authentification au chargement de la page
function checkAuthentication() {
    const currentPage = window.location.pathname;
    
    const isIndexPage = currentPage.endsWith("index.html") || currentPage === "/" || currentPage.endsWith("/");

    // Seule admin.html est protégée par authentification
    const isProtectedPage = currentPage.endsWith("admin.html");
    
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

    // Compter la visite sur index.html (accessible sans authentification)
    if (isIndexPage) {
        countVisit();
    }
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
