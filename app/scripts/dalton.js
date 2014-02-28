/*global $: false */
'use strict';

var dalton = {
    ColorMatrix: function(o, m) {
        var a, b, fu, g, r;
        fu = function(n) { return (n < 0) ? 0 : (n < 255) ? Math.round(n) : 255; };
        r = (o.R * m[0]) + (o.G * m[1]) + (o.B * m[2]) + (o.A * m[3]) + m[4];
        g = (o.R * m[5]) + (o.G * m[6]) + (o.B * m[7]) + (o.A * m[8]) + m[9];
        b = (o.R * m[10]) + (o.G * m[11]) + (o.B * m[12]) + (o.A * m[13]) + m[14];
        a = (o.R * m[15]) + (o.G * m[16]) + (o.B * m[17]) + (o.A * m[18]) + m[19];
        return {
            'R': fu(r),
            'G': fu(g),
            'B': fu(b),
            'A': a
        };
    },

    parseColor: function(c) {
        var parsed, parser;
        parser = /rgba?\((\d+), (\d+), (\d+)(, (1\.0|1|0|0\.\d+))?\)/;
        parsed = c.match(parser);
        return {
            R: parsed[1],
            G: parsed[2],
            B: parsed[3],
            A: typeof parsed[5] !== 'undefined' ? parsed[5] : 1
        };
    },

    makeRGBA: function(o) {
        return 'rgba(' + o.R + ', ' + o.G + ', ' + o.B + ', ' + (typeof o.A !== 'undefined' ? o.A : 1 ) + ')';
    },

    type: 'Normal',

    // Channel mixer method does not actually work very well;
    // todo: change to method based on confusion lines
    Types: {
        //OUTPUT CHANNEL:|-------RED--------------| |----------BLUE---------| |---------GREEN---------| |--------ALPHA----------| |---------KEY-----------|
        //INPUT CHANNEL:  RRRR GGGG BBBB AAAA KKKK  RRRR GGGG BBBB AAAA KKKK  RRRR GGGG BBBB AAAA KKKK  RRRR GGGG BBBB AAAA KKKK  RRRR GGGG BBBB AAAA KKKK
        'Normal':        [1.00,   0,   0,   0,   0,    0,1.00,   0,   0,   0,    0,   0,   1,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Protanopia':    [0.57,0.43,   0,   0,   0, 0.56,0.44,   0,   0,   0,    0,0.24,0.76,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Protanomaly':   [0.82,0.18,   0,   0,   0, 0.33,0.67,   0,   0,   0,    0,0.13,0.88,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Deuteranopia':  [0.63,0.38,   0,   0,   0, 0.70,0.30,   0,   0,   0,    0,0.30,0.70,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Deuteranomaly': [0.80,0.20,   0,   0,   0, 0.26,0.74,   0,   0,   0,    0,0.14,0.86,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Tritanopia':    [0.95,0.05,   0,   0,   0,    0,0.43,0.57,   0,   0,    0,0.48,0.53,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Tritanomaly':   [0.97,0.03,   0,   0,   0,    0,0.73,0.27,   0,   0,    0,0.18,0.82,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Achromatopsia': [0.30,0.59,0.11,   0,   0, 0.30,0.59,0.11,   0,   0, 0.30,0.59,0.11,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1],
        'Achromatomaly': [0.62,0.32,0.06,   0,   0, 0.16,0.78,0.06,   0,   0, 0.16,0.32,0.52,   0,   0,    0,   0,   0,   1,   0,    0,   0,   0,   0,   1]
    },

    adjustColors: function(index, value){
        var oldColor = dalton.parseColor(value);
        // avoid changing greyscale
        if( oldColor.R === oldColor.B && oldColor.R === oldColor.G ){ return ''; }

        var newColor = dalton.ColorMatrix( oldColor, dalton.Types[dalton.type] );
        if( oldColor.R === newColor.R && oldColor.G === newColor.G && oldColor.B === newColor.B ){ return ''; }
        return dalton.makeRGBA(newColor);
    },

    processBackgroundImage: function(v, cb){
        // change colors in a gradient
        v = v.replace(/rgba?\((\d+), (\d+), (\d+)(, (\d+))?\)/g, function(m,r,g,b,ag,a){
            return dalton.makeRGBA( dalton.ColorMatrix( {R:r,G:g,B:b,A:typeof a !== 'undefined'?a:1}, dalton.Types[dalton.type] ) );
        });

        // change urls to dataURLs
        var urlFinder = /url\(('|")?(.*?)('|")?\)/g;
        var match;
        var urls = [];
        while( (match = urlFinder.exec(v)) !== null ){
            urls.push( match[2] );
        }
        // underscore's _.after
        var done = (function(times, func) {
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        })( urls.length, function(){
            cb(v);
        });
        var piw = function(url){
            dalton.processImage( url, function(dataURL){
                v = v.replace(url, dataURL);
                done();
            });
        };
        for( var i = 0; i < urls.length; i++ ){
            piw(urls[i]);
        }
    },

    processImage: function(url, cb){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.onload = function(){
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.drawImage(this,0,0);
            var imgData = ctx.getImageData(0,0,this.width,this.height);
            for( var i=0;i<imgData.data.length;i+=4){
                var pixel = {
                    R: imgData.data[i],
                    G: imgData.data[i+1],
                    B: imgData.data[i+2],
                    A: imgData.data[i+3] / 255
                };
                pixel = dalton.ColorMatrix(pixel, dalton.Types[dalton.type]);
                imgData.data[i] = pixel.R;
                imgData.data[i+1] = pixel.G;
                imgData.data[i+2] = pixel.B;
                imgData.data[i+3] = Math.round(pixel.A * 255);
            }
            ctx.putImageData(imgData,0,0);
            cb(canvas.toDataURL());
        };
        img.src = url;
    },

    applyColorBlindness: function($el, type, index) {
        var prop, _i, _len, url;
        var colorProps = ['background-color', 'border-bottom-color', 'border-left-color', 'border-right-color', 'border-top-color', 'color'];
        dalton.type = type;

        if (type === 'Normal') {
            for (_i = 0, _len = colorProps.length; _i < _len; _i++) {
                prop = colorProps[_i];
                $el.css(prop, '');
            }
            if( $el.tagName === 'img' && typeof $el.data('oldsrc') !== 'undefined' ){
                $el.attr('src', $el.data('oldsrc') );
                $el.removeData('oldsrc');
            }
        } else {
            for (_i = 0, _len = colorProps.length; _i < _len; _i++) {
                prop = colorProps[_i];
                $el.css(prop, dalton.adjustColors);
            }

            var bgi = $el.css('background-image');
            if( /(url\(.*?\)|rgba?\((\d+), (\d+), (\d+)(, (\d+))?\))/.test( bgi ) ){
                chrome.runtime.sendMessage({
                    action: 'process_background_image',
                    value: bgi,
                    index: index
                }, function(){});
            }

            if( $el[0].tagName === 'IMG' ){
                url = $el[0].src;
                $el.data('oldsrc', url);
                chrome.runtime.sendMessage({
                    action: 'get_image_data_url',
                    url: url,
                    index: index
                }, function(){});
            }
        }
    }
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if( message.action === 'simulate' ){
        $('*').each(function(index){
            dalton.applyColorBlindness($(this), message.type, index);
        });
        sendResponse(true);
    }
    if( message.action === 'update_img' ){
        $('*')[message.index].src = message.data;
    }
    if( message.action === 'update_bgi' ){
        $($('*')[message.index]).css('background-image', message.data);
    }
});
