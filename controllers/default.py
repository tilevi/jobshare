# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import json
import datetime

def community():
    return dict()

def index():
    return dict()

# Check color
allowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F']

def checkColor(form, job_color):
    if len(job_color) != 6:
        form["errors"]["job_color"] = 'Color must be a hexadecimal value.'
    else:
        good = True
        for letter in job_color:
            if (not (letter in allowed)):
                good = False
                break
        if (not good):
            form["errors"]["job_color"] = 'Color is not valid.'

def checkPlayers(form, job_max_players):
    if job_max_players < 0:
        form["errors"]["job_max_players"] = 'Max players must be at least 1.'

def checkTeamID(form, job_id):
    if not (all(x.isalnum() or x == "_" for x in job_id)):
        form["errors"]["job_job_id"] = "Job ID must have only alphanumeric characters or underscores."

def checkModel(form, job_model):
    if not (all(x.isalnum() or x == "/" or x == "." or x == "_" for x in job_model)):
        form["errors"]["job_model"] = "Player model contains invalid characters."

# https://stackoverflow.com/questions/20890618/isalpha-python-function-wont-consider-spaces
def checkJob(form, job_name):
    if not (all(x.isalnum() or x.isspace() or x == "'" for x in job_name)):
        form["errors"]["job_name"] = "Job name must be alphanumeric."

def checkDescription(form, job_desc):
    if len(job_desc) > 50:
        form["errors"]["job_desc"] = "Job description is too long."
    elif not (all(x.isalpha() or x.isspace() or x == "," or x == "'"  or x == "." or x == "!" or x == "?" for x in job_desc)):
        form["errors"]["job_desc"] = "Job description must be alphanumeric."

def checkSalary(form, job_salary):
    if job_salary < 0:
        form["errors"]["salary"] = "Salary must be greater than zero."
    elif job_salary >= 1000000000000:
        form["errors"]["salary"] = "Salary must be less than 1 trillion."

tags = [
    "Citizen",
    "Commercial",
    "Criminal",
    "Fun",
    "Government",
    "OP",
    "Misc."
]

def checkTag(form, job_tag):
    if not (job_tag in tags):
        form["errors"]["tag"] = "Please select a valid job tag.";

def checkWeapons(form, weps):
    okay = True
    for wep in weps:
        if not (all(x.isalnum() or x == "_" for x in wep)):
            okay = False
            break
        
    
    if (not okay):
        form["errors"]["job_weapons"] = "One of the weapons contains one or more invalid characters."
    

def validate(form):
    checkTeamID(form)
    checkJob(form)
    checkDescription(form)
    checkSalary(form)
    checkColor(form)
    checkPlayers(form)
    form.vars.weapons = json.loads(form.vars.weapons);
    form.vars.created_on = datetime.datetime.utcnow()

@auth.requires_login()
def create():
    return dict()

def isNoneOrEmpty(var):
    return var is None or var == ""

@auth.requires_login()
@auth.requires_signature()
def create_job():
    form = { 'errors': { 'job_job_id': '', 'job_name': '', 'job_desc': '', 'job_model': '', 'job_tag': '', 'job_color': '', 'job_weapons': '', 'job_salary': '', 'job_max_players': '', 'job_vote': '', 'job_admin_only': '' } }
    
    job_job_id = request.vars.job_job_id
    job_name = request.vars.job_name
    job_desc = request.vars.job_desc
    job_model = request.vars.job_model
    job_tag = request.vars.job_tag
    job_color = request.vars.job_color
    
    job_weapons = request.vars.get('weps[]', [])
    if isinstance(job_weapons, basestring):
        job_weapons = [job_weapons]
    
    
    # Check job ID
    if (isNoneOrEmpty(job_job_id)):
        form['errors']['job_job_id'] = "Job ID is missing."
    else:
        checkTeamID(form, job_job_id)
    
    # Check job name
    if (isNoneOrEmpty(job_name)):
        form['errors']['job_name'] = "Job name is missing."
    else:
        checkJob(form, job_name)
        
    if (isNoneOrEmpty(job_desc)):
        form['errors']['job_desc'] = "Job description is missing."
    else:
        # Check Job Description
        checkDescription(form, job_desc)
    
    if (isNoneOrEmpty(job_model)):
        form['errors']['job_model'] = "Job model is missing."
    else:
        checkModel(form, job_model)
    
    if (isNoneOrEmpty(job_tag)):
        form['errors']['job_tag'] = "Job tag is missing."
    else:
        checkTag(form, job_tag)
    
    # Check job color
    if (isNoneOrEmpty(job_color)):
        form['errors']['job_color'] = "Job color is missing."
    else:
        checkColor(form, job_color)
    
    # Check job salary
    if (isNoneOrEmpty(request.vars.job_salary)):
        form['errors']['job_salary'] = "Job salary is missing."
    else:
        job_salary = int(request.vars.job_salary)
        checkSalary(form, job_salary)

    # Check max players
    if (isNoneOrEmpty(request.vars.job_max_players)):
        form['errors']['job_max_players'] = "Max players is missing."
    else:
        job_max_players = int(request.vars.job_max_players)
        checkPlayers(form, job_max_players)
    
    # Determine whether or not this job should be made public.
    if (int(request.vars.make_public) == 0):
        make_public = False
    else:
        make_public = True
    
    # Verify that all of the weapons contain valid characters.
    checkWeapons(form, job_weapons)
    
    # Check now for errors.
    error = False
    
    for k, v in form["errors"].items():
        if (v != ""):
            error = True
            break
    
    if (error):
        logger.info("We have an error in the form.");
        return response.json(dict(form=form, errors=True))
    else:
        logger.info("The form is ready to go.");
        
        # Check misc. options (vote and admin only checkboxes)
        if (request.vars.job_vote is None):
            form['errors']['job_vote'] = "Vote option is missing."
        else:
            if (int(request.vars.job_vote) == 0):
                job_vote = False
            else:
                job_vote = True
        
        
        if (request.vars.job_admin_only is None):
            form['errors']['job_admin_only'] = "Admin only option is missing."
        else:
            if (int(request.vars.job_admin_only) == 0):
                job_admin_only = False
            else:
                job_admin_only = True
        
        j_id = db.job.insert(
            job_id = job_job_id,
            name = job_name,
            description = job_desc,
            color = job_color,
            model = job_model,
            salary = job_salary,
            max_players = job_max_players,
            admin_only = job_admin_only,
            tag = job_tag,
            vote = job_vote,
            weapons = job_weapons,
            is_public = make_public
        )
        
        return response.json(dict(form=form, errors=False))

@auth.requires_login()
@auth.requires_signature()
def update_job():
    form = { 'errors': { 'job_job_id': '', 'job_name': '', 'job_desc': '', 'job_model': '', 'job_tag': '', 'job_color': '', 'job_weapons': '', 'job_salary': '', 'job_max_players': '', 'job_vote': '', 'job_admin_only': '' } }
    
    job_id = request.vars.job_id
    job_job_id = request.vars.job_job_id
    job_name = request.vars.job_name
    job_desc = request.vars.job_desc
    job_model = request.vars.job_model
    job_tag = request.vars.job_tag
    job_color = request.vars.job_color
    
    job_weapons = request.vars.get('weps[]', [])
    if isinstance(job_weapons, basestring):
        job_weapons = [job_weapons]
    
    
    # Check job ID
    if (isNoneOrEmpty(job_job_id)):
        form['errors']['job_job_id'] = "Job ID is missing."
    else:
        checkTeamID(form, job_job_id)
    
    # Check job name
    if (isNoneOrEmpty(job_name)):
        form['errors']['job_name'] = "Job name is missing."
    else:
        checkJob(form, job_name)
        
    if (isNoneOrEmpty(job_desc)):
        form['errors']['job_desc'] = "Job description is missing."
    else:
        # Check Job Description
        checkDescription(form, job_desc)
    
    if (isNoneOrEmpty(job_model)):
        form['errors']['job_model'] = "Job model is missing."
    else:
        checkModel(form, job_model)
    
    if (isNoneOrEmpty(job_tag)):
        form['errors']['job_tag'] = "Job tag is missing."
    else:
        checkTag(form, job_tag)
    
    # Check job color
    if (isNoneOrEmpty(job_color)):
        form['errors']['job_color'] = "Job color is missing."
    else:
        checkColor(form, job_color)
    
    # Check job salary
    if (isNoneOrEmpty(request.vars.job_salary)):
        form['errors']['job_salary'] = "Job salary is missing."
    else:
        job_salary = int(request.vars.job_salary)
        checkSalary(form, job_salary)

    # Check max players
    if (isNoneOrEmpty(request.vars.job_max_players)):
        form['errors']['job_max_players'] = "Max players is missing."
    else:
        job_max_players = int(request.vars.job_max_players)
        checkPlayers(form, job_max_players)
    
    # Verify that all of the weapons contain valid characters.
    checkWeapons(form, job_weapons)
    
    # Check now for errors.
    error = False
    
    for k, v in form["errors"].items():
        if (v != ""):
            error = True
            break
    
    if (error):
        logger.info("We have an error in the form.");
        return response.json(dict(form=form, errors=True))
    else:
        logger.info("The form is ready to go.");
        
        # Check misc. options (vote and admin only checkboxes)
        if (request.vars.job_vote is None):
            form['errors']['job_vote'] = "Vote option is missing."
        else:
            if (int(request.vars.job_vote) == 0):
                job_vote = False
            else:
                job_vote = True
                
        if (request.vars.job_admin_only is None):
            form['errors']['job_admin_only'] = "Admin only option is missing."
        else:
            if (int(request.vars.job_admin_only) == 0):
                job_admin_only = False
            else:
                job_admin_only = True
        
        
        q = ((db.job.id == job_id) & (db.job.user_id == auth.user_id))
        row = db(q).select().first()
        
        row.update_record(
            job_id = job_job_id,
            name = job_name,
            description = job_desc,
            color = job_color,
            model = job_model,
            salary = job_salary,
            max_players = job_max_players,
            admin_only = job_admin_only,
            tag = job_tag,
            vote = job_vote,
            weapons = job_weapons
        )
        
        return response.json(dict(form=form, errors=False))
    
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


