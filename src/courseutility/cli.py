#!/usr/bin/python3

import json
import getopt
import sys
import os
import codecs

from modules import db
from modules import course
from modules import search
from modules import sort
from modules import graph

deptcode_guelph = (lambda x, y: x + "*" + y)
deptcode_waterloo = (lambda x, y: x + " " + y)
deptcode_default = (lambda x, y: x + "" + y)


# load in the json file from the parse
def load_file(filename):
    with codecs.open(filename, encoding='utf-8') as file:
        return file.read()

def parse_file(string, deptcode_function):
    database = db.create_db()
    departments = []
    departments_ = json.loads(string)
    for department_ in departments_:
        dept_db = db.create_db()
        prefix = str(department_['prefix'])
        #print(str(department_['departmentName']))
        for course_ in department_.get('courses'):
            #print("\t" + str(course_['courseTitle']))
            title = course_.get('courseTitle')
            description = course_.get('description')
            code = course_.get('courseCode')
            credits = float(course_.get('credits'))
            location = course_.get('location')
            prerequisite = course_.get('prerequisite') # Temp
            prereq_string = course_.get('prerequisiteStr')
            c = course.Course(title,
                              description,
                              prefix, 
                              code,
                              credits,
                              location,
                              deptcode_function)
            if(prerequisite):
                p = course.Prereq(0,len(prerequisite),prerequisite,prereq_string)
                # p = course.Prereq(prerequisite['type'],prerequisite['requirement'],prerequisite['courses'])
                c.add_raw_prereq(p)
            offering_ = course_.get('offerings')
            if offering_.get('seasons'):
                add_seasons(c, offering_.get('seasons'))
            database.add_course(c)
            dept_db.add_course(c)
        departments.append({'name': department_.get('departmentName'), 'code': department_.get('prefix'), 'courses': dept_db})
    return database, departments

# Gotta be a better way to do this.
def parse_majors(string):
    majors = {}
    departments = json.loads(string)
    for department_ in departments:
        c = department_.get('code')
        for block_ in department_.get('blocks'):
            majors[c] = list(set(block_.get('courses')))
    return majors

def parse_major(string, target):
    filterset = set()
    departments = json.loads(string)
    for department_ in departments:
        if department_.get('code') != target: continue
        for block_ in department_.get('blocks'):
            filterset = list(set(block_.get('courses')))
            return filterset
    return []

def add_seasons(target_course: course.Course, seasons):
    target_course.add_offering(seasons, 0)

# saves database into file
# def save_file(filename, db):
#     pass

def parse_arguments(arguments):
    filter = []
    sorter = sort.name_key
    university = "Guelph"
    
    semester = None
    year = []
    cert = False
    credits = []
    departments = []
    codes = []
    offerings = []
    graph_flag = False
    graphAll_flag = False
    degree = None

    ## Possible Arguments
    # -f        File Path   
    # -s        Semester (requires -y)
    # -y        Year        
    # -c        Credit      
    # -C        Course Code      
    # -d        Department
    # --cert    Certainty (suppresses courses with no (known) offering pattern)
    # --graph   Creates a tree of courses with the given filters instead of text output\n"+
    # --degree  Degree code
    # --sort    Sorter      

    # Processing Arguments
    #print(str(args))
    optlist, args = getopt.getopt(arguments[1:], 'ih?u:s:c:d:C:', ['help','cert','graph', 'graphAll' ,'sortCode', 'degree='])
    #print(str(optlist), str(args))
    invert = False
    for o, a in optlist:
        if o in ['-h', '-?', '--help']: # help
            print("Usage: " + arguments[0] + " [options]\n"
                  "[-h]         Help\n"+
                  "[-u]         University\n"+
                  #"[-y]         Year\n"+

                  "\nPredicates:\n"+
                  "[-s]         Semester\n"+
                  "[-[i]c]      Credit\n"+
                  "[-[i]d]      Department\n"+
                  "[-[i]C]      Course code\n"+
                  "[--degree]   Degree program code\n"+

                  "\nFunctions:\n"
                  "[--cert]     Certainty (suppresses courses with no (known) offering pattern)\n"+
                  "[--graph]    Output a dot file instead, used to compile a graph\n"+
                  "[--sortCode] Sort by course code\n"
                  "[-i]         Invert the next predicate, if invertable: (!)")
            exit(0)
        elif o == '-i': # invert
            invert = True
            continue
        elif o == '-u': # university
            university = a
        elif o == '-y': # year
            year.append(int(a))
            pass
        elif o == '-s': # semester
            if(semester):
                print('Semester already defined')
                exit(-1)
            semester = course.decide_semester(a)
            if(not semester):
                print('Semester not recognized:', "shape=box")
                exit(-1)
        elif o == '-c': # credit
            credits.append(search.CreditFilter(float(a), inverse = invert))
            invert = False
        elif o == '-d': # department
            departments.append(search.DepartmentFilter(str(a).upper(), invert))
            invert = False
        elif o == '-C': # Code
            codes.append(search.CodeFilter(str(a), invert))
            invert = False
        elif o == '--cert': # certainty
            cert = True
        elif o == '--graph': # graphviz output
            graph_flag = True
        elif o == '--graphAll':
            graph_flag = True
            graphAll_flag = True
        elif o == '--degree': # get stuff from a degree instead
            degree = str(a).upper()
        elif o == '--sortCode':
            sorter = sort.code_key
        else:
            pass
        if invert == True:
            print("Improperly matched invert flag")
            exit(-1)
    if invert == True:
        print("Expected predicate after invert")
        exit(-1)

    # Processing Query
    for y in year:
        if(semester):
            offerings.append(search.SemesterFilter([semester], y, cert))
        else:
            offerings.append(search.YearFilter(y, cert))
    
    if credits: filter.append(search.DisjunctiveFilter(credits))
    if departments: filter.append(search.DisjunctiveFilter(departments))
    if offerings: filter.append(search.ConjunctiveFilter(offerings))
    if codes: filter.append(search.DisjunctiveFilter(codes))
        
    filename = "../temp/parsedCourses" + university + ".json"
    majors_filename = "../temp/parsedPrograms" + university + ".json"

    
    return (filename, majors_filename, university,
            search.ConjunctiveFilter(filter) if filter else search.Filter(True),
            sorter, False, graph_flag, graphAll_flag, degree)

# A straightforward run for now
def __main__():
    #print("Starting...", sys.argv)
    ### Parse Arguments
    filename, majors_filename, university, filter, sorter, interactive, graph_flag, graphAll_flag, degree = parse_arguments(sys.argv)

    # Check if files exist
    if not os.path.exists(filename): #or not os.path.exists(majors_filename):
        print("Error: Can't find parsed data")
        return -1

    # Load File
    file_string = load_file(filename)
    if not file_string:
        print("File not found or empty")
        return -1

    # Later, I'll separate these into their own modules.
    # At present, however, I have no idea how to do that.
    legend_function = \
        graph.guelph_legend if university == "Guelph" else \
        graph.waterloo_legend if university == "Waterloo" else \
        None
    deptcode_function = \
        deptcode_guelph if university == "Guelph" else \
        deptcode_waterloo if university == "Waterloo" else \
        deptcode_default
    color_function = \
        (lambda x: int(x[-4])) if university == "Guelph" else \
        (lambda x: int(x.split(" ")[1][0]) if len(x.split(" ")[1]) >= 3 and x.split(" ")[1][2].isdigit() else 0 ) if university == "Waterloo" else \
        (lambda : 0)
        # Thanks waterloo for having the least consistent course scheme I've seen so far.
        # They drop the leading zero, so you get course categories: xx, 1xx, 2xx... so on.

    # Parse File
    master_db, department_dbs = parse_file(file_string, deptcode_function)

    program_database = None
    program_filter = None
    if degree:
        if not os.path.exists(majors_filename):
            print("Error: Can't find program data")
            exit(1)
        majors_string = load_file(majors_filename)
        if not majors_string:
            print("File not found or empty")
            return -1
        program_database = parse_major(majors_string, degree)
        program_filter = search.CourseCodeFilter(program_database)
        filter = search.ConjunctiveFilter([filter, program_filter])


    # Create master db to use with graphing
    database = db.create_db()

    desired_graphs = []

    #We only really need to change two elements of this call so...
    quickgraph = lambda g, n = None: graph.create_graph(master_db, g, deptcode_function, color_function, legend_function, title = n)

    if(graphAll_flag):
        for dept in department_dbs:
            #print(str(department))
            desired_graphs.append(quickgraph(dept['courses'], dept['name']))
    else:
        database.load_db(master_db, filter.test)
        # Apply Sort
        database.sort_courses(sorter)
        desired_graphs = [quickgraph(database, None)]

    # Print graph output
    if graph_flag:
        graphstr = ""
        for g in desired_graphs:
            graphstr += g + "\n"

        # Write to file
        with open("../temp/graph.dot", "w") as f:
            f.write(graphstr)

        os.system('dot -Tps:cairo:cairo ../temp/graph.dot | ps2pdf - > graph.pdf')
        print('graph.dot and graph.pdf created!')

    # Print text output
    else:
        print(database.format_database())

if __name__ == '__main__':
    exit(__main__())
