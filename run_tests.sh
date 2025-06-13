#!/bin/sh
# Compile and run C tests

gcc -o dev/tests dev/tests.c -lm
./dev/tests > test_output.txt
