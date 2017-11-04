(function() {

var fetch = function(url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function() {
        callback(JSON.parse(this.responseText));
    });
    oReq.addEventListener('error', function() {
        console.log('Fetch failed, trying again in 1 second');
        setTimeout(function() {
            fetch(url, callback);
        }, 1000);
    });
    oReq.open('GET', url);
    oReq.send();
};

var status = function(callback) {
    fetch('/lights/status', callback); 
};

var update = function() {
    status(function(json) {
        if (json && json.lights && json.pins) {
            Object.keys(json).forEach(function(sub) {
                Object.keys(json[sub]).forEach(function(key) {
                    var id = sub + '_' + key;
                    var el = document.getElementById(id);
                    if (el) {
                        el.className = json[sub][key];
                    }
                });
                if (sub === 'running') {
                    [].slice.call(document.querySelectorAll('#actions li.on')).forEach(function(el) {
                        el.className = '';
                    });
                    var cmd = json[sub].command;
                    switch (cmd) {
                        case 'on':
                            document.getElementById('lights_on').className = 'on';
                            break;
                        case 'show':
                            document.getElementById('show_on').className = 'on';
                            break;
                        default:
                            var el = document.getElementById(cmd);
                            if (el) {
                                el.className = 'on';
                            }
                            break;
                    }
                    document.querySelector('small em').innerHTML = 'Last Action was ' + json[sub].since;
                }
            });
            var h1 = document.querySelector('h1');
            var enabled = document.getElementById('enable');
            var a = enabled.querySelector('a');
            var img = a.querySelector('img');
            if (json.disabled) {
                if (h1.className !== 'disabled') {
                    h1.className = 'disabled';
                    a.href = '/show/enable';
                    img.setAttribute('src', '/play.gif');
                    a.innerHTML = a.innerHTML.replace('Disable', 'Enable')
                    document.title = '(disabled) ' + document.title
                }
            } else {
                if (h1.className !== '') {
                    h1.className = '';
                    a.href = '/show/disable';
                    img.setAttribute('src', '/stop.gif');
                    a.innerHTML = a.innerHTML.replace('Enable', 'Disable')
                    document.title = document.title.replace('(disabled) ', '');
                }
            }
        }
        fetch('/music.json', function(data) {
            var html = 'No music currently playing..';
            if (data.title && data.artist) {
                html = data.title + ' by ' + data.artist;
            }
            document.querySelector('#playing span').innerHTML = html;
            setTimeout(update, 500);
        });
    });
};

update();

var timer;
var show = function(str) {
    if (timer) {
        clearTimeout(timer);
    }
    var el = document.getElementById('message');
    el.innerHTML = str;
    el.className = '';
    timer = setTimeout(function() {
        el.className = 'hide';
    }, 3000);
};

document.getElementById('actions').addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        e.stopPropagation();
        fetch(e.target.href, function(json) {
            show(json.command + ' was executed..');
            update();  
        });
    }
})

})();
