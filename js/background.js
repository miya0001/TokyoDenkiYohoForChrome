function denkiYoho()
{
    this.baseURL = 'http://denki.cuppat.net/data/%s%s%s.json';
    this.default = 'img/blue.png';
    this.icons = {
        80: 'img/green.png',
        90: 'img/orange.png',
        95: 'img/red.png'
    };
    this.showBadge = 95;
}

denkiYoho.prototype.load = function()
{
    chrome.browserAction.setIcon({path: 'img/grey.png'});
    chrome.browserAction.setBadgeText({"text": ''});

    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth() + 1;
    var d = today.getDate();
    m = (m < 10) ? '0' + m : m;
    d = (d < 10) ? '0' + d : d;
    var url = this.baseURL.sprintf(y, m, d);
    var self = this;
    $.getJSON(url, function(data) {
        var capa = data.capability;
        var dem = 0;
        for (var i=0; i<data.hours.length; i++) {
            if (data.hours[i]) {
                dem = data.hours[i];
            }
        }
        self.setIcon(capa, dem);
    });
}

denkiYoho.prototype.setIcon = function(capa, dem)
{
    var per = parseInt(dem) / parseInt(capa) * 100;
    per = per.toFixed(0);
    if (this.showBadge < per) {
        chrome.browserAction.setBadgeText({"text": per+'%'});
    } else {
        chrome.browserAction.setBadgeText({"text": ''});
    }

    var icon = this.default;
    for (var i in this.icons) {
        if (per >= i) {
            icon = this.icons[i];
        }
    }
    chrome.browserAction.setIcon({path:icon});
    console.log('latest: '+per+'%');
}

function loadDenkiYoho()
{
    var yoho = new denkiYoho();
    yoho.load();
    delete yoho;
}

$(document).ready(function() {
    loadDenkiYoho();
    $.timer(10*60*1000, loadDenkiYoho); // every 10 minutes
    chrome.browserAction.onClicked.addListener(function(tab) {
        var href = 'http://www.tepco.co.jp/forecast/';
        if (localStorage.getItem('open') === 'true') {
            chrome.tabs.create({url: href});
        } else {
            chrome.tabs.update(tab.id, {url: href});
        }
    });
});


jQuery.timer = function (interval, callback)
 {
    var interval = interval || 100;

    if (!callback)
        return false;

    _timer = function (interval, callback) {
        this.stop = function () {
            clearInterval(self.id);
        };

        this.internalCallback = function () {
            callback(self);
        };

        this.reset = function (val) {
            if (self.id)
                clearInterval(self.id);

            var val = val || 100;
            this.id = setInterval(this.internalCallback, val);
        };

        this.interval = interval;
        this.id = setInterval(this.internalCallback, this.interval);

        var self = this;
    };

    return new _timer(interval, callback);
};
