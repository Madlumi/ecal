#!/bin/sh
# Compile and run C tests

gcc -o dev/tests dev/tests.c
./dev/tests > test_output.txt
