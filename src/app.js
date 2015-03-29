//Pebble!
var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

//JS settings/configs;
var config = require('config');
var g = require('global');

//Screens!;
var Screens = require('Screens');
Screens.showSplash();

//Trello!;
var Trello = require('Trello');


//Configuration!
Pebble.addEventListener('showConfiguration', function () {
    console.log('[CONFIG]: Launching configuration screen.');
    Pebble.openURL(Trello.getAuthorizationURL());
});

Pebble.addEventListener("webviewclosed", function (e) {
    console.log('[CONFIG]: response is back!');
    console.log(e);
    console.log(e.response);

    var token = false;
    if (e && e.response) {
        try {
            e.response = JSON.parse(e.response);
            token = e.response.token;
        }
        catch (error) {
            console.log("[CONFIG]: Failed to parse:" + error);
            if (g.get('token')) {
                token = g.get('token');
            }
        }
    }
    else {
        console.log('[CONFIG]: e is empty?');
        console.log(JSON.stringify(e));
    }

    if (!token) {
        g.showError('Unable to load token. Please reconfigure your app.');
        return;
    }

    console.log('[CONFIG]: setting token to be: ' + token);
    console.log(JSON.stringify(token));

    Trello.setToken(token);
    Trello.loadItem('boards');
    return;
});


//If we don't have any boards, then we need to show the config;
setTimeout(function(){
    if(!Trello.loadToken()){        //No token? Well, better give them a prompt...
        Screens.showStart();
    }
    else {
        Trello.loadItem('boards');    //@TODO: caching.
    }
    
    Screens.hideSplash();
}, 750);
//END OF FILE;