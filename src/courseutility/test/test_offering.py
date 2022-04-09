import unittest

from modules.course import Course
from modules.course import Offering

#Using unittest, add functions to run a single test each.
class TestOffering(unittest.TestCase):

    def setUp(self):
        self.offering0 = Offering("WF") #Winter Fall every year
        self.offering1 = Offering("s",2,1) #Summer odd years
        self.offering2 = Offering("s",19,7) #Summer odd years

    def tearDown(self):
        pass

    #Checking if any year winter and fall is correct
    def test_check_semester(self):
        self.assertTrue(self.offering0.check_semester(2022, "WF"))
        self.assertTrue(self.offering0.check_semester(2023, "F"))
        self.assertTrue(self.offering1.check_semester(2021, "S"))
        self.assertFalse(self.offering1.check_semester(2020, "S"))
        self.assertFalse(self.offering1.check_semester(2021, "f"))

    def test_next_year(self):
        # print(self.offering2.next_year(2020))
        self.assertEqual(self.offering2.next_year(2020),2021,"Somthing airt workin right")
        self.assertNotEqual(self.offering2.next_year(2020), 2022, "bad")