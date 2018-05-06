// This is the js for the default/index.html view.

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
    var getCommentIndex = function(id) {
        for (var i = 0; i < self.vue.memos.length; i++) {
            if (self.vue.memos[i].id == id) {
                return i;
            }
        }
        return -1;
    }
    
    function get_comments_url(start_idx, end_idx, id) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
            id: id
        };
        return comments_url + "?" + $.param(pp);
    }
    
    self.get_comments = function () {
        $.getJSON(get_comments_url(0, 10, self.vue.job_id), function (data) {
            self.vue.comments = data.comments;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.comments);
        })
    };
    
    self.add_comment = function () {
        // The submit button to add a track has been added.
        $.post(add_comment_url,
            {
                id: parseInt(self.vue.job_id),
                body: self.vue.comment_form
            },
            function (data) {
                if (data.error) {
                    self.vue.comment_error = true;
                } else {
                    self.vue.comment_error = false;
                    self.vue.comments.unshift(data.comment);
                    enumerate(self.vue.comments);
                }
            });
    };
    
    self.add_comment_button = function() {
        self.vue.is_adding_comment = !self.vue.is_adding_comment;
    };
    
    self.get_more = function() {
        var num_comments = self.vue.comments.length;
        $.getJSON(get_comments_url(num_comments, num_comments + 10, self.vue.job_id), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.comments, data.comments);
            enumerate(self.vue.comments);
        });
    };
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            comments: [],
            logged_in: false,
            has_more: false,
            job_id: job_id,
            comment_form: null,
            comment_error: false
        },
        methods: {
            add_comment_button: self.add_comment_button,
            add_comment: self.add_comment,
            get_more: self.get_more
        }
    });
    
    self.get_comments();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
