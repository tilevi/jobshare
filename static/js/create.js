
/*
    This code handles setting and copying the GLua code.
*/

copied = false;

$("#copyButton").click(function() {
    if (!copied) {
        copied = true;
        $("#copyButton").text("Copied!");
        setTimeout(function() {
            $("#copyButton").text("Copy");
            copied = false;
        }, 1000);
    }
});

function myFunction() {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val($("#genCode").text()).select();
    document.execCommand("copy");
    $temp.remove();
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "<span class='hljs-number'>" + r + "</span>, <span class='hljs-number'>" + g + "</span>, <span class='hljs-number'>" + b + "</span>";
}

function getWeaponsList() {
    var str = "";
    /*
    var lastIndex = wepTags.length - 1;
    wepTags.forEach(function(wep, index) {
        // This is more readable (than using a ternary operator).
        if (index != lastIndex) {
            str += '"<span class="hljs-string">' + wep + '</span>",';
        } else {
            str += '"<span class="hljs-string">' + wep + '</span>"';
        }
    });*/
    return str;
}

function setCode() {
    $('#genCode').html( "TEAM_" + $('#job_job_id').val() + ` = DarkRP.createJob(<span class="hljs-string">"` + $('#job_name').val() +`"</span>, {
    color = Color(` + hexToRgb($('#job_color').val()) + `),
    model = <span class="hljs-string">"` + $('#job_model').val() + `"</span>,
    description = <span class="hljs-string">"` + $('#job_description').val() + `"</span>,
    weapons = {` + getWeaponsList() + `},
    command = <span class="hljs-string">"` + $('#job_job_id').val().toLowerCase() + `"</span>,
    <span class="hljs-built_in">max</span> = ` + $('#job_max_players').val() + `,
    salary = ` + $('#job_salary').val() + `,
    vote = <span class='hljs-literal'>` + ($('#job_vote').is(':checked') ? 'true' : 'false') + `</span>,
    admin = <span class='hljs-literal'>` + ($('#job_admin_only').is(':checked') ? 'true' : 'false') + `</span>,
})`);
}

$('#job_job_id').on('input', setCode);
$('#job_name').on('input', setCode);
$('#job_salary').on('input', setCode);
$('#job_description').on('input', setCode);


$('#job_model').on('change', function() {
    console.log("TEST");
    
    //APP.vue.job_model = $(this).val();
});

$('#job_model').keypress(function (e) {
    if (e.which == 13) {
        //console.log("Enter " + $(this).val());
        
        //APP.vue.job_model = $(this).val();
        return false;
    }
});


$('#job_max_players').on('input', setCode);

$("#job_vote").on('change', setCode);
$("#job_admin_only").on('change', setCode);

setCode();


