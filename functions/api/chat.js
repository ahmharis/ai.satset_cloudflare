export async function onRequestPost(context) {
  const GEMINI_API_KEY = context.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) return new Response(JSON.stringify({ reply: "Maaf, otak Aimin sedang offline." }), { headers: { "Content-Type": "application/json" }, status: 500 });

  try {
    const body = await context.request.json();
    const userMessage = body.message;

    const systemPrompt = `
      Kamu adalah Aimin, asisten AI "TIM AI Konten". Gaya bahasa santai, "Satset", sopan, dan menggunakan emoji.
      Tugas: Jelaskan produk (Analis, Planner, Komunikasi, Editing).
      Jika tanya harga/beli: Arahkan klik tombol Hubungi Admin.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ reply: "Aimin sedang pusing. Coba lagi ya!" }), { status: 500 });
  }
}
