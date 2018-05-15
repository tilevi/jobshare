
var router = new VueRouter({
    mode: 'history',
    routes: []
});

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

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
        return jobs_url + "?" + $.param(pp);
    }
    
    self.getJobViewURL = function(id) {
        return view_url + "/" + id;
    }
    
    self.search_jobs = function() {
        self.get_jobs(self.vue.search_form, 1);
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
            search_form: null
        },
        methods: {
            getJobViewURL: self.getJobViewURL,
            setNewURL: self.setNewURL,
            search_jobs: self.search_jobs
        }
    });
    
    // Set the search form value.
    self.vue.search_form = self.vue.$route.query.search;
    
    // Get the corresponding jobs.
    self.get_jobs(self.vue.$route.query.search, self.vue.$route.query.page);
    $("#vue-div-main").show();
    
    return self;
};


// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
});