/*
    This file includes any miscellanous variables and functions.
*/

var create_job_url = "{{=URL('api', 'create_job', user_signature=True)}}";    
var default_url = "{{=URL('default', 'index')}}";
var image_url = "{{=URL('static', 'images/player_models')}}";

function isJobModel(event) {
    var charCode = event.which;
    
    if(charCode === 32 || !(charCode == 46 || charCode == 47 || charCode == 95 || (charCode >= 65 && charCode <= 90) || (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 122))) {
        return false;
    } else {
        return true;
    }
}

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