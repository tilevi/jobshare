/*
    This code controls input to the forms.
    Of course, data is checked again erver-side.
*/


$('form').submit(function() {
    $("#job_weapons").val(JSON.stringify(wepTags));
});

$('#job_job_id').keypress(function(e) {
    if(e.which === 32 || !(e.which == 95 || (e.which >= 65 && e.which <= 90) || (e.which >= 48 && e.which <= 57) || (e.which >= 97 && e.which <= 122))) {
        return false;
    }
});

$('#job_name').keypress(function(e) {
    if(!(e.which == 32 || (e.which >= 48 && e.which <= 57) || (e.which == 39) || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122))) {
        return false;
    }
});

$('#job_description').keypress(function(e) {
    if(!(e.which === 32 || e.which == 33 || e.which == 46 || e.which == 39 || e.which == 44 || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122))) {
        return false;
    }
});

var input = document.querySelector('input[name=tags]'),
tagify = new Tagify(input, {
    whitelist : ["weapon_ak47", "weapon_ar2"]
});

var wepTags = [];

// listen to custom 'remove' tag event
tagify.on('remove', onRemoveTag);

function onRemoveTag(e){
    wepTags.splice(wepTags.indexOf(e.detail.value), 1);
    setCode();
}

tagify.on('add', onAddTag);

function onAddTag(e) {
    wepTags.push(e.detail.value);
    setCode();
}