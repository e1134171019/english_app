/**
 * Vercel Serverless Function: Identify Word Base Form
 * Uses GitHub Models API to identify base form of inflected words
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { word, sentence } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Build prompt with optional sentence context
    let prompt = `Identify the base form and grammatical information for the English word "${word}"`;

    if (sentence) {
        prompt += ` in the following sentence:\n"${sentence}"\n\n`;
        prompt += `Consider the context to accurately determine the part of speech and inflection type.\n\n`;
    } else {
        prompt += `.

`;
    }

    prompt += `Return ONLY valid JSON:
{
  "baseForm": "base/infinitive form",
  "pos": "part of speech (v./n./adj./adv.)",
  "inflection": "grammatical form (e.g., present-participle, past-tense, plural, third-person-singular)",
  "contextualMeaning": "${sentence ? 'meaning in this context (Chinese)' : 'general meaning (Chinese)'}"
}

Examples:
- Word: "runs", Sentence: "He runs to school" → {"baseForm":"run","pos":"v.","inflection":"third-person-singular","contextualMeaning":"跑"}
- Word: "running", Sentence: "I am running" → {"baseForm":"run","pos":"v.","inflection":"present-participle","contextualMeaning":"正在跑"}
- Word: "running", Sentence: "Running is healthy" → {"baseForm":"running","pos":"n.","inflection":"base","contextualMeaning":"跑步"}

Now identify: "${word}"${sentence ? ` in: "${sentence}"` : ''}`;

    try {
        const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a linguistic expert specializing in English morphology.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error('GitHub Models API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        const result = JSON.parse(jsonMatch[0]);

        console.log(`[AI] Identified: ${word}${sentence ? ` (in context)` : ''} → ${result.baseForm}`);
        res.status(200).json(result);
    } catch (error) {
        console.error('[AI] Identification error:', error);
        res.status(500).json({ error: error.message });
    }
}
