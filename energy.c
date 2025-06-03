
#include <stdio.h>
#include <string.h>

#define ef else if

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

const double E_wght[E_TYPE_COUNT] = {
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
	double F_geo;
} Location;

static const Location locations[] = {
	{ "default", 1.0 },
	{ "Åland",   1.1 }
};

//============================
//=House Type=================
//============================
typedef enum {
	SMALL,
	MULTI,
	LOCAL,
	HOUSE_TYPE_COUNT
} HouseType;

const char *HouseType_name[HOUSE_TYPE_COUNT] = {
	[SMALL] = "SMALL",
	[MULTI] = "MULTI",
	[LOCAL] = "LOCAL"
};

//============================
//=Energy Use=================
//============================
typedef struct {
	double heat[E_TYPE_COUNT];
	double cool[E_TYPE_COUNT];
	double watr[E_TYPE_COUNT];
	double fast[E_TYPE_COUNT];
} Energy;

//============================
//=House======================
//============================
typedef struct {
	HouseType type;
	int       Atemp;
	Energy    E;
	const Location *L;
} House;

// “Constructor” for House
House newHouse(HouseType type, int atemp, const Location *L) {
	House h;
	h.type  = type;
	h.Atemp = atemp;
	memset(&h.E, 0, sizeof(Energy));
	h.L     = L;
	return h;
}

//============================
//=Limits Struct==============
//============================
typedef struct {
	double EP;
	double EL;
	double UM;
	double LL;
} LimitVals;

//============================
//=Function Prototypes========
//============================
int       EPpet(const House *h);
void      toPDF(int Ep);
LimitVals limit(const House *h);
void      printHouse(const House *h);

//============================
//=Main=======================
//============================
int main() {
	House h = newHouse(SMALL, 100, &locations[1]);  // “Åland”

	// example input
	h.E.heat[ELECTRIC]  = 120;
	h.E.cool[FJARRKYLA] = 40;

	printHouse(&h);
	return 0;
}

//============================
//=Core Calculation===========
//============================
int EPpet(const House *h) {
	double total = 0;
	double F_geo = h->L->F_geo;
	int    Atemp = h->Atemp;

	for (int i = 0; i < E_TYPE_COUNT; i++) {
		total += (
				((h->E.heat[i] / F_geo) 
				 + h->E.cool[i] + h->E.watr[i] + h->E.fast[i]) *
				(E_wght[i] / Atemp)
			 );
	}
	return (int)total;
}

//============================
//=Limits Calculation=========
//============================
/*TODO make sure we calculate everything correcly*/
LimitVals limit(const House *h) {
	LimitVals l = {0, 0, 0, 0};
	int    atemp = h->Atemp;
	double F_geo = h->L->F_geo;

	if (h->type == SMALL) {
		if (atemp > 130) {
			l.EP = 90.0;
			l.EL = 4.5 + 1.7 * (F_geo - 1.0);
			l.UM = 0.30;
			l.LL = -1.0;  // “see section”
		}
		ef (atemp > 90) {
			l.EP = 95.0;
			l.EL = 4.5 + 1.7 * (F_geo - 1.0);
			l.UM = 0.30;
			l.LL = -1.0;
		}
		ef (atemp > 50) {
			l.EP = 100.0;
			l.EL = 4.5 + 1.7 * (F_geo - 1.0);
			l.UM = 0.30;
			l.LL = -1.0;
		}
		ef (atemp >= 0) {
			l.EP = -1.0;   // “no requirement”
			l.EL = -1.0;
			l.UM = 0.33;
			l.LL =  0.60;
		}
	}
	ef (h->type == MULTI) {
		if (atemp >= 0) {
			l.EP = 75.0;
			l.EL = 4.5 + 1.7 * (F_geo - 1.0);
			l.UM = 0.40;
			l.LL = -1.0;
		}
	}
	ef (h->type == LOCAL) {
		if (atemp > 50) {
			l.EP = 70.0;
			l.EL = 4.5 + 1.7 * (F_geo - 1.0);
			l.UM = 0.50;
			l.LL = -1.0;
		}
		ef (atemp >= 0) {
			l.EP = -1.0;
			l.EL = -1.0;
			l.UM = 0.33;
			l.LL =  0.60;
		}
	}
	return l;
}

//============================
//=Print House Data===========
//============================
void printHouse(const House *h) {
	printf("House type: %s\n", HouseType_name[h->type]);
	printf("Atemp: %d m²\n", h->Atemp);
	printf("Location: %s (F_geo = %.2f)\n", h->L->name, h->L->F_geo);

	printf("Energy use:\n");
	for (int i = 0; i < E_TYPE_COUNT; i++) {
		if (h->E.heat[i] != 0.0)
			printf("  %s heat: %.1f  ", E_name[i], h->E.heat[i]);
		if (h->E.cool[i] != 0.0)
			printf("  %s cool: %.1f  ", E_name[i], h->E.cool[i]);
		if (h->E.watr[i] != 0.0)
			printf("  %s watr: %.1f  ", E_name[i], h->E.watr[i]);
		if (h->E.fast[i] != 0.0)
			printf("  %s fast: %.1f  ", E_name[i], h->E.fast[i]);
		if (h->E.heat[i] != 0.0 || h->E.cool[i] != 0.0 ||
				h->E.watr[i] != 0.0 || h->E.fast[i] != 0.0)
			printf("\n");
	}

	int ep = EPpet(h);
	printf("Calculated EP: %d\n", ep);

	LimitVals lim = limit(h);
	printf("Limits → EP: %.1f, EL: %.1f, UM: %.2f, LL: %.2f\n",
			lim.EP, lim.EL, lim.UM, lim.LL);
}

//============================
//=PDF Stub===================
//============================
void toPDF(int Ep) { }

















/*

   varje verksamhet upptar. Om mer än hälften av byggnadens area utgörs av lokaler med tillverkning, kan byggnaden komma att omfattas av undantaget för industrianläggningar och verkstäder. Om mer än hälften av byggnadens area är kontor eller lager eller liknande, där ingen tillverkning sker, omfattas byggnaden inte av undantaget
   ...

9:2c.
Ett högre primärenergital och högre eleffekt än vad som anges i tabell 9:2a kan godtas

för lokaler avsedda för verksamhet av tillfällig karaktär, eller

i andra fall om särskilda förhållanden föreligger.

Allmänt råd
Med verksamhet av tillfällig karaktär avses som utgångspunkt verksamhet som pågår i två år eller kortare tid.
Med särskilda förhållanden avses till exempel när alternativ till el för uppvärmning och tappvarmvatten inte finns och värmepump inte kan användas. Hur mycket högsta tillåtna primärenergital och eleffekt enligt tabell 9:2a behöver överskridas som en följd av de särskilda förhållandena bör visas i en särskild utredning.


...
Ytterligare regler om klimatskärmens lufttäthet ur fukt- och ventilationssynpunkt framgår av avsnitten 6:255 Täthet
och 6:531 Lufttäthet. Regler om täthet mot brandspridning, finns i avsnitt 5 Brandskydd.
...

Allmänt råd
Ventilationssystems eleffektivitet bör, vid dimensionerande luftflöde, inte överskrida följande värden på specifik fläkteffekt (SFP):

Typ	SFP, kW/(m³/s)
Från- och tilluft med värmeåtervinning	1,5
Från- och tilluft utan värmeåtervinning	1,1
Frånluft med återvinning	1,6
Frånluft	0,5

För ventilationssystem med varierande luftflöden, mindre luftflöden än 0,2 m³/s eller drifttider kortare än 800 timmar per år kan högre SFP-värden vara acceptabla.











