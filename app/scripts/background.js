'use strict';

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.sendMessage(tab.id, "simulate", function(res){
    console.log(res);
  });
});

chrome.storage.sync.get('buttonAction',function(settings){
  if( settings.buttonAction == "popup" ) chrome.browserAction.setPopup({popup:"popup.html"});
});
