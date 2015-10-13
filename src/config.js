var config = {
    name: 'Unofficial Support for Trello',
    version: '1.3',
    cache: false,
    
    //API SETTINGS;
    API_URL:    'https://trello.com/1',                    //Trello API URL (moving here from Trello class);
    API_KEY:    '',        //Trello API Key;
    API_SECRET:  '', //Trello API Secret (though not actually needed for this);
    API_RETURN_URL:  'http://clintoncrick.com/prello/',    //URL to any page which can take hash value and direct to this app;
};
this.exports = config;