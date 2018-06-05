
# Main controller

import datetime, requests, json

from dateutil.relativedelta import *
from urlparse import urlparse, parse_qs

# The maximum number of jobs to display per page.
jobs_per_page = 8

# This was just for testing features.
"""
def setdate():
    d = datetime.date(2017, 6, 15)
    
    q = (db.job.id == 8)
    rows = db(q).select()
    
    for row in rows:
        row.update_record(created_on=d)
"""

# Workshop Endpoint
# This function uses the Steam Web API to access Workshop information.
def workshop():
    id = request.vars.id
    
    r = requests.post("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?key=***REMOVED***", data = {"itemcount": 1, "publishedfileids[0]": id})
        
    title = "Not available"
    file_size = "Not available"
    
    if (r.status_code == 200):
        json = r.json()
        
        if ("title" in json["response"]["publishedfiledetails"][0]):
            title = json["response"]["publishedfiledetails"][0]["title"]
        
        if ("file_size" in json["response"]["publishedfiledetails"][0]):
            file_size = json["response"]["publishedfiledetails"][0]["file_size"]
    
    return response.json(dict(id=id, title=title, size=file_size))

# Below contains job verification for forms.
def is_none_or_empty(var):
    return ((var is None) or (var.strip() == ""))

# The allowed hex characters for colors
allowed_hex_chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F']

# Check color
def check_color(form, job_color):
    if len(job_color) != 6:
        form["errors"]["job_color"] = "Color must be a hexadecimal value."
    else:
        good = True
        for letter in job_color:
            if (not (letter in allowed_hex_chars)):
                good = False
                break
        if (not good):
            form["errors"]["job_color"] = "Color is not valid."

# Check max players
def check_players(form, job_max_players):
    if job_max_players < 0:
        form["errors"]["job_max_players"] = "Max players must be at least 1."
    elif job_max_players > 128:
        form["errors"]["job_max_players"] = "Max players must be less than 128."

# Check Team/Job ID
# Resource: https://stackoverflow.com/questions/20890618/isalpha-python-function-wont-consider-spaces
def check_teamid(form, job_id):
    if (len(job_id) > 25):
        form["errors"]["job_job_id"] = "Job ID is too long."
    elif not (all(x.isalnum() or x == "_" for x in job_id)):
        form["errors"]["job_job_id"] = "Job ID must have only alphanumeric characters or underscores."

# Check the player model
def check_model(form, job_model):
    if (len(job_model) > 50):
        form["errors"]["job_model"] = "Player model is too long."
    if not (all(x.isalnum() or x == "/" or x == "." or x == "_" for x in job_model)):
        form["errors"]["job_model"] = "Player model contains invalid characters."

# Check job name
def check_job(form, job_name):
    if (len(job_name) > 25):
        form["errors"]["job_name"] = "Job name is too long."
    elif not (all(x.isalnum() or x.isspace() or x == "'" for x in job_name)):
        form["errors"]["job_name"] = "Job name must be alphanumeric."

# Check job description
def check_description(form, job_desc):
    if len(job_desc) > 100:
        form["errors"]["job_desc"] = "Job description is too long."
    elif not (all(x.isalnum() or x.isspace() or x == "-" or x == "," or x == "'"  or x == "." or x == "!" or x == "?" for x in job_desc)):
        form["errors"]["job_desc"] = "Job description must be alphanumeric."

# Check salary
def check_salary(form, job_salary):
    if job_salary < 0:
        form["errors"]["job_salary"] = "Salary must be greater than zero."
    elif job_salary >= 1000000000000:
        form["errors"]["job_salary"] = "Salary must be less than 1 trillion."

# Check the suggested character/model
def check_suggested_model(form, job_suggested_model):
    if len(job_suggested_model) > 50:
        form["errors"]["job_suggested_model"] = "Suggested model is too long."
    elif not (all(x.isalnum() or x.isspace() or x == "," or x == "'"  or x == "." or x == "!" or x == "?" for x in job_suggested_model)):
        form["errors"]["job_suggested_model"] = "Suggested model must be alphanumeric."

# The available filter options for job tags
job_tags = [
    "Citizen",
    "Commercial",
    "Criminal",
    "Fun",
    "Government",
    "OP",
    "Misc."
]

# Check job tag/type
def check_tag(form, job_tag):
    if not (job_tag in job_tags):
        form["errors"]["tag"] = "Please select a valid job tag.";

# The default weapons available.
weapons = dict(
    weapon_glock=True,
    weapon_shotgun=True,
    weapon_rpg=True,
    weapon_usp=True,
    weapon_p228=True,
    weapon_deagle=True,
    weapon_elite=True,
    weapon_fiveseven=True,
    weapon_m3=True,
    weapon_galil=True,
    weapon_ak47=True,
    weapon_scout=True,
    weapon_sg552=True,
    weapon_awp=True,
    weapon_g3sg1=True,
    weapon_famas=True,
    weapon_m4a1=True,
    weapon_aug=True,
    weapon_sg550=True,
    weapon_mac10=True,
    weapon_tmp=True,
    weapon_mp5navy=True,
    weapon_ump45=True,
    weapon_p90=True,
    weapon_m249=True,
    lockpick=True,
    keypad_cracker=True,
    weapon_stunstick=True,
    arrest_stick=True,
    unarrest_stick=True,
    weapon_bugbait=True,
)

# Check the weapons.
def check_weapons(form, weps):
    okay = True
    custom_swep = False
    
    for wep in weps:
        if not (wep in weapons):
            custom_swep = True
        
        if (len(wep) >= 25):
            form["errors"]["job_weapons"] = "Each weapon has to be less than 25 characters."
            okay = False
        elif (not (all(x.isalnum() or x == "_" for x in wep))):
            form["errors"]["job_weapons"] = "One of the weapons contains one or more invalid characters."
            okay = False
        
        if ((not okay) and custom_swep):
            break
    
    return custom_swep

def check_workshop_id(form, id):
    preview_url = "";
    
    if (len(id) > 200):
        form["errors"]["job_workshop"] = "Workshop URL/ID is too long."
    elif len(id) < 9 or not (all(x.isdigit() for x in id)):
        form["errors"]["job_workshop"] = "Invalid workshop URL/ID."
    else: 
        r = requests.post("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?key=***REMOVED***", data = {"itemcount": 1, "publishedfileids[0]": id})
        
        if (r.status_code != 200):
            form["errors"]["job_workshop"] = "Unable to verify Workshop item. Please try again."
        else:
            json = r.json()
            if (("consumer_app_id" in json["response"]["publishedfiledetails"][0]) and json["response"]["publishedfiledetails"][0]["consumer_app_id"] == 4000):
                found = False
                for tag in (json["response"]["publishedfiledetails"][0]["tags"]):
                    if (tag["tag"] == "model"):
                        found = True
                        break

                if (not found):
                    form["errors"]["job_workshop"] = "Workshop item must have the 'Model' tag."
                
                if ("preview_url" in json["response"]["publishedfiledetails"][0]):
                    preview_url = json["response"]["publishedfiledetails"][0]["preview_url"]
            else:
                form["errors"]["job_workshop"] = "The game for the Workshop item must be Garry's Mod."
    
    return preview_url

def check_resources(form, job_resources):
    if (len(job_resources) > 3):
        form["errors"]["job_resources"] = "You can only have 3 resources."
    else:
        for res in job_resources:
            if (res["name"].strip() == ""):
                form["errors"]["job_resources"] = "One of the resource names is empty."
                break
            if (res["url"].strip() == ""):
                form["errors"]["job_resources"] = "One of the resource URLs is empty."
                break
            if (len(res["name"]) > 50 or len(res["url"]) > 200):
                form["errors"]["job_resources"] = "Either the name or URL of a resource is too long."
                break
            if not (all(x.isalnum() or x.isspace() or x == "'" for x in res["name"])):
                form["errors"]["job_resources"] = "At least one resource has an invalid name."
                break
            if not (all(x.isalnum() or x == ":" or x == "-" or x == "&" or x == "/" or x == "=" or x == "?" or x == "!" or x == "." or x == "_" for x in res["url"])):
                form["errors"]["job_resources"] = "At least one resource has an invalid URL."
                break
        
    

# This function checks and verifies all of the job information.
# verify_job() is used in both the create_job() and update_job() endpoints.
def verify_job(form, request):
    # Grab the job information.
    job_job_id = request.vars.job_job_id
    job_name = request.vars.job_name
    job_desc = request.vars.job_desc
    job_model = request.vars.job_model
    job_tag = request.vars.job_tag
    job_color = request.vars.job_color
    job_workshop = request.vars.job_workshop
    job_suggested_model = request.vars.job_suggested_model
    
    # Check the job resources
    if (request.vars.job_resources is not None):
        job_resources = json.loads(request.vars.job_resources)
        check_resources(form, job_resources)
    else:
        job_resources = []
    
    # Dummy values.
    job_salary = 0
    job_max_players = 0
    job_admin_only = False
    job_vote = False
    
    job_weapons = request.vars.get("job_weapons[]", [])
    if isinstance(job_weapons, basestring):
        job_weapons = [job_weapons]
    
    # Check job ID
    if (is_none_or_empty(job_job_id)):
        form["errors"]["job_job_id"] = "Job ID is missing."
    else:
        check_teamid(form, job_job_id)
    
    # Check job name
    if (is_none_or_empty(job_name)):
        form["errors"]["job_name"] = "Job name is missing."
    else:
        check_job(form, job_name)
        
    if (is_none_or_empty(job_desc)):
        form["errors"]["job_desc"] = "Job description is missing."
    else:
        # Check Job Description
        check_description(form, job_desc)
    
    if (not is_none_or_empty(job_model)):
        check_model(form, job_model)
    
    if (is_none_or_empty(job_tag)):
        form["errors"]["job_tag"] = "Job tag is missing."
    else:
        check_tag(form, job_tag)
    
    # Check job color
    if (is_none_or_empty(job_color)):
        form["errors"]["job_color"] = "Job color is missing."
    else:
        check_color(form, job_color)
    
    # Check job salary
    if (is_none_or_empty(request.vars.job_salary)):
        form["errors"]["job_salary"] = "Job salary is missing."
    else:
        job_salary = int(round(float(request.vars.job_salary)))
        check_salary(form, job_salary)

    # Check max players
    if (is_none_or_empty(request.vars.job_max_players)):
        form["errors"]["job_max_players"] = "Max players is missing."
    else:
        job_max_players = int(request.vars.job_max_players)
        check_players(form, job_max_players)
    
    # Determine whether or not this job should be made public.
    
    logger.info("MAKE PUBLIC: %r" % request.vars.job_make_public)
    
    if (request.vars.job_make_public == "true"):
        make_public = True
    else:
        make_public = False
    
    logger.info("SETTING TO: %r" % make_public)

    
    # Verify that all of the weapons contain valid characters.
    custom_swep = check_weapons(form, job_weapons)
    
    preview_url = ""
    
    # We don't require a Steam Workshop item
    if (len(job_workshop) > 0):
        # First try to parse a Workshop URL
        # Source: https://stackoverflow.com/questions/10113090/best-way-to-parse-a-url-query-string
        parsed_url = urlparse(job_workshop)
        result = parse_qs(parsed_url.query)
        
        try:
            job_workshop = result["id"][0]
        except:
            pass
        
        # We need to check the workshop ID.
        preview_url = check_workshop_id(form, job_workshop)
        
        # Check the suggested model (it may be blank--it's not required).
        check_suggested_model(form, job_suggested_model)
    
    # Check misc. options (vote and admin only checkboxes)
    if (request.vars.job_vote is None):
        form["errors"]["job_vote"] = "Vote option is missing."
    else:
        if (request.vars.job_vote == "true"):
            job_vote = True
        else:
            job_vote = False
    
    if (request.vars.job_admin_only is None):
        form["errors"]["job_admin_only"] = "Admin only option is missing."
    else:
        if (request.vars.job_admin_only == "true"):
            job_admin_only = True
        else:
            job_admin_only = False
    
    return dict(job_job_id=job_job_id,
                job_name=job_name,
                job_desc=job_desc,
                job_model=job_model,
                job_tag=job_tag,
                job_color=job_color,
                job_workshop=job_workshop,
                job_suggested_model=job_suggested_model,
                job_weapons=job_weapons,
                job_admin_only=job_admin_only,
                job_vote=job_vote,
                job_max_players=job_max_players,
                job_salary=job_salary,
                make_public=make_public,
                preview_url=preview_url,
                custom_swep=custom_swep,
                job_resources=job_resources)

@auth.requires_login()
@auth.requires_signature()
def create_job():
    # The form
    form = {"errors": { "job_job_id": None, "job_name": None, "job_desc": None, 
                        "job_model": None, "job_tag": None, "job_color": None, 
                        "job_weapons": None, "job_salary": None, "job_max_players": None, 
                        "job_vote": None, "job_admin_only": None}}
    
    # Verify the job information
    result = verify_job(form, request)
    
    # Check now for errors.
    error = False
    
    for k, v in form["errors"].items():
        if (v is not None):
            error = True
            break
    
    if (error):
        return response.json(dict(form=form, errors=True))
    else:
        j_id = db.job.insert(
            job_id = result["job_job_id"],
            name = result["job_name"],
            description = result["job_desc"],
            workshop = result["job_workshop"],
            suggested_model = result["job_suggested_model"],
            preview_url = result["preview_url"],
            color = result["job_color"],
            model = result["job_model"],
            salary = result["job_salary"],
            max_players = result["job_max_players"],
            admin_only = result["job_admin_only"],
            tag = result["job_tag"],
            vote = result["job_vote"],
            weapons = result["job_weapons"],
            is_public = result["make_public"],
            has_custom_swep = result["custom_swep"],
            resources = json.dumps(result["job_resources"])
        )
        
        return response.json(dict(form=form, errors=False))

@auth.requires_login()
@auth.requires_signature()
def update_job():
    # The form
    form = {"errors": { "job_job_id": None, "job_name": None, "job_desc": None, 
                        "job_model": None, "job_tag": None, "job_color": None, 
                        "job_weapons": None, "job_salary": None, "job_max_players": None, 
                        "job_vote": None, "job_admin_only": None}}
    
    # Verify the job information
    result = verify_job(form, request)
    
    # Check now for errors.
    error = False
    
    for k, v in form["errors"].items():
        if (v is not None):
            error = True
            break
    
    if (error):
        return response.json(dict(form=form, errors=True, job=False))
    else:
        q = ((db.job.id == request.vars.job_id) & (db.job.user_id == auth.user_id))
        row = db(q).select().first()
        job = None
        
        if (row is not None):
            row.update_record(
                job_id = result["job_job_id"],
                name = result["job_name"],
                description = result["job_desc"],
                workshop = result["job_workshop"],
                suggested_model = result["job_suggested_model"],
                preview_url = result["preview_url"],
                color = result["job_color"],
                model = result["job_model"],
                salary = result["job_salary"],
                max_players = result["job_max_players"],
                admin_only = result["job_admin_only"],
                tag = result["job_tag"],
                vote = result["job_vote"],
                weapons = result["job_weapons"],
                has_custom_swep = result["custom_swep"],
                updated_on = datetime.datetime.utcnow(),
                resources = json.dumps(result["job_resources"])
            )
            
            # Fetch the updated job.
            job = db((db.job.id == request.vars.job_id)).select().first()
        
        return response.json(dict(form=form, errors=False, job=job))

def get_job():
    job = db((db.job.id == request.vars.job_id) & ((db.job.user_id == auth.user_id) | (db.job.is_public == True))).select().first()
    return response.json(dict(error=(job is None), job=job))

def get_jobs():
    # Time range
    time_range = request.vars.time_range
    
    # Sort type (newest or recently updated jobs)
    sort = request.vars.sort
    
    # Get the filtered weapons
    # Source: https://groups.google.com/forum/#!topic/web2py/Awb9qrdl1nM
    weps = request.vars.get("weps[]", [])
    if isinstance(weps, basestring):
        weps = [weps]
    
    # Get the tags
    tags = request.vars.get("tags[]", [])
    if isinstance(tags, basestring):
        tags = [tags]
    
    # The jobs that we will retrieve.
    jobs = []
    
    # Determine if we're looking for public jobs.
    if  request.vars.public == "true":
        get_public_jobs = True
    else:
        get_public_jobs = False
    
    # Job title to search for
    search = request.vars.search or ""
    
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
    
    # Build the query
    q = (db.job.name.contains(search)) & (db.job.max_players >= min_players) & (db.job.max_players <= max_players) & (db.job.salary >= min_salary)

    # If we want to get public jobs, make sure the job is public.
    if (get_public_jobs):
        q = q & (db.job.is_public == True)
    else: # Otherwise, we just want our jobs.
        q = q & (db.job.user_id == auth.user_id)
        # If public_jobs is true, then we only want to see our public jobs.
        if (request.vars.public_jobs == "true"):
            q = q & (db.job.is_public == True)
    
    # Search for custom models?
    if (request.vars.custom_model == "true"):
        q = q & (db.job.workshop != "")
    
    # Vote only?
    if (request.vars.vote_only == "true"):
        q = q & (db.job.vote == True)
    
    # Admin only?
    if (request.vars.admin_only == "true"):
        q = q & (db.job.admin_only == True)
    
    # Filter the weapons.
    for wep in weps:
        if wep != "custom_swep":
            q = q & (db.job.weapons.contains(wep))
        else:
            q = q & (db.job.has_custom_swep == True)
    
    # Filter the tags.
    # For this context, OR logic makes the most sense.
    tag_q = None

    for tag in tags:
        if (tag_q is not None):
            tag_q = tag_q | (db.job.tag.contains(tag))
        else:
            tag_q = (db.job.tag.contains(tag))

    if (tag_q is not None):
        q = q & tag_q
    
    # Sources:
    #   https://groups.google.com/forum/#!topic/web2py/PrIo2I-fgCc
    #   https://stackoverflow.com/questions/35066588/is-there-a-simple-way-to-increment-a-datetime-object-one-month-in-python
    if (time_range != "any"):
        # Grab today's date.
        todaysDate = datetime.datetime.utcnow().date()
        
        if (time_range == "day"):
            q = q & (db.job.created_on >= ( todaysDate - relativedelta(days=+1) ) )
        elif (time_range == "week"):
            q = q & ( db.job.created_on >= ( todaysDate - relativedelta(weeks=+1) ) )
        elif (time_range == "month"):
            q = q & ( db.job.created_on >= ( todaysDate - relativedelta(months=+1) ) )
        elif (time_range == "year"):
            q = q & ( db.job.created_on >= ( todaysDate - relativedelta(years=+1) ) )
        
    if (max_salary >= 0):
        q = q & (db.job.salary <= max_salary)

    result = db(q)
    count = result.count()
    
    if (sort == "newest"):
        jobs = result.select(
                orderby=~db.job.created_on,
                limitby=(pn * jobs_per_page, (pn + 1) * jobs_per_page))
    elif (sort == "recent"):
        jobs = result.select(
                orderby=~db.job.updated_on,
                limitby=(pn * jobs_per_page, (pn + 1) * jobs_per_page))
    else:
        jobs = result.select(
                orderby=~db.job.created_on,
                limitby=(pn * jobs_per_page, (pn + 1) * jobs_per_page))

    
    rCount = (count // jobs_per_page)
    if ((count % jobs_per_page) > 0):
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
    logged_in = auth.user is not None
    
    try:
        start_idx = int(request.vars.start)
        end_idx = int(request.vars.end)
        id = int(request.vars.id)
    except:
        return response.json(dict(comments=[], logged_in=logged_in, has_more=False))
    
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
                created_on = r.created_on.strftime("%B %d, %Y")
            )
            get_comments.append(c)
        else:
            has_more = True
    
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
    if request.vars.body.strip() == "":
        return response.json(dict(error="Comments can't be empty."))
    else:
        job = db((db.job.id == request.vars.id) & ((db.job.user_id == auth.user_id) | (db.job.is_public == True))).select().first()
        
        if (job is None):
            return response.json(dict(error="Job no longer exists."))
        else:
            c_id = db.post.insert(
                post_id = int(job.id),
                body = request.vars.body
            )
            c = db.post(c_id)
            return response.json(dict(comment = dict(post_id = c.post_id, body=c.body,
                                                    user_id = c.user_id, username = c.username,
                                                    created_on = c.created_on.strftime("%B %d, %Y"))))