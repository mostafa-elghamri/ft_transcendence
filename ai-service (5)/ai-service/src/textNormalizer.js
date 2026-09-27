const normalizeArabic = text =>
  text
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .trim();

const SYNONYM_GROUPS = [
  ['دين', 'ادين', 'يدين', 'مديون', 'واجب', 'دفع', 'ارجاع'],
  ['مصروف', 'مصاريف', 'صرفت', 'دفعت', 'انفقت', 'expense'],
  ['اجمالي', 'مجموع', 'كامل', 'كل', 'total'],
  ['اكبر', 'اعلى', 'اغلى', 'الاكثر'],
  ['اصغر', 'اقل', 'ارخص'],
  ['مجموعه', 'فريق', 'group'],
  ['رصيد', 'balance', 'استحقاق']
];

const expandWithSynonyms = text => {
  const normalized = normalizeArabic(text.toLowerCase());
  const words = normalized.split(/\s+/);
  const extra = new Set();

  for (const word of words) {
    for (const group of SYNONYM_GROUPS) {
      if (group.includes(word)) {
        group.forEach(w => extra.add(w));
      }
    }
  }

  return [normalized, ...extra].join(' ');
};
module.exports = {
  normalizeArabic,
  expandWithSynonyms
};