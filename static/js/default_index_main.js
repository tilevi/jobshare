
var router = new VueRouter({
    mode: 'history',
    routes: []
});

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    
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
    
    function get_jobs_url(search, page) {
        var pp = {
            search: search,
            page: page
        };
        
        if (isCommunityPage) {
            pp.public = true;
        }
        
        return jobs_url + "?" + $.param(pp);
    }
    
    self.getJobViewURL = function(id) {
        return view_url + "/" + id;
    }
    
    self.search_jobs = function() {
        self.get_jobs(self.vue.search_form, 1);
    }
    
    self.set_page = function(page) {
        self.get_jobs(self.vue.search_form, page);
    }
    
    self.get_jobs = function(search, page) {
        $.getJSON(get_jobs_url(search, page), function (data) {
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
            self.setNewURL(search, page);
        })
    };
    
    self.setNewURL = function(search, page) {
        var pp = {
            search: search,
            page: page
        };
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
            search_form: null
        },
        methods: {
            getJobViewURL: self.getJobViewURL,
            setNewURL: self.setNewURL,
            search_jobs: self.search_jobs,
            set_page: self.set_page,
            prev_page: self.prev_page,
            next_page: self.next_page,
            getModelURL: self.getModelURL
        }
    });
    
    // Set the search form value.
    self.vue.search_form = self.vue.$route.query.search;
    
    // Get the corresponding jobs.
    self.get_jobs(self.vue.$route.query.search, self.vue.$route.query.page);
    
    // Show the Vue div.
    $("#vue-div-main").show();
    
    return self;
};


// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
});