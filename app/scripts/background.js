/*global dalton: false*/
'use strict';

chrome.browserAction.onClicked.addListener(function(tab){
    chrome.storage.sync.get('preset-choice', function(settings){
        chrome.tabs.sendMessage(tab.id, {
            action: 'simulate',
            type: settings['preset-choice']
        });
    });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    dalton.type = msg.type;
    if( msg.action === 'get_image_data_url' ){
        dalton.processImage(msg.url, function(dataURL){
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'update_img',
                data: dataURL,
                index: msg.index
            });
        });
    }
    if( msg.action === 'process_background_image' ){
        dalton.processBackgroundImage(msg.value, function(value){
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'update_bgi',
                data: value,
                index: msg.index
            });
        });
    }
    sendResponse();
});
    

chrome.storage.sync.get('buttonAction',function(settings){
    if( !settings.hasOwnProperty('buttonAction') || settings.buttonAction === 'popup' ){
        chrome.browserAction.setPopup({popup:'popup.html'});
    }
});
