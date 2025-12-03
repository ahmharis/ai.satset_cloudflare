import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("kunci_rahasia");
  
  // GANTI 'RAHASIA_DAPUR' DENGAN PASSWORD ANDA
  if (secret !== "RAHASIA_DAPUR") return new Response("Akses Ditolak", { status: 403 });

  const firebaseConfig = {
    apiKey: context.env.FB_API_KEY,
    authDomain: context.env.FB_AUTH_DOMAIN,
    projectId: context.env.FB_PROJECT_ID,
    appId: context.env.FB_APP_ID
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const body = await context.request.json();
    const email = body.email;
    const maxDevices = body.max_devices || 3;

    if (!email) return new Response("Email wajib ada", { status: 400 });

    // Generate Kode: SATSET-NAMA-ANGKA
    let cleanName = email.split('@')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleanName.length < 3) cleanName = "MEMBER";
    cleanName = cleanName.substring(0, 10);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `SATSET-${cleanName}-${randomDigits}`;

    await setDoc(doc(db, "licenses", newCode), {
      owner_email: email,
      max_devices: parseInt(maxDevices),
      created_at: new Date().toISOString(),
      status: "active",
      valid_tokens: []
    });

    await setDoc(doc(db, "claims", email), { license_code: newCode });

    return new Response(JSON.stringify({ success: true, code: newCode }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
