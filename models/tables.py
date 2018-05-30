# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_utc_time():
    return datetime.datetime.utcnow()

def get_user_id():
    return auth.user_id if auth.user is not None else None

def get_username():
    return auth.user.username if auth.user is not None else None

db.define_table('job',
                Field('user_id', 'reference auth_user', default=get_user_id()),
                Field('job_id', 'string', placeholder='DOCTOR'),
                Field('name', 'string', placeholder='Doctor'),
                Field('description', 'text', placeholder="Heal the community."),
                Field('workshop', 'string'),
                Field('suggested_model', 'string'),
                Field('preview_url', 'string'),
                Field('color', 'string', default='23B5EB'),
                Field('model', 'string', placeholder='models/player/kleiner.mdl'),
                Field('salary', 'integer', placeholder=0),
                Field('max_players', 'integer', placeholder=2),
                Field('admin_only', 'boolean'),
                Field('tag', 'string', default="Citizen"),
                Field('vote', 'boolean'),
                Field('weapons', 'list:string', default=[]),
                Field('is_public', 'boolean', default=False),
                Field('has_custom_swep', 'boolean', default=False),
                Field('created_by', default=get_username()),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', default=datetime.datetime.utcnow())
                )

db.define_table('post',
                Field('post_id', 'reference job', ondelete='CASCADE'),
                Field('username', default=get_username()),
                Field('user_id', default=get_user_id()),
                Field('created_on', 'datetime', default=get_utc_time()),
                Field('body', 'text')
                )

db.define_table('favorite',
                Field('user_id', default=get_user_id()),
                Field('job_id', 'reference job', ondelete='CASCADE')
               )

db.job.user_id.writable = db.job.user_id.readable = False
db.job.is_public.writable = db.job.is_public.readable = False
db.job.created_by.writable = db.job.created_by.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
