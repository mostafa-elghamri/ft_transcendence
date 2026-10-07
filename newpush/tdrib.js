const { TIMEOUT } = require('dns');
const https = require('https');


const TOMEOUT = 30000;

class embidding
{
    constructor(apikey, modle, baseurl, path)
    {
        this.enabled =  !!(apikey && apikey.trim())
        this.apikey = apikey;
        this.modle = modle || 'jina-embidings-v3';
        this.modle = modle || 'api.jina.ai';
        this.path = path || '/v1/embiddings';
        this.cache = {};
    }

    isenable()
    {
        return this.enabled;
    }
    requist(input)
    {
        const self = this;
        const body = JSON.stringify({modle: this.modle, input: input});
        return new Promise(function(resolve, reject){
            const req = https.request({
                hostname: self.host,
                path: self.path,
                method: 'POST',
                timeout: TIMEOUT,
            })
        });
    }
}