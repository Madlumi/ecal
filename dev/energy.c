

#include <stdio.h>
#include <string.h>

#define ef        else if
#define I         int
#define D         double
#define R         return

typedef enum {
    SMALL,
    MULTI,
    LOCAL,
    HOUSE_TYPE_COUNT
} HouseType;
//============================
//=Energy sources=============
//============================
typedef enum {
    ELECTRIC,
    FJARRVARME,
    FJARRKYLA,
    BIOBRANSLE,
    FOSSIL_OLJA,
    FOSSIL_GAS,
    E_TYPE_COUNT
} EType;

const D E_wght[E_TYPE_COUNT] = {
    [ELECTRIC]    = 1.8,
    [FJARRVARME]  = 0.7,
    [FJARRKYLA]   = 0.6,
    [BIOBRANSLE]  = 0.6,
    [FOSSIL_OLJA] = 1.8,
    [FOSSIL_GAS]  = 1.8
};

const char *E_name[E_TYPE_COUNT] = {
    [ELECTRIC]    = "El",
    [FJARRVARME]  = "Fjärrvärme",
    [FJARRKYLA]   = "Fjärrkyla",
    [BIOBRANSLE]  = "Biobränslen",
    [FOSSIL_OLJA] = "Fossil olja",
    [FOSSIL_GAS]  = "Fossil gas"
};

//============================
//=Location===================
//============================

typedef struct {
    char name[256];
    D    factor;
} EntryD;

static const Location locations[] = {
    { "Åland",   1.1 },
    { "none", 1.0 },
};

//============================
//=Location===================
//============================


static const EntryD tvvFactors[] = {
    { .name = "Fjärrvärme",                           .factor = 1.00 },
    { .name = "El, direktverkande och elpanna",       .factor = 1.00 },
    { .name = "El, frånluftsvärmepump",               .factor = 1.70 },
    { .name = "El, uteluft-vattenvärmepump",          .factor = 2.00 },
    { .name = "El, markvärmepump (berg, mark, sjö)",  .factor = 2.50 },
    { .name = "Biobränslepanna (pellets, ved, flis m.m.)", .factor = 0.75 },
    { .name = "Olja",                                 .factor = 0.85 },
    { .name = "Gaspanna",                             .factor = 0.90 }
};
const double TvvMult[HOUSE_TYPE_COUNT] = {
    [SMALL] = 20
    [MULTI] = 25
    [LOCAL] = 2
};

//Tvv=TvvMult[]*atemp/tvvFactors[].factor 

//============================
//=House Type=================
//============================

const char *HouseType_name[HOUSE_TYPE_COUNT] = {
    [SMALL] = "SMALL",
    [MULTI] = "MULTI",
    [LOCAL] = "LOCAL"
};




//============================
//=Energy Use=================
//============================
typedef struct {
    D heat[E_TYPE_COUNT];
    D cool[E_TYPE_COUNT];
    D watr[E_TYPE_COUNT];
    D fast[E_TYPE_COUNT];
} Energy;

//============================
//=House======================
//============================
typedef struct {
    HouseType      type;
    I              Atemp;      // Heated area in m²
    Energy         E;          // Energy uses
    const Location *L;         // Location pointer
    D              flow;       // Instantaneous airflow (q) [l/s·m²]
    D              qavg;       // Average airflow (q_medel) [l/s·m²]
    I              foot4;      // Footnote-4 flag
    I              foot5;      // Footnote-5 flag
} House;

//============================
//=Limits Struct==============
//============================
typedef struct {
    D EP;   // Primärenergital
    D EL;   // Installerad eleffekt
    D UM;   // U-värde
    D LL;   // Luftläckage
} LimitVals;

//============================
//=Helper Functions============
//============================
#define NoReq  9999.0
#define seSec  -1.0

D elBase(D F_geo) { R (4.5 + 1.7 * (F_geo - 1.0)); }

D el1(D F_geo, I atemp) {
    // (0,025 + 0,02 × (F_geo − 1)) × (Atemp − 130) om Atemp > 130 m²
    if (atemp <= 130) { R 0; }
    R (0.025 + 0.02 * (F_geo - 1.0)) * (atemp - 130);
}

D ep2(D qavg) {
    // 40 × (q_medel − 0,35) om q_medel > 0,35
    if (qavg <= 0.35) { R 0; }
    R 40 * (qavg - 0.35);
}

D el3(D F_geo, D flow, I atemp) {
    // (0,022 + 0,02 × (F_geo − 1)) × (flow − 0,35) × Atemp om flow > 0,35 l/s·m²
    if (flow <= 0.35) { R 0; }
    R (0.022 + 0.02 * (F_geo - 1.0)) * (flow - 0.35) * atemp;
}

D ep4(D F_geo, D flow, D qavg, I atemp, I Foot4) {
    // ...i flerbostadshus där Atemp är 50 m² eller större
    if (atemp < 50) { R 0; }
    // q_medel är uteluftsflödet i temperaturreglerade utrymmen överstiger 0,35 l/s·m²
    if (qavg <= 0.35) { R 0; }
    // Tillägget kan enbart användas på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök
    if (!Foot4) { R 0; }
    // får högst tillgodoräknas upp till 0,6 l/s·m²
    if (flow > 0.6) { flow = 0.6; }
    R 40 * (qavg - 0.35);
}

D el5(D F_geo, D flow, I atemp, I Foot5) {
    // ...i flerbostadshus där Atemp är 50 m² eller större
    if (atemp < 50) { R 0; }
    // Tillägget kan enbart användas då det maximala uteluftsflödet vid DVUT i temperaturreglerade utrymmen q överstiger 0,35 l/s·m²
    if (flow <= 0.35) { R 0; }
    // på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök
    // och som till övervägande delen (>50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² vardera
    if (!Foot5) { R 0; }
    // Tillägg får göras med (0,022 + 0,02 × (F_geo − 1)) × (flow − 0,35) × Atemp
    R (0.022 + 0.02 * (F_geo - 1.0)) * (flow - 0.35) * atemp;
}

//============================
//=Function Prototypes========
//============================
House     newHouse(HouseType type, I atemp, const Location *L);
I         EPpet(const House *h);
LimitVals limit(const House *h);
void      printHouse(const House *h);
void      toPDF(I Ep);

//============================
//=Constructor================
//============================
House newHouse(HouseType type, I atemp, const Location *L) {
    House h;
    h.type   = type;
    h.Atemp  = atemp;
    memset(&h.E, 0, sizeof(Energy));
    h.L      = L;
    h.flow   = 0.0;
    h.qavg   = 0.0;
    h.foot4  = 0;
    h.foot5  = 0;
    R h;
}

//============================
//=Main=======================
//============================
I main() {
    // Create a House (Åland, SMALL, Atemp = 100)
    House h = newHouse(SMALL, 100, &locations[1]);

    // Example inputs:
    h.E.heat[ELECTRIC]   = 120.0;
    h.E.cool[FJARRKYLA]  = 40.0;
    h.flow               = 0.5;   // example instantaneous airflow (q)
    h.qavg               = 0.4;   // example average airflow (q_medel)
    h.foot4              = 1;     // footnote-4 applies
    h.foot5              = 1;     // footnote-5 applies

    printHouse(&h);
    R 0;

}

//============================
//=Core Calculation===========
//============================
I EPpet(const House *h) {
    D total = 0.0;
    D F_geo = h->L->F_geo;
    I  Atemp = h->Atemp;

    for (I i = 0; i < E_TYPE_COUNT; i++) {
        total += (
            (h->E.heat[i] / F_geo
             + h->E.cool[i]
             + h->E.watr[i]
             + h->E.fast[i])
            * (E_wght[i] / Atemp)
        );
    }
    R (I)total;
}

//============================
//=Limits Calculation=========
//============================
LimitVals limit(const House *h) {
    LimitVals l = {0.0, 0.0, 0.0, 0.0};
    I      atemp = h->Atemp;
    D      F_geo = h->L->F_geo;
    D      flow  = h->flow;
    D      qavg  = h->qavg;

    if (h->type == SMALL) {
        if (atemp > 130) {
            l.EP = 90.0;
            l.EL = elBase(F_geo) + el1(F_geo, atemp);
            l.UM = 0.30;
            l.LL = seSec;
        }
        ef (atemp > 90) {
            l.EP = 95.0;
            l.EL = elBase(F_geo) + el1(F_geo, atemp);
            l.UM = 0.30;
            l.LL = seSec;
        }
        ef (atemp > 50) {
            l.EP = 100.0;
            l.EL = elBase(F_geo) + el1(F_geo, atemp);
            l.UM = 0.30;
            l.LL = seSec;
        }
        ef (atemp >= 0) {
            l.EP = NoReq;
            l.EL = NoReq;
            l.UM = 0.33;
            l.LL = 0.60;
        }
    }
    ef (h->type == MULTI) {
        if (atemp >= 0) {
            l.EP = 75.0 + ep4(F_geo, flow, qavg, atemp, h->foot4);
            l.EL = elBase(F_geo) + el1(F_geo, atemp) + el5(F_geo, flow, atemp, h->foot5);
            l.UM = 0.40;
            l.LL = seSec;
        }
    }
    ef (h->type == LOCAL) {
        if (atemp > 50) {
            l.EP = 70.0 + ep2(qavg);
            l.EL = elBase(F_geo) + el1(F_geo, atemp) + el3(F_geo, flow, atemp);
            l.UM = 0.50;
            l.LL = seSec;
        }
        ef (atemp >= 0) {
            l.EP = NoReq;
            l.EL = NoReq;
            l.UM = 0.33;
            l.LL = 0.60;
        }
    }
    R l;
}

//============================
//=Print House Data===========
//============================
void printHouse(const House *h) {
    printf("House type: %s\n", HouseType_name[h->type]);
    printf("Atemp: %d m²\n", h->Atemp);
    printf("Location: %s (F_geo = %.2f)\n", h->L->name, h->L->F_geo);
    printf("Flow (q): %.2f   qavg (q_medel): %.2f\n", h->flow, h->qavg);
    printf("Foot4: %s   Foot5: %s\n",
           h->foot4 ? "Yes" : "No",
           h->foot5 ? "Yes" : "No");

    printf("Energy use:\n");
    for (I i = 0; i < E_TYPE_COUNT; i++) {
        if (h->E.heat[i] != 0.0)
            printf("  %s heat: %.1f  ", E_name[i], h->E.heat[i]);
        if (h->E.cool[i] != 0.0)
            printf("  %s cool: %.1f  ", E_name[i], h->E.cool[i]);
        if (h->E.watr[i] != 0.0)
            printf("  %s watr: %.1f  ", E_name[i], h->E.watr[i]);
        if (h->E.fast[i] != 0.0)
            printf("  %s fast: %.1f  ", E_name[i], h->E.fast[i]);
        if (h->E.heat[i] != 0.0 ||
            h->E.cool[i] != 0.0 ||
            h->E.watr[i] != 0.0 ||
            h->E.fast[i] != 0.0)
            printf("\n");
    }

    I ep = EPpet(h);
    printf("Calculated EP: %d\n", ep);

    LimitVals lim = limit(h);
    printf("Limits → EP: %.1f, EL: %.1f, UM: %.2f, LL: %.2f\n",
           lim.EP, lim.EL, lim.UM, lim.LL);
}

//============================
//=PDF Stub===================
//============================
void toPDF(I Ep) {
    // (stub)
    printf("EPpet (PDF output stub) = %d\n", Ep);
}


