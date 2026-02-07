// ===============================
// GESTION DU STOCKAGE (JSONBLOB)
// ===============================

// 🔴 IMPORTANT : Remplacez l'ID ci-dessous par celui que vous avez créé sur jsonblob.com
const BLOB_ID = "019c3a27-71d5-7fe4-815c-b3fa0dc8deea"; 
const API_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

// 1. ÉCRIRE (+1)
async function incrementerCompteur() {
    try {
        // A. On récupère le fichier actuel
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // B. On ajoute 1
        data.visites = (data.visites || 0) + 1;
        
        // C. On sauvegarde le fichier modifié
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log("Visite comptabilisée. Total:", data.visites);
    } catch (err) {
        console.error("Erreur compteur:", err);
    }
}

// 2. LIRE
async function lireCompteur() {
    try {
        const response = await fetch(API_URL);
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

    // --- LOGIQUE PAGE INDEX (COMPTEUR) ---
    if (isIndexPage) {
        incrementerCompteur();
    }
}

// Exécuter la vérification dès que le script charge
checkAuthentication();
