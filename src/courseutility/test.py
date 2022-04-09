#!/usr/bin/python3

import unittest

loader = unittest.TestLoader()
suites = loader.discover("./test")
runner = unittest.TextTestRunner()
runner.run(suites)