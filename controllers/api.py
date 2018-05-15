import datetime

def get_jobs():
    jobs = []
    search = request.vars.search or ''
    
    # We make a try-catch block to prevent any internal errors.
    try:
        pn = int(request.vars.page) - 1
    except:
        pn = 0
    
    jobsPerPage = 8
    count = 0
    
    if auth.user is not None:
        result = db((db.job.user_id == auth.user_id) & (db.job.name.contains(search)))
        count = result.count()
        jobs = result.select(
                limitby=(pn * jobsPerPage, (pn + 1) * jobsPerPage))
        
    rCount = (count // jobsPerPage)
    if ((count % 8) > 0):
        rCount = rCount + 1
    
    # This is just in-case someone visits a non-existent page.
    #if (pn > rCount):
    #    redirect(URL('', vars={'page': rCount}))
    #elif (pn < 0):
    #    redirect(URL('', vars={'page': 1}))
    
    return response.json(
        dict(   jobs = jobs,
                count = count,
                pages = rCount)
    )

def get_comments():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
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