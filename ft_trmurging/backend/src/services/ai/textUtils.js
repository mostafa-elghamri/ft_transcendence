function normalize(text) {
  let result = text;
  result = result.replace(/[\u064B-\u065F]/g, '');
  result = result.replace(/[إأآا]/g, 'ا');
  result = result.replace(/ى/g, 'ي');
  result = result.replace(/ة/g, 'ه');
  result = result.replace(/ؤ/g, 'و');
  result = result.replace(/ئ/g, 'ي');
  return result;
}

function tokenize(text) {
  const lower = text.toLowerCase();
  const norm = normalize(lower);
  const clean = norm.replace(/[^\w\s\u0600-\u06FF]/g, ' ');
  const parts = clean.split(/\s+/);

  const stop = {
    'في': 1, 'من': 1, 'على': 1, 'الى': 1, 'إلى': 1, 'عن': 1, 'مع': 1,
    'هذا': 1, 'هذه': 1, 'ذلك': 1, 'التي': 1, 'الذي': 1, 'الذين': 1,
    'كان': 1, 'كانت': 1, 'يكون': 1, 'هو': 1, 'هي': 1, 'انا': 1, 'أنا': 1,
    'انت': 1, 'أنت': 1, 'نحن': 1, 'هم': 1, 'ما': 1, 'لا': 1, 'لم': 1,
    'the': 1, 'a': 1, 'an': 1, 'is': 1, 'are': 1, 'of': 1, 'to': 1,
    'in': 1, 'on': 1, 'at': 1, 'and': 1, 'or': 1
  };

  const tokens = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length > 1 && stop[parts[i]] === undefined) {
      tokens.push(parts[i]);
    }
  }

  return tokens;
}

module.exports = { normalize, tokenize };