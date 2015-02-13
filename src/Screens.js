var UI = require('ui');
var Vector2 = require('vector2');
var config = require('config');

var Screens = {};

//Splash;
Screens.splash = false;
Screens.showSplash = function () {
    if(!Screens.splash){
        Screens.splash = new UI.Window({});
        Screens.splash.add(new UI.Rect({
            backgroundColor: 'white',
            size: new Vector2(144, 168)
        }));
        Screens.splash.add(new UI.Image({
            position: new Vector2(40, 5),
            size: new Vector2(64, 64),
            backgroundColor: 'clear',
            image: 'images/trello-logo_64.png',
        }));
        
        Screens.splash.add(new UI.Text({
            position: new Vector2(0, 70),
            size: new Vector2(144, 30),
            text: config.name,
            font:'gothic_28_bold',
            color:'black',
            textOverflow:'wrap',
            textAlign:'center',
            backgroundColor:'white'
        }));
        Screens.splash.add(new UI.Text({
            position: new Vector2(0, 130),
            size: new Vector2(144, 14),
            text: config.version,
            font:'gothic_14',
            color:'black',
            textOverflow:'wrap',
            textAlign:'center',
            backgroundColor:'white'
        }));
    }
    Screens.splash.show();
};
Screens.hideSplash = function () {
    if(Screens.splash){
        Screens.splash.hide();
    }
};


//Loading;
Screens.loading = false;
Screens.showLoading = function (message) {
    if(!Screens.loading){
       Screens.loading = new UI.Card({
            title: config.name,
            icon: 'images/trello-logo_28.png',
            body: ''
        });
    }
    
    Screens.loading.body(message);
    Screens.loading.show();
};
Screens.hideLoading = function () {
    if(Screens.loading){
        Screens.loading.hide();
    }
};

//Start/pre-auth
Screens.start = false;
Screens.showStart = function () {
    if(!Screens.start){
        Screens.start = new UI.Card({
            title: 'Welcome to ' + config.name + '!',
            body: 'To start, authorize your Trello account via the Configuration screen.',
        });
    }
    Screens.start.show();
};
Screens.hideStart = function () {
    if(Screens.start){
        Screens.start.hide();
    }
};


//Options;
Screens.options = false;
Screens.showOptions = function (item, selectFunction) {
    if (!Screens.options) {
        Screens.options = new UI.Menu({
            sections: [{
                title: 'Options:',
                items: [{
                    title: 'Archive',
                    value: 'close'
                }]
            }]
        });

        Screens.options.on('select', function (e) {
            selectFunction(e);
        });
    }

    Screens.options.id = item.id;
    Screens.options.item = item;
    Screens.options.show();
};
Screens.hideOptions = function(){
    if(Screens.options){
        Screens.options.hide();
    }
};

//Dyn
Screens.dyn = {};

this.exports = Screens;