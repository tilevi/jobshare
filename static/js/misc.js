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