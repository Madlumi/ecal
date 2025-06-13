#include <stdio.h>
#include <math.h>

#define main energy_main
#include "energy.c"
#undef main

#define DEQ(a,b,t) (fabs((a)-(b)) < (t))
#define PF printf

I TTvv() {
    I F=0;
    House h = newHouse(SMALL, 100, &locations[0], &tvvFactors[0]);
    D t = Tvv(h);
    if (DEQ(t, 2000.0, 0.01)) {
        PF("Tvv SMALL PASS\n");
    } else {
        PF("Tvv SMALL FAIL (got %.2f)\n", t);
        F++;
    }
    h.type = MULTI;
    t = Tvv(h);
    if (DEQ(t, 2500.0, 0.01)) {
        PF("Tvv MULTI PASS\n");
    } else {
        PF("Tvv MULTI FAIL (got %.2f)\n", t);
        F++;
    }
    h.type = LOCAL;
    t = Tvv(h);
    if (DEQ(t, 200.0, 0.01)) {
        PF("Tvv LOCAL PASS\n");
    } else {
        PF("Tvv LOCAL FAIL (got %.2f)\n", t);
        F++;
    }
    R F;
}

I TNewHouse() {
    I F=0;
    House h = newHouse(SMALL, 100, &locations[0], &tvvFactors[1]);
    if (h.E.heat[ELECTRIC] == 0.0 && h.E.cool[ELECTRIC] == 0.0 &&
        h.E.watr[ELECTRIC] == 2000.0 && h.foot2 == 0 && h.foot3 == 0 &&
        h.foot4 == 0 && h.foot5 == 0 && h.Rooms == 0 &&
        DEQ(h.HouseHoldEnergy, 0.0, 0.0001) &&
        DEQ(h.uval.U_roof, 0.0, 0.0001) && h.energyusage == NULL) {
        PF("newHouse PASS\n");
    } else {
        PF("newHouse FAIL\n");
        F++;
    }
    R F;
}

I THelpers() {
    I F=0;
    if(!DEQ(elBase(1.1),4.67,0.01)){PF("elBase FAIL\n");F++;}
    if(!DEQ(el1(1.1,150),0.54,0.01)){PF("el1 FAIL\n");F++;}
    if(!DEQ(ep2(0.5),6.0,0.01)){PF("ep2 FAIL\n");F++;}
    if(!DEQ(el3(1.1,0.4,100),0.12,0.01)){PF("el3 FAIL\n");F++;}
    if(!DEQ(ep4(1.1,0.5,0.4,100,1),2.0,0.01)){PF("ep4 FAIL\n");F++;}
    if(!DEQ(ep4(1.1,0.8,0.7,100,1),10.0,0.01)){PF("ep4 cap FAIL\n");F++;}
    if(!DEQ(el5(1.1,0.5,100,1),0.36,0.01)){PF("el5 FAIL\n");F++;}
    R F;
}

I TEPpet() {
    I F=0;
    House h = newHouse(SMALL, 100, &locations[0], &tvvFactors[0]);
    if (EPpet(&h) == 13) {
        PF("EPpet base PASS\n");
    } else {
        PF("EPpet base FAIL (got %d)\n", EPpet(&h));
        F++;
    }
    h.E.heat[ELECTRIC] = 120.0;
    h.E.cool[FJARRKYLA] = 40.0;
    if (EPpet(&h) == 16) {
        PF("EPpet combo PASS\n");
    } else {
        PF("EPpet combo FAIL (got %d)\n", EPpet(&h));
        F++;
    }

    House m = newHouse(MULTI, 100, &locations[0], &tvvFactors[0]);
    m.E.heat[FOSSIL_GAS] = 80.0;
    if (EPpet(&m) == 18) {
        PF("EPpet multi PASS\n");
    } else {
        PF("EPpet multi FAIL (got %d)\n", EPpet(&m));
        F++;
    }

    House l = newHouse(LOCAL, 100, &locations[0], &tvvFactors[0]);
    if (EPpet(&l) == 1) {
        PF("EPpet local PASS\n");
    } else {
        PF("EPpet local FAIL (got %d)\n", EPpet(&l));
        F++;
    }
    R F;
}

I TLimitSmall() {
    I F=0;
    House h = newHouse(SMALL, 40, &locations[0], &tvvFactors[0]);
    LimitVals lim = limit(&h);
    if (lim.EP == NoReq && lim.EL == NoReq && DEQ(lim.UM, 0.33, 0.001) &&
        DEQ(lim.LL, 0.60, 0.001)) {
        PF("limit small low PASS\n");
    } else {
        PF("limit small low FAIL\n");
        F++;
    }
    h.Atemp = 100;
    lim = limit(&h);
    if (DEQ(lim.EP, 95.0, 0.01) && DEQ(lim.EL, 4.67, 0.02) &&
        DEQ(lim.UM, 0.30, 0.001) && lim.LL == seSec) {
        PF("limit small mid PASS\n");
    } else {
        PF("limit small mid FAIL\n");
        F++;
    }
    h.Atemp = 140;
    lim = limit(&h);
    if (DEQ(lim.EP, 90.0, 0.01) && DEQ(lim.EL, 4.94, 0.02) &&
        DEQ(lim.UM, 0.30, 0.001) && lim.LL == seSec) {
        PF("limit small high PASS\n");
    } else {
        PF("limit small high FAIL\n");
        F++;
    }
    R F;
}

I TLimitMulti() {
    I F=0;
    House h = newHouse(MULTI, 100, &locations[0], &tvvFactors[0]);
    h.flow = 0.5;
    h.qavg = 0.4;
    h.foot4 = 1;
    h.foot5 = 1;
    LimitVals lim = limit(&h);
    if (DEQ(lim.EP, 77.0, 0.01) && DEQ(lim.EL, 5.03, 0.02) &&
        DEQ(lim.UM, 0.40, 0.001) && lim.LL == seSec) {
        PF("limit multi PASS\n");
    } else {
        PF("limit multi FAIL\n");
        F++;
    }
    R F;
}

I TLimitLocal() {
    I F=0;
    House h = newHouse(LOCAL, 60, &locations[0], &tvvFactors[0]);
    h.flow = 0.4;
    h.qavg = 0.4;
    h.foot2 = 1;
    h.foot3 = 1;
    LimitVals lim = limit(&h);
    if (DEQ(lim.EP, 72.0, 0.01) && DEQ(lim.EL, 4.74, 0.02) &&
        DEQ(lim.UM, 0.50, 0.001) && lim.LL == seSec) {
        PF("limit local PASS\n");
    } else {
        PF("limit local FAIL\n");
        F++;
    }
    R F;
}

I main() {
    I F=0;
    F += TTvv();
    F += TNewHouse();
    F += THelpers();
    F += TEPpet();
    F += TLimitSmall();
    F += TLimitMulti();
    F += TLimitLocal();
    if (F == 0) {
        PF("ALL TESTS PASSED\n");
        R 0;
    } else {
        PF("%d TESTS FAILED\n", F);
        R 1;
    }
}
