var config = require('config');
var global = {
    showMessage: function(msg){
        console.log('[Message]: ' + (typeof msg == 'string' ? msg : JSON.stringify(msg)));
    },
    
    //@TODO: have this actually show an error message upon load?
    showError: function(msg){
        console.log('[ERROR!]: ' + msg);
    },

    //localstorage stuff;
    get: function(k){
        if(localStorage.getItem(config.version + k)){
            return JSON.parse(localStorage.getItem(config.version + k));
        }
        return false;
    },

    set: function(k, v){
        return localStorage.setItem(config.version + k, JSON.stringify(v));
    }
};
this.exports = global;