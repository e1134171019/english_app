/**
 * Level Migration Script
 * 將現有的 JH/SH/ADV 格式轉換為 J1/J2/J3/H1/H2/H3/ADV
 * 
 * 轉換規則：
 * - JH → 根據單字難度分配到 J1/J2/J3
 * - SH → 根據單字難度分配到 H1/H2/H3
 * - ADV → 保持 ADV
 */

// 國中基礎單字（J1）- 最常用的日常單字
const J1_WORDS = [
    'a', 'about', 'after', 'all', 'am', 'an', 'and', 'are', 'as', 'at',
    'be', 'but', 'by', 'can', 'come', 'day', 'do', 'eat', 'for', 'from',
    'get', 'go', 'good', 'have', 'he', 'her', 'here', 'him', 'his', 'how',
    'I', 'if', 'in', 'is', 'it', 'like', 'look', 'make', 'me', 'my',
    'no', 'not', 'now', 'of', 'on', 'one', 'or', 'our', 'out', 'see',
    'she', 'so', 'some', 'that', 'the', 'their', 'them', 'then', 'there', 'they',
    'this', 'to', 'up', 'us', 'we', 'what', 'when', 'where', 'which', 'who',
    'will', 'with', 'you', 'your',
    // 基礎名詞
    'book', 'boy', 'cat', 'dog', 'girl', 'man', 'woman', 'people', 'time', 'year',
    'home', 'house', 'school', 'water', 'food', 'name', 'hand', 'head', 'eye',
    // 基礎動詞
    'say', 'take', 'give', 'know', 'think', 'want', 'use', 'find', 'tell', 'ask',
    'work', 'call', 'try', 'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep',
    // 基礎形容詞
    'new', 'old', 'big', 'small', 'long', 'short', 'hot', 'cold', 'happy', 'sad'
];

// 國中進階單字（J3）- 較難的單字
const J3_WORDS = [
    'ability', 'accept', 'accident', 'achieve', 'advantage', 'affect', 'afford',
    'ancient', 'appear', 'approach', 'argue', 'arrange', 'attend', 'attitude',
    'attract', 'avoid', 'balance', 'behavior', 'benefit', 'beyond', 'billion',
    'border', 'brief', 'budget', 'burden', 'cancel', 'capable', 'capacity',
    'capital', 'career', 'category', 'cause', 'celebrate', 'central', 'century',
    'ceremony', 'certain', 'challenge', 'character', 'charge', 'chemical', 'chief',
    'citizen', 'claim', 'climate', 'combine', 'comment', 'commercial', 'commit',
    'common', 'communicate', 'community', 'compare', 'compete', 'complete', 'complex',
    'concern', 'conclude', 'condition', 'conduct', 'conference', 'confidence', 'confirm',
    'conflict', 'connect', 'consider', 'consist', 'constant', 'construct', 'contain',
    'content', 'context', 'continue', 'contract', 'contrast', 'contribute', 'control',
    'convenient', 'conversation', 'convert', 'convince', 'cooperate', 'correct', 'cost',
    'create', 'crime', 'crisis', 'critical', 'culture', 'current', 'custom'
];

function migrateLevel(word) {
    const english = word.english.toLowerCase();
    const oldLevel = word.level;

    // ADV 保持不變
    if (oldLevel === 'ADV') {
        return 'ADV';
    }

    // JH → J1/J2/J3
    if (oldLevel === 'JH') {
        if (J1_WORDS.includes(english)) {
            return 'J1';
        } else if (J3_WORDS.includes(english)) {
            return 'J3';
        } else {
            return 'J2'; // 預設為 J2
        }
    }

    // SH → H1/H2/H3
    if (oldLevel === 'SH') {
        // 根據字母順序和複雜度分配
        const firstChar = english.charAt(0).toLowerCase();

        // A-F → H1
        if (firstChar >= 'a' && firstChar <= 'f') {
            return 'H1';
        }
        // G-P → H2
        else if (firstChar >= 'g' && firstChar <= 'p') {
            return 'H2';
        }
        // Q-Z → H3
        else {
            return 'H3';
        }
    }

    // 預設返回原值
    return oldLevel;
}

// 如果在 Node.js 環境中執行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { migrateLevel };
}
