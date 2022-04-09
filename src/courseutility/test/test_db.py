import unittest

from modules.course import Course
from modules.db import CourseDB
import modules.sort
import modules.search

#Using unittest, add functions to run a single test each.
class TestDB(unittest.TestCase):

    def setUp(self):
        self.test_db = CourseDB()
        self.test_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph"))
        self.test_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph"))
        self.test_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph"))

    def tearDown(self):
        pass

    def test_db_eq(self):
        # expected db
        temp_db = CourseDB()
        temp_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph"))
        temp_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph"))
        temp_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph"))
        # perform test
        self.assertEqual(self.test_db, temp_db, "Courses not Equal")

    def test_db_neq(self):
        # not equal database
        temp_db = CourseDB()
        temp_db.add_course(Course("Data Science", "Beeps and boops", "CIS", "4020", 0.5, "Guelph"))
        # perform test
        self.assertNotEqual(self.test_db, temp_db, "Courses Equal")

    def test_db_sort(self):
        # expected output
        temp_db = CourseDB()
        temp_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph"))
        temp_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph"))
        temp_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph"))
        # sorting test db
        self.test_db.sort_courses(modules.sort.code_key) #Sort by code should yield above course structure
        # perform test
        self.assertEqual(self.test_db, temp_db, "Courses Not Sorted")

    def test_db_load(self):
        # creating db and loading courses
        loaded_db = CourseDB()
        loaded_db.load_db(self.test_db, lambda crs: crs.code.startswith('2'))
        # expected output
        temp_db = CourseDB()
        temp_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph"))
        # perform test
        self.assertEqual(loaded_db, temp_db, "Loading/Filter failed")

    def test_db_filter(self):
        # creating db and filtering courses
        filtered_db = CourseDB()
        filtered_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph"))
        filtered_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph"))
        filtered_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph"))
        filtered_db.filter_courses(modules.search.DepartmentFilter("MATH"))
        # expected output
        temp_db = CourseDB()
        temp_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph"))
        temp_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph"))
        # perform test
        self.assertEqual(temp_db, filtered_db, "Filter did not work")
