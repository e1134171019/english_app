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
        console.log('[AI] Calling GitHub Models API...');
        console.log('[AI] Token configured:', GITHUB_TOKEN ? 'Yes' : 'No');

        // Use official GitHub Models endpoint
        const response = await fetch('https://models.github.ai/inference/chat/completions', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',  // Use proper GitHub Models format
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
                temperature: 0.3,
                max_tokens: 1000
            })
        });

        console.log('[AI] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI] GitHub Models error response:', errorText);
            console.error('[AI] Status:', response.status);
            console.error('[AI] Headers:', Object.fromEntries(response.headers.entries()));
            throw new Error(`GitHub Models API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Extract JSON (in case AI adds explanation)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[AI] Invalid response format:', content);
            throw new Error('Invalid JSON response from AI');
        }

        const wordData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!wordData.english || !wordData.translation || !wordData.pos) {
            console.error('[AI] Missing required fields:', wordData);
            throw new Error('Missing required fields in AI response');
        }

        console.log(`[AI] Generated word: ${wordData.english}`);
        res.status(200).json(wordData);
    } catch (error) {
        console.error('[AI] Generation error:', error);
        console.error('[AI] Error stack:', error.stack);
        res.status(500).json({
            error: 'AI generation failed',
            details: error.message,
            hint: 'Check Vercel logs for detailed error information'
        });
    }
}

function generateWordPrompt(word) {
    return `You are an expert English-Chinese dictionary AI. Generate a complete, accurate JSON object for the English word "${word}".

**CRITICAL: ALL CHINESE TEXT MUST BE IN TRADITIONAL CHINESE (繁體中文), NOT SIMPLIFIED CHINESE (简体中文).**

CRITICAL REQUIREMENTS:
1. Determine the correct part of speech (POS)
2. **Create SCENARIO-BASED example sentences** (see detailed requirements below)
3. Provide accurate TRADITIONAL CHINESE translations
4. If it's a VERB, include past tense and past participle
5. Include synonyms and word family for interactive learning
6. **Use ONLY Traditional Chinese characters (繁體字) for all Chinese text**

**EXAMPLE SENTENCE REQUIREMENTS** (MOST IMPORTANT):
Your example sentence MUST be:
- **CONTEXTUAL**: Set in a realistic scenario, not isolated grammar
- **LEVEL-APPROPRIATE**: Match the word's difficulty level
  * J1-J2 → Simple daily life (family, shopping, routine activities)
  * J3-H1 → School/social situations (classroom, friends, hobbies, events)
  * H2-H3 → Professional/abstract (workplace, news, academic discussions)
- **SPECIFIC**: Include concrete details to create vivid scenarios
  * Good: "My mom bought fresh apples from the supermarket this morning"
  * Bad: "I eat an apple"
- **COMPLEXITY-MATCHED**:
  * J1: Simple present/past tense, basic vocabulary
  * J3: Compound sentences, cause-and-effect relationships
  * H3: Complex sentences with subordinate clauses, passive voice

OUTPUT FORMAT (JSON only, no explanation):
{
  "english": "${word}",
  "translation": "準確的繁體中文翻譯（可包含多個意思用；分隔）",
  "level": "J3",
  "schoolLevel": "",
  "pos": "詞性代碼 (n./v./vt./vi./adj./adv./prep./conj./pron./art./interj.)",
  "phonetic": "IPA音標，格式：/ˈfəʊnətɪk/",
  "exampleEn": "情景化例句（真實場景，根據level調整複雜度）",
  "exampleZh": "例句的準確繁體中文翻譯",
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
