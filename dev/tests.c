#include <stdio.h>

#define main energy_main
#include "energy.c"
#undef main

static int pass = 1;

void test_EPpet() {
    House h = newHouse(SMALL, 100, &locations[0], &tvvFactors[0]);
    h.E.heat[ELECTRIC] = 120.0;
    h.E.cool[FJARRKYLA] = 40.0;
    int ep = EPpet(&h);
    if (ep == 16) {
        printf("EPpet test PASS\n");
    } else {
        printf("EPpet test FAIL (got %d)\n", ep);
        pass = 0;
    }
}

void test_limit() {
    House h = newHouse(SMALL, 100, &locations[0], &tvvFactors[0]);
    LimitVals lim = limit(&h);
    if (lim.EP == 95.0 && lim.EL > 4.66 && lim.EL < 4.68 &&
        lim.UM == 0.30 && lim.LL == seSec) {
        printf("limit test PASS\n");
    } else {
        printf("limit test FAIL (EP=%.1f, EL=%.2f, UM=%.2f, LL=%.2f)\n",
               lim.EP, lim.EL, lim.UM, lim.LL);
        pass = 0;
    }
}

int main() {
    test_EPpet();
    test_limit();
    if (pass) {
        printf("ALL TESTS PASSED\n");
        return 0;
    } else {
        printf("SOME TESTS FAILED\n");
        return 1;
    }
}

