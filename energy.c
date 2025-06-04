
#include <stdio.h>
#include <string.h>

#define ef else if
#define I int
#define D D
#define R return

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
	D F_geo;
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
	D heat[E_TYPE_COUNT];
	D cool[E_TYPE_COUNT];
	D watr[E_TYPE_COUNT];
	D fast[E_TYPE_COUNT];
} Energy;

//============================
//=House======================
//============================
typedef struct {
	HouseType type;
	I       Atemp;
	Energy    E;
	const Location *L;
} House;

// “Constructor” for House
House newHouse(HouseType type, I atemp, const Location *L) {
	House h;
	h.type  = type;
	h.Atemp = atemp;
	memset(&h.E, 0, sizeof(Energy));
	h.L     = L;
	R h;
}

//============================
//=Limits Struct==============
//============================
typedef struct {
	D EP;
	D EL;
	D UM;
	D LL;
} LimitVals;

//============================
//=Function Prototypes========
//============================
I       EPpet(const House *h);
void      toPDF(I Ep);
LimitVals limit(const House *h);
void      printHouse(const House *h);

//============================
//=Main=======================
//============================
I main() {
	House h = newHouse(SMALL, 100, &locations[1]);  // “Åland”

	// example input
	h.E.heat[ELECTRIC]  = 120;
	h.E.cool[FJARRKYLA] = 40;

	printHouse(&h);
	R 0;
}

//============================
//=Core Calculation===========
//============================
I EPpet(const House *h) {
	D total = 0;
	D F_geo = h->L->F_geo;
	I    Atemp = h->Atemp;

	for (I i = 0; i < E_TYPE_COUNT; i++) {
		total += (
				((h->E.heat[i] / F_geo) 
				 + h->E.cool[i] + h->E.watr[i] + h->E.fast[i]) *
				(E_wght[i] / Atemp)
			 );
	}
	R (I)total;
}

//============================
//=Limits Calculation=========
//============================
#define NoReq 9999
#define seSec -1
D elBase(D F_geo)	{ R 		  (4.5 + 1.7 * (F_geo - 1.0)); 		     }
D el1(D F_geo, D atemp)	{ R (atemp>130)	? (.025+.02*(F_geo - 1.0))*(atemp-130) 	: 0; }
D ep2()			{ R (flow>.35)	? 40*(qavg-.35)				: 0; } //qmedel
D el3()			{ R (flow>.35)	? (.022+.02*(F_geo))*(q-.35)*atemp 	: 0; }//q

// 2 flags, qavg/flow?
D ep4(){
	//...i flerbostadshus där Atemp är 50 m² eller större
	if(atemp<50){ R 0;}       
	// qmedel är uteluftsflödet i temperaturreglerade utrymmen överstiger 0,35 l/s per m². 
	if(flow <=.35){ R 0;}       
	//större och som till övervägande delen (>50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² 
	//Tillägget kan enbart användas på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök 
	if(!Foot4 ){ R 0;}
	// får högst tillgodoräknas upp till 0,6 l/s per m².
	if(flow > .6){ flow = .6;}       
	R 40*(qavg-.35);
}

D el5() {
    // ...i flerbostadshus där Atemp är 50 m² eller större
    if (atemp < 50) { R 0; }
    // Tillägget kan enbart användas då det maximala uteluftsflödet vid DVUT i temperaturreglerade utrymmen q överstiger 0,35 l/s per m²
    if (flow <= 0.35) { R 0; }
    // på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök
    // och som till övervägande delen (>50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² vardera
    if (!Foot5) { R 0; }
    //...Tillägg får göras med (0,022 + 0,02 x (F_geo -1)) x (q – 0,35) x Atemp

    R (0.022 + 0.02 * (F_geo - 1.0)) * (flow - 0.35) * atemp;
}


LimitVals limit(const House *h) {
	LimitVals l = {0, 0, 0, 0};
	I    atemp = h->Atemp;
	D F_geo = h->L->F_geo;

	//table 9:2a
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
			l.EP = 75.0 +ep4();
			l.EL = elBase(F_geo) + el1(F_geo, atemp)+ el5();
			l.UM = 0.40;
			l.LL = seSec;
		}
	}
	ef (h->type == LOCAL) {
		if (atemp > 50) {
			l.EP = 70.0 +ep2();
			l.EL = elBase(F_geo) + el1(F_geo, atemp)+ el3();
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
//=PrI House Data===========
//============================
void printHouse(const House *h) {
	printf("House type: %s\n", HouseType_name[h->type]);
	printf("Atemp: %d m²\n", h->Atemp);
	printf("Location: %s (F_geo = %.2f)\n", h->L->name, h->L->F_geo);

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
		if (h->E.heat[i] != 0.0 || h->E.cool[i] != 0.0 ||
				h->E.watr[i] != 0.0 || h->E.fast[i] != 0.0)
			printf("\n");
	}

	I ep = EPpet(h);
	printf("Calculated EP: %d\n", ep);

	LimitVals lim = limit(h);
	printf("Limits → EP: %.1f, EL: %.1f, UM: %.2f, LL: %.2f\n", lim.EP, lim.EL, lim.UM, lim.LL);
}

//============================
//=PDF Stub===================
//============================
void toPDF(I Ep) { }

















/*

   varje verksamhet upptar. Om mer än hälften av byggnadens area utgörs av lokaler med tillverkning, kan byggnaden komma att omfattas av undantaget för industrianläggningar och verkstäder. Om mer än hälften av byggnadens area är kontor eller lager eller liknande, där ingen tillverkning sker, omfattas byggnaden Ie av undantaget
   ...

9:2c.
Ett högre primärenergital och högre eleffekt än vad som anges i tabell 9:2a kan godtas

för lokaler avsedda för verksamhet av tillfällig karaktär, eller

i andra fall om särskilda förhållanden föreligger.

Allmänt råd
Med verksamhet av tillfällig karaktär avses som utgångspunkt verksamhet som pågår i två år eller kortare tid.
Med särskilda förhållanden avses till exempel när alternativ till el för uppvärmning och tappvarmvatten Ie finns och värmepump Ie kan användas. Hur mycket högsta tillåtna primärenergital och eleffekt enligt tabell 9:2a behöver överskridas som en följd av de särskilda förhållandena bör visas i en särskild utredning.


...
Ytterligare regler om klimatskärmens lufttäthet ur fukt- och ventilationssynpunkt framgår av avsnitten 6:255 Täthet
och 6:531 Lufttäthet. Regler om täthet mot brandspridning, finns i avsnitt 5 Brandskydd.
...

Allmänt råd
Ventilationssystems eleffektivitet bör, vid dimensionerande luftflöde, Ie överskrida följande värden på specifik fläkteffekt (SFP):

Typ	SFP, kW/(m³/s)
Från- och tilluft med värmeåtervinning	1,5
Från- och tilluft utan värmeåtervinning	1,1
Frånluft med återvinning	1,6
Frånluft	0,5

För ventilationssystem med varierande luftflöden, mindre luftflöden än 0,2 m³/s eller drifttider kortare än 800 timmar per år kan högre SFP-värden vara acceptabla.










16 §. (2021/65) Energideklaration av system över 70 kilowatt
Om det i en byggnad finns ett uppvärmningssystem eller ett luftkonditioneringssystem, separat eller kombinerat
med ett ventilationssystem med en nominell effekt på över 70 kilowatt ska energideklarationen innehålla
1) en bedömning av värmegeneratorns verkningsgrad och storlek i förhållande till byggnadens
uppvärmningsbehov, alternativt luftkonditioneringens verkningsgrad och storlek i förhållande till byggnadens
kylbehov och
2) rekommendationer om kostnadseffektiva förbättringar av systemets energiprestanda.
En bedömning enligt 1 mom. behöver Ie omfatta värmegeneratorns eller luftkonditioneringssystemets storlek
om systemet i fråga Ie har ändrats sedan en bedömning enligt detta moment senast gjordes.


*/

