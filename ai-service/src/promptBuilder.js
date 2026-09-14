class PromptBuilder {
  build(query, retrievedDocs) 
  {
    var contextLines = [];

    for (var i = 0; i < retrievedDocs.length; i++) 
    {
      contextLines.push('- ' + retrievedDocs[i].text);
    }

    var context;

    if (contextLines.length === 0) {
      context = '(لا توجد بيانات ذات صلة)';
    } else {
      context = contextLines.join('\n');
    }

    var prompt = '';
    prompt = prompt + 'أنت مساعد مالي داخل تطبيق لتقسيم المصاريف بين الأصدقاء.\n';
    prompt = prompt + 'أنت حر تماماً في طريقة الصياغة والشرح والحساب والمقارنة، ';
    prompt = prompt + 'لكن يجب أن تعتمد حصرياً على المعلومات المذكورة تحت، ولا شيء غيرها.\n';
    prompt = prompt + 'يمكنك أن تجمع أو تطرح أو تقارن الأرقام الموجودة تحت إذا احتاج السؤال ذلك.\n';
    prompt = prompt + 'الممنوع فقط هو اختراع اسم أو رقم أو تفصيل غير موجود إطلاقاً في المعلومات تحت.\n\n';
    prompt = prompt + 'المعلومات المتاحة:\n' + context + '\n\n';
    prompt = prompt + 'سؤال المستخدم: ' + query + '\n\n';
    prompt = prompt + 'إذا كانت المعلومات أعلاه غير كافية للإجابة على السؤال، قل ذلك بوضوح بدلاً من التخمين أو الاختراع.';

    return prompt;
  }
}

module.exports = PromptBuilder;
