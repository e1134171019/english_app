/**
 * verb3Data.js
 * 動詞三態資料
 * 包含國中和高中常用不規則動詞
 */

window.verb3List = [
    // ==========================================
    // 國中動詞三態 (J1-J3)
    // ==========================================
    // J1 - 最基礎動詞
    { base: 'be', past: 'was/were', ppart: 'been', level: 'J1', translation: '是' },
    { base: 'have', past: 'had', ppart: 'had', level: 'J1', translation: '有' },
    { base: 'do', past: 'did', ppart: 'done', level: 'J1', translation: '做' },
    { base: 'go', past: 'went', ppart: 'gone', level: 'J1', translation: '去' },
    { base: 'come', past: 'came', ppart: 'come', level: 'J1', translation: '來' },
    { base: 'get', past: 'got', ppart: 'got/gotten', level: 'J1', translation: '得到' },
    { base: 'make', past: 'made', ppart: 'made', level: 'J1', translation: '製作' },
    { base: 'see', past: 'saw', ppart: 'seen', level: 'J1', translation: '看見' },
    { base: 'know', past: 'knew', ppart: 'known', level: 'J1', translation: '知道' },
    { base: 'take', past: 'took', ppart: 'taken', level: 'J1', translation: '拿' },
    { base: 'give', past: 'gave', ppart: 'given', level: 'J1', translation: '給' },
    { base: 'find', past: 'found', ppart: 'found', level: 'J1', translation: '找到' },
    { base: 'think', past: 'thought', ppart: 'thought', level: 'J1', translation: '想' },
    { base: 'tell', past: 'told', ppart: 'told', level: 'J1', translation: '告訴' },
    { base: 'say', past: 'said', ppart: 'said', level: 'J1', translation: '說' },

    // J2 - 進階基礎動詞
    { base: 'eat', past: 'ate', ppart: 'eaten', level: 'J2', translation: '吃' },
    { base: 'drink', past: 'drank', ppart: 'drunk', level: 'J2', translation: '喝' },
    { base: 'write', past: 'wrote', ppart: 'written', level: 'J2', translation: '寫' },
    { base: 'read', past: 'read', ppart: 'read', level: 'J2', translation: '讀' },
    { base: 'speak', past: 'spoke', ppart: 'spoken', level: 'J2', translation: '說話' },
    { base: 'buy', past: 'bought', ppart: 'bought', level: 'J2', translation: '買' },
    { base: 'bring', past: 'brought', ppart: 'brought', level: 'J2', translation: '帶來' },
    { base: 'teach', past: 'taught', ppart: 'taught', level: 'J2', translation: '教' },
    { base: 'catch', past: 'caught', ppart: 'caught', level: 'J2', translation: '抓住' },
    { base: 'feel', past: 'felt', ppart: 'felt', level: 'J2', translation: '感覺' },
    { base: 'leave', past: 'left', ppart: 'left', level: 'J2', translation: '離開' },
    { base: 'meet', past: 'met', ppart: 'met', level: 'J2', translation: '遇見' },
    { base: 'sit', past: 'sat', ppart: 'sat', level: 'J2', translation: '坐' },
    { base: 'stand', past: 'stood', ppart: 'stood', level: 'J2', translation: '站' },
    { base: 'run', past: 'ran', ppart: 'run', level: 'J2', translation: '跑' },

    // J3 - 較難的國中動詞
    { base: 'begin', past: 'began', ppart: 'begun', level: 'J3', translation: '開始' },
    { base: 'break', past: 'broke', ppart: 'broken', level: 'J3', translation: '打破' },
    { base: 'choose', past: 'chose', ppart: 'chosen', level: 'J3', translation: '選擇' },
    { base: 'draw', past: 'drew', ppart: 'drawn', level: 'J3', translation: '畫' },
    { base: 'drive', past: 'drove', ppart: 'driven', level: 'J3', translation: '駕駛' },
    { base: 'fall', past: 'fell', ppart: 'fallen', level: 'J3', translation: '落下' },
    { base: 'fly', past: 'flew', ppart: 'flown', level: 'J3', translation: '飛' },
    { base: 'forget', past: 'forgot', ppart: 'forgotten', level: 'J3', translation: '忘記' },
    { base: 'grow', past: 'grew', ppart: 'grown', level: 'J3', translation: '成長' },
    { base: 'hide', past: 'hid', ppart: 'hidden', level: 'J3', translation: '隱藏' },
    { base: 'keep', past: 'kept', ppart: 'kept', level: 'J3', translation: '保持' },
    { base: 'lose', past: 'lost', ppart: 'lost', level: 'J3', translation: '失去' },
    { base: 'ride', past: 'rode', ppart: 'ridden', level: 'J3', translation: '騎' },
    { base: 'ring', past: 'rang', ppart: 'rung', level: 'J3', translation: '響' },
    { base: 'rise', past: 'rose', ppart: 'risen', level: 'J3', translation: '升起' },
    { base: 'sing', past: 'sang', ppart: 'sung', level: 'J3', translation: '唱' },
    { base: 'swim', past: 'swam', ppart: 'swum', level: 'J3', translation: '游泳' },
    { base: 'throw', past: 'threw', ppart: 'thrown', level: 'J3', translation: '丟' },
    { base: 'wear', past: 'wore', ppart: 'worn', level: 'J3', translation: '穿' },
    { base: 'win', past: 'won', ppart: 'won', level: 'J3', translation: '贏' },

    // ==========================================
    // 高中動詞三態 (H1-H3)
    // ==========================================
    // H1
    { base: 'arise', past: 'arose', ppart: 'arisen', level: 'H1', translation: '出現' },
    { base: 'bear', past: 'bore', ppart: 'borne/born', level: 'H1', translation: '承受；生' },
    { base: 'beat', past: 'beat', ppart: 'beaten', level: 'H1', translation: '打敗' },
    { base: 'become', past: 'became', ppart: 'become', level: 'H1', translation: '變成' },
    { base: 'bend', past: 'bent', ppart: 'bent', level: 'H1', translation: '彎曲' },
    { base: 'bet', past: 'bet', ppart: 'bet', level: 'H1', translation: '打賭' },
    { base: 'bind', past: 'bound', ppart: 'bound', level: 'H1', translation: '綁' },
    { base: 'bite', past: 'bit', ppart: 'bitten', level: 'H1', translation: '咬' },
    { base: 'bleed', past: 'bled', ppart: 'bled', level: 'H1', translation: '流血' },
    { base: 'blow', past: 'blew', ppart: 'blown', level: 'H1', translation: '吹' },
    { base: 'build', past: 'built', ppart: 'built', level: 'H1', translation: '建造' },
    { base: 'burn', past: 'burnt/burned', ppart: 'burnt/burned', level: 'H1', translation: '燃燒' },
    { base: 'burst', past: 'burst', ppart: 'burst', level: 'H1', translation: '爆裂' },
    { base: 'cast', past: 'cast', ppart: 'cast', level: 'H1', translation: '投擲' },
    { base: 'cost', past: 'cost', ppart: 'cost', level: 'H1', translation: '花費' },

    // H2
    { base: 'deal', past: 'dealt', ppart: 'dealt', level: 'H2', translation: '處理' },
    { base: 'dig', past: 'dug', ppart: 'dug', level: 'H2', translation: '挖' },
    { base: 'feed', past: 'fed', ppart: 'fed', level: 'H2', translation: '餵' },
    { base: 'fight', past: 'fought', ppart: 'fought', level: 'H2', translation: '戰鬥' },
    { base: 'flee', past: 'fled', ppart: 'fled', level: 'H2', translation: '逃跑' },
    { base: 'forbid', past: 'forbade', ppart: 'forbidden', level: 'H2', translation: '禁止' },
    { base: 'freeze', past: 'froze', ppart: 'frozen', level: 'H2', translation: '結冰' },
    { base: 'grind', past: 'ground', ppart: 'ground', level: 'H2', translation: '磨' },
    { base: 'hang', past: 'hung', ppart: 'hung', level: 'H2', translation: '掛' },
    { base: 'hear', past: 'heard', ppart: 'heard', level: 'H2', translation: '聽見' },
    { base: 'hold', past: 'held', ppart: 'held', level: 'H2', translation: '握住' },
    { base: 'hurt', past: 'hurt', ppart: 'hurt', level: 'H2', translation: '傷害' },
    { base: 'kneel', past: 'knelt', ppart: 'knelt', level: 'H2', translation: '跪' },
    { base: 'lay', past: 'laid', ppart: 'laid', level: 'H2', translation: '放置' },
    { base: 'lead', past: 'led', ppart: 'led', level: 'H2', translation: '領導' },

    // H3
    { base: 'lend', past: 'lent', ppart: 'lent', level: 'H3', translation: '借出' },
    { base: 'lie', past: 'lay', ppart: 'lain', level: 'H3', translation: '躺' },
    { base: 'light', past: 'lit', ppart: 'lit', level: 'H3', translation: '點燃' },
    { base: 'mean', past: 'meant', ppart: 'meant', level: 'H3', translation: '意思是' },
    { base: 'overcome', past: 'overcame', ppart: 'overcome', level: 'H3', translation: '克服' },
    { base: 'prove', past: 'proved', ppart: 'proven/proved', level: 'H3', translation: '證明' },
    { base: 'quit', past: 'quit', ppart: 'quit', level: 'H3', translation: '放棄' },
    { base: 'seek', past: 'sought', ppart: 'sought', level: 'H3', translation: '尋求' },
    { base: 'sell', past: 'sold', ppart: 'sold', level: 'H3', translation: '賣' },
    { base: 'send', past: 'sent', ppart: 'sent', level: 'H3', translation: '送' },
    { base: 'shake', past: 'shook', ppart: 'shaken', level: 'H3', translation: '搖' },
    { base: 'shine', past: 'shone', ppart: 'shone', level: 'H3', translation: '發光' },
    { base: 'shoot', past: 'shot', ppart: 'shot', level: 'H3', translation: '射擊' },
    { base: 'shut', past: 'shut', ppart: 'shut', level: 'H3', translation: '關閉' },
    { base: 'sink', past: 'sank', ppart: 'sunk', level: 'H3', translation: '下沉' },
    { base: 'slide', past: 'slid', ppart: 'slid', level: 'H3', translation: '滑' },
    { base: 'spend', past: 'spent', ppart: 'spent', level: 'H3', translation: '花費' },
    { base: 'spin', past: 'spun', ppart: 'spun', level: 'H3', translation: '旋轉' },
    { base: 'split', past: 'split', ppart: 'split', level: 'H3', translation: '分裂' },
    { base: 'spread', past: 'spread', ppart: 'spread', level: 'H3', translation: '傳播' },
    { base: 'spring', past: 'sprang', ppart: 'sprung', level: 'H3', translation: '跳' },
    { base: 'steal', past: 'stole', ppart: 'stolen', level: 'H3', translation: '偷' },
    { base: 'stick', past: 'stuck', ppart: 'stuck', level: 'H3', translation: '黏' },
    { base: 'sting', past: 'stung', ppart: 'stung', level: 'H3', translation: '刺' },
    { base: 'strike', past: 'struck', ppart: 'struck', level: 'H3', translation: '打擊' },
    { base: 'swear', past: 'swore', ppart: 'sworn', level: 'H3', translation: '發誓' },
    { base: 'sweep', past: 'swept', ppart: 'swept', level: 'H3', translation: '掃' },
    { base: 'tear', past: 'tore', ppart: 'torn', level: 'H3', translation: '撕' },
    { base: 'understand', past: 'understood', ppart: 'understood', level: 'H3', translation: '理解' },
    { base: 'wake', past: 'woke', ppart: 'woken', level: 'H3', translation: '醒來' },
    { base: 'weep', past: 'wept', ppart: 'wept', level: 'H3', translation: '哭泣' },
    { base: 'wind', past: 'wound', ppart: 'wound', level: 'H3', translation: '纏繞' },
    { base: 'withdraw', past: 'withdrew', ppart: 'withdrawn', level: 'H3', translation: '撤退' }
];

// 如果在 Node.js 環境中執行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { verb3List: window.verb3List };
}
