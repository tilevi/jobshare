# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import json

def community():
    return dict()

def index():
    return dict()

allowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'A', 'B', 'C', 'D', 'E', 'F']
def checkColor(form):
    if len(form.vars.color) != 6:
        form.errors.color = 'Color must be a hexadecimal value.'
    else:
        good = True
        for letter in form.vars.color:
            if (not (letter in allowed)):
                good = False
                break
        if (not good):
            form.errors.color = 'Color is not valid.'

def checkPlayers(form):
    if form.vars.max_players == "":
        form.errors.max_players = "Max players cannot be empty."
    elif form.vars.max_players < 0:
        form.errors.max_players = 'Max players must be at least 1.'

def checkTeamID(form):
    if form.vars.job_id == '':
        form.errors.job_id = "Job ID cannot be empty."
    elif not (all(x.isalnum() or x == "_" for x in form.vars.job_id)):
        form.errors.job_id = "Job ID must have only alphanumeric characters or underscores."

# https://stackoverflow.com/questions/20890618/isalpha-python-function-wont-consider-spaces
def checkJob(form):
    if form.vars.name == '':
        form.errors.name = "Job name cannot be empty."
    elif not (all(x.isalnum() or x.isspace() or x == "'" for x in form.vars.name)):
        form.errors.name = "Job name must be alphanumeric."

def checkDescription(form):
    if form.vars.description == '':
        form.errors.description = "Job description cannot be empty."
    elif len(form.vars.description) > 50:
        form.errors.description = "Job description is too long."
    elif not (all(x.isalpha() or x.isspace() or x == "," or x == "'"  or x == "." or x == "!" or x == "?" for x in form.vars.description)):
        form.errors.description = "Job description must be alphanumeric."
        
def checkSalary(form):
    if form.vars.salary < 0:
        form.errors.salary = "Salary must be greater than 0."

def validate(form):
    checkTeamID(form)
    checkJob(form)
    checkDescription(form)
    checkSalary(form)
    checkColor(form)
    checkPlayers(form)
    
    form.vars.weapons = json.loads(form.vars.weapons);

@auth.requires_login()
def create():
    form = SQLFORM(db.job, formstyle='bootstrap')
    if form.process(onvalidation=validate).accepted:
        redirect(URL('default', 'index'))
    return dict(form=form)

@auth.requires_login()
@auth.requires_signature()
def delete():
    if request.args(0) is not None:
        q = ((db.job.user_id == auth.user_id) &
             (db.job.id == request.args(0)))
        db(q).delete()
    redirect(URL('default', 'index'))

@auth.requires_login()
@auth.requires_signature()
def edit():
    job = request.args(0)
    if job is None:
        # We send you back to the general index.
        redirect(URL('default', 'index'))
    else:
        q = ((db.job.user_id == auth.user_id) &
             (db.job.id == request.args(0)))
        
        j = db(q).select().first()
        if j is None:
            redirect(URL('default', 'index'))
        # Always write invariants in your code.
        # Here, the invariant is that the checklist is known to exist.
        # Is this an edit form?
        form = SQLFORM(db.job, record=j, deletable=False)
        if form.process(onvalidation=validate).accepted:
            redirect(URL('default', 'view', args=[job]))
    return dict(form=form)

def view():
    if request.args(0) is None:
        redirect(URL('default', 'jobs'))
    else:
        q = (db.job.id == request.args(0))
        job = db(q).select().first()
        
        if (job is None) or ((not job.is_public) and (int(job.user_id)!= int(auth.user_id))):
            redirect(URL('default', 'jobs'))
    
    logger.info("The weapons length is: %r" % len(job.weapons))
    
    return dict(id=request.args(0), job=job, weapons=job.weapons)

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    
    if request.args(0) == 'profile':
        db.auth_user.username.readable = db.auth_user.username.writable = False
    
    if 'login' in request.args:
        db.auth_user.username.label = T("Username or Email")
        auth.settings.login_userfield = 'username'
        if request.vars.username and not IS_EMAIL()(request.vars.username)[1]:
            auth.settings.login_userfield = 'email'
            request.vars.email = request.vars.username
            request.post_vars.email = request.vars.email
            request.vars.username = None
            request.post_vars.username = None
 
        return dict(form=auth())
 
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


