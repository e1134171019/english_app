/**
 * wordsData.js - 測試版（包含使用者測試單字）
 * 涵蓋所有等級：J1, J2, J3, H1, H2, H3, ADV
 * H1 包含 22 個測試單字用於功能驗證
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
    // 高中 H1 (包含測試單字)
    // ==========================================
    {
        english: "handshake",
        pos: "n.",
        translation: "握手",
        level: "H1",
        family_id: "F014",
        example_en: "A firm handshake shows confidence.",
        example_zh: "有力的握手展現自信。"
    },
    {
        english: "bow",
        pos: "v.",
        translation: "鞠躬",
        level: "H1",
        family_id: "F015",
        example_en: "He bowed to show respect.",
        example_zh: "他鞠躬以示尊重。"
    },
    {
        english: "team",
        pos: "n.",
        translation: "團隊",
        level: "H1",
        family_id: "F016",
        example_en: "Our team won the championship.",
        example_zh: "我們的團隊贏得了冠軍。"
    },
    {
        english: "leader",
        pos: "n.",
        translation: "領導者",
        level: "H1",
        family_id: "F017",
        example_en: "A good leader inspires others.",
        example_zh: "好的領導者能激勵他人。"
    },
    {
        english: "hobby",
        pos: "n.",
        translation: "嗜好",
        level: "H1",
        family_id: "F018",
        example_en: "Reading is my favorite hobby.",
        example_zh: "閱讀是我最喜歡的嗜好。"
    },
    {
        english: "salary",
        pos: "n.",
        translation: "薪水",
        level: "H1",
        family_id: "F019",
        example_en: "She earns a good salary.",
        example_zh: "她賺取不錯的薪水。"
    },
    {
        english: "failure",
        pos: "n.",
        translation: "失敗",
        level: "H1",
        family_id: "F020",
        example_en: "Failure is the mother of success.",
        example_zh: "失敗是成功之母。"
    },
    {
        english: "attitude",
        pos: "n.",
        translation: "態度",
        level: "H1",
        family_id: "F021",
        example_en: "A positive attitude is important.",
        example_zh: "積極的態度很重要。"
    },
    {
        english: "passionate",
        pos: "adj.",
        translation: "熱情的",
        level: "H1",
        family_id: "F022",
        example_en: "She is passionate about her work.",
        example_zh: "她對工作充滿熱情。"
    },
    {
        english: "punctual",
        pos: "adj.",
        translation: "準時的",
        level: "H1",
        family_id: "F023",
        example_en: "Being punctual shows respect for others.",
        example_zh: "準時顯示對他人的尊重。"
    },
    {
        english: "nervous",
        pos: "adj.",
        translation: "緊張的",
        level: "H1",
        family_id: "F024",
        example_en: "I feel nervous before exams.",
        example_zh: "考試前我感到緊張。"
    },
    {
        english: "entry",
        pos: "n.",
        translation: "進入；入口",
        level: "H1",
        family_id: "F025",
        example_en: "The entry to the building is on the left.",
        example_zh: "建築物的入口在左邊。"
    },
    {
        english: "temporary",
        pos: "adj.",
        translation: "暫時的",
        level: "H1",
        family_id: "F026",
        example_en: "This is just a temporary solution.",
        example_zh: "這只是暫時的解決方案。"
    },
    {
        english: "opportunity",
        pos: "n.",
        translation: "機會",
        level: "H1",
        family_id: "F027",
        example_en: "This is a great opportunity to learn.",
        example_zh: "這是一個很好的學習機會。"
    },
    {
        english: "candidate",
        pos: "n.",
        translation: "候選人",
        level: "H1",
        family_id: "F028",
        example_en: "She is a strong candidate for the position.",
        example_zh: "她是這個職位的有力候選人。"
    },
    {
        english: "talent",
        pos: "n.",
        translation: "才能",
        level: "H1",
        family_id: "F029",
        example_en: "He has a talent for music.",
        example_zh: "他有音樂天賦。"
    },
    {
        english: "familiar",
        pos: "adj.",
        translation: "熟悉的",
        level: "H1",
        family_id: "F030",
        example_en: "This place looks familiar to me.",
        example_zh: "這個地方對我來說很熟悉。"
    },
    {
        english: "roadmap",
        pos: "n.",
        translation: "路線圖",
        level: "H1",
        family_id: "F031",
        example_en: "We need a roadmap for the project.",
        example_zh: "我們需要專案的路線圖。"
    },
    {
        english: "rapport",
        pos: "n.",
        translation: "融洽關係",
        level: "H1",
        family_id: "F032",
        example_en: "Building rapport with clients is essential.",
        example_zh: "與客戶建立融洽關係是必要的。"
    },
    {
        english: "priority",
        pos: "n.",
        translation: "優先事項",
        level: "H1",
        family_id: "F033",
        example_en: "Safety is our top priority.",
        example_zh: "安全是我們的首要任務。"
    },
    {
        english: "reduce",
        pos: "v.",
        translation: "減少",
        level: "H1",
        family_id: "F034",
        example_en: "We need to reduce waste.",
        example_zh: "我們需要減少浪費。"
    },
    {
        english: "analyze",
        pos: "v.",
        translation: "分析",
        level: "H1",
        family_id: "F035",
        example_en: "We need to analyze the data carefully.",
        example_zh: "我們需要仔細分析數據。"
    },
    {
        english: "approach",
        pos: "v.",
        translation: "接近",
        level: "H1",
        family_id: "F036",
        example_en: "The train is approaching the station.",
        example_zh: "火車正在接近車站。"
    },
    {
        english: "benefit",
        pos: "n.",
        translation: "好處",
        level: "H1",
        family_id: "F037",
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
