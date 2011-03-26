window.lastTweet = {};

function TN()
{
    this.url = 'http://twitter.com/statuses/user_timeline/officialtepco.json';
}

TN.prototype.load = function()
{
    if (localStorage.getItem('notificate') !== 'true') {
        //console.log('quit');
        return;
    }
    $.ajax({
        type: 'get',
        url: this.url,
        dataType: 'json',
        success: function(data){
            data = data.reverse();
            var last = localStorage.getItem('lastTweet');
            for (var i=0; i<data.length; i++) {
                var id = data[i].id_str;
                if (id > last) {
                    window.lastTweet.sname = data[i].user.screen_name;
                    window.lastTweet.icon = data[i].user.profile_image_url;
                    window.lastTweet.bg = data[i].user.profile_background_image_url;
                    var link = 'https://twitter.com/#!/%s/status/%s';
                    window.lastTweet.link = link.sprintf(
                        window.lastTweet.sname,
                        id
                    );
                    window.lastTweet.text = data[i].text;
                    var notification = webkitNotifications.createHTMLNotification(
                        'notification.html'
                    );
                    localStorage.setItem('lastTweet', id);
                    notification.show();
                    notification.onclose = function(e){
                        loadTweetNotifier();
                    };
                    break;
                }
            }
        },
        error: function(){
            return true;
        }
    });
}


function loadTweetNotifier() {
    var tweet = new TN();
    tweet.load();
    delete tweet;
}

$(document).ready(function() {
    loadTweetNotifier();
    setInterval(loadTweetNotifier, 10*60*1000); // every 10 minutes
});

