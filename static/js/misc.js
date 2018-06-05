/*
    This file includes any miscellanous variables and functions.
*/

var create_job_url = "{{=URL('api', 'create_job', user_signature=True)}}";    
var default_url = "{{=URL('default', 'index')}}";
var image_url = "{{=URL('static', 'images/player_models')}}";

/*
    Input validators
    
    Sources:
            http://jsfiddle.net/gargdeendayal/4qqza69k/
            https://stackoverflow.com/questions/39782176/filter-input-text-only-accept-number-and-dot-vue-js
*/

const SPACE = 32;
const EXCLAMATION_MARK = 33;
const SINGLE_QUOTE = 39;
const COMMA = 44;
const DASH = 45;
const PERIOD = 46;
const SLASH = 47;

const ZERO = 48;
const NINE = 57;

const A = 65;
const Z = 90;

const UNDERSCORE = 95;

const a = 97;
const z = 122;


function isJobModel(e) {
    var charCode = e.which;
    
    if(charCode === SPACE || !(charCode == A || charCode == SLASH || charCode == UNDERSCORE || (charCode >= A && charCode <= Z) || (charCode >= ZERO && charCode <= NINE) || (charCode >= a && charCode <= z))) {
        e.preventDefault();
    } else {
        return true;
    }
}

function isJobID(e) {
    e = (e) ? e : window.event;
    var charCode = (e.which) ? e.which : e.keyCode;

    if(charCode === SPACE || !(charCode == UNDERSCORE || (charCode >= A && charCode <= Z) || (charCode >= ZERO && charCode <= NINE) || (charCode >= a && charCode <= z))) {
        e.preventDefault();
    } else {
        return true;
    }
}
    
function isJobName(e) {
    e = (e) ? e : window.event;
    var charCode = (e.which) ? e.which : e.keyCode;

    if(!(charCode == SPACE || (charCode >= ZERO && charCode <= NINE) || (charCode == SINGLE_QUOTE) || (charCode >= A && charCode <= Z) || (charCode >= a && charCode <= z))) {
        e.preventDefault();
    } else {
        return true;
    }
}
    
function isJobDescription(e) {
    e = (e) ? e : window.event;
    var charCode = (e.which) ? e.which : e.keyCode;

    if(!((charCode >= ZERO && charCode <= NINE) || charCode == DASH || charCode === SPACE || charCode == EXCLAMATION_MARK || charCode == PERIOD || charCode == SINGLE_QUOTE || charCode == COMMA || (charCode >= A && charCode <= Z) || (charCode >= a && charCode <= z))) {
        e.preventDefault();
    } else {
        return true;
    }
}

/*
    Decides if dark or light text should be used.
*/
function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        return (L > 0.179) ? darkColor : lightColor;
}