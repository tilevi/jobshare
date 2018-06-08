/*
    File:
            default_index_create.js
    Purpose:
            Holds the Vue.js code for the job creation page.
    
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

var app = function() {
    var self = {};
    
    // Vue configuration
    Vue.config.silent = false;
    Vue.config.ignoredElements = ['tags'];
    
    // Vue components
    Vue.component('tag-it', {
        template: '<input/>',
        mounted: function() {
            var input = document.querySelector("#job_weapons_input");
            self.tagify = new Tagify(input, {
                whitelist: self.wepClasses,
                suggestionsMinChars: 0
            });
            
            // Weapons
            var wepTags = ((self.vue != null) && (self.vue.job_weapons_arr != null)) ? self.vue.job_weapons_arr : [];
            
            var realWepTags = [];
            
            wepTags.forEach(function(e) {
                realWepTags.push({value: e});
            });
            
            // Add the existing tags (if any).
            if (realWepTags.length > 0) {
                self.tagify.addTags(realWepTags);
            }
            
            function onRemoveTag(e){
                wepTags.splice(wepTags.indexOf(e.detail.value), 1);
                self.vue.job_weapons_arr = wepTags;
                self.vue.job_weapons = JSON.stringify(wepTags);
            }
            self.tagify.on('remove', onRemoveTag);
            
            function onAddTag(e) {
                wepTags.push(e.detail.value);
                self.vue.job_weapons_arr = wepTags;
                self.vue.job_weapons = JSON.stringify(wepTags);
            }
            self.tagify.on('add', onAddTag);
        },
        beforeDestroy: function() {
            self.tagify.destroy();
        }
    });
    
    Vue.component('color-it', {
        template: '<input/>',
        mounted: function() {
            $("#job_color_input").spectrum({
                preferredFormat: "hex",
                showInput: true,
                color: "#" + ((self.vue) != null ? self.vue.job_color : "23B5EB"),
                change: function() {
                    self.set_rgb();
                }
            });
        },
        beforeDestroy: function() {
            $("#job_color_input").spectrum("destroy");
        }
    });
    
    // Player models
    self.player_models = player_models;
    self.weps = weapons;
    
    // Weapons
    self.wepClasses = [];
    self.weps.forEach(function(wepObj) {
        self.wepClasses.push(wepObj.class);
    });
    
    //// FUNCTIONS /////
    
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
    
    // Submits the form.
    self.submit = function(makePublic) {
        if (makePublic) {
            $("#submit_share_button").prop("disabled", true);
        } else {
            $("#submit_button").prop("disabled", true);
        }
        
        // Grab the job resources
        var res = [];
        for (var i = 0; i < Math.min(self.vue.job_resources.length, 3); i++) {
            var job = self.vue.job_resources[i];
            res.push({"name": job.name, "url": job.url});
        }        
        self.vue.job_resources.json = JSON.stringify(res);
        
        // Clear the errors.
        self.vue.job_errors = {}
        
        // Waiting..
        self.vue.waiting = true;
        
        $.post(create_job_url,
            {
                job_job_id: self.vue.job_job_id,
                job_name: self.vue.job_name,
                job_desc: self.vue.job_desc,
                job_workshop: self.vue.job_workshop,
                job_suggested_model: self.vue.job_suggested_model,
                job_model: self.vue.job_model,
                job_salary: self.vue.job_salary,
                job_max_players: self.vue.job_max_players,
                job_color: self.vue.job_color,
                job_weapons: self.vue.job_weapons_arr,
                job_tag: self.vue.job_tag,
                job_vote: self.vue.job_vote,
                job_admin_only: self.vue.job_admin_only,
                job_make_public: makePublic,
                job_resources: self.vue.job_resources.json
            },
            function (data) {
                if (data.errors) {
                    var vue = self.vue;
                    vue.job_errors = data.form.errors;
                    
                    // Scroll to the highest error
                    self.scroll_to_top_error(vue.job_errors);
                    
                    // Re-enable the button
                    if (makePublic) {
                        $("#submit_share_button").prop("disabled", false);
                    } else {
                        $("#submit_button").prop("disabled", false);
                    }
                } else {
                    // The form doesn't have errors, so redirect.
                    if (makePublic) {
                        window.location.replace(default_url);
                    } else {
                        window.location.replace(home_url);
                    }
                }
                // We are no longer waiting.
                self.vue.waiting = false;
            }
        );
    }
    
    // Submits a job (to be made public)
    self.submit_share = function() {
        $("#submit_share_button").prop("disabled", true);
        self.submit(true);
    }
    
    /*
        Copies the GLua code (located at the bottom of the page).
        
        Code reference:
            https://stackoverflow.com/questions/35841557/adding-new-line-in-jquery
    */
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
    
    /*
        Scrolls to an element.
        
        Source:
            https://mikeauteri.com/2014/08/19/use-jquery-to-center-element-in-viewport/
    */
    self.scroll_to = function(id, pos) {
        var e = document.getElementById(id);
        e.scrollIntoView({behavior: "smooth", block: pos});
    }
    
    // Shows the player models page.
    self.show_player_models = function() {
        self.vue.showing_player_models = true;
        
        // Store the vertical scroll position
        self.vue.scroll = $(window).scrollTop();
        
        // We need to add a slight delay or it won't scroll on the first try.
        setTimeout(function() {
            self.scroll_to("createJobContainer", "start");
        }, 100);
    }
    
    // Closes the player models page.
    self.close_player_models = function() {
        self.vue.showing_player_models = false;
        
        // Restore the vertical scroll position
        setTimeout(function() {
            $(window).scrollTop(self.vue.scroll);
        }, 0);
    }
    
    /*
        Selects a player model.
        Once a PM is selected, we want to close the player models page.
    */
    self.select_player_model = function(model) {
        // Set the input field
        self.vue.job_model = model;
        
        // Close the player model page
        self.close_player_models();
    }
    
    // Sets the color of the job
    // This function is called when a user picks a color.
    self.set_rgb = function() {
        var hex = $("#job_color_input").spectrum("get").toHex();
        var bigint = parseInt(hex, 16);
        
        var r = ((bigint >> 16) & 255);
        var g =  ((bigint >> 8) & 255);
        var b = (bigint & 255);
        
        self.vue.job_color = hex;
        self.vue.job_color_arr = [r, g, b];
    }
    
    // Resource functions
    self.add_resource = function() {
        var vue = self.vue;
        if (vue.job_resources.length < 3) {
            vue.job_resources.push({ name: "", url: "" });
        }
    }
    
    self.delete_resource = function(idx) {
        var vue = self.vue;
        if (idx != null && vue.job_resources[idx] != null) {
            // Remove the resource.
            vue.job_resources.splice(idx, 1);
        }
    }
    
    // The Vue object
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            // Resources
            job_resources: [],
            job_resources_json: "",
            
            // Job fields
            job_command: null,
            job_job_id: "",
            job_name: null,
            job_desc: null,
            job_workshop: null,
            job_suggested_model: null,
            job_model: null,
            job_salary: null,
            job_max_players: null,
            job_color: "23B5EB",
            job_color_arr: [35, 181, 235],
            job_weapons: null,
            job_weapons_arr: [],
            job_vote: false,
            job_admin_only: false,
            job_tag: "Citizen",
            
            // Job errors
            job_errors: {},
            
            // Player models
            showing_player_models: false,
            player_models: self.player_models,
            
            // Miscellaneous variables
            image_url: image_url,
            weps: self.weps,
            scroll: 0,
            waiting: false
        },
        methods: {
            // Input field enforcers
            is_job_id: isJobID,
            is_job_name: isJobName,
            is_job_description: isJobDescription,
            
            // Add and delete resource
            add_resource: self.add_resource,
            delete_resource: self.delete_resource,
            
            // Copy code function
            copy_code: self.copy_code,
            
            // Submit functions
            submit: self.submit,
            submit_share: self.submit_share,
            
            // Player model page functions
            show_player_models: self.show_player_models,
            close_player_models: self.close_player_models,
            select_player_model: self.select_player_model
        }
    });
    
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
});