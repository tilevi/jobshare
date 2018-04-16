# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None

def boot_form_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'form-control',
                 _placeholder=field.placeholder,
                 _value=value,
                 requires=field.requires)

def color_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'jscolor',
                 _style = 'padding: 5px; max-width: 100%;',
                 _value=value,
                 requires=field.requires)

db.define_table('job',
                Field('user_email', default=get_user_email()),
                Field('job_id', 'string', placeholder='TEAM_CITIZEN', widget=boot_form_widget),
                Field('name', 'string', placeholder='Citizen', widget=boot_form_widget),
                Field('description', 'text', default=''),
                Field('color', 'string', default='54ED1D', widget=color_widget),
                Field('salary', 'integer', placeholder=45, widget=boot_form_widget),
                Field('admin_only', 'boolean', default=False),
                Field('vote', 'boolean', default=False),
                Field('weapons', 'string', default='')
                )

db.job.user_email.writable = db.job.user_email.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
