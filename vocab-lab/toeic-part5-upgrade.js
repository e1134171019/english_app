(() => {
  'use strict';

  if (window.__toeicPart5UpgradeLoaded) return;
  window.__toeicPart5UpgradeLoaded = true;

  const LETTERS = ['A', 'B', 'C', 'D'];

  const TOEIC_BANK = {
    union: {
      category: '單字與搭配',
      sentence: 'The employees decided to form a _____ to negotiate better working conditions.',
      options: ['union', 'theory', 'palace', 'territory'],
      answer: 'union',
      translation: '員工決定成立工會，以協商更好的工作條件。',
      explanation: 'form a union 是「成立工會」的固定搭配。'
    },
    permit: {
      category: '單字與搭配',
      sentence: 'Visitors must obtain a parking _____ before leaving their vehicles in this area.',
      options: ['permit', 'volume', 'attitude', 'audience'],
      answer: 'permit',
      translation: '訪客把車停在此區域前，必須取得停車許可證。',
      explanation: 'parking permit 是「停車許可證」的常見搭配。'
    },
    prevent: {
      category: '文法結構',
      sentence: 'Regular maintenance helps prevent the equipment _____ unexpectedly.',
      options: ['fail', 'to fail', 'from failing', 'failed'],
      answer: 'from failing',
      translation: '定期維護有助於防止設備意外故障。',
      explanation: 'prevent A from V-ing 表示「防止 A 做某事」。'
    },
    perform: {
      category: '動詞與時態',
      sentence: 'The technician _____ a safety inspection before the machine was restarted.',
      options: ['performs', 'performed', 'performing', 'performance'],
      answer: 'performed',
      translation: '技術員在機器重新啟動前進行了安全檢查。',
      explanation: 'before the machine was restarted 表示過去情境，需要過去式 performed。'
    },
    achieve: {
      category: '單字與搭配',
      sentence: 'The sales team worked overtime to _____ its quarterly target.',
      options: ['achieve', 'prevent', 'represent', 'replace'],
      answer: 'achieve',
      translation: '業務團隊加班，以達成季度目標。',
      explanation: 'achieve a target 表示「達成目標」。'
    },
    expectation: {
      category: '詞性變化',
      sentence: 'The new product exceeded customer _____ during its first month on the market.',
      options: ['expect', 'expected', 'expectations', 'expecting'],
      answer: 'expectations',
      translation: '新產品上市第一個月就超出顧客的期望。',
      explanation: 'customer 後需要名詞；exceed expectations 是常見搭配，且通常使用複數。'
    },
    react: {
      category: '介系詞與搭配',
      sentence: 'Investors reacted positively _____ the company’s improved earnings report.',
      options: ['at', 'to', 'for', 'with'],
      answer: 'to',
      translation: '投資人對公司改善的財報做出正面反應。',
      explanation: 'react to 是「對……做出反應」的固定搭配。'
    },
    fund: {
      category: '單字與搭配',
      sentence: 'The city plans to _____ the project through a combination of taxes and private donations.',
      options: ['fund', 'rank', 'quote', 'freeze'],
      answer: 'fund',
      translation: '市政府計畫透過稅收與私人捐款共同資助此計畫。',
      explanation: 'fund 作動詞表示「資助、提供資金」。'
    },
    announce: {
      category: '動詞與時態',
      sentence: 'The company _____ the appointment of its new chief executive yesterday.',
      options: ['announce', 'announced', 'announcement', 'announcing'],
      answer: 'announced',
      translation: '公司昨天宣布了新任執行長的人事任命。',
      explanation: 'yesterday 是明確過去時間，需使用過去式 announced。'
    },
    theory: {
      category: '詞性與句意',
      sentence: 'The consultant’s _____ was supported by data collected from several regional offices.',
      options: ['theory', 'theoretical', 'theoretically', 'theorize'],
      answer: 'theory',
      translation: '顧問的理論獲得數個區域辦公室所蒐集資料的支持。',
      explanation: '所有格 consultant’s 後面需要名詞 theory。'
    },
    advantage: {
      category: '介系詞與搭配',
      sentence: 'One major advantage _____ the new system is its lower operating cost.',
      options: ['at', 'of', 'for', 'by'],
      answer: 'of',
      translation: '新系統的一項主要優點是營運成本較低。',
      explanation: 'the advantage of something 表示「某事物的優點」。'
    },
    connect: {
      category: '介系詞與搭配',
      sentence: 'Please connect the printer _____ the office network before installing the software.',
      options: ['at', 'to', 'for', 'from'],
      answer: 'to',
      translation: '安裝軟體前，請先將印表機連接至辦公室網路。',
      explanation: 'connect A to B 表示「把 A 連接到 B」。'
    },
    aware: {
      category: '介系詞與搭配',
      sentence: 'All employees should be aware _____ the revised security procedures.',
      options: ['of', 'to', 'with', 'by'],
      answer: 'of',
      translation: '所有員工都應了解修訂後的安全程序。',
      explanation: 'be aware of 表示「知道、察覺」。'
    },
    replace: {
      category: '文法結構',
      sentence: 'The damaged component will be _____ during the scheduled maintenance period.',
      options: ['replace', 'replaced', 'replacing', 'replacement'],
      answer: 'replaced',
      translation: '損壞的零件將在預定維護期間被更換。',
      explanation: 'will be 後接過去分詞，形成被動語態 will be replaced。'
    },
    conclusion: {
      category: '固定搭配',
      sentence: 'After reviewing the test results, the engineers came _____ the conclusion that the design was safe.',
      options: ['at', 'to', 'for', 'with'],
      answer: 'to',
      translation: '工程師檢視測試結果後，得出該設計安全的結論。',
      explanation: 'come to the conclusion 是「得出結論」的固定搭配。'
    },
    previous: {
      category: '單字與句意',
      sentence: 'Applicants with _____ experience in customer service will receive priority consideration.',
      options: ['previous', 'fashionable', 'missing', 'historic'],
      answer: 'previous',
      translation: '具備先前客服經驗的申請者將獲優先考慮。',
      explanation: 'previous experience 表示「先前的經驗」。'
    },
    significant: {
      category: '詞性變化',
      sentence: 'The new procedure has _____ reduced the amount of production waste.',
      options: ['significant', 'significance', 'significantly', 'signify'],
      answer: 'significantly',
      translation: '新程序已顯著減少生產廢料量。',
      explanation: '空格修飾動詞 reduced，需要副詞 significantly。'
    },
    engage: {
      category: '介系詞與搭配',
      sentence: 'The workshop encourages employees to engage _____ group discussions.',
      options: ['in', 'on', 'at', 'for'],
      answer: 'in',
      translation: '研習活動鼓勵員工參與小組討論。',
      explanation: 'engage in 表示「從事、參與」。'
    },
    reasonable: {
      category: '詞性與句意',
      sentence: 'The supplier offered a _____ explanation for the delivery delay.',
      options: ['reason', 'reasonable', 'reasonably', 'reasoning'],
      answer: 'reasonable',
      translation: '供應商對交貨延誤提出合理的解釋。',
      explanation: '空格修飾名詞 explanation，需要形容詞 reasonable。'
    },
    benefit: {
      category: '介系詞與搭配',
      sentence: 'Small businesses may benefit _____ the government’s new tax program.',
      options: ['from', 'to', 'at', 'with'],
      answer: 'from',
      translation: '小型企業可能受益於政府的新稅務方案。',
      explanation: 'benefit from 表示「從……獲益」。'
    },
    exchange: {
      category: '介系詞與搭配',
      sentence: 'Customers may exchange the item _____ another model within fourteen days.',
      options: ['for', 'to', 'by', 'from'],
      answer: 'for',
      translation: '顧客可在十四天內將商品更換為另一款型。',
      explanation: 'exchange A for B 表示「用 A 換 B」。'
    },
    practical: {
      category: '詞性與句意',
      sentence: 'The training course provides _____ advice for handling customer complaints.',
      options: ['practice', 'practical', 'practically', 'practiced'],
      answer: 'practical',
      translation: '該訓練課程提供處理客訴的實用建議。',
      explanation: '空格修飾名詞 advice，需要形容詞 practical。'
    },
    trend: {
      category: '單字與句意',
      sentence: 'The report identifies a growing _____ toward online shopping among older consumers.',
      options: ['trend', 'threat', 'vision', 'proof'],
      answer: 'trend',
      translation: '報告指出，年長消費者的網路購物有成長趨勢。',
      explanation: 'a growing trend toward 是「朝向……的成長趨勢」。'
    },
    attract: {
      category: '詞性變化',
      sentence: 'The company redesigned its website to make it more _____ to international customers.',
      options: ['attract', 'attraction', 'attractive', 'attractively'],
      answer: 'attractive',
      translation: '公司重新設計網站，使其對國際顧客更具吸引力。',
      explanation: 'make + 受詞 + 形容詞，故使用 attractive。'
    },
    remind: {
      category: '文法結構',
      sentence: 'Please remind all participants _____ their identification cards to the conference.',
      options: ['bring', 'to bring', 'bringing', 'brought'],
      answer: 'to bring',
      translation: '請提醒所有與會者攜帶身分證件參加會議。',
      explanation: 'remind someone to V 表示「提醒某人做某事」。'
    },
    advise: {
      category: '文法結構',
      sentence: 'The consultant advised the company _____ its outdated accounting system.',
      options: ['replace', 'to replace', 'replacing', 'replaced'],
      answer: 'to replace',
      translation: '顧問建議公司更換過時的會計系統。',
      explanation: 'advise someone to V 表示「建議某人做某事」。'
    },
    observe: {
      category: '單字與句意',
      sentence: 'The supervisor will _____ the production line to ensure that safety rules are followed.',
      options: ['observe', 'announce', 'promote', 'decorate'],
      answer: 'observe',
      translation: '主管將觀察生產線，以確保安全規定獲得遵守。',
      explanation: 'observe 表示「觀察、監看」，符合品質與安全檢查情境。'
    },
    advertise: {
      category: '詞性變化',
      sentence: 'The company plans to _____ the position on several employment websites.',
      options: ['advertisement', 'advertise', 'advertising', 'advertiser'],
      answer: 'advertise',
      translation: '公司計畫在數個求職網站刊登此職缺。',
      explanation: 'plan to 後接原形動詞，因此使用 advertise。'
    },
    confuse: {
      category: '文法結構',
      sentence: 'Customers sometimes confuse the basic model _____ the premium version.',
      options: ['to', 'with', 'for', 'by'],
      answer: 'with',
      translation: '顧客有時會把基本款和高階款混淆。',
      explanation: 'confuse A with B 表示「把 A 和 B 混淆」。'
    },
    comfort: {
      category: '單字與句意',
      sentence: 'The new office chairs were selected for their durability and _____.',
      options: ['comfort', 'comparison', 'scale', 'shadow'],
      answer: 'comfort',
      translation: '新辦公椅是基於耐用性與舒適度而挑選的。',
      explanation: 'and 連接兩個名詞 durability 與 comfort。'
    },
    promote: {
      category: '文法與被動',
      sentence: 'Ms. Chen was _____ to regional manager after exceeding her sales target.',
      options: ['promote', 'promoted', 'promotion', 'promotional'],
      answer: 'promoted',
      translation: '陳小姐超越業績目標後，被升任為區域經理。',
      explanation: 'was 後接過去分詞 promoted，形成被動語態。'
    },
    decrease: {
      category: '動詞與時態',
      sentence: 'Customer complaints have _____ significantly since the new policy was introduced.',
      options: ['decrease', 'decreased', 'decreasing', 'decreaseful'],
      answer: 'decreased',
      translation: '新政策實施後，顧客抱怨已顯著減少。',
      explanation: 'have 後接過去分詞，構成現在完成式 have decreased。'
    },
    request: {
      category: '假設語氣',
      sentence: 'The manager requested that the report _____ by Friday afternoon.',
      options: ['complete', 'completed', 'be completed', 'completing'],
      answer: 'be completed',
      translation: '經理要求報告在星期五下午前完成。',
      explanation: 'request that + 主詞 + 原形動詞；此處報告是被完成，因此使用 be completed。'
    },
    opposite: {
      category: '介系詞與位置',
      sentence: 'The new branch is located directly _____ the central train station.',
      options: ['opposite', 'beneath', 'onto', 'among'],
      answer: 'opposite',
      translation: '新分行就位於中央火車站正對面。',
      explanation: 'opposite 表示「在……對面」。'
    },
    superior: {
      category: '介系詞與搭配',
      sentence: 'This model is superior _____ the previous version in terms of energy efficiency.',
      options: ['at', 'for', 'to', 'with'],
      answer: 'to',
      translation: '就能源效率而言，這個型號優於前一版本。',
      explanation: 'be superior to 是「優於……」的固定搭配。'
    },
    emergency: {
      category: '固定搭配',
      sentence: 'Employees should use the nearest exit in case _____ emergency.',
      options: ['at', 'by', 'of', 'with'],
      answer: 'of',
      translation: '發生緊急狀況時，員工應使用最近的出口。',
      explanation: 'in case of emergency 是「如遇緊急狀況」的固定用法。'
    },
    creative: {
      category: '詞性變化',
      sentence: 'The marketing department needs a more _____ approach to reach younger customers.',
      options: ['create', 'creative', 'creatively', 'creation'],
      answer: 'creative',
      translation: '行銷部門需要更具創意的方法來接觸年輕顧客。',
      explanation: '空格修飾名詞 approach，需要形容詞 creative。'
    },
    media: {
      category: '主詞動詞一致',
      sentence: 'The local media _____ expected to attend tomorrow’s press conference.',
      options: ['is', 'are', 'be', 'being'],
      answer: 'are',
      translation: '地方媒體預計將出席明天的記者會。',
      explanation: 'media 在此視為複數名詞，因此搭配 are。'
    },
    risk: {
      category: '動名詞',
      sentence: 'The company does not want to risk _____ an important client over a billing error.',
      options: ['lose', 'to lose', 'losing', 'lost'],
      answer: 'losing',
      translation: '公司不想因帳務錯誤而冒著失去重要客戶的風險。',
      explanation: 'risk 後接 V-ing，因此使用 losing。'
    },
    persuade: {
      category: '不定詞',
      sentence: 'The representative tried to persuade the customer _____ the extended warranty.',
      options: ['purchase', 'to purchase', 'purchasing', 'purchased'],
      answer: 'to purchase',
      translation: '業務代表試圖說服顧客購買延長保固。',
      explanation: 'persuade someone to V 表示「說服某人做某事」。'
    },
    release: {
      category: '動詞原形',
      sentence: 'The company will _____ its quarterly sales report tomorrow morning.',
      options: ['release', 'released', 'releasing', 'releaseable'],
      answer: 'release',
      translation: '公司將於明天上午發布季度銷售報告。',
      explanation: '助動詞 will 後接原形動詞 release。'
    },
    electronic: {
      category: '詞性變化',
      sentence: 'All invoices are stored _____ so that employees can access them quickly.',
      options: ['electronic', 'electronically', 'electric', 'electricity'],
      answer: 'electronically',
      translation: '所有發票均以電子方式儲存，方便員工快速存取。',
      explanation: '空格修飾動詞 stored，需要副詞 electronically。'
    },
    electricity: {
      category: '詞性變化',
      sentence: 'The commuter train runs entirely on _____.',
      options: ['electric', 'electrical', 'electrician', 'electricity'],
      answer: 'electricity',
      translation: '這班通勤列車完全以電力運行。',
      explanation: '介系詞 on 後需要名詞 electricity。'
    },
    rank: {
      category: '動詞與時態',
      sentence: 'The company _____ first in customer satisfaction last year.',
      options: ['rank', 'ranked', 'ranking', 'ranks'],
      answer: 'ranked',
      translation: '該公司去年在顧客滿意度方面排名第一。',
      explanation: 'last year 表示過去時間，因此使用 ranked。'
    },
    roughly: {
      category: '詞性變化',
      sentence: 'The renovation project will take _____ three months to complete.',
      options: ['rough', 'roughly', 'roughness', 'roughen'],
      answer: 'roughly',
      translation: '翻修工程大約需要三個月完成。',
      explanation: '修飾數量 three months，需要副詞 roughly，表示「大約」。'
    },
    proof: {
      category: '詞性變化',
      sentence: 'Applicants must provide _____ of identity when submitting the form.',
      options: ['prove', 'proof', 'proven', 'proving'],
      answer: 'proof',
      translation: '申請人提交表格時必須提供身分證明。',
      explanation: 'provide 後需要名詞 proof；proof of identity 是固定搭配。'
    },
    owing: {
      category: '介系詞與搭配',
      sentence: 'Owing _____ severe weather, several flights were canceled this morning.',
      options: ['at', 'for', 'to', 'with'],
      answer: 'to',
      translation: '由於天候惡劣，今天上午有數個航班被取消。',
      explanation: 'owing to 表示「由於」。'
    },
    concert: {
      category: '固定搭配',
      sentence: 'The two departments will work in _____ to complete the project on schedule.',
      options: ['concert', 'territory', 'proof', 'rank'],
      answer: 'concert',
      translation: '兩個部門將協力合作，以如期完成專案。',
      explanation: 'work in concert 表示「協調合作、同心協力」。'
    },
    survey: {
      category: '動詞與時態',
      sentence: 'The research team _____ two thousand customers last month.',
      options: ['survey', 'surveyed', 'surveying', 'surveyor'],
      answer: 'surveyed',
      translation: '研究團隊上個月調查了兩千名顧客。',
      explanation: 'last month 表示過去時間，需要過去式 surveyed。'
    },
    investigate: {
      category: '現在進行式',
      sentence: 'The compliance department is currently _____ the complaint.',
      options: ['investigate', 'investigated', 'investigating', 'investigation'],
      answer: 'investigating',
      translation: '法規遵循部門目前正在調查這項申訴。',
      explanation: 'is currently 後接 V-ing，構成現在進行式。'
    },
    automatic: {
      category: '詞性變化',
      sentence: 'The new payment system operates _____ without assistance from an employee.',
      options: ['automatic', 'automatically', 'automation', 'automate'],
      answer: 'automatically',
      translation: '新的付款系統無須員工協助即可自動運作。',
      explanation: '空格修飾動詞 operates，需要副詞 automatically。'
    },
    ownership: {
      category: '詞性變化',
      sentence: 'The documents confirm the legal _____ of the property.',
      options: ['own', 'owner', 'ownership', 'owned'],
      answer: 'ownership',
      translation: '這些文件確認該不動產的合法所有權。',
      explanation: '形容詞 legal 後需要名詞 ownership。'
    },
    similarity: {
      category: '詞性變化',
      sentence: 'There is little _____ between the two proposals.',
      options: ['similar', 'similarly', 'similarity', 'resemble'],
      answer: 'similarity',
      translation: '這兩份提案幾乎沒有相似之處。',
      explanation: 'little 後面需要不可數名詞 similarity。'
    },
    relax: {
      category: '不定詞',
      sentence: 'Employees are encouraged _____ during their scheduled breaks.',
      options: ['relax', 'to relax', 'relaxing', 'relaxed'],
      answer: 'to relax',
      translation: '公司鼓勵員工在排定的休息時間放鬆。',
      explanation: 'be encouraged to V 表示「被鼓勵做某事」。'
    },
    meanwhile: {
      category: '連接副詞',
      sentence: 'The technicians will repair the network; _____, employees may use the backup system.',
      options: ['meanwhile', 'because', 'although', 'despite'],
      answer: 'meanwhile',
      translation: '技術人員將修復網路；在此同時，員工可以使用備援系統。',
      explanation: '兩個同時發生的動作，以連接副詞 meanwhile 銜接最恰當。'
    },
    compete: {
      category: '介系詞與搭配',
      sentence: 'More than fifty teams will compete _____ the championship.',
      options: ['at', 'by', 'for', 'with'],
      answer: 'for',
      translation: '超過五十支隊伍將角逐冠軍。',
      explanation: 'compete for 表示「競爭、角逐某項獎項」。'
    },
    shortly: {
      category: '詞性變化',
      sentence: 'The new branch will open _____ after the renovation is completed.',
      options: ['short', 'shortly', 'shorten', 'shortness'],
      answer: 'shortly',
      translation: '翻修完成後不久，新分行將開幕。',
      explanation: '修飾時間關係，需要副詞 shortly，表示「不久」。'
    },
    organize: {
      category: '被動語態',
      sentence: 'The training session was carefully _____ by the human resources department.',
      options: ['organize', 'organized', 'organizing', 'organization'],
      answer: 'organized',
      translation: '該訓練課程由人力資源部門仔細籌辦。',
      explanation: 'was 後接過去分詞 organized，形成被動語態。'
    },
    assume: {
      category: '固定搭配',
      sentence: 'Ms. Lin will _____ responsibility for the project while the manager is away.',
      options: ['assume', 'release', 'request', 'observe'],
      answer: 'assume',
      translation: '經理不在期間，林小姐將負責該專案。',
      explanation: 'assume responsibility 表示「承擔責任」。'
    }
  };

  function cleanFamilyCandidates(item) {
    return (item.family || [])
      .map(value => String(value).trim())
      .filter(value => /^[A-Za-z-]+$/.test(value));
  }

  function buildFallback(item) {
    const sourceSentence = item.e || '';
    const pattern = new RegExp(`\\b${escapeRegExp(item.w)}(?:s|es|ed|ing)?\\b`, 'i');
    const match = sourceSentence.match(pattern);
    const answer = match ? match[0] : item.w;
    const sentence = match
      ? sourceSentence.replace(pattern, '_____')
      : `The correct word to complete this business-English item is _____. (${item.z})`;

    const candidates = unique([
      ...cleanFamilyCandidates(item),
      ...shuffle(words.map(entry => entry.w)).slice(0, 16)
    ]).filter(value => value.toLowerCase() !== answer.toLowerCase());

    const options = shuffle([answer, ...candidates.slice(0, 3)]);
    while (options.length < 4) options.push(`option-${options.length + 1}`);

    return {
      type: 'choice',
      toeic: true,
      category: match ? '單字與搭配' : '單字應用',
      label: `${item.u}｜多益 Part 5｜${match ? '單字與搭配' : '單字應用'}`,
      q: sentence,
      ans: answer,
      opts: options,
      item,
      completed: match ? sourceSentence : sentence.replace('_____', answer),
      translation: item.t || item.z,
      explanation: match
        ? `依句意與搭配，空格應填 ${answer}。`
        : `此題檢查 ${item.w}（${item.z}）在句中的使用。`
    };
  }

  function buildToeicQuestion(item) {
    const bankItem = TOEIC_BANK[String(item.w).toLowerCase()];
    if (!bankItem) return buildFallback(item);
    const opts = shuffle(bankItem.options);
    return {
      type: 'choice',
      toeic: true,
      category: bankItem.category,
      label: `${item.u}｜多益 Part 5｜${bankItem.category}`,
      q: bankItem.sentence,
      ans: bankItem.answer,
      opts,
      item,
      completed: bankItem.sentence.replace('_____', bankItem.answer),
      translation: bankItem.translation,
      explanation: bankItem.explanation
    };
  }

  const originalSetTop = setTop;
  const originalMakeQuestion = makeQuestion;
  const originalRender = render;
  const originalCheckChoice = checkChoice;

  setTop = function upgradedSetTop() {
    originalSetTop();
    if (mode === 'toeic') {
      $('#modeName').textContent = '多益 Part 5';
    }
  };

  makeQuestion = function upgradedMakeQuestion() {
    if (mode !== 'toeic') return originalMakeQuestion();
    const item = currentWord();
    return item ? buildToeicQuestion(item) : null;
  };

  function decorateToeicOptions() {
    if (mode !== 'toeic' || !currentQuestion) return;
    document.querySelectorAll('.opt').forEach((button, index) => {
      const value = button.dataset.value;
      button.innerHTML = `<span class="toeicLetter">(${LETTERS[index]})</span><span>${escapeHtml(value)}</span>`;
    });
    const feedback = $('#fb');
    if (feedback) {
      feedback.textContent = '請選出最適合填入空格的答案。作答後會顯示完整句子、中文與考點解析。';
    }
  }

  render = function upgradedRender() {
    originalRender();
    if (mode === 'toeic') decorateToeicOptions();
  };

  function toeicFeedback(prefix, question) {
    const answerIndex = question.opts.indexOf(question.ans);
    const answerLetter = LETTERS[answerIndex] || '?';
    return `${prefix}\n正確答案：(${answerLetter}) ${question.ans}\n\n完整句子：\n${question.completed}\n\n中文：\n${question.translation}\n\n考點：${question.category}\n解析：${question.explanation}`;
  }

  checkChoice = function upgradedCheckChoice(button, value) {
    if (mode !== 'toeic' || !currentQuestion || !currentQuestion.toeic) {
      return originalCheckChoice(button, value);
    }

    const question = currentQuestion;
    document.querySelectorAll('.opt').forEach(option => {
      option.disabled = true;
      if (option.dataset.value === question.ans) option.classList.add('correct');
    });

    if (value === question.ans) {
      button.classList.add('correct');
      score++;
      $('#fb').textContent = toeicFeedback('正確', question);
    } else {
      button.classList.add('wrong');
      const wrongItem = {
        ...question.item,
        e: question.q,
        t: `答案：${question.ans}｜${question.completed}｜${question.translation}｜${question.explanation}`
      };
      markWrong(wrongItem, `${question.label}｜${question.category}`);
      $('#fb').textContent = toeicFeedback('錯誤', question);
    }

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'btn primary toeicNext';
    nextButton.textContent = '下一題';
    nextButton.onclick = nextQuestion;
    $('#fb').appendChild(document.createElement('br'));
    $('#fb').appendChild(nextButton);
    setTop();
  };

  function installToeicButton() {
    const modes = document.querySelector('.modes');
    if (!modes || modes.querySelector('[data-mode="toeic"]')) return;
    const wrongButton = modes.querySelector('[data-mode="wrong"]');
    const button = document.createElement('button');
    button.className = 'mode';
    button.dataset.mode = 'toeic';
    button.textContent = '多益 Part 5';
    button.onclick = () => {
      if (loading) return;
      mode = 'toeic';
      currentQuestion = null;
      resetDeck();
      render();
    };
    modes.insertBefore(button, wrongButton || null);
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .modes{grid-template-columns:repeat(7,1fr)}
      .toeicLetter{display:inline-block;min-width:42px;color:#1d4ed8;font-weight:950}
      .opt.correct .toeicLetter{color:#166534}
      .opt.wrong .toeicLetter{color:#be123c}
      .toeicNext{display:block;width:100%;margin-top:14px}
      @media(max-width:860px){.modes{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  installStyles();
  installToeicButton();
  setTop();
})();
