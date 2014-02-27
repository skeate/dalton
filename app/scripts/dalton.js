var dalton = {
  ColorMatrix: function(o, m) {
    var a, b, fu, g, q, r;
    fu = function(n) { return (n < 0) ? 0 : (n < 255) ? Math.round(n) : 255; }
    r = (o.R * m[0]) + (o.G * m[1]) + (o.B * m[2]) + (o.A * m[3]) + m[4];
    g = (o.R * m[5]) + (o.G * m[6]) + (o.B * m[7]) + (o.A * m[8]) + m[9];
    b = (o.R * m[10]) + (o.G * m[11]) + (o.B * m[12]) + (o.A * m[13]) + m[14];
    a = (o.R * m[15]) + (o.G * m[16]) + (o.B * m[17]) + (o.A * m[18]) + m[19];
    return {
      'R': fu(r),
      'G': fu(g),
      'B': fu(b),
      'A': fu(a)
    };
  },

  parseColor: function(c) {
    var o, parsed, parser;
    parser = /rgba?\((\d+), (\d+), (\d+)(, (1\.0|1|0|0\.\d+))?\)/;
    parsed = c.match(parser);
    return o = {
      R: parsed[1],
      G: parsed[2],
      B: parsed[3],
      A: parsed[5] != null ? parsed[5] : 1
    };
  },

  makeRGBA: function(o) {
    return 'rgba(' + o.R + ', ' + o.G + ', ' + o.B + ', ' + (o.A != null ? o.A : 1 ) + ')';
  },

  Types: {
    'Normal': [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Protanopia': [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Protanomaly': [0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Deuteranopia': [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Deuteranomaly': [0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Tritanopia': [0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Tritanomaly': [0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Achromatopsia': [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    'Achromatomaly': [0.618, 0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
  },

  colorProps: ['background-color', 'border-bottom-color', 'border-left-color', 'border-right-color', 'border-top-color', 'color'],

  applyColorBlindness: function($el, type) {
    var prop, _i, _len;
    if (type === 'Normal') {
      for (_i = 0, _len = dalton.colorProps.length; _i < _len; _i++) {
        prop = dalton.colorProps[_i];
        $el.css(prop, '');
      }
      if( $el.tagName == "img" && typeof $el.data("oldsrc") !== "undefined" ){
        $el.attr('src', $el.data('oldsrc') );
        $el.removeData('oldsrc');
      }
    } else {
      for (_i = 0, _len = dalton.colorProps.length; _i < _len; _i++) {
        prop = dalton.colorProps[_i];
        $el.css(prop, function(i, v) {
          var oldColor = dalton.parseColor(v);
          // avoid changing greyscale
          if( oldColor.R == oldColor.B && oldColor.R == oldColor.G ) return '';
          var newColor = dalton.ColorMatrix(dalton.parseColor(v), dalton.Types[type]);
          if( oldColor.R == newColor.R &&
              oldColor.G == newColor.G &&
              oldColor.B == newColor.B ) return '';
          return dalton.makeRGBA(newColor);
        });
      }

      $el.css('background-image', function(i, v){
        if( v == "none" ) return '';
        return v.replace(/rgba?\((\d+), (\d+), (\d+)(, (\d+))?\)/g, function(m,r,g,b,ag,a){
          return dalton.makeRGBA( dalton.ColorMatrix( {R:r,G:g,B:b,A:typeof a !== "undefined"?a:1}, dalton.Types[type] ) );
        });
      });
    }
  }
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  chrome.storage.sync.get('preset-choice', function(settings){
    $('*').each(function(){
      dalton.applyColorBlindness($(this), settings['preset-choice']);
    });
  });
  sendResponse(true);
});
