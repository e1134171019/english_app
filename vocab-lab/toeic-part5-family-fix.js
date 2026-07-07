(() => {
  'use strict';

  if (window.__toeicPart5FamilyFixLoaded) return;
  window.__toeicPart5FamilyFixLoaded = true;

  const FAMILY_GROUPS = [
    ['attract', 'attracted', 'attraction', 'attractive'],
    ['history', 'historic', 'historical', 'historian'],
    ['threat', 'threaten', 'threatening', 'threatened'],
    ['advise', 'advised', 'advice', 'adviser'],
    ['expect', 'expected', 'expectation', 'expectations'],
    ['theory', 'theoretical', 'theoretically', 'theorize'],
    ['significant', 'significance', 'significantly', 'signify'],
    ['reason', 'reasonable', 'reasonably', 'reasoning'],
    ['practice', 'practical', 'practically', 'practiced'],
    ['advertise', 'advertisement', 'advertising', 'advertiser'],
    ['promote', 'promoted', 'promotion', 'promotional'],
    ['create', 'creative', 'creatively', 'creation'],
    ['electronic', 'electronically', 'electric', 'electricity'],
    ['prove', 'proof', 'proven', 'proving'],
    ['automatic', 'automatically', 'automation', 'automate'],
    ['own', 'owner', 'ownership', 'owned'],
    ['similar', 'similarly', 'similarity', 'resemble'],
    ['rough', 'roughly', 'roughness', 'roughen'],
    ['short', 'shortly', 'shorten', 'shortness'],
    ['organize', 'organized', 'organizing', 'organization'],
    ['perform', 'performed', 'performing', 'performance'],
    ['announce', 'announced', 'announcement', 'announcing'],
    ['decrease', 'decreased', 'decreasing', 'decreaseful'],
    ['survey', 'surveyed', 'surveying', 'surveyor'],
    ['investigate', 'investigated', 'investigating', 'investigation'],
    ['relax', 'relaxed', 'relaxing', 'relaxation']
  ];

  const previousMakeQuestion = makeQuestion;

  function lower(value) {
    return String(value || '').trim().toLowerCase();
  }

  function groupFor(value) {
    const target = lower(value);
    return FAMILY_GROUPS.find(group => group.some(form => lower(form) === target)) || null;
  }

  function broadPos(item) {
    const pos = String(item.pos || '').toLowerCase();
    const result = [];
    if (/(^|[^a-z])n\./.test(pos)) result.push('noun');
    if (/v\.|vt\.|vi\./.test(pos)) result.push('verb');
    if (/(^|[^a-z])a\.|adj\./.test(pos)) result.push('adjective');
    if (/adv\./.test(pos)) result.push('adverb');
    if (/prep\./.test(pos)) result.push('preposition');
    if (/conj\./.test(pos)) result.push('conjunction');
    return result;
  }

  function sharesPos(a, b) {
    const left = broadPos(a);
    const right = broadPos(b);
    if (!left.length || !right.length) return false;
    return left.some(type => right.includes(type));
  }

  function formatLikeAnswer(value, answer) {
    const text = String(value);
    if (/^[A-Z]/.test(String(answer))) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text.toLowerCase();
  }

  function findFamilyMatch(sentence, group) {
    const ordered = [...group].sort((a, b) => b.length - a.length);
    for (const form of ordered) {
      const pattern = new RegExp(`\\b${escapeRegExp(form)}\\b`, 'i');
      const match = String(sentence || '').match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  function buildFamilyQuestion(item, group) {
    const source = item.e || '';
    const answer = findFamilyMatch(source, group);
    if (!answer) return null;

    const sentence = source.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'), '_____');
    const normalizedGroup = group.map(form => formatLikeAnswer(form, answer));
    const formattedAnswer = formatLikeAnswer(answer, answer);
    const options = shuffle(unique([formattedAnswer, ...normalizedGroup.filter(form => lower(form) !== lower(answer))]).slice(0, 4));

    if (options.length !== 4) return null;

    return {
      type: 'choice',
      toeic: true,
      category: '詞性變化',
      label: `${item.u}｜多益 Part 5｜詞性變化`,
      q: sentence,
      ans: formattedAnswer,
      opts: options,
      item,
      completed: source,
      translation: item.t || item.z,
      explanation: `四個選項都來自同一字族；依空格在句中的位置與句意，應選 ${formattedAnswer}。`
    };
  }

  function buildSamePosVocabularyQuestion(question, item) {
    const answer = question.ans;
    const rawRelated = Array.isArray(item.rawRelated) ? item.rawRelated : [];
    const relatedWords = rawRelated
      .map(value => words.find(entry => lower(entry.w) === lower(value)))
      .filter(Boolean)
      .filter(entry => sharesPos(item, entry))
      .map(entry => entry.w);

    const samePosPool = shuffle(words
      .filter(entry => lower(entry.w) !== lower(item.w))
      .filter(entry => sharesPos(item, entry))
      .map(entry => entry.w));

    const candidates = unique([...relatedWords, ...samePosPool])
      .filter(value => lower(value) !== lower(answer))
      .map(value => formatLikeAnswer(value, answer));

    const options = shuffle(unique([answer, ...candidates]).slice(0, 4));
    if (options.length < 4) return question;

    return {
      ...question,
      category: '單字與搭配',
      label: `${item.u}｜多益 Part 5｜單字與搭配`,
      opts: options,
      explanation: `${question.explanation} 此題不是詞性題，因此干擾選項改為與答案相同詞性的單字。`
    };
  }

  function isGeneratedFallback(question) {
    return question && question.toeic && (
      String(question.explanation || '').startsWith('依句意與搭配') ||
      String(question.explanation || '').startsWith('此題檢查')
    );
  }

  makeQuestion = function familySafeMakeQuestion() {
    if (mode !== 'toeic') return previousMakeQuestion();

    const item = currentWord();
    const question = previousMakeQuestion();
    if (!item || !question) return question;

    if (!isGeneratedFallback(question)) {
      if (question.category === '詞性變化') {
        const group = groupFor(question.ans) || groupFor(item.w);
        if (group) {
          const answer = question.ans;
          const familyOptions = group.map(form => formatLikeAnswer(form, answer));
          const answerInGroup = familyOptions.find(form => lower(form) === lower(answer));
          if (answerInGroup) {
            question.ans = answerInGroup;
            question.opts = shuffle(unique([answerInGroup, ...familyOptions.filter(form => lower(form) !== lower(answerInGroup))]).slice(0, 4));
          }
        }
      }
      return question;
    }

    const familyGroup = groupFor(item.w);
    if (familyGroup) {
      const familyQuestion = buildFamilyQuestion(item, familyGroup);
      if (familyQuestion) return familyQuestion;
    }

    return buildSamePosVocabularyQuestion(question, item);
  };
})();
