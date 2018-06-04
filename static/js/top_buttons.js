
/*
    Controls the behavior of the "Home" and "Community" links.
*/

var homeOrisCommunityClicked = function(getCommunityJobs) {
    var vue = APP.vue;
    // selected_public is true when we're showing community jobs.
    // It is false if we're showing personal jobs.
    if (!isLoadingResults && (vue.selected_public != getCommunityJobs)) {
        // Toggle the public variable
        vue.selected_public = getCommunityJobs;
        vue.fetch_new_results();

        $("#jobsLink").toggleClass("active");
        $("#homeLink").toggleClass("active");

        // Change the header text
        $("#header_text").html(getCommunityJobs ? "Community" : "Your Jobs");
    } else if (!isLoadingResults && (vue.selected_public == getCommunityJobs)) {
        // Otherwise, the user must want to refresh the results.
        // So go ahead.
        vue.fetch_new_results();
    }
}

$("#homeLink").click(function(e) {
    e.preventDefault();
    homeOrisCommunityClicked(false);
});
$("#jobsLink").click(function(e) {
    e.preventDefault();
    homeOrisCommunityClicked(true);
});