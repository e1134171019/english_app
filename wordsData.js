/**
 * wordsData.js - 測試版（精簡30個單字）
 * 涵蓋所有等級：J1, J2, J3, H1, H2, H3, ADV
 */

const fullWordList = [
    // ==========================================
    // 國中 J1 (10個基礎單字)
    // ==========================================
    {
        english: "go",
        pos: "v.",
        translation: "去",
        level: "J1",
        family_id: "F001",
        example_en: "I go to school every day.",
        example_zh: "我每天去學校。"
    },
    {
        english: "come",
        pos: "v.",
        translation: "來",
        level: "J1",
        family_id: "F002",
        example_en: "Please come here.",
        example_zh: "請來這裡。"
    },
    {
        english: "book",
        pos: "n.",
        translation: "書",
        level: "J1",
        family_id: "F003",
        example_en: "I like reading books.",
        example_zh: "我喜歡讀書。"
    },
    {
        english: "cat",
        pos: "n.",
        translation: "貓",
        level: "J1",
        family_id: "F004",
        example_en: "The cat is cute.",
        example_zh: "這隻貓很可愛。"
    },
    {
        english: "happy",
        pos: "adj.",
        translation: "快樂的",
        level: "J1",
        family_id: "F005",
        example_en: "I am very happy today.",
        example_zh: "我今天很快樂。"
    },

    // ==========================================
    // 國中 J2 (5個)
    // ==========================================
    {
        english: "ability",
        pos: "n.",
        translation: "能力",
        level: "J2",
        family_id: "F006",
        example_en: "She has the ability to solve problems.",
        example_zh: "她有解決問題的能力。"
    },
    {
        english: "able",
        pos: "adj.",
        translation: "能夠的",
        level: "J2",
        family_id: "F006",
        example_en: "I am able to swim.",
        example_zh: "我會游泳。"
    },
    {
        english: "accept",
        pos: "v.",
        translation: "接受",
        level: "J2",
        family_id: "F007",
        example_en: "Please accept my gift.",
        example_zh: "請接受我的禮物。"
    },
    {
        english: "accident",
        pos: "n.",
        translation: "意外",
        level: "J2",
        family_id: "F008",
        example_en: "There was a car accident.",
        example_zh: "發生了車禍。"
    },
    {
        english: "achieve",
        pos: "v.",
        translation: "達成",
        level: "J2",
        family_id: "F009",
        example_en: "You can achieve your goals.",
        example_zh: "你可以達成目標。"
    },

    // ==========================================
    // 國中 J3 (5個)
    // ==========================================
    {
        english: "abandon",
        pos: "v.",
        translation: "放棄",
        level: "J3",
        family_id: "F010",
        example_en: "Don't abandon your dreams.",
        example_zh: "不要放棄你的夢想。"
    },
    {
        english: "accessible",
        pos: "adj.",
        translation: "可接近的",
        level: "J3",
        family_id: "F007",
        example_en: "The library is accessible to everyone.",
        example_zh: "圖書館對所有人開放。"
    },
    {
        english: "accomplish",
        pos: "v.",
        translation: "完成",
        level: "J3",
        family_id: "F011",
        example_en: "We accomplished the task successfully.",
        example_zh: "我們成功完成了任務。"
    },
    {
        english: "accurate",
        pos: "adj.",
        translation: "準確的",
        level: "J3",
        family_id: "F012",
        example_en: "The information is accurate.",
        example_zh: "這個資訊是準確的。"
    },
    {
        english: "active",
        pos: "adj.",
        translation: "活躍的",
        level: "J3",
        family_id: "F013",
        example_en: "She is very active in sports.",
        example_zh: "她在運動方面很活躍。"
    },

    // ==========================================
    // 高中 H1 (3個)
    // ==========================================
    {
        english: "analyze",
        pos: "v.",
        translation: "分析",
        level: "H1",
        family_id: "F014",
        example_en: "We need to analyze the data carefully.",
        example_zh: "我們需要仔細分析數據。"
    },
    {
        english: "approach",
        pos: "v.",
        translation: "接近",
        level: "H1",
        family_id: "F015",
        example_en: "The train is approaching the station.",
        example_zh: "火車正在接近車站。"
    },
    {
        english: "benefit",
        pos: "n.",
        translation: "好處",
        level: "H1",
        family_id: "F016",
        example_en: "Exercise has many health benefits.",
        example_zh: "運動有許多健康好處。"
    },

    // ==========================================
    // 高中 H2 (3個)
    // ==========================================
    {
        english: "capacity",
        pos: "n.",
        translation: "容量；能力",
        level: "H2",
        family_id: "F017",
        example_en: "The stadium has a large capacity.",
        example_zh: "體育場有很大的容量。"
    },
    {
        english: "challenge",
        pos: "n.",
        translation: "挑戰",
        level: "H2",
        family_id: "F018",
        example_en: "This is a difficult challenge.",
        example_zh: "這是一個困難的挑戰。"
    },
    {
        english: "contribute",
        pos: "v.",
        translation: "貢獻",
        level: "H2",
        family_id: "F019",
        example_en: "Everyone can contribute to the project.",
        example_zh: "每個人都可以為專案做出貢獻。"
    },

    // ==========================================
    // 高中 H3 (3個)
    // ==========================================
    {
        english: "demonstrate",
        pos: "v.",
        translation: "展示",
        level: "H3",
        family_id: "F020",
        example_en: "The teacher will demonstrate the experiment.",
        example_zh: "老師將展示這個實驗。"
    },
    {
        english: "emphasize",
        pos: "v.",
        translation: "強調",
        level: "H3",
        family_id: "F021",
        example_en: "I want to emphasize the importance of this.",
        example_zh: "我想強調這件事的重要性。"
    },
    {
        english: "evaluate",
        pos: "v.",
        translation: "評估",
        level: "H3",
        family_id: "F022",
        example_en: "We need to evaluate the results.",
        example_zh: "我們需要評估結果。"
    },

    // ==========================================
    // 進階 ADV (2個)
    // ==========================================
    {
        english: "facilitate",
        pos: "v.",
        translation: "促進",
        level: "ADV",
        family_id: "F023",
        example_en: "Technology can facilitate communication across distances.",
        example_zh: "科技可以促進遠距離溝通。"
    },
    {
        english: "implement",
        pos: "v.",
        translation: "實施",
        level: "ADV",
        family_id: "F024",
        example_en: "The government will implement new policies to address climate change.",
        example_zh: "政府將實施新政策來應對氣候變遷。"
    }
];
