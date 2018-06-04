
# Tables.py

import datetime, json

def get_utc_time():
    return datetime.datetime.utcnow()

def get_user_id():
    return auth.user_id if auth.user is not None else None

def get_username():
    return auth.user.username if auth.user is not None else None

db.define_table('job',
                Field('user_id', 'reference auth_user', default=get_user_id()),
                
                Field('job_id', 'string', default=""),
                Field('name', 'string', default=""),
                Field('description', 'text', default=""),
                Field('model', 'string',  default=""),
                
                Field('workshop', 'string', default=""),
                Field('suggested_model', 'string', default=""),
                Field('preview_url', 'string', default=""),
                
                Field('color', 'string', default=""),
                
                Field('salary', 'integer', default=45),
                Field('max_players', 'integer', default=2),
                Field('tag', 'string', default=""),
                Field('weapons', 'list:string', default=[]),
                
                Field('vote', 'boolean', default=False),
                Field('admin_only', 'boolean', default=False),
                
                Field('is_public', 'boolean', default=False),
                Field('has_custom_swep', 'boolean', default=False),
                
                Field('resources', 'json', default=json.dumps([])),
                
                Field('created_by', default=get_username()),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', default=datetime.datetime.utcnow())
                )

db.define_table('post',
                Field('post_id', 'reference job', ondelete='CASCADE'),
                Field('username', default=get_username()),
                Field('user_id', default=get_user_id()),
                Field('created_on', 'datetime', default=get_utc_time()),
                Field('body', 'text', default="")
                )

db.job.user_id.writable = db.job.user_id.readable = False
db.job.is_public.writable = db.job.is_public.readable = False
db.job.created_by.writable = db.job.created_by.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
