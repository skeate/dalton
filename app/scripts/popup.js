'use strict';

function onChange(e){
    var type = e.target.id;
    chrome.tabs.getSelected(function(tab){
        chrome.tabs.sendMessage(tab.id, {
            action: 'simulate',
            type: type
        });
    });
}

document.addEventListener('DOMContentLoaded', function(){
    var types = document.getElementsByName('type');
    for( var i = 0; i < types.length; i++ ){
        types[i].addEventListener('change', onChange );
    }
});
