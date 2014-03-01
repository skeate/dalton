'use strict';

document.addEventListener('DOMContentLoaded', function(){
    var i;
    // handle setting storage
    function saveSetting(e){
        chrome.storage.sync.get(null, function(settings){
            settings[e.target.name] = e.target.value;
            chrome.storage.sync.set(settings);
        });
    }

    chrome.storage.sync.get(null, function(settings){
        var inputs = document.getElementsByTagName('input');
        for( i = 0; i < inputs.length; i++ ){
            if( settings.hasOwnProperty(inputs[i].name) ){
                inputs[i].checked = settings[inputs[i].name] === inputs[i].value;
            } else {
                settings[inputs[i].name] = inputs[i].value;
                chrome.storage.sync.set(settings);
            }
            inputs[i].addEventListener('change', saveSetting);
        }

        var selects = document.getElementsByTagName('select');
        for( i = 0; i < selects.length; i++ ){
            if( settings.hasOwnProperty(selects[i].name) ){
                selects[i].value = settings[selects[i].name];
            } else {
                settings[selects[i].name] = selects[i].value;
                chrome.storage.sync.set(settings);
            }
            selects[i].addEventListener('change', saveSetting);
        }
    });

    // handle pop up toggle
    function setBrowserAction(e){
        if( e.target.value === 'popup' ){
            chrome.browserAction.setPopup({popup:'popup.html'});
        } else {
            chrome.browserAction.setPopup({popup:''});
        }
    }
    var buttonActions = document.getElementsByName('buttonAction');
    for( i = 0; i < buttonActions.length; i++ ){
        buttonActions[i].addEventListener('change', setBrowserAction);
    }
});
