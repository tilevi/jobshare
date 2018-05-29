
// This is the js for the default/index.html view.

var app = function() {
    var self = {};
    
    self.player_models = [
        
        [
            {image: "alyx.png", model: "models/player/alyx.mdl"},
            {image: "medic07.png", model: "models/player/Group03m/male_07.mdl"},
            {image: "kleiner.png", model: "models/player/kleiner.mdl"},
            {image: "monk.png", model: "models/player/monk.mdl"}
        ],
        [
            {image: "police.png", model: "models/player/police.mdl"},
            {image: "combine.png", model: "models/player/combine_soldier.mdl"},
            {image: "combineelite.png", model: "models/player/combine_super_soldier.mdl"},
            {image: "gman.png", model: "models/player/gman_high.mdl"}
        ],
        [
            {image: "eli.png", model: "models/player/eli.mdl"},
            {image: "css_arctic.png", model: "models/player/arctic.mdl"},
            {image: "css_guerilla.png", model: "models/player/guerilla.mdl"},
            {image: "css_phoenix.png", model: "models/player/phoenix.mdl"}
        ]
    ];
    
    Vue.config.silent = false;
    Vue.config.ignoredElements = ['tags'];
    
    Vue.component('tag-it', {
        template: '<input/>',
        mounted: function() {
            console.log("Loaded again!");
            
            var input = document.querySelector("#weaponTags");
            self.tagify = new Tagify(input, {
                whitelist : [
                    "weapon_ar2", 
                    "weapon_glock", 
                    "weapon_shotgun", 
                    "weapon_crowbar", 
                    "weapon_rpg",
                    "weapon_glock",
                    "weapon_usp",
                    "weapon_p228",
                    "weapon_deagle",
                    "weapon_elite",
                    "weapon_fiveseven",
                    "weapon_m3",
                    "weapon_xm1014",
                    "weapon_galil",
                    "weapon_ak47",
                    "weapon_scout", 
                    "weapon_sg552",
                    "weapon_awp",
                    "weapon_g3sg1", 
                    "weapon_famas",
                    "weapon_m4a1",
                    "weapon_aug",
                    "weapon_sg550", 
                    "weapon_mac10",
                    "weapon_tmp",
                    "weapon_mp5navy",
                    "weapon_ump45",
                    "weapon_p90",
                    "weapon_m249"
                ],
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
            console.log("Trying to get destroyed.");
            self.tagify.destroy();
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
    
    Vue.component('color-it', {
        template: '<input/>',
        mounted: function() {
            $("#colorpicker").spectrum({
                preferredFormat: "hex",
                showInput: true,
                color: "#" + ((self.vue) != null ? self.vue.job_color : "23B5EB"),
                change: function() {
                    self.vue.setRGB();
                }
            });
        },
        beforeDestroy: function() {
            $("#colorpicker").spectrum("destroy");
        }
    });
    
    self.submit_share = function() {
        $("#submit_share_button").prop("disabled", true);
        self.submit(true);
    }
    
    self.submit = function(makePublic) {
        if (makePublic) {
            $("#submit_share_button").prop("disabled", true);
        } else {
            $("#submit_button").prop("disabled", true);
        }
        
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
                    console.log(data.form.errors);
                    
                    var vue = self.vue;
                    var errors = data.form.errors;

                    vue.job_job_id_error = data.form.errors.job_job_id;
                    vue.job_name_error = data.form.errors.job_name;
                    vue.job_desc_error = data.form.errors.job_desc;
                    vue.job_workshop_error = data.form.errors.job_workshop;
                    vue.job_model_error = data.form.errors.job_model;
                    vue.job_suggested_model_error = data.form.errors.job_suggested_model;
                    
                    vue.job_salary_error = data.form.errors.job_salary;
                    vue.job_max_players_error = data.form.errors.job_max_players;
                    vue.job_color_error = data.form.errors.job_color;

                    vue.job_weapons_error = data.form.errors.job_weapons;
                    vue.job_vote_error = data.form.errors.job_vote;
                    vue.job_admin_only_error = data.form.errors.job_admin_only;
                    
                    vue.job_tag_error = data.form.errors.job_tag;
                    
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
    
    self.setRGB = function() {
        var hex = $("#colorpicker").spectrum("get").toHex();
        var bigint = parseInt(hex, 16);
        
        var r = ((bigint >> 16) & 255);
        var g =  ((bigint >> 8) & 255);
        var b = (bigint & 255);
        
        self.vue.job_color = hex;
        self.vue.job_color_arr = [r, g, b];
    }
    
    /* Sources:
        http://jsfiddle.net/gargdeendayal/4qqza69k/
        https://stackoverflow.com/questions/39782176/filter-input-text-only-accept-number-and-dot-vue-js
    */
    self.isJobID = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
        
        if(charCode === 32 || !(charCode == 95 || (charCode >= 65 && charCode <= 90) || (charCode >= 48 && charCode <= 57) || (charCode >= 97 && charCode <= 122))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
    self.isJobName = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
           
        if(!(charCode == 32 || (charCode >= 48 && charCode <= 57) || (charCode == 39) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
    self.isJobDescription = function(e) {
        e = (e) ? e : window.event;
        var charCode = (e.which) ? e.which : e.keyCode;
           
        if(!(charCode === 32 || charCode == 33 || charCode == 46 || charCode == 39 || charCode == 44 || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode >= 48 && charCode <= 57))) {
            e.preventDefault();
        } else {
            return true;
        }
    }
    
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
    
    self.show_player_models = function() {
        // $("#weaponTags").remove();
        self.vue.showing_player_models = true;
    }
    
    self.close_player_models = function() {
        self.vue.showing_player_models = false;
        window.scrollTo(0, 0);
    }
    
    self.select_player_model = function(model) {
        // Set the input field
        self.vue.job_model = model;
        
        // Close the player model page
        self.close_player_models();
    }
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            tagify: null,
            
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
            
            job_job_id_error: null,
            job_name_error: null,
            job_desc_error: null,
            job_workshop_error: null,
            job_suggested_model_error: null,
            job_model_error: null,
            job_salary_error: null,
            job_max_players_error: null,
            job_color_error: null,
            job_weapons_error: null,
            job_vote_error: null,
            job_admin_only_error: null,
            job_tag_error: null,
            
            // Player models
            showing_player_models: false,
            player_models: self.player_models,
            image_url: image_url
        },
        methods: {
            setRGB: self.setRGB,
            isJobID: self.isJobID,
            isJobName: self.isJobName,
            isJobDescription: self.isJobDescription,
            copy_code: self.copy_code,
            submit: self.submit,
            submit_share: self.submit_share,
            
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