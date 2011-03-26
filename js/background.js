function denkiYoho()
{
    this.baseURL = 'http://denki.cuppat.net/data/%s.json';
    this.defaultIcon = 'img/blue.png';
    this.icons = {
        80: 'img/green.png',
        90: 'img/orange.png',
        95: 'img/red.png'
    };
    this.showBadge = 95;
}

denkiYoho.prototype.load = function()
{
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth() + 1;
    var d = today.getDate();
    m = (m < 10) ? '0' + m : m + '';
    d = (d < 10) ? '0' + d : d + '';
    y = y + '';
    this.getJson(y + m + d);
}

denkiYoho.prototype.getLastDay = function()
{
    var last = new Date();
    last.setTime(last.getTime()-86400*1000);
    var y = last.getFullYear();
    var m = last.getMonth() + 1;
    var d = last.getDate();
    m = (m < 10) ? '0' + m : m + '';
    d = (d < 10) ? '0' + d : d + '';
    y = y + '';
    return y + m + d;
}

denkiYoho.prototype.getJson = function(day)
{
    //console.log(day);
    chrome.browserAction.setIcon({path: 'img/grey.png'});
    chrome.browserAction.setBadgeText({"text": ''});

    var url = this.baseURL.sprintf(day);
    var self = this;
    $.ajax({
        type: 'get',
        url: url,
        dataType: 'json',
        success: function(data){
            var capa = data.capability;
            var dem = 0;
            for (var i=0; i<data.hours.length; i++) {
                if (data.hours[i]) {
                    dem = data.hours[i];
                }
            }
            self.setIcon(capa, dem);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 404) {
                var last = self.getLastDay();
                if (day !== last) {
                    self.getJson(last);
                }
            }
        }
    });
}

denkiYoho.prototype.setIcon = function(capa, dem)
{
    var per = parseInt(dem) / parseInt(capa) * 100;
    per = per.toFixed(0);
    if (this.showBadge < per || localStorage.getItem('showDemand') === 'true') {
        chrome.browserAction.setBadgeText({"text": per+'%'});
    } else {
        chrome.browserAction.setBadgeText({"text": ''});
    }

    var icon = this.defaultIcon;
    for (var i in this.icons) {
        if (per >= i) {
            icon = this.icons[i];
        }
    }
    chrome.browserAction.setIcon({path:icon});
    dem = dem+'';
    dem = dem.number_format();
    capa = capa+'';
    capa = capa.number_format();
    chrome.browserAction.setTitle({title: dem+'万kw/'+capa+'万kw'});
    //console.log('latest: '+per+'%');
}

function loadDenkiYoho()
{
    var yoho = new denkiYoho();
    yoho.load();
    delete yoho;
}

$(document).ready(function() {
    loadDenkiYoho();
    setInterval(loadDenkiYoho, 10*60*1000); // every 10 minutes
    chrome.browserAction.onClicked.addListener(function(tab) {
        var href = 'http://www.tepco.co.jp/forecast/';
        if (localStorage.getItem('open') === 'true') {
            chrome.tabs.create({url: href});
        } else {
            chrome.tabs.update(tab.id, {url: href});
        }
    });
});

