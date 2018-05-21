
var router = new VueRouter({
    mode: 'history',
    routes: []
});

var app = function() {
    var self = {};

    Vue.config.silent = false; // show all warnings
    Vue.config.ignoredElements = ['tags'];
    
    Vue.component('tag-it', {
        template: '<input/>',
        mounted: function() {
            var input = document.querySelector("#lolFine");
            var tagify = new Tagify(input, {
                whitelist : ["weapon_ak47", "weapon_ar2"]
            });
        },
        beforeDestroy: function() {
            $(this.$el).destroy();
        }
    });
    
    var player_models = {
        'models/player/alyx.mdl': 'alyx.png',
        'models/player/police.mdl': 'police.png',
        'models/player/combine_super_soldier.mdl': 'combine_super_soldier.png',
        'models/player/Group01/female_01.mdl': 'female_01.png',
        'models/player/breen.mdl': 'breen.png',
        'models/player/monk.mdl': 'monk.png',
        'models/player/kleiner.mdl': 'kleiner.png',
        'models/player/phoenix.mdl': 'phoenix.png'
    }
    
    self.getModelURL = function(mdl) {
        if (player_models[mdl] == null) {
            return "";
        }
        return image_url + "/" + player_models[mdl];
    }
    
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
    
    // Fetches the index of a memo, given a memo id.
    var getJobIndex = function(id) {
        for (var i = 0; i < self.vue.jobs.length; i++) {
            if (self.vue.jobs[i].id == id) {
                return i;
            }
        }
        return -1;
    }
    
    function get_jobs_url() {
        var vue = self.vue;
        
        var pp = {
            search: vue.search_form,
            page: vue.current_page,
            min_p: vue.min_players,
            max_p: vue.max_players,
            min_s: vue.min_salary,
            max_s: vue.max_salary,
            weps: vue.checkedWeapons,
            time_range: vue.selectedTimeRange,
            sort: vue.selectedSort
        }
        
        if (isCommunityPage) {
            pp.public = true;
        }
        
        return jobs_url + "?" + $.param(pp);
    }
    
    self.getJobViewURL = function(id) {
        return view_url + "/" + id;
    }
    
    self.search_jobs = function() {
        self.get_jobs();
    }
    
    self.set_page = function(page) {
        self.get_jobs();
    }
    
    self.get_jobs = function() {
        var vue = self.vue;
        vue.isLoadingResults = true;
        
        $.getJSON(get_jobs_url(), function (data) {
            vue.jobs = data.jobs;
            
            vue.even_jobs = [];
            vue.odd_jobs = [];
            
            for (var i = 0; i < self.vue.jobs.length; i++) {
                if (i % 2 == 0) {
                    vue.even_jobs.push(self.vue.jobs[i]);
                } else {
                    vue.odd_jobs.push(self.vue.jobs[i]);
                }
            }
            
            vue.count = data.count;
            vue.pages = data.pages;
            
            // Set the current page.
            vue.current_page = data.page;
            
            // Set the new URL.
            self.setNewURL();
            
            vue.isLoadingResults = false;
        })
    };
    
    self.setNewURL = function() {
        var vue = self.vue;
        var pp = {};
        
        var search = vue.search_form;
        var page = vue.current_page;
        
        var min_p = vue.min_players;
        var max_p = vue.max_players;
        
        var min_s = vue.min_salary;
        var max_s = vue.max_salary;
        
        var time_range = vue.selectedTimeRange;
        var selected_sort = vue.selectedSort;
        
        if (search != null && search != '') {
            pp.search = vue.search_form;
        }
        
        if (page != null) {
            pp.page = vue.current_page;
        }
        
        if (min_p != null && min_p != '') {
            pp.min_p = vue.min_players;
        }
        
        if (max_p != null && max_p != '') {
            pp.max_p = vue.max_players;
        }
        
        if (min_s != null && min_s != '') {
            pp.min_s = vue.min_salary;
        }
        
        if (max_s != null && max_s != '') {
            pp.max_s = vue.max_salary;
        }
        
        if (vue.checkedWeapons.length != 0) {
            pp.wep = vue.checkedWeapons;
        }
        
        if (time_range != null) {
            pp.time_range = time_range;
        }
        
        if (selected_sort != null) {
            pp.sort = selected_sort
        }
        
        var url = your_jobs_url + "?" + $.param(pp);
        window.history.replaceState(null, null, url);
    }
    
    self.prev_page = function() {
        if (self.vue.current_page > 1) {
            self.set_page(self.vue.current_page - 1);
        }
    }
    
    self.next_page = function() {
        if (self.vue.current_page < self.vue.pages) {
            self.set_page(self.vue.current_page + 1);
        }
    }
    
    self.searchByPlayers = function() {
        self.get_jobs();
    }
    
    self.searchBySalary = function() {
        self.get_jobs();
    }
    
    // Source:
    // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    self.getTextClass = function(bgColor, faded) {
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
        
        if (faded) {
           return (L > 0.179) ? "textColorBlackFaded" : "textColorWhiteFaded"; 
        }
        
        return (L > 0.179) ? "textColorBlack" : "textColorWhite";
    }
    
    self.show_job_details = function(job) {
        var vue = self.vue;
        
        vue.job_name = job.name;
        vue.job_desc = job.description;
        vue.job_model = job.model;
        vue.job_color = job.color;
        vue.job_salary = "$" + job.salary;
        vue.job_max_players = job.max_players;
        
        vue.showing_job_details = true;
        
        /*
            job_model: null,
            job_salary: null,
            job_max_players: null,
            job_color: null,
            job_weapons: null
        */
    }
    
    var router = new VueRouter({
        mode: 'history',
        routes: []
    });
    
    // https://stackoverflow.com/questions/35914069/vue-js-query-parameters
    
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
            search_form: null,
            tags: ['Citizen', 'Commercial', 'Criminal', 'Fun', 'Government', 'OP', 'Misc.'],
            weapons: ['AK-47', 'AR2', 'Custom SWEP'],
            
            min_salary: null,
            max_salary: null,
            
            min_players: null,
            max_players: null,
            
            checkedWeapons: [],
            checkedTags: [],
            
            isLoadingResults: false,
            
            selectedTimeRange: 'any',
            selectedSort: 'newest',
            
            showing_job_details: false,
            
            // This is for the job details view.
            job_name: null,
            job_desc: null,
            job_model: null,
            job_salary: null,
            job_max_players: null,
            job_color: null,
            job_weapons: null
        },
        methods: {
            fetchNewResults: self.get_jobs,
            getJobViewURL: self.getJobViewURL,
            setNewURL: self.setNewURL,
            search_jobs: self.search_jobs,
            set_page: self.set_page,
            prev_page: self.prev_page,
            next_page: self.next_page,
            getModelURL: self.getModelURL,
            searchByPlayers: self.searchByPlayers,
            searchBySalary: self.searchBySalary,
            getTextClass: self.getTextClass,
            show_job_details: self.show_job_details
        }
    });
    
    // Set the search form value.
    self.vue.search_form = self.vue.$route.query.search;
    self.vue.current_page = self.vue.$route.query.search;
    
    self.vue.min_players = self.vue.$route.query.min_p;
    self.vue.max_players = self.vue.$route.query.max_p;
    
    self.vue.min_salary = self.vue.$route.query.min_s;
    self.vue.max_salary = self.vue.$route.query.max_s;
    
    // Get the weapons
    var wepArr = self.vue.$route.query["wep[]"];
    self.vue.checkedWeapons = (wepArr!= null) ? wepArr : [];
    
    // Convert it to an array, if necessary.
    if ((typeof wepArr) == "string") {
        self.vue.checkedWeapons = [ wepArr ];
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