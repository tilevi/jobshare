# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_id():
    return auth.user_id if auth.user is not None else None

def get_username():
    return auth.user.username if auth.user is not None else None

def boot_form_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'form-control',
                 _placeholder=field.placeholder,
                 _value=value,
                 _maxlength=50,
                 requires=field.requires)

def number_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'form-control',
                 _type='number',
                 _min=0,
                 _step=1,
                 _placeholder=field.placeholder,
                 _value=value,
                 requires=field.requires)

def number_widget2(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'form-control',
                 _type='number',
                 _min=1,
                 _step=1,
                 _placeholder=field.placeholder,
                 _value=value,
                 requires=field.requires)

def textarea_widget(field, value):
    return TEXTAREA(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'form-control',
                 _style='max-height: 100px',
                 _placeholder=field.placeholder,
                 _value=value,
                 requires=field.requires)

def color_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _class = 'jscolor',
                 _onchange ="setCode();",
                 _style = 'padding: 5px; max-width: 100%; height: 38px;',
                 _value=value,
                 requires=field.requires)

def tag_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _placeholder='Add weapon classes',
                 _value='css',
                 _type='hidden')

def check_widget(field, value):
    return INPUT(_name=field.name,
                 _id="%s_%s" % (field._tablename, field.name),
                 _value='',
                 _type='checkbox')

db.define_table('job',
                Field('user_id', default=get_user_id()),
                Field('job_id', 'string', placeholder='MUGGER', widget=boot_form_widget),
                Field('name', 'string', placeholder='Mugger', widget=boot_form_widget),
                Field('description', 'text', placeholder="Mug the streets, become rich and spend your 'hard-earned' cash.", widget=boot_form_widget),
                Field('color', 'string', default='3d3d3d', widget=color_widget),
                Field('model', 'string', placeholder='models/player/phoenix.mdl', widget=boot_form_widget),
                Field('salary', 'integer', placeholder=0, widget=number_widget),
                Field('max_players', 'integer', placeholder=2, widget=number_widget2),
                Field('admin_only', 'boolean', default=False),
                Field('vote', 'boolean', default=False),
                Field('weapons', 'string', widget=tag_widget)
                )

db.define_table('post',
                Field('post_id', 'reference job'),
                Field('username', default=get_username()),
                Field('user_id', default=get_user_id()),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('body', 'text')
                )

db.job.user_id.writable = db.job.user_id.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)