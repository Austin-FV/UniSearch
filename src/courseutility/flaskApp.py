#!/usr/bin/python3

import functools
from flask import Flask, request, abort
from cli import load_file, parse_file, parse_majors, deptcode_guelph, deptcode_waterloo
import modules.db as database
import modules.course as course
import modules.search as search
import json

app = Flask(__name__)
import os
#app.config['APPLICATION_ROOT'] = '/api'

# @app.route("/getAllCourses")
# def getAllCourses():
#     guelphCourses = os.popen('./cli.py -u Guelph').read()
#     waterlooCourses = os.popen('./cli.py -u Waterloo').read()
#     print(guelphCourses)

##### Load the courses #####

guelph_fn = '../temp/parsedCoursesGuelph.json'
guelph_pfn = '../temp/parsedProgramsGuelph.json'
waterloo_fn = '../temp/parsedCoursesWaterloo.json'
degree_fn = '../temp/parsedProgramsGuelph.json'

def load_courses(fn, dc):
    f = load_file(fn)
    db, dept = parse_file(f, dc)
    return db

def load_programs(fn):
    f = load_file(fn)
    return parse_majors(f)


guelph_db = load_courses(guelph_fn, deptcode_guelph)
guelph_programs = load_programs(guelph_pfn)
waterloo_db = load_courses(waterloo_fn, deptcode_waterloo)
dbs = {"guelph": guelph_db, "waterloo": waterloo_db}

##### Helper Functions #####

def db_chooser(dbs = dbs):
    def db_chooser_builder(fn):
        @functools.wraps(fn)
        def db_chooser_wrapper(*args, **kwargs):
            university = request.args.get("university")
            if(university):
                try:    
                    kwargs["db"] = dbs[university]
                except BaseException:
                    abort(404)
            return fn(*args, **kwargs)
        return db_chooser_wrapper
    return db_chooser_builder

def sort_code(c):
    return c.coursecode()

def sort_name(c):
    return c.name

sort_mapping = {
    'name': sort_name,
    'code': sort_code
}

def sort_chooser(sort_table = sort_mapping):
    def sort_chooser_builder(fn):
        @functools.wraps(fn)
        def sort_chooser_wrapper(*args, **kwargs):
            try:
                sorter = request.args.get('sortby')
                if(sorter):
                    kwargs["sortby"] = sort_table[sorter]
            except BaseException:
                abort(400)
            return fn(*args, **kwargs)
        return sort_chooser_wrapper
    return sort_chooser_builder

def course_code(c):
    return c.coursecode()

def course_detailed(c):
    return {
        "code": c.coursecode(),
        "title": c.name,
        "desc": c.desc,
        "prereqs": str(c.prerequisite.literal) if c.prerequisite else None,
        "prereq_simple": c.get_all_prereqs(),
        #This next line takes each offering and extracts the semesters.
        "offering": list(set(k for o in c.offering for k, v in o.semesters.items() if v == True)),
        "credits": c.credit
    }

def course_simplified(c):
    return {
        "code": c.coursecode(),
        "title": c.name,
        "desc": c.desc,
        "credits": c.credit
    }

def course_prereqs(c):
    return {
        "code": c.coursecode(),
        "prereq_simple": c.get_all_prereqs()
    }
    
function_mapping = {
    "coursedetailed": course_detailed,
    "coursesimplified": course_simplified,
    "courseprereqs": course_prereqs,
    "coursecode": course_code,
}

def output_detail(fn_table = function_mapping):
    def output_detail_builder(fn):
        @functools.wraps(fn)
        def output_detail_wrapper(*args, **kwargs):
            try:
                format = request.args.get('format')
                if(format):
                    kwargs["format_fn"] = fn_table[format]
            except BaseException:
                abort(400)
            return fn(*args, **kwargs)
        return output_detail_wrapper
    return output_detail_builder

##### API Itself #####

@app.route("/")
def hello():
    return "<h1 style='color:brown'>Hello World!</h1>"

@app.route("/search")
@output_detail()
@sort_chooser()
@db_chooser()
def route_search(*, db = guelph_db, format_fn = course_code, sortby = None):
    args = request.args
    
    sort = request.args.get("sort")
    offerings = request.args.get("offerings")
    dept = request.args.get("dept")
    code = request.args.get("code")
    credits = request.args.get("credits")

    filters = []

    if(offerings):
        filters.append(search.SemesterFilter(offerings))
    if(dept):
        filters.append(search.DepartmentFilter(dept))
    if(code):
        filters.append(search.CodeFilter(code))
    if(credits):
        try:
            credits = float(credits)
        except ValueError:
            abort(400)
        filters.append(search.CreditFilter(credits))

    filter = search.ConjunctiveFilter(filters)

    return json.dumps(db.output_courses(filter.test, format_fn, sortby))

@app.route("/course")
@output_detail()
@sort_chooser()
@db_chooser()
def route_course(*, db = guelph_db, format_fn = course_detailed, sortby = None):
    codes = request.args.getlist("code")
    return json.dumps(db.output_courses(lambda c: c.coursecode() in codes, format_fn, sortby))


@app.route("/course/prerequisites")
@output_detail()
@sort_chooser()
@db_chooser()
def route_course_prerequisites(*, db = guelph_db, format_fn = course_prereqs, sortby = None):
    codes = request.args.getlist("code")
    filter = search.CourseCodeFilter(codes)
    # Here, the algorithm will find all the prereqs not already seen in a previous db.
    # Then make a new DB with them.
    # DBs will accumulate until no new courses are seen, then merged together.
    # Finally, the merged DB will output.
    main_prereqs: database.CourseDB = database.CourseDB()
    last_db: database.CourseDB = database.CourseDB().load_db(db, filter.test)
    while len(last_db.courses):
        f = search.PrereqFilter([last_db], [main_prereqs])
        new_db = database.CourseDB().load_db(db, f.test)
        main_prereqs.load_db(last_db)
        last_db = new_db
    main_prereqs.load_db(last_db)
    return json.dumps(main_prereqs.output_courses(output_function = format_fn, sort_kf = sortby))

@app.route("/degree")
@output_detail()
@sort_chooser()
def route_degree(*, db = guelph_db, format_fn = course_code, sortby = None):
    programs = request.args.getlist("program")
    out = {}
    for program in programs:
        p = guelph_programs.get(program)
        filter = search.CourseCodeFilter(p)
        out[program] = db.output_courses(filter.test, format_fn, sortby)
    return json.dumps(out)

if __name__ == "__main__":
    app.run(host='0.0.0.0')
