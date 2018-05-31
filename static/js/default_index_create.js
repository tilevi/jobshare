/*
    File:
            default_index_create.js
    Purpose:
            Holds the Vue.js code for the job creation page.
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
            var input = document.querySelector("#weaponTags");
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
            $("#colorpicker").spectrum({
                preferredFormat: "hex",
                showInput: true,
                color: "#" + ((self.vue) != null ? self.vue.job_color : "23B5EB"),
                change: function() {
                    self.vue.set_rgb();
                }
            });
        },
        beforeDestroy: function() {
            $("#colorpicker").spectrum("destroy");
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
    
    // Submits the form.
    self.submit = function(makePublic) {
        if (makePublic) {
            $("#submit_share_button").prop("disabled", true);
        } else {
            $("#submit_button").prop("disabled", true);
        }
        
        // Clear the errors.
        self.vue.job_errors = {}
        
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
                weps: self.vue.job_weapons_arr,
                job_tag: $("#tag_form").val(),
                job_vote: self.vue.job_vote ? 1 : 0,
                job_admin_only: self.vue.job_admin_only ? 1 : 0,
                
                make_public: makePublic ? 1 : 0
            },
            function (data) {
                if (data.errors) {
                    var vue = self.vue;
                    vue.job_errors = data.form.errors;
                    
                    // Re-enable the button
                    if (makePublic) {
                        $("#submit_share_button").prop("disabled", false);
                    } else {
                        $("#submit_button").prop("disabled", false);
                    }
                } else {
                    // The form doesn't have errors, so redirect.
                    window.location.replace(default_url);
                }
            }
        );
    }
    
    // Submits a job (to be made public)
    self.submit_share = function() {
        $("#submit_share_button").prop("disabled", true);
        self.submit(true);
    }
    
    
    // Below are functions to check job information entry
    // Of course, input is also checked server-side.
    
    /* 
        Checks the Job/Team ID
        
        Sources:
            http://jsfiddle.net/gargdeendayal/4qqza69k/
            https://stackoverflow.com/questions/39782176/filter-input-text-only-accept-number-and-dot-vue-js
    */
    self.is_job_id = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
        
        if(charCode === 32 || !(charCode == 95 || (charCode >= 65 && charCode <= 90) || (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 122))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
    // Checks the job name
    self.is_job_name = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
           
        if(!(charCode == 32 || (charCode >= 48 && charCode <= 57) || (charCode == 39) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
    // Checks the job description
    self.is_job_description = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
           
        if(!(charCode === 32 || charCode == 33 || charCode == 46 || charCode == 39 || charCode == 44 || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode >= 48 && charCode <= 57))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
    // Copies the code (located at the bottom of the page).
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
    self.scroll_to_middle = function(id) {
        var $window = $(window),
        $element = $(id),
        elementTop = $(id)[0].getBoundingClientRect().top + $(window)['scrollTop'](),
        elementHeight = $element.height(),
        viewportHeight = $window.height(),
        scrollIt = elementTop - ((viewportHeight - elementHeight) / 2);
        
        $window.scrollTop(scrollIt);
    }
    
    // Shows the player models page.
    self.show_player_models = function() {
        var position = $("#job_info").offset();
        scroll(0, position.top);
        
        self.vue.showing_player_models = true;
    }
    
    // Closes the player models page.
    self.close_player_models = function() {
        self.vue.showing_player_models = false;
        
        setTimeout(function() {
            self.scroll_to_middle("#job_model");
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
        var hex = $("#colorpicker").spectrum("get").toHex();
        var bigint = parseInt(hex, 16);
        
        var r = ((bigint >> 16) & 255);
        var g =  ((bigint >> 8) & 255);
        var b = (bigint & 255);
        
        self.vue.job_color = hex;
        self.vue.job_color_arr = [r, g, b];
    }
    
    // The Vue object
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
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
            job_vote: null,
            job_admin_only: null,
            job_tag: null,
            
            // Job errors
            job_errors: {},
            
            // Player models
            showing_player_models: false,
            player_models: self.player_models,
            
            // Miscellaneous variables
            image_url: image_url,
            weps: self.weps,
        },
        methods: {
            // Input field enforcers
            is_job_id: self.is_job_id,
            is_job_name: self.is_job_name,
            is_job_description: self.is_job_description,
            
            // Copy code function
            copy_code: self.copy_code,
            
            // Submit functions
            submit: self.submit,
            submit_share: self.submit_share,
            
            // Set RGB (for the color input field)
            set_rgb: self.set_rgb,
            
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