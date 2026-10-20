/**
 * One entry per state page — 36 states plus the FCT.
 *
 * `name` must match `job.state` exactly (it is the value used by
 * /jobs?state=), and every category in `sectors` must exist in CATEGORIES.
 * Nothing here contains a number: counts are read live from the board on the
 * page itself, so a state page can never quote a figure the board does not
 * currently hold.
 */
export interface StatePage {
  /** URL segment, e.g. "akwa-ibom". */
  slug: string;
  /** Exact `job.state` value. */
  name: string;
  /** What the page headline calls the place. */
  label: string;
  capital: string;
  zone: "North Central" | "North East" | "North West" | "South East" | "South South" | "South West";
  /** Two sentences on what actually employs people there. No statistics. */
  blurb: string;
  /** Category names from CATEGORIES, most relevant first. */
  sectors: string[];
  /** Three states to cross-link, for internal discovery. */
  neighbours: string[];
}

export const STATE_PAGES: StatePage[] = [
  {
    slug: "abia",
    name: "Abia",
    label: "Abia",
    capital: "Umuahia",
    zone: "South East",
    blurb:
      "Abia runs on two engines. Aba is one of the country's densest manufacturing and trading clusters — shoes, garments, plastics, packaging — while Umuahia is the civil-service and university town. Most paid work sits in the Aba value chain or in state institutions.",
    sectors: ["Manufacturing & Production", "Sales & Marketing", "Education & Teaching"],
    neighbours: ["Imo", "Ebonyi", "Rivers"],
  },
  {
    slug: "adamawa",
    name: "Adamawa",
    label: "Adamawa",
    capital: "Yola",
    zone: "North East",
    blurb:
      "Adamawa is cattle, grain and riverain farming country, with Yola as the administrative and university centre. Livestock trading, agro-processing and the state civil service are the steady employers; NGO and relief work adds a layer of contract roles.",
    sectors: ["Agriculture", "Education & Teaching", "Government & NGO"],
    neighbours: ["Borno", "Gombe", "Taraba"],
  },
  {
    slug: "akwa-ibom",
    name: "Akwa Ibom",
    label: "Akwa Ibom",
    capital: "Uyo",
    zone: "South South",
    blurb:
      "Akwa Ibom is an oil-producing state with a large public sector and a fast-growing capital in Uyo. Beyond oil and gas, the state's own infrastructure programme, hospitality and the university system employ a broad mix of people.",
    sectors: ["Oil, Gas & Energy", "Government & NGO", "Hospitality & Food Services"],
    neighbours: ["Cross River", "Rivers", "Abia"],
  },
  {
    slug: "anambra",
    name: "Anambra",
    label: "Anambra",
    capital: "Awka",
    zone: "South East",
    blurb:
      "Anambra is trade and light manufacturing. Onitsha's main market and the surrounding industrial estates move goods across the whole country, while Awka and Nnewi add civil service, education and auto-parts production.",
    sectors: ["Sales & Marketing", "Manufacturing & Production", "Education & Teaching"],
    neighbours: ["Enugu", "Imo", "Kogi"],
  },
  {
    slug: "bauchi",
    name: "Bauchi",
    label: "Bauchi",
    capital: "Bauchi",
    zone: "North East",
    blurb:
      "Bauchi is an agricultural state with a substantial civil service and a growing mining interest. Grain, groundnut and livestock dominate the rural economy; the state capital holds the ministries, the teaching hospital and the university.",
    sectors: ["Agriculture", "Government & NGO", "Education & Teaching"],
    neighbours: ["Plateau", "Kano", "Gombe"],
  },
  {
    slug: "bayelsa",
    name: "Bayelsa",
    label: "Bayelsa",
    capital: "Yenagoa",
    zone: "South South",
    blurb:
      "Bayelsa is at the centre of the Niger Delta oil industry, and much of its formal employment follows that — operators, service contractors, marine logistics. Yenagoa adds the state civil service and a young university and college sector.",
    sectors: ["Oil, Gas & Energy", "Government & NGO", "Logistics & Transport"],
    neighbours: ["Rivers", "Delta", "Imo"],
  },
  {
    slug: "benue",
    name: "Benue",
    label: "Benue",
    capital: "Makurdi",
    zone: "North Central",
    blurb:
      "Benue is the country's food basket — yam, cassava, soyabean, citrus — and Makurdi sits on the Benue River as the collection and transport point. Agro-processing, haulage and the university system are where salaried jobs concentrate.",
    sectors: ["Agriculture", "Manufacturing & Production", "Education & Teaching"],
    neighbours: ["Nasarawa", "Taraba", "Cross River"],
  },
  {
    slug: "borno",
    name: "Borno",
    label: "Borno",
    capital: "Maiduguri",
    zone: "North East",
    blurb:
      "Maiduguri is the commercial and administrative centre of Borno, with a long trading history across the Lake Chad basin. Reconstruction, humanitarian programmes, agriculture and the state civil service are the main sources of paid work today.",
    sectors: ["Government & NGO", "Agriculture", "Logistics & Transport"],
    neighbours: ["Adamawa", "Gombe", "Yobe"],
  },
  {
    slug: "cross-river",
    name: "Cross River",
    label: "Cross River",
    capital: "Calabar",
    zone: "South South",
    blurb:
      "Calabar is a port and tourism city, and Cross River leans on both: hospitality, events and the free trade zone on one side, the state civil service and the university on the other. Cocoa and banana plantations support the rural economy.",
    sectors: ["Hospitality & Food Services", "Government & NGO", "Logistics & Transport"],
    neighbours: ["Akwa Ibom", "Rivers", "Benue"],
  },
  {
    slug: "delta",
    name: "Delta",
    label: "Delta",
    capital: "Asaba",
    zone: "South South",
    blurb:
      "Delta combines oil and gas with one of the stronger manufacturing bases in the south. Warri and Escravos anchor the energy industry, Asaba holds the civil service, and Sapele and Ughelli add processing and engineering work.",
    sectors: ["Oil, Gas & Energy", "Manufacturing & Production", "Engineering"],
    neighbours: ["Edo", "Bayelsa", "Ondo"],
  },
  {
    slug: "ebonyi",
    name: "Ebonyi",
    label: "Ebonyi",
    capital: "Abakaliki",
    zone: "South East",
    blurb:
      "Ebonyi is rice country — Abakaliki rice is a recognised local brand — alongside cassava, yam and a mineral belt of lead and limestone. Milling, quarrying and the state civil service provide the salaried jobs around Abakaliki.",
    sectors: ["Agriculture", "Manufacturing & Production", "Government & NGO"],
    neighbours: ["Enugu", "Abia", "Cross River"],
  },
  {
    slug: "edo",
    name: "Edo",
    label: "Edo",
    capital: "Benin City",
    zone: "South South",
    blurb:
      "Benin City is an education and arts city with a rubber and oil-palm hinterland, and Edo's manufacturing corridor runs north towards Auchi. Universities, hospitals, tyre and plastics plants and the state civil service all hire steadily.",
    sectors: ["Education & Teaching", "Manufacturing & Production", "Healthcare"],
    neighbours: ["Delta", "Ondo", "Kogi"],
  },
  {
    slug: "ekiti",
    name: "Ekiti",
    label: "Ekiti",
    capital: "Ado-Ekiti",
    zone: "South West",
    blurb:
      "Ekiti is the most education-intensive state per head in the south-west, with a university and a large teaching-service payroll in Ado-Ekiti. Farming — cocoa, kolanut, rice, cassava — and the state civil service employ most of the rest.",
    sectors: ["Education & Teaching", "Agriculture", "Government & NGO"],
    neighbours: ["Ondo", "Kogi", "Osun"],
  },
  {
    slug: "enugu",
    name: "Enugu",
    label: "Enugu",
    capital: "Enugu",
    zone: "South East",
    blurb:
      "Enugu was built on coal and remains the administrative and commercial capital of the south-east. State ministries, universities, hospitals and a large retail and distribution sector around Ogbete and the New Haven axis drive employment.",
    sectors: ["Administration & Office", "Education & Teaching", "Sales & Marketing"],
    neighbours: ["Anambra", "Ebonyi", "Kogi"],
  },
  {
    slug: "fct-abuja",
    name: "FCT Abuja",
    label: "Abuja (FCT)",
    capital: "Abuja",
    zone: "North Central",
    blurb:
      "Abuja is the federal capital, so government, embassies, development agencies and the consultancies that serve them dominate the job market. Banking, hospitality, real estate and a growing tech cluster follow the same payroll.",
    sectors: ["Government & NGO", "Banking & Finance", "Technology & IT"],
    neighbours: ["Niger", "Nasarawa", "Kogi"],
  },
  {
    slug: "gombe",
    name: "Gombe",
    label: "Gombe",
    capital: "Gombe",
    zone: "North East",
    blurb:
      "Gombe is a trading and farming state at the centre of the north-east, with a state university and a teaching hospital in the capital. Grain, groundnut and livestock move through its markets; the civil service is the largest formal employer.",
    sectors: ["Agriculture", "Government & NGO", "Sales & Marketing"],
    neighbours: ["Bauchi", "Borno", "Adamawa"],
  },
  {
    slug: "imo",
    name: "Imo",
    label: "Imo",
    capital: "Owerri",
    zone: "South East",
    blurb:
      "Owerri is a service city — hotels, retail, education, hospitals — and Imo's oil wells sit in the Oguta and Ohaji-Egbema belt. Small manufacturing and a very active trading sector fill in the rest of the employment picture.",
    sectors: ["Sales & Marketing", "Education & Teaching", "Oil, Gas & Energy"],
    neighbours: ["Abia", "Anambra", "Rivers"],
  },
  {
    slug: "jigawa",
    name: "Jigawa",
    label: "Jigawa",
    capital: "Dutse",
    zone: "North West",
    blurb:
      "Jigawa is farming and cross-border trade — sesame, groundnut, millet, livestock — with Dutse as the administrative centre. Small-scale processing and the state civil service are the steadiest formal employers.",
    sectors: ["Agriculture", "Sales & Marketing", "Government & NGO"],
    neighbours: ["Kano", "Bauchi", "Yobe"],
  },
  {
    slug: "kaduna",
    name: "Kaduna",
    label: "Kaduna",
    capital: "Kaduna",
    zone: "North West",
    blurb:
      "Kaduna is the north's industrial city: textiles, beverages, steel and defence manufacturing, plus one of the country's biggest railway junctions. That industrial base and the state's universities and military institutions prop up the job market.",
    sectors: ["Manufacturing & Production", "Logistics & Transport", "Education & Teaching"],
    neighbours: ["Kano", "Niger", "Plateau"],
  },
  {
    slug: "kano",
    name: "Kano",
    label: "Kano",
    capital: "Kano",
    zone: "North West",
    blurb:
      "Kano is the commercial capital of northern Nigeria. The Kurmi market and Sabon Gari trading networks, tanneries, textiles and food processing move goods across the Sahel, and the emirate's business houses still hire on reputation as much as on paper.",
    sectors: ["Sales & Marketing", "Manufacturing & Production", "Logistics & Transport"],
    neighbours: ["Jigawa", "Kaduna", "Bauchi"],
  },
  {
    slug: "katsina",
    name: "Katsina",
    label: "Katsina",
    capital: "Katsina",
    zone: "North West",
    blurb:
      "Katsina is agriculture and livestock — cotton, groundnut, millet, cattle — with a long trading tradition reaching into Niger Republic. The state civil service, education and agro-dealing hold the formal jobs.",
    sectors: ["Agriculture", "Sales & Marketing", "Government & NGO"],
    neighbours: ["Kano", "Kaduna", "Zamfara"],
  },
  {
    slug: "kebbi",
    name: "Kebbi",
    label: "Kebbi",
    capital: "Birnin Kebbi",
    zone: "North West",
    blurb:
      "Kebbi is rice and fish. The Argungu fishing festival and the rice paddies around Birnin Kebbi define the economy, and milling, irrigation schemes and the state civil service provide the salaried layer on top.",
    sectors: ["Agriculture", "Manufacturing & Production", "Government & NGO"],
    neighbours: ["Sokoto", "Niger", "Zamfara"],
  },
  {
    slug: "kogi",
    name: "Kogi",
    label: "Kogi",
    capital: "Lokoja",
    zone: "North Central",
    blurb:
      "Kogi sits at the confluence of the Niger and Benue, which makes it a logistics and cement state. Obajana and Okpella produce cement at national scale, and Lokoja carries the civil service and river-port trade.",
    sectors: ["Manufacturing & Production", "Logistics & Transport", "Government & NGO"],
    neighbours: ["Nasarawa", "Benue", "Enugu"],
  },
  {
    slug: "kwara",
    name: "Kwara",
    label: "Kwara",
    capital: "Ilorin",
    zone: "North Central",
    blurb:
      "Ilorin is a university and civil-service city, and Kwara's farmland — cassava, sugarcane, maize — feeds a growing agro-processing sector. The state's industrial estate and the Ilorin international market add trade and light manufacturing.",
    sectors: ["Education & Teaching", "Agriculture", "Administration & Office"],
    neighbours: ["Niger", "Kogi", "Oyo"],
  },
  {
    slug: "lagos",
    name: "Lagos",
    label: "Lagos",
    capital: "Ikeja",
    zone: "South West",
    blurb:
      "Lagos is the country's commercial capital and its biggest single labour market: banking, insurance, technology, media, professional services, ports and manufacturing all sit within the state. Competition is heaviest here, so applications need to be specific.",
    sectors: ["Technology & IT", "Banking & Finance", "Sales & Marketing"],
    neighbours: ["Ogun", "Oyo", "Osun"],
  },
  {
    slug: "nasarawa",
    name: "Nasarawa",
    label: "Nasarawa",
    capital: "Lafia",
    zone: "North Central",
    blurb:
      "Nasarawa is Abuja's northern neighbour, which shapes its job market: commuter towns, quarries and building materials, plus solid minerals at Awe and Keffi. Farming and the state civil service cover the rest of the state.",
    sectors: ["Agriculture", "Construction & Real Estate", "Government & NGO"],
    neighbours: ["FCT Abuja", "Benue", "Plateau"],
  },
  {
    slug: "niger",
    name: "Niger",
    label: "Niger",
    capital: "Minna",
    zone: "North Central",
    blurb:
      "Niger State hosts the country's biggest hydro-electric assets at Kainji and Shiroro, along with the Suleja industrial corridor near Abuja. Farming, power-sector engineering and the state civil service are the three main employers.",
    sectors: ["Engineering", "Agriculture", "Government & NGO"],
    neighbours: ["FCT Abuja", "Kogi", "Kaduna"],
  },
  {
    slug: "ogun",
    name: "Ogun",
    label: "Ogun",
    capital: "Abeokuta",
    zone: "South West",
    blurb:
      "Ogun is Nigeria's industrial belt — Agbara, Sango Ota, Sagamu and the Lagos–Ibadan expressway corridor are packed with factories. Cement, food and beverage, plastics and logistics companies hire at scale, and Abeokuta holds the civil service.",
    sectors: ["Manufacturing & Production", "Logistics & Transport", "Engineering"],
    neighbours: ["Lagos", "Oyo", "Osun"],
  },
  {
    slug: "ondo",
    name: "Ondo",
    label: "Ondo",
    capital: "Akure",
    zone: "South West",
    blurb:
      "Ondo is cocoa and oil: the state's plantations made it a cocoa powerhouse, and its coastline holds some of the country's largest crude reserves. Akure adds universities, hospitals and the state civil service.",
    sectors: ["Oil, Gas & Energy", "Agriculture", "Education & Teaching"],
    neighbours: ["Ekiti", "Edo", "Osun"],
  },
  {
    slug: "osun",
    name: "Osun",
    label: "Osun",
    capital: "Osogbo",
    zone: "South West",
    blurb:
      "Osun is education and culture — Obafemi Awolowo University at Ile-Ife anchors a large academic payroll, and Osogbo's art and textile traditions support a creative sector. Farming and the state civil service complete the picture.",
    sectors: ["Education & Teaching", "Agriculture", "Government & NGO"],
    neighbours: ["Oyo", "Ekiti", "Ondo"],
  },
  {
    slug: "oyo",
    name: "Oyo",
    label: "Oyo",
    capital: "Ibadan",
    zone: "South West",
    blurb:
      "Ibadan is the largest city in West Africa by land area and a long-standing administrative and academic centre. Agribusiness, haulage, education, healthcare and a widening tech scene give Oyo one of the more varied job markets outside Lagos.",
    sectors: ["Education & Teaching", "Logistics & Transport", "Sales & Marketing"],
    neighbours: ["Lagos", "Ogun", "Osun"],
  },
  {
    slug: "plateau",
    name: "Plateau",
    label: "Plateau",
    capital: "Jos",
    zone: "North Central",
    blurb:
      "Plateau's tin-mining history built Jos, and the city remains a university, hospital and tourism centre on the cool highlands. Farming — Irish potato, maize, vegetables — and solid minerals keep the rural economy moving.",
    sectors: ["Agriculture", "Education & Teaching", "Hospitality & Food Services"],
    neighbours: ["Kaduna", "Bauchi", "Nasarawa"],
  },
  {
    slug: "rivers",
    name: "Rivers",
    label: "Rivers",
    capital: "Port Harcourt",
    zone: "South South",
    blurb:
      "Port Harcourt is the oil capital and the country's second port city. International operators, service contractors, marine logistics, engineering firms and the state civil service make Rivers the most industrialised labour market in the south-south.",
    sectors: ["Oil, Gas & Energy", "Engineering", "Logistics & Transport"],
    neighbours: ["Bayelsa", "Imo", "Abia"],
  },
  {
    slug: "sokoto",
    name: "Sokoto",
    label: "Sokoto",
    capital: "Sokoto",
    zone: "North West",
    blurb:
      "Sokoto is a historic trading and scholarly city, and the state around it is livestock, millet, sorghum and onions. The sultanate's institutions, the university and the state civil service carry most of the formal payroll.",
    sectors: ["Agriculture", "Sales & Marketing", "Education & Teaching"],
    neighbours: ["Kebbi", "Zamfara", "Niger"],
  },
  {
    slug: "taraba",
    name: "Taraba",
    label: "Taraba",
    capital: "Jalingo",
    zone: "North East",
    blurb:
      "Taraba is highland farming and tourism — Mambilla tea, cattle, maize — with Jalingo as the administrative centre. The state civil service, the university and agro-trading companies account for most salaried work.",
    sectors: ["Agriculture", "Government & NGO", "Education & Teaching"],
    neighbours: ["Adamawa", "Benue", "Gombe"],
  },
  {
    slug: "yobe",
    name: "Yobe",
    label: "Yobe",
    capital: "Damaturu",
    zone: "North East",
    blurb:
      "Yobe is livestock and grain country on the edge of the Sahel, with Damaturu as its administrative capital. Gum arabic, wheat and irrigation farming sit alongside the state civil service and reconstruction programmes.",
    sectors: ["Agriculture", "Government & NGO", "Logistics & Transport"],
    neighbours: ["Borno", "Gombe", "Jigawa"],
  },
  {
    slug: "zamfara",
    name: "Zamfara",
    label: "Zamfara",
    capital: "Gusau",
    zone: "North West",
    blurb:
      "Zamfara is agriculture and artisanal mining — gold, mostly — with Gusau as the trading and administrative centre. Grain, cotton and livestock dominate the rural economy; the state civil service and education carry formal employment.",
    sectors: ["Agriculture", "Sales & Marketing", "Government & NGO"],
    neighbours: ["Sokoto", "Kebbi", "Katsina"],
  },
];

/** Lookup by URL segment. */
export function getStatePage(slug: string): StatePage | undefined {
  return STATE_PAGES.find((state) => state.slug === slug);
}

/** Reverse lookup from a `job.state` value to its page. */
export function statePageForName(name: string): StatePage | undefined {
  return STATE_PAGES.find((state) => state.name === name);
}
