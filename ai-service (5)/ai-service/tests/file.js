class itidf{
    constructor()
    {
        this.vocabluri = {};
        this.vecid = [];
    }
    
}
function fit(documents)
{
    var doccount = [];
    for(var i = 0; i < documents.length; i++)
    {
        var count = {}
        var terms = this.toknizer(documents[i]);
        for(var j = 0; j <  terms.length; j++)
        {
            var term = terms[j];
            if(count[term] === undefined)
            {
                count[term] = 1;
            }
            else
            {
                count[term] = count[term] + 1;
            }
            if(vocabluri[term] === undefined)
            {
                var curntsize = Object.keys(this.vocabluri).length;
                this.vocabluri[term] = curntsize;
            }
        }
        doccount.push(count);
    }
}