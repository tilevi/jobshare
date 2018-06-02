/*
    icon.js
    
    This file contains functions that control icons on the main page.
*/

function toggleTagIcon() {
    $("#filterIcon").toggleClass("fa-rotate-180");
}

function toggleWeaponIcon() {
    $("#filterWeaponIcon").toggleClass("fa-rotate-180");
}

function toggleSalaryIcon() {
    $("#filterSalaryIcon").toggleClass("fa-rotate-180");
}

function toggleMaxPlayersIcon() {
    $("#filterMaxPlayersIcon").toggleClass("fa-rotate-180");
}

function togglePersonalIcon() {
    $("#filterPersonalIcon").toggleClass("fa-rotate-180");
}

$(document).ready(function() {
    $("#public_icon").tooltip();   

    // Filter tags
    $("#filterTags").on("show.bs.collapse", toggleTagIcon);
    $("#filterTags").on("hide.bs.collapse", toggleTagIcon);

    // Filter weapons
    $("#filterWeapons").on("show.bs.collapse", toggleWeaponIcon);
    $("#filterWeapons").on("hide.bs.collapse", toggleWeaponIcon);

    // Filter salary
    $("#filterSalary").on("show.bs.collapse", toggleSalaryIcon);
    $("#filterSalary").on("hide.bs.collapse", toggleSalaryIcon);

    // Filter max players
    $("#filterMaxPlayers").on("show.bs.collapse", toggleMaxPlayersIcon);
    $("#filterMaxPlayers").on("hide.bs.collapse", toggleMaxPlayersIcon);

    // Filter personal jobs
    $("#filterPersonal").on("show.bs.collapse", togglePersonalIcon);
    $("#filterPersonal").on("hide.bs.collapse", togglePersonalIcon);
});