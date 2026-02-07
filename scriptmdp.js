// Fonction pour hasher le mot de passe avec SHA256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Récupérer l'adresse MAC (ou l'IP locale comme proxy)
async function getMachineIdentifier() {
    return new Promise((resolve) => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [] });
            const ipv4Pattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
            
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate) return;
                const match = ipv4Pattern.exec(ice.candidate.candidate);
                if (match) {
                    pc.close();
                    resolve(match[0]);
                }
            };
        } catch (e) {
            resolve('unknown-device-error');
        }
        
        // Fallback si on ne peut pas récupérer l'IP
        setTimeout(() => {
            resolve('unknown-device');
        }, 1000);
    });
}

// Mot de passe hashé (vous pouvez le générer une fois et le stocker)
// Pour générer: hashPassword("votreMotDePasse").then(h => console.log(h))
const CORRECT_PASSWORD_HASH = "82c54848684abada2a27edb35393413bb6adae9fb641f07cffd1802e22fb51a9"; 

// Durée d'accès en millisecondes (10 minutes)
const ACCESS_DURATION = 10 * 60 * 1000;

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    // Hasher le mot de passe entré
    const inputHash = await hashPassword(password);
    
    // Vérifier si c'est correct
    if (inputHash === CORRECT_PASSWORD_HASH) {
        // Récupérer l'identifiant de la machine
        const deviceId = await getMachineIdentifier();
        
        // Créer un token d'accès avec expiration
        const accessToken = {
            deviceId: deviceId,
            accessTime: Date.now(),
            expiresAt: Date.now() + ACCESS_DURATION,
            verified: true
        };
        
        // Stocker dans localStorage pour persister même après fermeture du navigateur
        localStorage.setItem('pageAccess', JSON.stringify(accessToken));
        
        // Stocker aussi une trace datée par adresse de machine
        const accessLog = {
            deviceId: deviceId,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + ACCESS_DURATION).toISOString()
        };
        localStorage.setItem(`access_${deviceId}`, JSON.stringify(accessLog));
        
        // Variable globale pour indiquer l'accès autorisé
        window.isAuthorized = true;
        window.authorizedDeviceId = deviceId;
        window.authorizationExpires = Date.now() + ACCESS_DURATION;
        
        // Afficher un message de succès
        alert(`Accès autorisé pour l'appareil: ${deviceId}\nExpiration: ${new Date(Date.now() + ACCESS_DURATION).toLocaleTimeString()}`);
        
        // Redirection vers la page d'administration
        window.location.href = 'admin.html';
        
        // Vider le champ (sécurité)
        passwordInput.value = '';
    } else {
        alert('Mot de passe incorrect');
        passwordInput.value = '';
    }
});

// Vérifier si l'utilisateur a un accès valide au chargement
window.addEventListener('load', () => {
    const storedAccess = localStorage.getItem('pageAccess');
    
    if (storedAccess) {
        const accessData = JSON.parse(storedAccess);
        
        // Vérifier si l'accès n'a pas expiré
        if (accessData.expiresAt > Date.now()) {
            window.isAuthorized = true;
            window.authorizedDeviceId = accessData.deviceId;
            window.authorizationExpires = accessData.expiresAt;
            document.getElementById('passwordForm').style.display = 'none';
            console.log(`Accès autorisé pour: ${accessData.deviceId}`);
            
            // Redirection automatique vers admin.html si le dispositif est reconnu
            window.location.href = 'admin.html';
        } else {
            localStorage.removeItem('pageAccess');
            window.isAuthorized = false;
        }
    }
});
