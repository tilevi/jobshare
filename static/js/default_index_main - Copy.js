
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
            min_p: vue.min_p,
            max_p: vue.max_p,
            min_s: vue.min_s,
            max_s: vue.max_s,
            weps: vue.checkedWeapons
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
        $.getJSON(get_jobs_url(), function (data) {
            self.vue.jobs = data.jobs;
            
            self.vue.even_jobs = [];
            self.vue.odd_jobs = [];
            
            for (var i = 0; i < self.vue.jobs.length; i++) {
                if (i % 2 == 0) {
                    self.vue.even_jobs.push(self.vue.jobs[i]);
                } else {
                    self.vue.odd_jobs.push(self.vue.jobs[i]);
                }
            }
            
            self.vue.count = data.count;
            self.vue.pages = data.pages;
            
            // Set the current page.
            self.vue.current_page = data.page;
            
            // Set the new URL.
            self.setNewURL();
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
        
        pp.weps = (vue.checkedWeapons.length == 0) ? [] : vue.checkedWeapons;
        
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
    
    self.getWeapons = function() {
        self.get_jobs();
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
            
            checkedWeapons: []
        },
        methods: {
            getJobViewURL: self.getJobViewURL,
            setNewURL: self.setNewURL,
            search_jobs: self.search_jobs,
            set_page: self.set_page,
            prev_page: self.prev_page,
            next_page: self.next_page,
            getModelURL: self.getModelURL,
            searchByPlayers: self.searchByPlayers,
            searchBySalary: self.searchBySalary,
            getWeapons: self.getWeapons
        }
    });
    
    // Set the search form value.
    self.vue.search_form = self.vue.$route.query.search;
    self.vue.current_page = self.vue.$route.query.search;
    
    self.vue.min_players = self.vue.$route.query.min_p;
    self.vue.max_players = self.vue.$route.query.max_p;
    
    self.vue.min_salary = self.vue.$route.query.min_s;
    self.vue.max_salary = self.vue.$route.query.max_s;
    
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