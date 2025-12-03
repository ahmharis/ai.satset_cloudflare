import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function onRequestPost(context) {
  // Ambil Config dari Cloudflare Environment
  const firebaseConfig = {
    apiKey: context.env.FB_API_KEY,
    authDomain: context.env.FB_AUTH_DOMAIN,
    projectId: context.env.FB_PROJECT_ID,
    appId: context.env.FB_APP_ID
  };

  if (!firebaseConfig.apiKey) return new Response("Server Config Error", { status: 500 });

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const request = context.request;
    const body = await request.json();
    const { code } = body;

    const docRef = doc(db, "licenses", code);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "Kode Akses Salah!" }), { 
        headers: { "Content-Type": "application/json" }, status: 404 
      });
    }

    const data = docSnap.data();
    
    // Logika Team License (Saling Tendang)
    const maxDevices = data.max_devices || 3; 
    let currentTokens = data.valid_tokens || [];
    const newSessionToken = crypto.randomUUID();

    currentTokens.push(newSessionToken);

    if (currentTokens.length > maxDevices) {
        currentTokens = currentTokens.slice(-maxDevices);
    }
    
    await updateDoc(docRef, { 
      valid_tokens: currentTokens,
      last_login: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, token: newSessionToken }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
