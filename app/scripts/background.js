'use strict';

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.storage.sync.get('preset-choice', function(settings){
    chrome.tabs.sendMessage(tab.id, settings['preset-choice']);
  });
});

chrome.storage.sync.get('buttonAction',function(settings){
  if( !settings.hasOwnProperty('buttonAction') || settings.buttonAction == "popup" ){
    chrome.browserAction.setPopup({popup:"popup.html"});
  }
});
