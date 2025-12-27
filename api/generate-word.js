/**
 * Vercel Serverless Function: Generate Complete Word Data
 * Uses GitHub Models API (GPT-4) to generate comprehensive word data
 */

export default async function handler(req, res) {
    // Enable CORS for GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { word } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error: Missing GitHub token' });
    }

    const prompt = generateWordPrompt(word);

    try {
        const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',  // Use gpt-4o-mini (free tier compatible)
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert English-Chinese dictionary AI that generates accurate, educationally-sound word data in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,  // Low for consistency
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'GitHub Models API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Extract JSON (in case AI adds explanation)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from AI');
        }

        const wordData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!wordData.english || !wordData.translation || !wordData.pos) {
            throw new Error('Missing required fields in AI response');
        }

        console.log(`[AI] Generated word: ${wordData.english}`);
        res.status(200).json(wordData);
    } catch (error) {
        console.error('[AI] Generation error:', error);
        res.status(500).json({
            error: 'AI generation failed',
            details: error.message
        });
    }
}

function generateWordPrompt(word) {
    return `You are an expert English-Chinese dictionary AI. Generate a complete, accurate JSON object for the English word "${word}".

CRITICAL REQUIREMENTS:
1. Determine the correct part of speech (POS)
2. Create a natural, context-appropriate example sentence
3. Provide accurate Chinese translations
4. If it's a VERB, include past tense and past participle
5. Include synonyms and word family for interactive learning

OUTPUT FORMAT (JSON only, no explanation):
{
  "english": "${word}",
  "translation": "準確的中文翻譯（可包含多個意思用；分隔）",
  "level": "J3",
  "schoolLevel": "",
  "pos": "詞性代碼 (n./v./vt./vi./adj./adv./prep./conj./pron./art./interj.)",
  "phonetic": "IPA音標，格式：/ˈfəʊnətɪk/",
  "exampleEn": "自然的英文例句，使用這個單字，符合詞性用法",
  "exampleZh": "例句的準確中文翻譯",
  "past": "如果是動詞填過去式，否則空字串",
  "pp": "如果是動詞填過去分詞，否則空字串",
  "verb": null,
  "synonyms": ["同義詞1", "同義詞2", "同義詞3"],
  "family": "相關詞族，用逗號分隔",
  "pattern": "如果是動詞填變化模式（REG_ED/IRREG等），否則空字串",
  "patternZh": "變化模式的中文說明"
}

IMPORTANT: If this is a VERB, set "verb" to {"base":"${word}","past":"過去式","pp":"過去分詞"} instead of null.

EXAMPLES:

For noun "apple":
{
  "english": "apple",
  "translation": "蘋果",
  "level": "J1",
  "schoolLevel": "",
  "pos": "n.",
  "phonetic": "/ˈæpl/",
  "exampleEn": "I eat an apple every day.",
  "exampleZh": "我每天吃一個蘋果。",
  "past": "",
  "pp": "",
  "verb": null,
  "synonyms": [],
  "family": "",
  "pattern": "",
  "patternZh": ""
}

For verb "run":
{
  "english": "run",
  "translation": "跑；奔跑",
  "level": "J1",
  "schoolLevel": "",
  "pos": "vi.",
  "phonetic": "/rʌn/",
  "exampleEn": "I run five kilometers every morning.",
  "exampleZh": "我每天早上跑五公里。",
  "past": "ran",
  "pp": "run",
  "verb": {
    "base": "run",
    "past": "ran",
    "pp": "run"
  },
  "synonyms": ["sprint", "jog", "dash"],
  "family": "runner, running",
  "pattern": "IRREG",
  "patternZh": "不規則動詞：run-ran-run"
}

Now generate complete data for "${word}":`;
}
