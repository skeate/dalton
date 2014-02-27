'use strict';

document.addEventListener("DOMContentLoaded", function(){
  var i;
  // handle setting storage
  chrome.storage.sync.get(null, function(settings){
    var inputs = document.getElementsByTagName("input");
    for( i = 0; i < inputs.length; i++ ){
      if( settings.hasOwnProperty(inputs[i].name) ){
        inputs[i].checked = settings[inputs[i].name] == inputs[i].value;
      }
      inputs[i].addEventListener('change', function(e){
        settings[e.target.name] = e.target.value;
        chrome.storage.sync.set(settings);
      });
    }

    var selects = document.getElementsByTagName("select");
    for( i = 0; i < selects.length; i++ ){
      if( settings.hasOwnProperty(selects[i].name) ){
        selects[i].value = settings[selects[i].name];
      }
      selects[i].addEventListener('change', function(e){
        settings[e.target.name] = e.target.value;
        chrome.storage.sync.set(settings);
      });
    }
  });

  // handle pop up toggle
  var buttonActions = document.getElementsByName('buttonAction');
  for( i = 0; i < buttonActions.length; i++ ){
    buttonActions[i].addEventListener('change', function(e){
      if( e.target.value == "popup" ){
        chrome.browserAction.setPopup({popup:"popup.html"})
      } else {
        chrome.browserAction.setPopup({popup:""});
      }
    });
  }
});
