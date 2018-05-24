import datetime
from dateutil.relativedelta import *

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
    
    if request.vars.public:
        getShared = True
    else:
        getShared = False
    
    # Search by job title
    search = request.vars.search or ''
    
    # We make a try-catch block to prevent any internal errors.
    try:
        pn = int(request.vars.page) - 1
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
    
    if (getShared):
        q = (db.job.is_public == True) & (db.job.name.contains(search)) & (db.job.max_players >= min_players) & (db.job.max_players <= max_players) & (db.job.salary >= min_salary)
        
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
                    orderby=~db.job.created_on,
                    limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
        else:
            jobs = result.select(
                    orderby=~db.job.created_on,
                    limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
        
        
        
        
        
    
    elif auth.user is not None:
        result = db((db.job.user_id == auth.user_id) & (db.job.name.contains(search)))
        count = result.count()
        jobs = result.select(
                limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
    
    rCount = (count // jobsPerPage)
    if ((count % jobsPerPage) > 0):
        rCount = rCount + 1
    
    # This is just in-case someone visits a non-existent page.
    if (pn > rCount):
        redirect(URL('', vars={'page': rCount}))
    elif (pn < 0):
        redirect(URL('', vars={'page': 1}))
    
    return response.json(
        dict(
                jobs = jobs,
                count = count,
                pages = rCount,
                page = (pn + 1)
        )
    )

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