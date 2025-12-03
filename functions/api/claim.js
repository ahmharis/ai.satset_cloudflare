import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function onRequestPost(context) {
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
    const { email } = body;
    const docRef = doc(db, "claims", email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "Email tidak ditemukan." }), { 
        headers: { "Content-Type": "application/json" }, status: 404 
      });
    }

    return new Response(JSON.stringify({ success: true, code: docSnap.data().license_code }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
