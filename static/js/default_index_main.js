/*
    File:
            default_index_main.js
    Purpose:
            Holds the Vue.js code for the main page.
            
    References:
    
        Luca de Alfaro's provided code:
                https://luca_de_alfaro@bitbucket.org/luca_de_alfaro/web2py_start_2016
                
        Vue.js components:
                https://vuejs.org/v2/guide/components.html
                
        Tagify (tags):
                https://yaireo.github.io/tagify/
        
        Spectrum (colorpicker):
                http://bgrins.github.io/spectrum/
        
        jQuery:
                https://jquery.com/
*/

// VueRouter object
var router = new VueRouter({
    mode: 'history',
    routes: []
});

var app = function() {
    var self = {};
    
    Vue.config.silent = false; // show all warnings
    Vue.config.ignoredElements = ['tags'];
    
    // Player models
    self.player_models = player_models;
    self.player_models_object = {};
    
    self.player_models.forEach(function(array) {
       array.forEach(function(item) {
           self.player_models_object[item.model] = item.image;
       });
    });
    
    // Weapons
    self.weapons = weapons;
    
    self.wepClasses = [];
    self.weapons.forEach(function(wepObj) {
        self.wepClasses.push(wepObj.class);
    });
    
    // Vue components
    Vue.component('tag-it', {
        template: '<input/>',
        mounted: function() {
            var input = document.querySelector("#job_weapons_input");
            var tagify = new Tagify(input, {
                whitelist : self.wepClasses,
                suggestionsMinChars: 0
            });
            
            // Add any pre-existing tags.
            var tags = [];
            var wepTags = [];
            
            for (var i = 0; i < self.vue.edit_job.job_weapons_arr.length; i++) {
                tags.push({ "value": self.vue.edit_job.job_weapons_arr[i] });
                wepTags.push(self.vue.edit_job.job_weapons_arr[i]);
            }
            
            if (tags.length > 0) {
                tagify.addTags(tags);
            }
            
            function onRemoveTag(e){
                wepTags.splice(wepTags.indexOf(e.detail.value), 1);
                self.vue.edit_job.job_weapons_arr = wepTags;
            }
            tagify.on('remove', onRemoveTag);
            
            function onAddTag(e) {
                wepTags.push(e.detail.value);
                self.vue.edit_job.job_weapons_arr = wepTags;
            }
            tagify.on('add', onAddTag);
        }
    });
    
    /*
        Spectrum:
                https://github.com/bgrins/spectrum
    */
    Vue.component('color-it', {
        template: '<input/>',
        mounted: function() {
            $("#job_color_input").spectrum({
                preferredFormat: "hex",
                showInput: true,
                color: "#" + self.vue.selected_job.color,
                change: function() {
                    self.set_rgb();
                }
            });
        },
        beforeDestroy: function() {
            $("#job_color_input").spectrum("destroy");
        }
    });
    
    Vue.component('job-model', {
        template: '<input/>',
        mounted: function() {
            var availableTags = [];
            
            // We have to go inside of each array to extract the models.
            self.player_models.forEach(function(array) {
                array.forEach(function(obj) {
                    availableTags.push(obj.model);
                });
            });
            
            $("#job_model").autocomplete({
                source: availableTags
            });
        }
    });
    
    
    // FUNCTIONS //
    
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k = 0;
        return v.map(function(e) {
            e._idx = k++;
        });
    };
    
    /*
        Scrolls an element into view
        
        Source:
                https://stackoverflow.com/questions/5685589/scroll-to-element-only-if-not-in-view-jquery
    */
    var scrollIntoViewIfNeeded = function(target, margin) {
        if (target != null) {
            var rect = target.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                target.scrollIntoView(false);
            }
            if (rect.top < 0) {
                target.scrollIntoView();
            }
            
            if (margin) {
                // Show the top of the box.
                var scrolledY = window.scrollY - 4;

                if (scrolledY) {
                    window.scroll(0, scrolledY);
                }
            }
        }
    }
    
    // Gets the jobs.
    self.get_jobs = function(scroll, changedTabs) {
        var vue = self.vue;
        
        vue.is_loading_results = true;
        isLoadingResults = true;
        
        // If we change from "Home" to "Community" jobs, or vice-versa, 
        // blank reset the jobs.
        if (changedTabs) {
            vue.jobs = [];
            vue.even_jobs = [];
            vue.odd_jobs = [];
        }
        
        $.post(jobs_url, {
            search: vue.search_form,
            page: vue.current_page,
            min_p: vue.min_players,
            max_p: vue.max_players,
            min_s: vue.min_salary,
            max_s: vue.max_salary,
            weps: vue.checked_weapons,
            tags: vue.checked_tags,
            time_range: vue.selected_time_range,
            sort: vue.selected_sort,
            public: vue.selected_public,
            public_jobs: vue.public_jobs,
            custom_model: vue.custom_model,
            vote_only: vue.vote_only,
            admin_only: vue.admin_only
        }, function (data) {
            vue.jobs = data.jobs;
            
            // If we retrieved 0 jobs, and we're not on page 1, retry.
            if (vue.jobs.length == 0 && vue.current_page != 1 && data.pages > 0)  {
                vue.current_page = data.pages;
                self.get_jobs();
                return;
            }
            
            if (vue.first_load) {
                vue.first_load = false;
            }
            
            // Even jobs belong to the left column
            vue.even_jobs = [];
            // Odd jobs belong to the right column
            vue.odd_jobs = [];
            
            for (var i = 0; i < self.vue.jobs.length; i++) {
                if (i % 2 == 0) {
                    vue.even_jobs.push(self.vue.jobs[i]);
                } else {
                    vue.odd_jobs.push(self.vue.jobs[i]);
                }
            }
            
            // Scroll the first job into view
            if (scroll) {
                setTimeout(function() {
                    var e = document.getElementById("even_job_0");
                    if (e == null) {
                        e = document.getElementById("mainRow");
                    }
                    scrollIntoViewIfNeeded(e, true);
                }, 0)
            }
            
            // Page stats
            vue.count = data.count;
            vue.pages = data.pages;
            
            // Set the current page.
            vue.current_page = data.page;
            
            // Set the new URL.
            self.set_new_url();
            
            // We are done loading.
            vue.is_loading_results = false;
            isLoadingResults = false;
        })
    };
    
    // Gets a specific job
    self.get_job_by_id = function(view_id) {
        var vue = self.vue;
        
        $.post(get_job_url, 
            {
                job_id: view_id
            },
            function(data) {
                if (!data.error) {
                    self.show_job_details(data.job);
                }
            }
        );
    }
    
    // Fetches job results and loads the first page.
    self.fetch_new_results = function(scroll, changedTabs) {
        self.vue.current_page = 1;
        self.get_jobs(scroll, changedTabs);        
    }
    
    /*
        Sets the page URL.
        Note: The main page is never redirected. Only the URL is updated.
    */
    self.set_new_url = function() {
        var vue = self.vue;
        var pp = {};
        
        var view_id = vue.view_id;
        
        if (view_id != null) {
            pp.view_id = view_id;
        } else {
            var search = vue.search_form;
            var page = vue.current_page;

            var min_p = vue.min_players;
            var max_p = vue.max_players;

            var min_s = vue.min_salary;
            var max_s = vue.max_salary;

            var time_range = vue.selected_time_range;
            var selected_sort = vue.selected_sort;
            var selected_public = vue.selected_public;

            if (search != null && search != "") {
                pp.search = vue.search_form;
            }

            if (page != null) {
                pp.page = vue.current_page;
            }

            if (min_p != null && min_p != "") {
                pp.min_p = vue.min_players;
            }

            if (max_p != null && max_p != "") {
                pp.max_p = vue.max_players;
            }

            if (min_s != null && min_s != "") {
                pp.min_s = vue.min_salary;
            }

            if (max_s != null && max_s != "") {
                pp.max_s = vue.max_salary;
            }

            if (vue.checked_weapons.length != 0) {
                pp.weps = vue.checked_weapons;
            }
            
            if (vue.checked_tags.length != 0) {
                pp.tags = vue.checked_tags;
            }

            if (time_range != null) {
                pp.time_range = time_range;
            }

            if (selected_sort != null) {
                pp.sort = selected_sort
            }
            
            if (selected_public != null) {
                pp.public = selected_public;
            }
        }
        
        // Replace the URL in-place
        var url = main_url + "?" + $.param(pp);
        window.history.replaceState(null, null, url);
    }
    
    // Sets the page to previous page.
    self.prev_page = function() {
        if (self.vue.current_page > 1) {
            self.set_page(self.vue.current_page - 1);
        }
    }
    
    // Sets the page to the next page.
    self.next_page = function() {
        if (self.vue.current_page < self.vue.pages) {
            self.set_page(self.vue.current_page + 1);
        }
    }
    
    // Sets the page.
    self.set_page = function(page) {
        if (!self.vue.is_loading_results) {
            self.vue.current_page = page;
            self.get_jobs(true);
        }
    }
    
    // Fetches Workshop details for a player model on the Steam Workshop.
    self.get_workshop = function() {
        var id = self.vue.view_id
        $.post(workshop_url,
            {
                id: self.vue.selected_job.workshop
            },
            function (data) {
                if (self.vue.view_id == id) {
                    self.vue.job_workshop_title = data.title;
                    self.vue.job_workshop_size = (data.size / 1048576).toFixed(2) + " MB";
                }
            }
        );
    }
    
    self.scroll_to_top_of_job = function() {
        // Scroll to the top of the job's panels.
        setTimeout(function() {
            self.scroll_to("jobDetailsRow", "start");
        }, 0);
    }
    
    /*
        Shows the job details page (when a user clicks on a job).
        
        Resource:
                https://stackoverflow.com/questions/6623231/remove-all-white-spaces-from-text
    */
    self.show_job_details = function(job) {
        var vue = self.vue;
        
        // Store the vertical scroll position
        self.vue.scroll_top = $(window).scrollTop();
        
        // Make a deep copy of the object.
        vue.selected_job = jQuery.extend(true, {}, job);
        
        // More details.
        vue.job_command = (vue.selected_job.job_id.toLowerCase()).replace(/ /g,'');
        vue.job_color_rgb = self.hex_to_rgb(vue.selected_job.color);
        vue.job_weapons = vue.selected_job.weapons.join(", ");
        vue.job_weapons_arr = vue.selected_job.weapons;
        vue.job_mine = (vue.selected_job.created_by == my_username);
        vue.text_color = self.get_text_class(vue.selected_job.color);
        
        // Resources
        vue.job_resources = JSON.parse(vue.selected_job.resources);
        
        // The job ID
        vue.view_id = vue.selected_job.id;
        
        // We are now showing the job details
        vue.showing_job_details = true;
        
        // Reset the tab to the first.
        vue.job_current_tab = 0;
        
        if (vue.selected_job.workshop) {
            // Reset the Workshop details
            vue.job_workshop_title = "Loading...";
            vue.job_workshop_size = "Loading...";
            
            // Fetch the Workshop item details, if necessary.
            self.get_workshop();
        }
        
        // Get the job's comments.
        self.get_comments();
        
        // Set the new URL.
        self.set_new_url();
        
        // Scroll
        self.scroll_to_top_of_job();
    }
    
    // Closes the job details page.
    self.close_job_details = function() {
        var vue = self.vue;
        // We are no longer editing a job/or waiting for it to process.
        vue.edit_waiting = false;
        vue.editing_job = false;
        
        // Hide the comment error
        vue.comment_error = null;
        
        // We are no longer waiting for a comment to process.
        vue.adding_comment = false;
        
        // We are no longer showing job details.
        vue.showing_job_details = false;
        vue.view_id = null;
        
        // Set the URL
        self.set_new_url();
        
        // Set the vertical scroll position
        setTimeout(function() {
            $(window).scrollTop(self.vue.scroll_top);
        }, 0);
    }
    
    // Gets comments
    self.get_comments = function() {
        $.post(comments_url,
            {
                start: 0,
                end: 5,
                id: self.vue.view_id
            },
            function (data) {
                self.vue.comments = data.comments;
                self.vue.has_more = data.has_more;
                self.vue.logged_in = data.logged_in;
                enumerate(self.vue.comments);
            });
    };
    
    // Adds a comment
    self.add_comment = function () {
        if (self.vue.adding_comment) {
            return;
        } else {
            self.vue.adding_comment = true;

            // The submit button to add a track has been added.
            $.post(add_comment_url,
                {
                    id: parseInt(self.vue.view_id),
                    body: self.vue.comment_form
                },
                function (data) {
                    var vue = self.vue;
                    if (data.error != null) {
                        vue.comment_error = data.error;
                    } else {
                        vue.comment_form = null;
                        vue.comment_error = null;
                        vue.comments.unshift(data.comment);
                        enumerate(self.vue.comments);
                    }
                    vue.adding_comment = false;
                });
        }
    };
    
    // Gets more comments
    self.get_more = function() {
        var num_comments = self.vue.comments.length;
        
        $.post(comments_url,
            {
                start: num_comments,
                end: num_comments + 5,
                id: self.vue.view_id
            },
            function (data) {
                self.vue.has_more = data.has_more;
                self.extend(self.vue.comments, data.comments);
                enumerate(self.vue.comments);
            }
        );
    };
        
    // Toggles the edit page of a job.
    self.toggle_edit_job = function() {
        var vue = self.vue;
        // Prevent toggling editing for this job until we hear 
        // back from the server.
        if (vue.edit_waiting) {
            return false;
        }
        
        vue.edit_errors = {};
        
        // Usernames are unique, so this is fine.
        if (vue.job_mine) {
            vue.editing_job = !vue.editing_job;
            vue.edit_waiting = false;
            
            if (vue.editing_job) {
                // Switch to the 'Details' tab
                self.open_tab(0);
                
                vue.edit_errors = {};
                vue.edit_job = jQuery.extend(true, {}, vue.selected_job);       
                
                vue.edit_job.job_command = (vue.selected_job.job_id.toLowerCase()).replace(/ /g,'');
                vue.edit_job.job_weapons = vue.selected_job.weapons.join(", ");
                vue.edit_job.job_weapons_arr = vue.selected_job.weapons;
                
                vue.edit_job_resources = JSON.parse(vue.selected_job.resources);
            } else {
                // Scroll
                self.scroll_to_top_of_job();
            }
        }
    }
    
    // Updates the job details.
    self.update_job_details = function(job) {
        var vue = self.vue;
        
        // Make a deep copy of the object.
        vue.selected_job = jQuery.extend(true, {}, job);
        
        // More details.
        vue.job_command = (vue.selected_job.job_id.toLowerCase()).replace(/ /g,'');
        vue.job_color_rgb = self.hex_to_rgb(vue.selected_job.color);
        vue.job_weapons = vue.selected_job.weapons.join(", ");
        vue.job_weapons_arr = vue.selected_job.weapons;
        vue.job_mine = (vue.selected_job.created_by == my_username);
        vue.text_color = self.get_text_class(vue.selected_job.color);
        
        // Resources
        vue.job_resources = JSON.parse(vue.selected_job.resources);
        
        if (vue.selected_job.workshop) {
            // Reset the Workshop details
            vue.job_workshop_title = "Loading...";
            vue.job_workshop_size = "Loading...";

            // Fetch the Workshop item details, if necessary.
            self.get_workshop();
        }
    }
    
    // The order is the level of priority from the top
    self.error_order = ["job_name", "job_job_id", "job_desc", "job_tag", "job_salary", "job_max_players", "job_vote", "job_admin_only", "job_weapons", "job_color", "job_model", "job_workshop", "job_suggested_model", "job_resources"];
    
    self.scroll_to_top_error = function(errors) {
        for (var i = 0; i < self.error_order.length; i++) {
            var name = self.error_order[i];
            if (errors[name] != null) {
                self.scroll_to(name + "_input", "center");
                break;
            }
        }
    }
    
    // Submits changes made to a job.
    self.submit = function() {
        var vue = self.vue;
        vue.edit_waiting = true;
        
        // Disable the button
        $("#submit_button").prop("disabled", true);
        
        // Grab the edit job resources
        var res = [];
        for (var i = 0; i < Math.min(self.vue.edit_job_resources.length, 3); i++) {
            var job = self.vue.edit_job_resources[i];
            res.push({"name": job.name, "url": job.url});
        }        
        self.vue.edit_job_resources.json = JSON.stringify(res);
        
        // Remove errors
        vue.edit_errors = {};
        
        $.post(update_job_url,
            {
                job_id: vue.edit_job.id,
                job_job_id: vue.edit_job.job_id,
                job_name: vue.edit_job.name,
                job_desc: vue.edit_job.description,
                job_model: vue.edit_job.model,
                job_workshop: vue.edit_job.workshop,
                job_suggested_model: vue.edit_job.suggested_model,
                job_salary: vue.edit_job.salary,
                job_max_players: vue.edit_job.max_players,
                job_color: vue.edit_job.color,
                job_weapons: vue.edit_job.job_weapons_arr,
                job_tag: vue.edit_job.tag,
                job_vote: vue.edit_job.vote,
                job_admin_only: vue.edit_job.admin_only,
                job_resources: vue.edit_job_resources.json
            },
            function (data) {
                if (data.errors) {
                    var vue = self.vue;
                    
                    var errors = data.form.errors;
                    vue.edit_errors = errors;
                    
                    // Scroll to the highest error
                    self.scroll_to_top_error(errors);
                    
                    // Re-enable the button
                    $("#submit_button").prop("disabled", false);
                    
                    // Done
                    vue.edit_waiting = false;
                } else {
                    var job = data.job;
                    
                    if (job != null) {
                        // The form doesn't have errors, so update the job.
                        for (var i = 0; i < self.vue.jobs.length; i++) {
                            if (job.id == self.vue.jobs[i].id) {
                                // Set the new job
                                self.vue.$set(self.vue.jobs, i, job);
                                if (i % 2 == 0) {
                                    self.vue.$set(self.vue.even_jobs, Math.floor(i/2), job);
                                } else {
                                    self.vue.$set(self.vue.odd_jobs, Math.floor(i/2), job);
                                }
                                break;
                            }
                        }
                        
                        // Only show the new details if we're viewing the same job
                        if (self.vue.view_id == job.id) {
                            // We must have been waiting for the edit to complete.
                            if (self.vue.edit_waiting) {
                                // Done
                                self.vue.edit_waiting = false;
                                // Toggle edit job
                                self.toggle_edit_job();
                            }
                            // Update the new job details
                            self.update_job_details(job);
                        }
                        
                        // Update the jobs page.
                        self.get_jobs();
                    } else {
                        // The job doesn't exist anymore, so just go to un-edit mode.
                        if (self.vue.edit_waiting) {
                            // Done
                            self.vue.edit_waiting = false;
                            // Toggle edit job
                            self.toggle_edit_job();
                        }
                    }
                }
            }
        );
    }
    
    // Sets the RGB value for the color input.
    self.set_rgb = function() {
        var hex = $("#job_color_input").spectrum("get").toHex();
        var bigint = parseInt(hex, 16);
        
        var r = ((bigint >> 16) & 255);
        var g =  ((bigint >> 8) & 255);
        var b = (bigint & 255);
        
        self.vue.edit_job.color = hex;
    }
    
    /*
        Converts a color represented by Hex to RGB
        
        Source:
                https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    */
    self.hex_to_rgb = function(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return [r, g, b];
    }
    
    // Shows the player model page.
    self.show_player_models = function() {
        self.vue.showing_player_models = true;
        
        // Store the vertical scroll position
        self.vue.edit_scroll = $(window).scrollTop();
        
        setTimeout(function() {
            self.scroll_to("details", "start");
        }, 100);
    }
    
    // Hides the player model page.
    self.close_player_models = function() {
        self.vue.showing_player_models = false;
        
        // Restore the vertical scroll position
        setTimeout(function() {
            $(window).scrollTop(self.vue.edit_scroll);
        }, 0);
    }
    
    // Called when a user clicks on a player model.
    self.select_player_model = function(model) {
        // Set the input field
        self.vue.edit_job.model = model;
        
        // Close the player model page
        self.close_player_models();
    }
    
    // Toggles the visibility of a job (makes it either private or public).
    self.toggle_public = function() {
        var vue = self.vue;
        
        $.post(toggle_job_url,
            {
                job_id: vue.view_id
            },
            function (data) {
                self.vue.selected_job.is_public = data.is_public;
                self.get_jobs();
            }
        ); 
    }
    
    // Deletes a job.
    self.delete_job = function() {
        var vue = self.vue;
        
        $.post(delete_job_url, 
            {
                job_id: vue.view_id
            },
            function(data) {
                if (!data.error) {
                    // Close the job details
                    self.close_job_details();
                    
                    // Fetch jobs.
                    self.get_jobs();
                }
            }
        );
    }
    
    // Gets the image URL to a player model
    self.get_model_url = function(mdl) {
        if (self.player_models_object[mdl] == null) {
            return image_url + "/question_mark.jpg";
        }
        return image_url + "/" + self.player_models_object[mdl];
    }
    
    /*
        Gets the proper text class for light or dark text.
        This is used to provide enough contrast between text and its background.
        
        Source:
            https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    */
    self.get_text_class = function(bgColor) {
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
        return (L > 0.179) ? "textColorBlack" : "textColorWhite";
    }
    
    // Opens a tab in the job details page.
    self.open_tab = function(idx) {
        self.vue.job_current_tab = idx;
    }
    
    // Copies the GLua code (from the 'Code' tab).
    self.copy_code = function() {
            $("#copyButton").text("Copied!");
            setTimeout(function() {
                $("#copyButton").text("Copy");
                copied = false;
            }, 1000);
            
            var $temp = $("<textarea>");
            $("body").append($temp);
            $temp.val($("#genCode").text()).select();
            document.execCommand("copy");
            $temp.remove();
    }
    
    // Formats a money amount with commas.
    self.comma = function(str) {
        str = String(str)
        
        if (str.length < 4) {
            return str;
        } else {
            var i = str.length - 3;
            var newStr = "";
            
            while (i >= 0) {
                newStr = "," + str.substring(i, i+3) + newStr;
                i = i - 3;
            }
            
            newStr = str.substring(0, i+3) + newStr;
            return newStr;
        }
    }
    
    /*
        Attempts to scroll an element to the middle of the screen.
        Source:
                https://mikeauteri.com/2014/08/19/use-jquery-to-center-element-in-viewport/
    */
    self.scroll_to = function(id, pos) {
        var e = document.getElementById(id);
        e.scrollIntoView({behavior: "instant", block: pos});
        
        // Show the top of the box.
        var scrolledY = window.scrollY - 2;
        
        if (scrolledY) {
            window.scroll(0, scrolledY);
        }
    }
    
    /*
        Formats a URL.
        
        Source:
            https://stackoverflow.com/questions/3543187/prepending-http-to-a-url-that-doesnt-already-contain-http
    */
    self.format_url = function(url) {
        if (!/^https?:\/\//i.test(url)) {
            url = "http://" + url;
        }
        return url;
    }
    
    // Resource functions
    self.add_resource = function() {
        var vue = self.vue;
        if (vue.edit_job_resources.length < 3) {
            vue.edit_job_resources.push({ name: "", url: "" });
        }
    }
    
    self.delete_resource = function(idx) {
        var vue = self.vue;
        if (idx != null && vue.edit_job_resources[idx] != null) {
            // Remove the resource.
            vue.edit_job_resources.splice(idx, 1);
        }
    }
    
    // Clears the filters
    self.clear_filters = function() {
        var vue = self.vue;
        
        // Regular filters
        vue.search_form = null;
        
        vue.min_players = null;
        vue.max_players = null;
        
        vue.min_salary = null;
        vue.max_salary = null;
        
        vue.checked_weapons = [];
        vue.checked_tags = [];
        
        vue.selected_time_range = "any";
        vue.selected_sort = "newest";
        
        // Misc. filters
        vue.public_jobs = false;
        vue.vote_only = false;
        vue.admin_only = false;
        vue.custom_model = false;
        
        // Close the pannels
        $("#filterTags").collapse("hide");
        $("#filterWeapons").collapse("hide");
        $("#filterSalary").collapse("hide");
        $("#filterMaxPlayers").collapse("hide");
        $("#filterMisc").collapse("hide");
        
        // Fetch new results
        self.fetch_new_results();
    }
    
    // Vue.js router
    var router = new VueRouter({
        mode: 'history',
        routes: []
    });
    
    // Vue object
    self.vue = new Vue({
        router,
        el: "#vue-div-main",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            jobs: [],
            even_jobs: [],
            odd_jobs: [],
            count: 0,
            pages: 0,
            current_page: 1,
            
            // Filter options
            tags: ["Citizen", "Commercial", "Criminal", "Fun", "Government", "OP", "Misc."],
            checked_weapons: [],
            checked_tags: [],
            
            search_form: null,
            
            min_salary: null,
            max_salary: null,
            
            min_players: null,
            max_players: null,
            
            
            //// Misc. filter options ////
            
            // True means that we want to show all of our public jobs.
            public_jobs: false,
            
            // True means that we want jobs with Workshop models
            custom_model: false,
            
            vote_only: false,
            admin_only: false,
            
            ////
            
            selected_public: true,
            is_loading_results: false,
            
            selected_time_range: "any",
            selected_sort: "newest",
            
            // Job details page variables
            showing_job_details: false,
            selected_job: null,
            job_job_id: null,
            job_command: null,
            job_name: null,
            job_desc: null,
            job_model: null,
            job_salary: null,
            job_max_players: null,
            job_color: null,
            job_color_rgb: null,
            job_weapons: null,
            job_weapons_arr: null,
            
            job_vote: null,
            job_admin_only: null,
            
            // Workshop
            job_workshop_title: "",
            job_workshop_size: "",
            
            job_resources: [],
            
            // Whether the job belongs to the user or not.
            job_mine: false,
            
            // The job ID the user is currently viewing.
            view_id: null,
            
            // 0 = 'Details', 1 = 'Code', 2 = 'Comments'
            job_current_tab: 0,
            
            // Comments
            has_more: false,
            adding_comment: false,
            comments: [],
            comment_form: null,
            comment_error: null,
            
            // Job editing
            editing_job: false,
            edit_waiting: false,
            
            edit_job: null,
            
            edit_job_job_id: "",
            edit_job_name: null,
            edit_job_desc: null,
            edit_job_model: null,
            edit_job_salary: null,
            edit_job_max_players: null,
            
            edit_job_color: "",
            edit_job_color_arr: [],
            
            edit_job_weapons_arr: [],
            edit_job_vote: null,
            edit_job_admin_only: null,
            edit_job_tag: null,
            
            edit_scroll: 0,
            
            // Resources
            edit_job_resources: [{"name": "", "url": ""}],
            edit_job_resources_json: "",
            
            // Edit errors
            edit_errors: {},
            
            
            // Player models page
            showing_player_models: false,
            player_models: self.player_models,
            image_url: player_model_image_url,
            
            // Misc. variables
            first_load: true,
            weps: self.weapons,
            my_username: my_username,
            scroll_top: 0
        },
        methods: {
            // Set new URL
            set_new_url: self.set_new_url,
            
            // Get jobs
            get_jobs: self.get_jobs,
            fetch_new_results: self.fetch_new_results,
            
            // Clear filters
            clear_filters: self.clear_filters,
            
            // Page functions
            prev_page: self.prev_page,
            next_page: self.next_page,
            set_page: self.set_page,
            
            // Job details page
            show_job_details: self.show_job_details,
            close_job_details: self.close_job_details,
            
            // Comment functions
            add_comment: self.add_comment,
            get_more: self.get_more,
            
            // Job editing
            is_job_id: isJobID,
            is_job_name: isJobName,
            is_job_description: isJobDescription,
            toggle_edit_job: self.toggle_edit_job,
            submit: self.submit,
            
            // Player model page
            show_player_models: self.show_player_models,
            close_player_models: self.close_player_models,
            select_player_model: self.select_player_model,
            
            // Job visibility
            toggle_public: self.toggle_public,
            
            // Job deletion
            delete_job: self.delete_job,
            
            // Add and delete resource
            add_resource: self.add_resource,
            delete_resource: self.delete_resource,
            
            // Misc. functions
            comma: self.comma,
            get_model_url: self.get_model_url,
            get_text_class: self.get_text_class,
            open_tab: self.open_tab,
            copy_code: self.copy_code,
            format_url: self.format_url
        }
    });
    
    /*
        Set variables from the URL parameters.
        
        Resource:
                https://stackoverflow.com/questions/35914069/vue-js-query-parameters
    */
    // Search by job title
    self.vue.search_form = self.vue.$route.query.search;
    
    // The current page
    self.vue.current_page = Math.max(1, ((self.vue.$route.query.page != null) ? self.vue.$route.query.page : 1))
    
    // Sort by newest or recently updated
    self.vue.selected_sort = self.vue.$route.query.sort != null ? self.vue.$route.query.sort : "newest";
    
    // Double-check the given sort.
    var sort = self.vue.selected_sort;
    if (sort != "newest" && sort != "recent") {
        self.vue.selected_sort = "newest";
    }
    
    
    // Sort by time range
    self.vue.selected_time_range = self.vue.$route.query.time_range != null ? self.vue.$route.query.time_range : "any";
    
    // Double-check the given time range.
    var time = self.vue.selected_time_range;
    if (time != "any" && time != "day" && time != "week" && time != "month" && time != "year") {
        self.vue.selected_time_range = "any";
    }
    
    
    ////
    
    /* Public or private jobs? */
    self.vue.selected_public = (self.vue.$route.query.public != "false") 
    
    // Set the highlight of one of the top bottoms.
    if (self.vue.selected_public) {
        $("#jobsLink").addClass("active");
        $("#header_text").text("Community");
    } else {
        $("#homeLink").addClass("active");
        $("#header_text").text("Your Jobs");
    }
    
    ////
    
    // Range for max players
    self.vue.min_players = self.vue.$route.query.min_p;
    self.vue.max_players = self.vue.$route.query.max_p;
    
    // Range for job salary
    self.vue.min_salary = self.vue.$route.query.min_s;
    self.vue.max_salary = self.vue.$route.query.max_s;
    
    // Get the weapons
    var wepArr = self.vue.$route.query["weps[]"];
    self.vue.checked_weapons = (wepArr != null) ? wepArr : [];
    
    // Convert it to an array, if necessary.
    if ((typeof wepArr) == "string") {
        self.vue.checked_weapons = [ wepArr ];
    }
    
    // Get the job tags/types
    var tagArr = self.vue.$route.query["tags[]"];
    self.vue.checked_tags = (tagArr != null) ? tagArr : [];
    
    // Convert it to an array, if it's a string.
    if ((typeof tagArr) == "string") {
        self.vue.checked_tags = [ tagArr ];
    }
    
    // Get the view id
    var view_id = self.vue.$route.query.view_id;
    if (view_id) {
        self.get_job_by_id(view_id);
    }
    
    // Get the corresponding jobs.
    self.get_jobs();
    
    // Show the Vue div.
    $("#vue-div-main").show();
    
    return self;
};

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
});