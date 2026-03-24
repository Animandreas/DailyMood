export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { answers, duration } = req.body;
  const summary = (answers || []).filter(Boolean).join(' | ');
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: `Someone just completed ${duration} minutes of focused prayer. During reflection they shared: "${summary}"\n\nBased on what they shared, give them ONE deeply personal and fitting Bible verse.\n\nRespond ONLY in valid JSON, no markdown:\n{"reference":"Book Ch:V","verse":"Full verse (ESV or NIV)","explanation":"3-4 warm, personal sentences connecting this verse to what they shared in their reflection. Be pastoral and gentle."}` }]
      })
    });
    const data = await r.json();
    const text = data.content.map(i => i.text || '').join('');
    return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (e) {
    return res.status(500).json({ error: 'Failed' });
  }
}
