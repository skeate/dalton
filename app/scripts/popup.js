'use strict';

function onClick(e){
    var type = e.target.id;
    chrome.tabs.getSelected(function(tab){
        chrome.tabs.sendMessage(tab.id, {
            action: 'simulate',
            type: type
        });
        window.close();
    });
}

document.addEventListener('DOMContentLoaded', function(){
    var types = document.getElementsByTagName('button');
    for( var i = 0; i < types.length; i++ ){
        types[i].addEventListener('click', onClick );
    }
});
