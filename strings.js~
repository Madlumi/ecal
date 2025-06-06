
// =====================
// All user‐facing text, keyed by language.
// =====================
const STRINGS = {
  // Application title
  app_title: {
    sv: "Energi kalkyl",
    en: "Energy Calculator",
    fi: "Energi laskuri"
  },

  // Disclaimer (only shown if non‐empty)
  disclaimer: {
    sv: "",
    en: "⚠ This text is machine‐translated and has not been human‐verified.",
    fi: "⚠ Tämä teksti on konekäännetty eikä sitä ole tarkistanut ihminen."
  },

  // Language selector (labels not strictly necessary since flags are obvious)
  language_label: {
    sv: "Språk:",
    en: "Language:",
    fi: "Kieli:"
  },

  // Geography
  geography_label: {
    sv: "Geografisk Justeringsfaktor:",
    en: "Geographic Adjustment Factor:",
    fi: "Maantieteellinen säätökerroin:"
  },
  geography_help: {
    sv: "",
    en: "",
    fi: ""
  },

  // House type
  housetype_label: {
    sv: "Hustyp:",
    en: "House Type:",
    fi: "Talotyyppi:"
  },
  housetype_help: {
    sv: "",
    en: "",
    fi: ""
  },

  // Footnotes heading + labels
  footnotes_heading: {
    sv: "Extra ventilationsfotnoter (endast flerbostadshus):",
    en: "Extra ventilation footnotes (only multi‐family):",
    fi: "Lisäilmanvaihdon alaviitteet (vain kerrostalot):"
  },
  foot4_label: {
    sv: "Eppet tillägg enligt 9:2a, fotnot 4",
    en: "EPpet addition per 9:2a, footnote 4",
    fi: "EPpet-lisä per 9:2a, alaviite 4"
  },
  foot4_help: {
    sv: "Tillägg får göras med 40 × (qₘₑdₑₗ – 0,35) i flerbostadshus där Atemp ≥ 50 m² och som till övervägande delen (> 50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² vardera och qₘₑdₑₗ (uteluftsflöde) > 0,35 l/s per m². Tillägget kan enbart användas på grund av krav på ventilation i särskilda utrymmen (badrum, toalett, kök) och får högst tillgodoräknas upp till 0,6 l/s per m².",
    en: "Addition is allowed with 40 × (qₘₑdₑₗ – 0.35) in multi‐family buildings where Atemp ≥ 50 m² and > 50 % of Atemp consists of apartments ≤ 35 m² each, and qₘₑdₑₗ (outdoor airflow) > 0.35 l/s·m². This extra only applies due to required ventilation in special rooms (bath, toilet, kitchen) and is capped at 0.6 l/s·m².",
    fi: "Lisä voidaan tehdä 40 × (qₘₑdₑₗ – 0,35) kerrostaloissa, joissa Atemp ≥ 50 m² ja yli 50 % Atempista on asuntoja ≤ 35 m², ja qₘₑdₑₗ (ulkouutislämpö) > 0,35 l/s·m². Tämä lisä on sallittu vain erityistilojen (kylpyhuone, WC, keittiö) ilmanvaihdon vuoksi ja enintään 0,6 l/s·m²."
  },
  foot5_label: {
    sv: "Elleffekt tillägg enligt 9:2a, fotnot 5",
    en: "Electrical load addition per 9:2a, footnote 5",
    fi: "Sähkötehon lisäys per 9:2a, alaviite 5"
  },
  foot5_help: {
    sv: "Tillägg får göras med (0,022 + 0,02 × (F<sub>geo</sub> – 1)) × (q – 0,35) × Atemp i flerbostadshus där Atemp ≥ 50 m² och som till övervägande delen (> 50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² vardera. Tillägget kan enbart användas då det maximala uteluftsflödet vid DVUT i temperaturreglerade utrymmen q överstiger 0,35 l/s per m² på grund av krav på ventilation i särskilda utrymmen (badrum, toalett, kök).",
    en: "Addition is allowed with (0.022 + 0.02 × (F<sub>geo</sub> – 1)) × (q – 0.35) × Atemp in multi‐family buildings where Atemp ≥ 50 m² and > 50 % of Atemp area is apartments ≤ 35 m² each, and the maximum outdoor airflow (q) in temperature‐controlled spaces at DVUT exceeds 0.35 l/s·m², due to required ventilation in special rooms (bath, toilet, kitchen).",
    fi: "Lisä voidaan tehdä (0,022 + 0,02 × (F<sub>geo</sub> – 1)) × (q – 0,35) × Atemp kerrostaloissa, joissa Atemp ≥ 50 m² ja yli 50 % Atempista on asuntoja ≤ 35 m², ja maksimoulkoilmanvaihto (q) DVUT:ssa lämpötilasäädetyissä tiloissa ylittää 0,35 l/s·m² erityistilojen (kylpyhuone, WC, keittiö) ilmanvaihdon vaatimusten vuoksi."
  },

  // Flow (q)
  flow_label: {
    sv: "Flöde (q):",
    en: "Flow (q):",
    fi: "Virtaus (q):"
  },
  flow_help: {
    sv: "Uteluftsflöde i liter per sekund och kvadratmeter.",
    en: "Outdoor airflow in liters per second per square meter.",
    fi: "Ulkouutislämpö litroina sekunnissa neliömetrillä."
  },

  // Atemp
  atemp_label: {
    sv: "Atemp (m²):",
    en: "Atemp (m²):",
    fi: "Atemp (m²):"
  },
  atemp_help: {
    sv: "Arean av samtliga våningsplan, vindsplan och källarplan för temperaturreglerade utrymmen, avsedda att värmas till mer än 10 °C, som begränsas av klimatskärmens insida. Area som upptas av innerväggar, öppningar för trappa, schakt och dylikt inräknas. Area för garage inräknas inte.",
    en: "The area of all floors, attic, and basement for temperature‐controlled spaces intended to be heated above 10 °C, bounded by the interior of the building envelope. Area occupied by interior walls, stair openings, shafts, etc., is included; garage area (inside the building) is not counted.",
    fi: "Lämpötilasäädeltyjen tilojen pinta‐ala, mukaan lukien kaikki kerrokset, yläkerrat ja kellarit, jotka on tarkoitus lämmittää yli 10 °C, sisäisen rakennuskuoren sisällä. Sisäseinien, portaiden, hormien jne. pinta‐ala sisältyy; autotallin pinta‐alaa ei lasketa."
  },

  // Permalink
  permalink_label: {
    sv: "Permalänk:",
    en: "Permalink:",
    fi: "Pysyvä linkki:"
  },
  permalink_help: {
    sv: "Länk med dessa värden",
    en: "Link with these values",
    fi: "Linkki näillä arvoilla"
  },

  // Clear & Copy buttons
  clear_button: {
    sv: "Rensa formulär",
    en: "Clear Form",
    fi: "Tyhjennä lomake"
  },
  copy_button: {
    sv: "Kopiera länk",
    en: "Copy Link",
    fi: "Kopioi linkki"
  },

  // EPpet + help
  ep_label: {
    sv: "Primärenergital (EP<sub>pet</sub>):",
    en: "Primary Energy Number (EP<sub>pet</sub>):",
    fi: "Ensisijainen energiakerroin (EP<sub>pet</sub>):"
  },
  ep_help: {
    sv: "Det värde som beskriver byggnadens energiprestanda uttryckt som ett primärenergital. Primärenergitalet utgörs av byggnadens energianvändning, där energi till uppvärmning har korrigerats med den geografiska justeringsfaktorn (F<sub>geo</sub>), multiplicerat med viktningsfaktor för energibärare och fördelat på Atemp (kWh/m²·år).",
    en: "The value describing the building’s energy performance expressed as a primary energy number. It is computed from the building’s energy use—corrected for heating by the geographic factor (F<sub>geo</sub>)—multiplied by weighting factors for energy carriers, and divided by Atemp (kWh/m²·yr).",
    fi: "Arvo, joka kuvaa rakennuksen energiatehokkuutta ensisijaisena energiana. Lasketaan rakennuksen energiankulutuksesta ottaen huomioon lämmityksessä maantieteellinen kerroin (F<sub>geo</sub>), kerrottuna energialähteiden painokertoimilla ja jaettuna Atempillä (kWh/m²·vuosi)."
  },

  // Limits column headers
  limit_ep: {
    sv: "EP<sub>pet</sub> (kWh/m²·år)",
    en: "EP<sub>pet</sub> (kWh/m²·yr)",
    fi: "EP<sub>pet</sub> (kWh/m²·vuosi)"
  },
  limit_el: {
    sv: "EL (kW)",
    en: "EL (kW)",
    fi: "EL (kW)"
  },
  limit_um: {
    sv: "U<sub>m</sub> (W/m²·K)",
    en: "U<sub>m</sub> (W/m²·K)",
    fi: "U<sub>m</sub> (W/m²·K)"
  },
  limit_ll: {
    sv: "Luftläckage (l/s·m²)",
    en: "Air leakage (l/s·m²)",
    fi: "Ilmanvuoto (l/s·m²)"
  },
  limit_ll_help: {
    sv: "Byggnadens klimatskärm ska vara så tät att kraven på byggnadens primärenergital och installerad eleffekt för uppvärmning uppfylls.",
    en: "The building envelope must be airtight enough to meet primary energy number and installed heating load requirements.",
    fi: "Rakennuksen lämmöneristys on oltava niin tiivis, että ensisijainen energiakerroin ja asennettu lämmitystehovaatimus täyttyvät."
  },

  warning_tooltip: {
    sv: "Överskrider gräns",
    en: "Exceeds limit",
    fi: "Ylittää rajan"
  },

  // “No requirement” literal to replace 9999
  no_requirement: {
    sv: "Inget krav",
    en: "No requirement",
    fi: "Ei vaatimus"
  },

  // Energy‐use table label + row labels
  energy_table_label: {
    sv: "Energyfaktorer (kW/år):",
    en: "Energy factors:",
    fi: "Energia‐tekijät:"
  },
  energy_row_heat: {
    sv: "Värme",
    en: "Heat",
    fi: "Lämpö"
  },
  energy_row_cool: {
    sv: "Kylning",
    en: "Cooling",
    fi: "Jäähdytys"
  },
  energy_row_watr: {
    sv: "Vatten",
    en: "Water",
    fi: "Vesi"
  },
  energy_row_fast: {
    sv: "Fastighet",
    en: "Facility",
    fi: "Kiinteistö"
  },

  // Row‐specific help
  energy_row_heat_help: {
    sv: "Energi till uppvärmning",
    en: "",
    fi: ""
  },
  energy_row_cool_help: {
    sv: "Energi till komfortkyla, kWh/år. Den till byggnaden levererade kyl- eller energimängd som används för att sänka byggnadens innetemperatur för människors komfort.  Kylenergi som hämtas direkt från omgivningen utan kylmaskin från sjövatten, uteluft eller dylikt (s.k. frikyla), inräknas inte.",
    en: "",
    fi: ""
  },
  energy_row_watr_help: {
    sv: "Energi till tappvarmvatten",
    en: "",
    fi: ""
  },
  energy_row_fast_help: {
    sv: "Fastighetsenergi, kWh/år. Den del av byggnadens energianvändning som är relaterad till byggnadens behov där den energikrävande apparaten finns inom under eller anbringad på utsidan av byggnaden. I fastighetsenergin ingår fast belysning i allmänna utrymmen och driftsutrymmen. Dessutom ingår energi som används i värmekablar, pumpar, fläktar, motorer, styr‐ och övervakningsutrustning och dylikt. Även externt lokalt placerad apparat som försörjer byggnaden, exempelvis pumpar och fläktar för frikyla, inräknas. Apparater avsedda för annan användning än för byggnaden, exempelvis motor‐ och kupévärmare för fordon, batteriladdare för extern användare, belysning i trädgård och på gångstråk, inräknas inte. Med fastighetsel menas den del av fastighetsenergin som är elbaserad.",
    en: "Facility energy, kWh/yr. The portion of the building’s energy use related to equipment installed within, under, or attached to the building. Includes fixed lighting in common areas and service spaces, plus energy used by heating cables, pumps, fans, motors, control/monitoring equipment, etc. Also includes externally placed equipment serving the building (e.g. free‐cooling pumps/fans). Excludes equipment intended for non‐building uses (e.g. vehicle block heaters, external battery chargers, garden path lighting). Facility electricity—i.e. that portion of facility energy which is electric—also counts here.",
    fi: "Kiinteistöenergia, kWh/v. Rakennuksen energiankulutuksen osa, joka liittyy laitteisiin, jotka on asennettu rakennuksen sisälle, alle tai kiinnitetty rakennuksen ulkopuolelle. Sisältää kiinteän valaistuksen yleisissä tiloissa ja huoltotiloissa sekä energian, jota käyttävät lämpökaapelit, pumput, puhaltimet, moottorit, ohjaus‐ ja valvontalaitteet jne. Sisältää myös rakennusta palvelevat ulkoiset laitteet (esim. vapaajäähdytyspumput tai puhaltimet). Ei sisällä laitteita, joiden tarkoitus on muu kuin rakennuksen käyttö (esim. ajoneuvojen lohkolämmittimet, ulkoiset lataajat, puistovalaistus). Kiinteistösähkö eli se osa kiinteistöenergiasta, joka on sähköä, lasketaan mukaan."
  },

  // “?” icon character
  info_icon: {
    sv: "?",
    en: "?",
    fi: "?"
  }
};
