function normalizeArabic(text) {
  var result = text;
  result = result.replace(/[\u064B-\u065F]/g, '');
  result = result.replace(/[إأآا]/g, 'ا');
  result = result.replace(/ى/g, 'ي');
  result = result.replace(/ة/g, 'ه');
  result = result.replace(/ؤ/g, 'و');
  result = result.replace(/ئ/g, 'ي');
  result = result.trim();
  return result;
}

var SYNONYM_GROUPS = [
  ['دين', 'ادين', 'يدين', 'مديون', 'واجب', 'دفع', 'ارجاع'],
  ['مصروف', 'مصاريف', 'صرفت', 'دفعت', 'انفقت', 'expense'],
  ['اجمالي', 'مجموع', 'كامل', 'كل', 'total'],
  ['اكبر', 'اعلى', 'اغلى', 'الاكثر'],
  ['اصغر', 'اقل', 'ارخص'],
  ['مجموعه', 'فريق', 'group'],
  ['رصيد', 'balance', 'استحقاق']
];

function expandWithSynonyms(text) {
  var lowerText = text.toLowerCase();
  var normalized = normalizeArabic(lowerText);
  var words = normalized.split(/\s+/);
  var extraWords = [];

  for (var i = 0; i < words.length; i++) {
    var word = words[i];

    for (var groupIndex = 0; groupIndex < SYNONYM_GROUPS.length; groupIndex++) {
      var group = SYNONYM_GROUPS[groupIndex];
      var wordFoundInGroup = false;

      for (var k = 0; k < group.length; k++) {
        if (group[k] === word) {
          wordFoundInGroup = true;
        }
      }

      if (wordFoundInGroup === true) {
        for (var j = 0; j < group.length; j++) {
          if (extraWords.indexOf(group[j]) === -1) {
            extraWords.push(group[j]);
          }
        }
      }
    }
  }

  var finalWords = [normalized];
  for (var m = 0; m < extraWords.length; m++) {
    finalWords.push(extraWords[m]);
  }

  return finalWords.join(' ');
}

module.exports = {
  normalizeArabic: normalizeArabic,
  expandWithSynonyms: expandWithSynonyms
};
