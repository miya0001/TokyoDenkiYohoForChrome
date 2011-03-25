window.lastTweet = {};

function TN()
{
    this.url = 'http://twitter.com/statuses/user_timeline/officialtepco.json';
}

TN.prototype.load = function()
{
    if (localStorage.getItem('notificate') !== 'true') {
        console.log('quit');
        return;
    }
    $.ajax({
        type: 'get',
        url: this.url,
        dataType: 'json',
        success: function(data){
            var id = data[0].id_str;
            var last = localStorage.getItem('lastTweet');
            if (id > last) {
                window.lastTweet.sname = data[0].user.screen_name;
                window.lastTweet.icon = data[0].user.profile_image_url;
                window.lastTweet.bg = data[0].user.profile_background_image_url;
                var link = 'https://twitter.com/#!/%s/status/%s';
                window.lastTweet.link = link.sprintf(
                    window.lastTweet.sname,
                    id
                );
                window.lastTweet.text = data[0].text;
                var notification = webkitNotifications.createHTMLNotification(
                    'notification.html'
                );
                notification.show();
                localStorage.setItem('lastTweet', id);
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

