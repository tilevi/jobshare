
// This is the js for the default/index.html view.

var app = function() {
    var self = {};
    Vue.config.silent = false;
    Vue.config.ignoredElements = ['tags'];
    
    Vue.component('tag-it', {
        template: '<input/>',
        mounted: function() {
            var input = document.querySelector("#weaponTags");
            var tagify = new Tagify(input, {
                whitelist : ["weapon_ak47", "weapon_ar2"]
            });
            
            // Weapons
            var wepTags = [];
            
            function onRemoveTag(e){
                wepTags.splice(wepTags.indexOf(e.detail.value), 1);
                self.vue.job_weapons_arr = wepTags;
                self.vue.job_weapons = JSON.stringify(wepTags);
            }
            tagify.on('remove', onRemoveTag);
            
            function onAddTag(e) {
                wepTags.push(e.detail.value);
                self.vue.job_weapons_arr = wepTags;
                self.vue.job_weapons = JSON.stringify(wepTags);
            }
            tagify.on('add', onAddTag);
        },
        beforeDestroy: function() {
            $(this.$el).destroy();
        }
    });
    
    Vue.component('job-model', {
        template: '<input/>',
        mounted: function() {
            var availableTags = [
                'models/player/alyx.mdl',
                'models/player/police.mdl',
                'models/player/combine_super_soldier.mdl',
                'models/player/Group01/female_01.mdl',
                'models/player/breen.mdl',
                'models/player/monk.mdl',
                'models/player/kleiner.mdl',
                'models/player/phoenix.mdl'
            ];
            $("#job_model").autocomplete({
                source: availableTags
            });
        },
        beforeDestroy: function() {
            $(this.$el).destroy();
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
                    var errors = data.form.errors;

                    vue.job_job_id_error = data.form.errors.job_job_id;
                    vue.job_name_error = data.form.errors.job_name;
                    vue.job_desc_error = data.form.errors.job_desc;
                    vue.job_model_error = data.form.errors.job_model;

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
                    window.location.replace(home_url);
                }
            }
        );
    }
    
    self.setRGB = function() {
        var bigint = parseInt($("#job_color").val(), 16);
        
        var r = ((bigint >> 16) & 255);
        var g =  ((bigint >> 8) & 255);
        var b = (bigint & 255);
        
        self.vue.job_color = $("#job_color").val();
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
           
        if(!(charCode === 32 || charCode == 33 || charCode == 46 || charCode == 39 || charCode == 44 || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122))) {
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
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            job_command: null,
            job_job_id: "",
            job_name: null,
            job_desc: null,
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
            job_model_error: null,
            job_salary_error: null,
            job_max_players_error: null,
            job_color_error: null,
            job_weapons_error: null,
            job_vote_error: null,
            job_admin_only_error: null,
            job_tag_error: null
        },
        methods: {
            setRGB: self.setRGB,
            isJobID: self.isJobID,
            isJobName: self.isJobName,
            isJobDescription: self.isJobDescription,
            copy_code: self.copy_code,
            submit: self.submit,
            submit_share: self.submit_share
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