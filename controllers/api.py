import datetime
from dateutil.relativedelta import *

import requests

def getWorkshopItem():
    id = '612053603' # request.vars.id
    
    r = requests.post('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?key=***REMOVED***', data = {'itemcount': 1, 'publishedfileids[0]': id})
    
    logger.info(r.text)
    

def isNoneOrEmpty(var):
    return var is None or var == ""

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
    elif not (all(x.isalnum() or x.isspace() or x == "," or x == "'"  or x == "." or x == "!" or x == "?" for x in job_desc)):
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

def get_jobs():
    # Time range
    time_range = request.vars.time_range
    
    # Sort (for orderby)
    sort = request.vars.sort
    
    # Get the filtered weapons
    # Source: https://groups.google.com/forum/#!topic/web2py/Awb9qrdl1nM
    weps = request.vars.get('weps[]', [])
    if isinstance(weps, basestring):
        weps = [weps]
    
    # Get the tags
    tags = request.vars.get('tags[]', [])
    if isinstance(tags, basestring):
        tags = [tags]
    
    # The jobs that we will retrieve.
    jobs = []
    
    logger.info(request.vars.public)
    
    if  request.vars.public == "true":
        getShared = True
    else:
        getShared = False
    
    # Search by job title
    search = request.vars.search or ''
    
    # We make a try-catch block to prevent any internal errors.
    try:
        pn = max(0, int(request.vars.page) - 1)
    except:
        pn = 0
    
    # Minimum and maximum number of players.
    try:
        min_players = int(request.vars.min_p)
    except:
        min_players = 1
    try:
        max_players = int(request.vars.max_p)
    except:
        max_players = 128
    
    # Minimum and maximum salary.
    try:
        min_salary = int(request.vars.min_s)
    except:
        min_salary = 0
    try:
        max_salary = int(request.vars.max_s)
    except:
        max_salary = -1
    
    jobsPerPage = 6
    count = 0
    
    # Build the query
    q = (db.job.name.contains(search)) & (db.job.max_players >= min_players) & (db.job.max_players <= max_players) & (db.job.salary >= min_salary)

    # If we want to get public jobs, make sure the job is public.
    if (getShared):
        q = q & (db.job.is_public == True)
    else: # Otherwise, we just want our jobs.
        q = q & (db.job.user_id == auth.user_id)
    
    # Filter the weapons.
    for wep in weps:
        q = q & (db.job.weapons.contains(wep))

    # Filter the tags.
    # For this context, OR logic makes the most sense.
    tagQ = None

    for tag in tags:
        if (tagQ is not None):
            tagQ = tagQ | (db.job.tag.contains(tag))
        else:
            tagQ = (db.job.tag.contains(tag))

    if (tagQ is not None):
        q = q & tagQ

    # Sources:
    #   https://groups.google.com/forum/#!topic/web2py/PrIo2I-fgCc
    #   https://stackoverflow.com/questions/35066588/is-there-a-simple-way-to-increment-a-datetime-object-one-month-in-python
    if (time_range != 'any'):
        if (time_range == 'day'):
            q = q & ( db.job.created_on >= ( datetime.datetime.utcnow().date() - relativedelta(days=+1) ) )
        elif (time_range == 'week'):
            q = q & ( db.job.created_on >= ( datetime.datetime.utcnow().date() - relativedelta(weeks=+1) ) )
        elif (time_range == 'month'):
            q = q & ( db.job.created_on >= ( datetime.datetime.utcnow().date() - relativedelta(months=+1) ) )
        elif (time_range == 'year'):
            q = q & ( db.job.created_on >= ( datetime.datetime.utcnow().date() - relativedelta(years=+1) ) ) 

    if (max_salary >= 0):
        q = q & (db.job.salary <= max_salary)

    result = db(q)

    count = result.count()

    if (sort == 'newest'):
        jobs = result.select(
                orderby=~db.job.created_on,
                limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
    elif (sort == 'recent'):
        jobs = result.select(
                orderby=~db.job.updated_on,
                limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
    else:
        jobs = result.select(
                orderby=~db.job.created_on,
                limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))

    
    rCount = (count // jobsPerPage)
    if ((count % jobsPerPage) > 0):
        rCount = rCount + 1
    
    return response.json(
        dict(
                jobs = jobs,
                count = count,
                pages = rCount,
                page = (pn + 1)
        )
    )


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
        return response.json(dict(form=form, errors=True, job=False))
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
            weapons = job_weapons,
            updated_on = datetime.datetime.utcnow()
        )
        
        # Return the updated job.
        job = db((db.job.id == job_id)).select().first()
        return response.json(dict(form=form, errors=False, job=job))

@auth.requires_login()
@auth.requires_signature()
def delete_job():
    job_id = request.vars.job_id
    db((db.job.id == job_id) & (db.job.user_id == auth.user_id)).delete()
    return response.json(dict(error=False, job_id=job_id))

@auth.requires_login()
@auth.requires_signature()
def toggle_job():
    q = ((db.job.id == request.vars.job_id) & (db.job.user_id == auth.user_id))
    row = db(q).select().first()
    
    is_public = row.is_public
    row.update_record(is_public=(not is_public))
    
    return response.json(dict(is_public=row.is_public))

def get_comments():
    start_idx = int(request.vars.start) if request.vars.start is not None else 0
    end_idx = int(request.vars.end) if request.vars.end is not None else 0
    
    logger.info('Start index: %r' % start_idx)
    logger.info('End index: %r' % end_idx)
    
    id = int(request.vars.id)
    
    get_comments = []
    has_more = False
    
    comments = db(db.post.post_id == id)
    rows = comments.select(orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))
    
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            # Check if I have a comment or not.
            c = dict(
                id = r.id,
                username = r.username,
                body = r.body,
                created_on = r.created_on.strftime('%B %d, %Y')
            )
            get_comments.append(c)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(
        comments=get_comments,
        logged_in=logged_in,
        has_more=has_more
    ))

@auth.requires_login()
@auth.requires_signature()
def toggle_visibility():
    q = ((db.job.id == request.vars.job_id) & (db.job.user_id == auth.user_id))
    row = db(q).select().first()
    
    is_public = row.is_public
    row.update_record(is_public=(not is_public))
    
    return response.json(dict(is_public=row.is_public))

@auth.requires_login()
@auth.requires_signature()
def add_comment():
    if request.vars.body.strip() == '':
        return response.json(dict(error='Comment cannot be empty.'))
    else:
        c_id = db.post.insert(
            post_id = int(request.vars.id),
            body = request.vars.body,
            user_id = auth.user_id,
            username = auth.user.username
        )
        c = db.post(c_id)
        return response.json(dict(comment = dict(post_id = c.post_id, body=c.body,
                                                user_id = c.user_id, username = c.username,
                                                created_on = c.created_on.strftime('%B %d, %Y'))))