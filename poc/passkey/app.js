// Utility: Generate a random challenge as an ArrayBuffer
function generateChallenge() {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  return challenge;
}

// Utility: Convert ArrayBuffer to base64url string (for easier storage)
function arrayBufferToBase64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Function to initiate passkey registration
async function registerPasskey() {
  // Dummy user data (in a real app, this data must come from a trusted source)
  const user = {
    id: Uint8Array.from('user123', c => c.charCodeAt(0)), // Unique user ID as ArrayBuffer
    name: 'user@example.com',
    displayName: 'User'
  };

  // Set up registration options. Note that rp.id must match your domain.
  const publicKeyCredentialCreationOptions = {
    challenge: generateChallenge(),
    rp: { name: 'YourSite', id: window.location.hostname },
    user: user,
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }  // RS256
    ],
    timeout: 60000,
    attestation: 'direct'
  };

  try {
    // Call the WebAuthn API to create a new credential (passkey)
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    
    // Process the credential: convert ArrayBuffers to base64url strings for storage
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
        clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON)
      }
    };

    // Store the credential data (for example, in localStorage)
    localStorage.setItem('userCredential', JSON.stringify(credentialData));
    alert('Passkey registration successful!');
  } catch (err) {
    console.error('Registration error:', err);
    alert('Error during registration: ' + err);
  }
}

// Attach the registration function to the button
document.getElementById('registerBtn').addEventListener('click', registerPasskey);
