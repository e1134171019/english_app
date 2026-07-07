(() => {
  'use strict';
  if (window.__toeicPart5FamilyFixLoaded) return;
  window.__toeicPart5FamilyFixLoaded = true;

  const FAMILIES = [
    ['attract','attraction','attractive','attractively'],
    ['history','historic','historical','historian'],
    ['threat','threaten','threatening','threatened'],
    ['advise','advice','adviser','advisory'],
    ['expect','expected','expectations','expecting'],
    ['theory','theoretical','theoretically','theorize'],
    ['significant','significance','significantly','signify'],
    ['reason','reasonable','reasonably','reasoning'],
    ['practice','practical','practically','practiced'],
    ['advertise','advertisement','advertising','advertiser'],
    ['promote','promoted','promotion','promotional'],
    ['create','creative','creatively','creation'],
    ['electronic','electronically','electric','electricity'],
    ['prove','proof','proven','proving'],
    ['automatic','automatically','automation','automate'],
    ['own','owner','ownership','owned'],
    ['similar','similarly','similarity','resemble'],
    ['rough','roughly','roughness','roughen'],
    ['short','shortly','shorten','shortness'],
    ['organize','organized','organizing','organization'],
    ['perform','performed','performing','performance'],
    ['announce','announced','announcement','announcing'],
    ['survey','surveyed','surveying','surveyor'],
    ['investigate','investigated','investigating','investigation'],
    ['relax','relaxed','relaxing','relaxation'],
    ['compete','competition','competitive','competitor'],
    ['persuade','persuasion','persuasive','persuasively'],
    ['assume','assumption','assumed','assuming'],
    ['protect','protection','protective','protectively'],
    ['confuse','confusion','confused','confusing'],
    ['comfort','comfortable','comfortably','comforting']
  ];

  const RELATED = [
    ['avenue','boulevard','street','lane','alley','road'],
    ['request','demand','proposal','inquiry','application'],
    ['proof','evidence','confirmation','documentation','record'],
    ['comfort','convenience','durability','quality','support'],
    ['territory','region','district','area','zone'],
    ['palace','castle','mansion','residence','estate'],
    ['scholar','researcher','professor','academic','expert'],
    ['county','province','district','city','municipality'],
    ['trend','pattern','tendency','development','movement'],
    ['threat','risk','danger','hazard','warning'],
    ['permit','license','certificate','approval','authorization'],
    ['union','association','committee','organization','council'],
    ['theory','concept','principle','idea','hypothesis'],
    ['advantage','benefit','strength','merit','feature'],
    ['emergency','crisis','incident','accident','disaster'],
    ['poll','survey','questionnaire','study','research'],
    ['ownership','possession','control','title','rights'],
    ['similarity','resemblance','comparison','connection','relationship'],
    ['wisdom','knowledge','experience','judgment','insight'],
    ['talent','skill','ability','gift','expertise'],
    ['rank','grade','level','position','status'],
    ['entry','entrance','access','admission','gateway'],
    ['electronic','digital','electrical','automatic','wireless'],
    ['rough','coarse','uneven','harsh','crude'],
    ['shiny','glossy','bright','polished','reflective'],
    ['creative','innovative','original','imaginative','inventive'],
    ['awkward','clumsy','uncomfortable','embarrassing','inconvenient'],
    ['extreme','severe','intense','excessive','drastic'],
    ['mental','psychological','emotional','physical','cognitive'],
    ['relax','rest','unwind','pause','recover'],
    ['organize','arrange','coordinate','schedule','prepare'],
    ['assume','accept','undertake','bear','shoulder'],
    ['release','publish','issue','announce','distribute'],
    ['observe','inspect','monitor','examine','review'],
    ['investigate','examine','inspect','analyze','probe'],
    ['promote','advance','support','advertise','encourage'],
    ['persuade','convince','encourage','urge','influence'],
    ['compete','contend','challenge','race','participate'],
    ['freeze','cool','chill','refrigerate','solidify'],
    ['decrease','decline','drop','fall','diminish']
  ];

  const POOLS = {
    noun:['proposal','report','policy','project','schedule','agreement','request','record','result','position','service','system'],
    verb:['approve','arrange','confirm','deliver','maintain','replace','review','support','provide','prepare','reduce','complete'],
    adjective:['available','effective','practical','reasonable','significant','appropriate','efficient','reliable','competitive','additional','temporary','professional'],
    adverb:['carefully','recently','gradually','significantly','properly','quickly','fully','directly','usually','currently','successfully','approximately']
  };

  const originalMakeQuestion = makeQuestion;
  const low = value => String(value || '').trim().toLowerCase();
  const oneWord = value => /^[A-Za-z][A-Za-z-]*$/.test(String(value || '').trim());
  const findGroup = (groups, value) => groups.find(group => group.some(entry => low(entry) === low(value))) || null;
  const unique = values => {
    const seen = new Set();
    return values.filter(value => {
      const key = low(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const sameCase = (value, answer) => /^[A-Z]/.test(answer)
    ? String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()
    : String(value).toLowerCase();

  function slotPos(answer, sentence) {
    const word = low(answer);
    const text = low(sentence);
    const index = text.indexOf('_____');
    const before = index < 0 ? '' : text.slice(0,index).trim();
    const after = index < 0 ? '' : text.slice(index + 5).trim();
    if (/ly$/.test(word)) return 'adverb';
    if (/\b(to|will|would|can|could|may|might|must|should|do|does|did)\s*$/.test(before)) return 'verb';
    if (/\b(is|are|was|were|be|been|being|seem|become|feel|look|remain)\s*$/.test(before)) return 'adjective';
    if (/\b(a|an|the|this|that|these|those|my|your|his|her|its|our|their|each|every|another)\s*$/.test(before)) {
      return /^[a-z]+\b/.test(after) ? 'adjective' : 'noun';
    }
    if (/(tion|sion|ment|ness|ity|ship|ance|ence|er|or|ist|ism|age|ure|dom)$/.test(word)) return 'noun';
    if (/(ous|ful|less|ive|able|ible|al|ic|ary|ory|ent|ant)$/.test(word)) return 'adjective';
    if (/(ate|ify|ise|ize|en)$/.test(word)) return 'verb';
    return 'noun';
  }

  function formLike(value, answer, pos) {
    let result = low(value);
    const target = low(answer);
    if (pos === 'verb' && /ing$/.test(target) && !/ing$/.test(result)) {
      result = /e$/.test(result) ? `${result.slice(0,-1)}ing` : `${result}ing`;
    } else if (pos === 'verb' && /ed$/.test(target) && !/ed$/.test(result)) {
      result = /e$/.test(result) ? `${result}d` : `${result}ed`;
    } else if (pos === 'verb' && /s$/.test(target) && !/s$/.test(result)) {
      result = /[^aeiou]y$/.test(result) ? `${result.slice(0,-1)}ies` : `${result}s`;
    }
    return sameCase(result, answer);
  }

  function fourOptions(answer, candidates) {
    const options = unique([answer, ...candidates]);
    return options.length >= 4 ? shuffle(options.slice(0,4)) : null;
  }

  function familyQuestion(item, question, group) {
    const source = item.e || question.completed || '';
    const form = [...group].sort((a,b) => b.length-a.length).find(value => new RegExp(`\\b${escapeRegExp(value)}\\b`,'i').test(source));
    if (!form) return null;
    const matched = source.match(new RegExp(`\\b${escapeRegExp(form)}\\b`,'i'))[0];
    const answer = sameCase(matched, matched);
    const options = fourOptions(answer, group.map(value => sameCase(value,answer)));
    if (!options) return null;
    return {...question,type:'choice',toeic:true,category:'詞性變化',label:`${item.u}｜多益 Part 5｜詞性變化`,q:source.replace(new RegExp(`\\b${escapeRegExp(matched)}\\b`,'i'),'_____'),ans:answer,opts:options,item,completed:source,translation:item.t||item.z,explanation:`四個選項屬於同一字族；依空格位置與句意，應選 ${answer}。`};
  }

  function lexicalQuestion(item, question) {
    const answer = String(question.ans || item.w).trim();
    const pos = slotPos(answer,question.q);
    const related = findGroup(RELATED,answer) || findGroup(RELATED,item.w) || [];
    const itemRelated = (item.family || []).filter(oneWord);
    const candidates = unique([...related,...itemRelated,...POOLS[pos]])
      .filter(value => low(value) !== low(answer))
      .map(value => formLike(value,answer,pos));
    const options = fourOptions(answer,candidates);
    return options ? {...question,category:'單字與搭配',label:`${item.u}｜多益 Part 5｜單字與搭配`,opts:options,explanation:`選項採用相近詞、相關詞或相同詞性的干擾項；依完整句意與固定搭配，應選 ${answer}。`} : question;
  }

  function isFallback(question) {
    const text = String(question?.explanation || '');
    return question?.toeic && (text.startsWith('依句意與搭配') || text.startsWith('此題檢查') || /^The correct word to complete/.test(question.q || ''));
  }

  makeQuestion = function smartToeicQuestion() {
    if (mode !== 'toeic') return originalMakeQuestion();
    const item = currentWord();
    let question = originalMakeQuestion();
    if (!item || !question) return question;

    if (low(item.w) === 'avenue') {
      const sentence = 'The company opened its New York branch on Fifth _____.', answer = 'Avenue';
      return {...question,type:'choice',toeic:true,category:'單字與搭配',label:`${item.u}｜多益 Part 5｜單字與搭配`,q:sentence,ans:answer,opts:shuffle(['Avenue','Boulevard','Street','Lane']),item,completed:sentence.replace('_____',answer),translation:'公司在紐約第五大道設立分公司。',explanation:'Fifth Avenue 是紐約的固定地名。四個選項都是道路類名詞，但只有 Avenue 符合此專有名稱。'};
    }

    if (low(item.w) === 'decrease') question.opts = shuffle(['decrease','decreased','decreasing','decreases']);

    if (/詞性/.test(question.category || '')) {
      const group = findGroup(FAMILIES,question.ans) || findGroup(FAMILIES,item.w);
      const options = group && fourOptions(question.ans,group.map(value => sameCase(value,question.ans)));
      if (options) question.opts = options;
      return question;
    }

    if (isFallback(question)) {
      const group = findGroup(FAMILIES,item.w) || findGroup(FAMILIES,question.ans);
      return (group && familyQuestion(item,question,group)) || lexicalQuestion(item,question);
    }
    return question;
  };
})();
