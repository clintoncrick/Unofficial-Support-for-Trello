//Pebble Classes;
var ajax = require('ajax');
var UI = require('ui');

//JS settings/configs;
var config = require('config');
var g = require('global');

var Screens = require('Screens');

var Trello = {
    //Settings;
    API_URL: 'https://trello.com/1',
    TOKEN: false,
    
    //Data;
    boards: false,
    lists: false,
    cards: false,
    
    //Load information;
    /**
     * Central point of loading items. If we have it in memory, use it. If cache it and have it cached, use it. Else, get from Trello.
     * 
     * @param {String} type
     * @param {String} typeID
     */
    loadItem: function (type, typeID) {
        g.showMessage('Loading ' + type + (typeID ? ' for ' + typeID : ''));
        
        //@TODO: ensure we have a way of refreshing these.
        if (false && this[type + typeID] && this[type + typeID].length) {
            g.showMessage('Have this information in memory.');
            g.showMessage(this[type + typeID]);
            
            this.show(type, this[type + typeID]);
        }
        //@TODO: ensure we have a way of refreshing these.
        else if (config.cache && g.get((typeof typeID === 'undefined' ? type : typeID))) {
            var items = g.get((typeof typeID === 'undefined' ? type : typeID));
            this[type + typeID] = items;
            
            g.showMessage('Have this information in localstorage.');
            g.showMessage(this[type + typeID]);
            this.show(type, this[type + typeID]);
        }
        else {
            g.showMessage('Do not have this information. Getting it from remote!;');
            this.get(type, typeID);
        }
    },
    //SHOW;
    /**
     * Show the passed items;
     * 
     * @param {String} type
     * @param {Array} items
     * @param {mixed} additional
     */
    show: function (type, items, additional) {
        if (type === 'boards') {
            var boards = items;
            console.log('[Show boards]: showing these boards:');
            console.log(JSON.stringify(boards));

            var items = [];
            var starredItems = [];

            for (var i in boards) {
                if (!boards[i].closed) {
                    var starred = boards[i].starred;

                    var b = {
                        id: boards[i].id,
                        title: boards[i].name,
                        subtitle: boards[i].desc
                    };

                    if (starred) {
                        starredItems.push(b);
                    }

                    items.push(b);
                }
            }


            var sections = [];
            if (starredItems.length) {
                sections.push({
                    title: 'Starred Boards:',
                    items: starredItems
                });
            }
            sections.push({
                title: 'Boards:',
                items: items
            });

            //@TODO: no items at all? prompt user to create a board?
            if(Screens.dyn[type]){
                Screens.dyn[type].hide();
            }
            
            Screens.dyn[type] = new UI.Menu({
                sections: sections
            });
            
            Screens.dyn[type].on('select', function (e) {
                console.log('Selected board: ' + JSON.stringify(e.item));
                Trello.loadItem('lists', e.item.id);
            });
            Screens.dyn[type].show();
            Screens.hideLoading();
        }
        else if (type === 'lists') {
            var lists = items;
            console.log('[Show lists]: showing these lists:');
            console.log(JSON.stringify(lists));

            var items = [];

            for (var i in lists) {
                if (lists[i] && !lists[i].closed) {
                    var b = {
                        id: lists[i].id,
                        title: lists[i].name,
                        cards: lists[i].cards
                    };

                    items.push(b);
                }
            }

            var sections = [];
            sections.push({
                title: 'Lists:',
                items: items
            });
            
            //@TODO: no items at all? prompt user to create a board?
            if(Screens.dyn[type]){
                Screens.dyn[type].hide();
            }
            
            Screens.dyn[type] = new UI.Menu({
                sections: sections
            });
            Screens.dyn[type].on('select', function (e) {
                console.log('Selected list: ' + JSON.stringify(e.item));
                Trello.loadItem('cards', e.item.id, e.item.id);
                
                //@TODO: refresh this data;
                /*
                if (e.item.cards && e.item.cards.length) {
                    console.log('SHOWING CARDS from show');
                    Trello.show('cards', e.item.cards, e.item.id);
                }
                else {
                    Trello.loadItem('cards', e.item.id, e.item.id);
                }
                */
            });
            
            Screens.dyn[type].show();
            Screens.hideLoading();
        }
        else if (type === 'cards') {
            var cards = items;
            
            console.log('[Show cards]: showing these cards (passed):');
            console.log(JSON.stringify(cards));
            var parentID = additional;
            var items = [];
            
            for (var i in cards) {
                if (cards[i] && !cards[i].closed) {
                    var b = {
                        id: cards[i].id,
                        title: cards[i].name,
                        desc: cards[i].desc,
                        idChecklists: cards[i].idChecklists,
                        parentID: parentID
                    };

                    items.push(b);
                }
            }

            var sections = [];
            sections.push({
                title: 'Cards:',
                items: items
            });
            
            //@TODO: no items at all? prompt user to create a board?
            if(Screens.dyn[type]){
                Screens.dyn[type].hide();
            }
            Screens.dyn[type] = new UI.Menu({
                sections: sections
            });
            Screens.dyn[type].on('select', function (e) {
                var item = e.item;
                item.type = 'cards';
                Trello.selectedItem = item;
                
                console.log('Selected card: ' + JSON.stringify(e.item));
                Screens.dyn['card'] = new UI.Card({
                    title: e.item.title,
                    body: (e.item.desc && e.item.desc.length ? e.item.desc : e.item.title),
                    action: {
                        'select': 'images/cog_12.png'
                    },
                    scrollable: true
                });
                
                /*
                if (item.idChecklists && item.idChecklists.length) {
                    //card.action('up', 'images/check.png');
                    Screens.dyn['card'].on('click', 'up', function (e) {
                        //Trello.showChecklist(item.idChecklists);
                    });
                }
                */
                
                Screens.dyn['card'].on('click', 'select', function (e) {
                    var selectOptions = function(e){
                        if (e.item.value) {
                            if (e.item.value == 'close') {
                                Trello.archiveItem(Trello.selectedItem);
                                Screens.dyn['card'].hide();
                                Screens.hideOptions();
                            }
                        }
                    }
                    Screens.showOptions(Trello.selectedItem, selectOptions);
                });
                
                Screens.dyn['card'].show();
                Screens.hideLoading();
            });
            Screens.dyn[type].show();
            Screens.hideLoading();
        }
        else {
            console.log('WHAT?!?! ERROR!!!! DIDnT WORK!');
            g.showMessage(type);
            g.showMessage(items);
            g.showMessage('------');
        }
    },
    
    //GET!;
    /**
     * Reaches out to Trello API, grabs the requested data;
     * @param {String} type
     * @param {String} typeID
     */
    get: function (type, typeID) {
        console.log('[TRELLO API]: getting ' + type + (typeID ? ' for ' + typeID : ''));

        if (type !== 'boards' && typeof typeID === 'undefined') {
            g.showError('No typeID! this is a problem. exiting;');
            return;
        }

        var URL = false;
        if (type === 'boards') {
            URL = this.API_URL + '/members/my/boards?lists=open&cards=open&key=' + config.API_KEY + '&token=' + this.TOKEN;
        }
        else if (type === 'lists') {
            URL = this.API_URL + '/board/' + typeID + '/lists?cards=open&key=' + config.API_KEY + '&token=' + this.TOKEN;
        }
        else if (type === 'cards') {
            URL = this.API_URL + '/lists/' + typeID + '?cards=open&key=' + config.API_KEY + '&token=' + this.TOKEN;
        }

        if (!URL) {
            g.showError('no URL? something has failed us...');
        }

        console.log('[TRELLO API]: Making req to: ' + URL);
        ajax({
                url: URL,
                type: 'json'
            },
            //success!;
            function (data) {
                console.log('[TRELLO API]: Successfully fetched Trello data!');
                g.showMessage(JSON.stringify(data));
                g.set((typeof typeID === 'undefined' ? type : typeID), data);

                if (type === 'cards') {
                    if (data.cards.length) {
                        console.log('SHOWING CARDS from ajax req');
                        Trello.show('cards', data.cards, data.id);
                    }
                    else {
                        var noCards = new UI.Card({
                            title: "Whoops!",
                            body: "Looks like there are no cards on this list."
                        });
                        noCards.show();
                        Screens.hideLoading();
                        return;
                    }
                }
                else {
                    Trello.show(type, data);
                }
            },
            //fail;
            function (error) {
                console.log('[TRELLO API]: Failed fetching Trello data!');
                g.showMessage(JSON.stringify(error));
                g.showError('NO ' + type + '!!!');
                return false;
            }
        );
        Screens.showLoading('Loading ' + type + '...');
    },
    //API STUFF;
    /**
     * Returns Trello Authorization URL
     * @returns {String}
     */
    getAuthorizationURL: function () {
        return this.API_URL + '/authorize?callback_method=fragment&scope=read,write&expiration=never&name=' + config.name + '&key=' + config.API_KEY + '&return_url=' + config.API_RETURN_URL;
    },
    
    
    /**
     * Takes an item object, will attempt to archive it. Item will need to have the following properties:
     *  type    {String}    type of the item, from these: board, lists, cards
     *  id      {String}    unique ID of the item
     *  parentID    {String}    Optional.
     * @param {Object} item
     */
    archiveItem: function (item) {
        if (typeof item === 'undefined') {
            g.showError('[Archive Item]: Nope! We need an item to archive something;');
            return;
        }
        
        var URL = this.API_URL + '/' + item.type + '/' + item.id + '/closed?value=true&key=' + config.API_KEY + '&token=' + this.TOKEN;
        
        console.log('[Archive Item]: URL: ' + URL);
        console.log('[Archive Item]: Item: ' + JSON.stringify(item));
        ajax({
                url: URL,
                method: 'put',
                type: 'json'
            },
            //Success;
            function (data) {
                console.log('[Archive Card]: Successfully archived card!');
                g.showMessage(JSON.stringify(data));
                if (item.type == 'cards' && item.parentID) {
                    console.log('Getting new cards');
                    Trello.get('cards', item.parentID);
                }
                Screens.hideLoading();
            },
            //Fail;
            function (error) {
                console.log('[Archive Card]: Failed archiving Trello card!');
                g.showMessage(JSON.stringify(error));
                g.showError('NO CARDS');
                Screens.hideLoading();
                return false;
            }
        );
        Screens.showLoading('Archiving card...');
    },
    
    
    //Token stuff;
    /**
     * Get token for this app (if it exists);
     * @returns {String}
     */
    loadToken: function () {
        this.TOKEN = g.get('token');
        return this.TOKEN;
    },
    
    /**
     * Set token for this app, storing it locally as well;
     * @param {String} t
     */
    setToken: function (t) {
        this.TOKEN = t;
        return g.set('token', t);
    }
};
Trello.loadToken(); //because, well...
this.exports = Trello;
