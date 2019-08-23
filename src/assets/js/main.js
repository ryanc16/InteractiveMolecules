var debug = false;
// once everything is loaded, we run our Three.js stuff.
var output = $("#output");
var debugKeys = false;
var plane, cube, sphere, scene, camera, renderer, controls;
var autoRotate = !debug;
var totalRotation = {
    "x": 0,
    "y": 0,
    "z": 0,
    "set": function (x, y, z) {
        totalRotation.x = x;
        totalRotation.y = y;
        totalRotation.z = z;
    },
    "reset": function () {
        totalRotation.x = 0;
        totalRotation.y = 0;
        totalRotation.z = 0;
    },
    "mod": function () {
        totalRotation.x %= 2 * Math.PI, totalRotation.y %= 2 * Math.PI, totalRotation.z %= 2 * Math.PI
    }
};
var keys = [];
var molecule = {
    "addAtom": function (atom) {
        this.ATOMS.push(atom);
        var minX = 100000,
            minY = 100000,
            minZ = 100000;
        var maxX = -100000,
            maxY = -100000,
            maxZ = -100000;
        $.each(this.ATOMS, function (i, o) {
            if (o.position.x < minX)
                minX = o.position.x;
            if (o.position.x > maxX)
                maxX = o.position.x;
            if (o.position.y < minY)
                minY = o.position.y;
            if (o.position.y > maxY)
                maxY = o.position.y;
            if (o.position.z < minZ)
                minZ = o.position.z;
            if (o.position.z > maxZ)
                maxZ = o.position.z;
        });
        this.position = new THREE.Vector3((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
    },
    "ATOMS": [],
    "BONDS": [],
    "position": new THREE.Vector3(),
    "setPosition": function (x, y, z) {
        var xDiff = x - this.position.x;
        var yDiff = y - this.position.y;
        var zDiff = z - this.position.z;
        $.each(this.ATOMS, function (i, o) {
            o.position.x += xDiff;
            o.position.y += yDiff;
            o.position.z += zDiff;
        });
        $.each(this.BONDS, function (i, o) {
            o.position.x += xDiff;
            o.position.y += yDiff;
            o.position.z += zDiff;
        })
        this.position.x += xDiff;
        this.position.y += yDiff;
        this.position.z += zDiff;
    },
    "reset": function () {
        this.ATOMS = [];
        this.position = new THREE.Vector3();
    }
};
var KEY_CODES = {
    "CTRL": 17,
    "ALT": 18,
    "ARROW_LEFT": 37,
    "ARROW_UP": 38,
    "ARROW_RIGHT": 39,
    "ARROW_DOWN": 40,
    "KEY_A": 65,
    "KEY_R": 82
};
var ATOMS = {
    "HYDROGEN": {
        "number": 1,
        "radius": 1.0000000000000,
        "shortName": 'H',
        "fullName": 'Hydrogen',
        "color": '#E5E5E5',
        "textColor": '#333333'
    },
    "CARBON": {
        "number": 6,
        "radius": 2.4516129032258,
        "shortName": 'C',
        "fullName": 'Carbon',
        "color": '#555555',
        "textColor": '#E5E5E5'
    },
    "NITROGEN": {
        "number": 7,
        "radius": 2.2903225806452,
        "shortName": 'N',
        "fullName": 'Nitrogen',
        "color": '#5533AA',
        "textColor": '#E5E5E5'
    },
    "OXYGEN": {
        "number": 8,
        "radius": 2.1290322580645,
        "shortName": 'O',
        "fullName": 'Oxygen',
        "color": '#CC3333',
        "textColor": '#E5E5E5'
    },
    "SODIUM": {
        "number": 11,
        "radius": 5.3548387096774,
        "shortName": 'Na',
        "fullName": 'Sodium',
        "color": '#AA33AA',
        "textColor": '#E5E5E5'
    },
    "POTASSIUM": {
        "number": 19,
        "radius": 6.5483870967742,
        "shortName": 'K',
        "fullName": 'Potassium',
        "color": '#AABB33',
        "textColor": '#333333'
    },
    "CALCIUM": {
        "number": 20,
        "radius": 5.6774193548387,
        "shortName": 'Ca',
        "fullName": 'Calcium',
        "color": '#33BB33',
        "textColor": '#333333'
    }
};
var ATOM_INFO = [
    {
        "fullName": 'Hydrogen',
        "shortName": 'H',
        "number": 1,
        "description": 'Hydrogen is a chemical element with chemical symbol H and atomic number 1. With an atomic weight of 1.00794 u, hydrogen is the lightest element on the periodic table. Its monatomic form (H) is the most abundant chemical substance in the Universe, constituting roughly 75% of all baryonic mass. Non-remnant stars are mainly composed of hydrogen in its plasma state. The most common isotope of hydrogen, termed protium (name rarely used, symbol 1H), has one proton and no neutrons.',
        "link": 'https://en.wikipedia.org/wiki/Hydrogen'
            }, {
        "fullName": 'Carbon',
        "shortName": 'C',
        "number": 6,
        "description": 'Carbon (from Latin: carbo "coal") is a chemical element with symbol C and atomic number 6. On the periodic table, it is the first (row 2) of six elements in column (group) 14, which have in common the composition of their outer electron shell. It is nonmetallic and tetravalent—making four electrons available to form covalent chemical bonds. There are three naturally occurring isotopes, with 12C and 13C being stable, while 14C is radioactive, decaying with a half-life of about 5,730 years. Carbon is one of the few elements known since antiquity.',
        "link": 'https://en.wikipedia.org/wiki/Carbon'
            },
    {
        "fullName": 'Nitrogen',
        "shortName": 'N',
        "number": 7,
        "description": 'Nitrogen is a chemical element with symbol N and atomic number 7. It is the lightest pnictogen and at room temperature, it is a transparent, odorless diatomic gas. Nitrogen is a common element in the universe, estimated at about seventh in total abundance in the Milky Way and the Solar System. On Earth, the element forms about 78% of Earth\'s atmosphere and as such is the most abundant uncombined element. The element nitrogen was discovered as a separable component of air, by Scottish physician Daniel Rutherford, in 1772.',
        "link": 'https://en.wikipedia.org/wiki/Nitrogen'
            },
    {
        "fullName": 'Oxygen',
        "shortName": 'O',
        "number": 8,
        "description": 'Oxygen is a chemical element with symbol O and atomic number 8. It is a member of the chalcogen group on the periodic table and is a highly reactive nonmetal and oxidizing agent that readily forms compounds (notably oxides) with most elements. By mass, oxygen is the third-most abundant element in the universe, after hydrogen and helium. At standard temperature and pressure, two atoms of the element bind to form dioxygen, a colorless and odorless diatomic gas with the formula O2. Diatomic oxygen gas constitutes 20.8% of the Earth\'s atmosphere. However, monitoring of atmospheric oxygen levels show a global downward trend, because of fossil-fuel burning. Oxygen is the most abundant element by mass in the Earth\'s crust as part of oxide compounds such as silicon dioxide, making up almost half of the crust\'s mass.',
        "link": 'https://en.wikipedia.org/wiki/Oxygen'
            }
        ];
var ATOMS_ARRAY = [
        ATOMS.HYDROGEN,
        ATOMS.CARBON,
        ATOMS.NITROGEN,
        ATOMS.OXYGEN,
        ATOMS.SODIUM,
        ATOMS.POTASSIUM,
        ATOMS.CALCIUM
        ];
var MOLECULES = {
    "WATER": {
        "name": 'Water',
        "makeup": 'H2O',
        "geometry": [
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(0, 0, 0),
                "bonds": []
                    },
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(3, -3, 0),
                "bonds": [[0]]
                    },
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-3, -3, 0),
                "bonds": [[0]]
                    }
            ],
        "zoomLevel": 30
    },
    "ETHANOL": {
        "name": 'Ethanol',
        "makeup": 'C2H6O',
        "geometry": [
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, 0, 0),
                "bonds": []
                    }, //0
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-4.5, 3.5, 0),
                "bonds": [[0]]
                    }, //1
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-3.5, -3.5, -3),
                "bonds": [[0]]
                    }, //2
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-3.5, -3.5, 3),
                "bonds": [[0]]
                    }, //3
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(9, 0, 0),
                "bonds": [[0]]
                    }, //4
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(12, 6, 0),
                "bonds": [[4]]
                    }, //5
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(17, 6, 0),
                "bonds": [[5]]
                    }, //6
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(12.5, -3.5, -3),
                "bonds": [[4]]
                    }, //7
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(12.5, -3.5, 3),
                "bonds": [[4]]
                    }, //8
            ],
        "zoomLevel": 30
    },
    "CAFFEINE": {
        "name": 'Caffeine',
        "makeup": 'C8H10N4O2',
        "geometry": [
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(0, 0, -3.5),
                "bonds": []
                    }, //0
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(0, 0, 3.5),
                "bonds": []
                    }, //1
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-3, -6, 0),
                "bonds": []
                    }, //2
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, -3, 0),
                "bonds": [[0], [1], [2]]
                    }, //3
            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(6, -6, 0),
                "bonds": [[3]]
                    }, //4
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(12, -3, 0),
                "bonds": [[4]]
                    }, //5
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(12, 3, 0),
                "bonds": [[5, 2]]
                    }, //6
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(18, -6, 0),
                "bonds": [[5]]
                    }, //7
            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(24, -4, 0),
                "bonds": [[7]]
                    }, //8
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(26, 2, 0),
                "bonds": [[8]]
                    }, //9
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(25, 5, -3.5),
                "bonds": [[9]]
                    }, //10
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(25, 5, 3.5),
                "bonds": [[9]]
                    }, //11
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(31, 3, 0),
                "bonds": [[9]]
                    }, //12
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(28.5, -8.7, 0),
                "bonds": [[8]]
                    }, //13
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(34, -8.7, 0),
                "bonds": [[13]]
                    }, //14
            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(24.5, -13.5, 0),
                "bonds": [[13, 2]]
                    }, //15
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(18, -12, 0),
                "bonds": [[15], [7, 2]]
                    }, //16
            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(12, -15, 0),
                "bonds": [[16]]
                    }, //17
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(12, -21, 0),
                "bonds": [[17]]
                    }, //18
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(7.5, -23, 0),
                "bonds": [[18]]
                    }, //19
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(15, -23, -3.5),
                "bonds": [[18]]
                    }, //20
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(15, -23, 3.5),
                "bonds": [[18]]
                    }, //21
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(6, -12, 0),
                "bonds": [[17], [4]]
                    }, //22
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(0, -15, 0),
                "bonds": [[22, 2]]
                    }, //23
            ],
        "zoomLevel": 42
    },
    "ISOPROPYL_ALCOHOL": {
        "name": 'Isopropyl Alcohol',
        "makeup": '(CH3)2CHOH',
        "geometry": [
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(0, 0, 0),
                "bonds": []
                    }, //0
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(3, -6, -3.5),
                "bonds": []
                    }, //1
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(3, -6, 3.5),
                "bonds": []
                    }, //2
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(4.5, -2, 0),
                "bonds": [[0], [1], [2]]
                    }, //3
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(10, 4, 0),
                "bonds": [[3]]
                    }, //4
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(10, 8, 3.5),
                "bonds": [[4]]
                    }, //5
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(10, 8, -6),
                "bonds": [[4]]
                    }, //6
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(6, 10, -6),
                "bonds": [[6]]
                    }, //7
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(15, -2, 0),
                "bonds": [[4]]
                    }, //8
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(19, 0, 0),
                "bonds": [[8]]
                    }, //9
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(16, -6, -3.5),
                "bonds": [[8]]
                    }, //10
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(16, -6, 3.5),
                "bonds": [[8]]
                    } //11
            ],
        "zoomLevel": 30
    },
    "OCTO_CARBON": {
        "name": 'OCTO CARBON',
        "makeup": 'TEST',
        "geometry": [
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, 0, 0),
                "bonds": []
                    }, //0
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(10, 0, 0),
                "bonds": [[0]]
                    }, //1
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(17.07, -7.07, 0),
                "bonds": [[1]]
                    }, //2
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(17.07, -17.07, 0),
                "bonds": [[2]]
                    }, //3
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(10, -23.07, 0),
                "bonds": [[3]]
                    }, //4
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, -23.07, 0),
                "bonds": [[4]]
                    }, //5
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(-7.07, -17.07, 0),
                "bonds": [[5]]
                    }, //6
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(-7.07, -7.07, 0),
                "bonds": [[6], [0]]
                    }, //7
            ],
        "zoomLevel": 45
    },
    "TRINITROTOLUENE": {
        "name": '(TNT) Trinitrotoluene',
        "makeup": 'C6H2(NO2)3CH3',
        "geometry": [
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, -2, 0),
                "bonds": []
                    }, //0
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(6, 2, 0),
                "bonds": [[0, 2]]
                    }, //1
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(12, -2, 0),
                "bonds": [[1]]
                    }, //2
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(12, -10, 0),
                "bonds": [[2, 2]]
                    }, //3
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(6, -14, 0),
                "bonds": [[3]]
                    }, //4
            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(0, -10, 0),
                "bonds": [[4, 2], [0]]
                    }, //5

            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(-7, 1, 0),
                "bonds": [[0]]
                    }, //6
                //2oxygen
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(-10, 7, -3),
                "bonds": [[6, 2]]
                    }, //7
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(-13, -2, 3),
                "bonds": [[6]]
                    }, //8

            {
                "atom": ATOMS.CARBON,
                "position": new THREE.Vector3(6, 10, 0),
                "bonds": [[1]]
                    }, //9
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(3, 12, 4),
                "bonds": [[9]]
                    }, //10
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(3, 12, -4),
                "bonds": [[9]]
                    }, //11
            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(11, 12, 0),
                "bonds": [[9]]
                    }, //12

            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(19, 1, 0),
                "bonds": [[2]]
                    }, //13
                //2 oxygen
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(21, 7, 3),
                "bonds": [[13]]
                    }, //14
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(25, -2, -3),
                "bonds": [[13, 2]]
                    }, //15

            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(17, -13, 0),
                "bonds": [[3]]
                    }, //16

            {
                "atom": ATOMS.NITROGEN,
                "position": new THREE.Vector3(6, -21, 0),
                "bonds": [[4]]
                    }, //17
                //2oxygen
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(1, -24, -3),
                "bonds": [[17]]
                    }, //18
            {
                "atom": ATOMS.OXYGEN,
                "position": new THREE.Vector3(11, -24, 3),
                "bonds": [[17, 2]]
                    }, //19

            {
                "atom": ATOMS.HYDROGEN,
                "position": new THREE.Vector3(-5, -13, 0),
                "bonds": [[5]]
                    }, //20

            ],
        "zoomLevel": 54
    }
}
var MOLECULE_INFO = [
    {
        "name": 'Water',
        "makeup": 'H2O',
        "description": 'Water ' + formatMoleculeMakeup('(H2O)') + ' is the most abundant compound on Earth\'s surface, covering 70 percent of the planet. In nature, water exists in liquid, solid, and gaseous states. It is in dynamic equilibrium between the liquid and gas states at standard temperature and pressure. At room temperature, it is a tasteless and odorless liquid, nearly colorless with a hint of blue. Many substances dissolve in water and it is commonly referred to as the universal solvent. Because of this, water in nature and in use is rarely pure and some properties may vary from those of the pure substance. However, there are also many compounds that are essentially, if not completely, insoluble in water. Water is the only common substance found naturally in all three common states of matter and it is essential for all life on Earth. Water makes up 55% to 78% of the human body.',
        "link": 'https://en.wikipedia.org/wiki/Properties_of_water'
            },
    {
        "name": 'Ethanol',
        "makeup": 'C2H6O',
        "description": 'Ethanol /ɛθənɒl/, also commonly called ethyl alcohol, drinking alcohol, or simply alcohol is the principal type of alcohol found in alcoholic beverages, produced by the fermentation of sugars by yeasts. It is a neurotoxic psychoactive drug and one of the oldest recreational drugs used by humans. It can cause alcohol intoxication when consumed in sufficient quantity. Ethanol is a volatile, flammable, colorless liquid with a slight chemical odor. It is used as an antiseptic, a solvent, a fuel, and, due to its low freezing point, the active fluid in post-mercury thermometers. The molecule is a simple one, being an ethyl group linked to a hydroxyl group. Its structural formula, ' + formatMoleculeMakeup('CH3CH2OH') + ', is often abbreviated as ' + formatMoleculeMakeup('C2H5OH') + ', ' + formatMoleculeMakeup('C2H6O') + ' or EtOH.',
        "link": 'https://en.wikipedia.org/wiki/Ethanol'
            },
    {
        "name": 'Caffeine',
        "makeup": 'C8H10N4O2',
        "description": 'Caffeine is a central nervous system (CNS) stimulant of the methylxanthine class. It is the world\'s most widely consumed psychoactive drug, but — unlike many other psychoactive substances — it is legal and unregulated in nearly all parts of the world. There are several known mechanisms of action to explain the effects of caffeine. The most prominent is that it reversibly blocks the action of adenosine on its receptor and consequently prevents the onset of drowsiness induced by adenosine. Caffeine also stimulates certain portions of the autonomic nervous system.',
        "link": 'https://en.wikipedia.org/wiki/Caffeine'
            },
    {
        "name": 'Isopropyl Alcohol',
        "makeup": '(CH3)2CHOH',
        "description": 'Isopropyl alcohol (IUPAC name propan-2-ol), also called isopropanol or dimethyl carbinol, is a compound with the chemical formula ' + formatMoleculeMakeup('C3H8O') + ' or ' + formatMoleculeMakeup('C3H7OH') + ' or ' + formatMoleculeMakeup('CH3CHOHCH3') + ' (sometimes represented as i-PrOH). It is a colorless, flammable chemical compound with a strong odor. As a propyl group linked to a hydroxyl group, it is the simplest example of a secondary alcohol, where the alcohol carbon atom is attached to two other carbon atoms, sometimes shown as ' + formatMoleculeMakeup('(CH3)2CHOH') + '. It is a structural isomer of 1-propanol. It has a wide variety of industrial and household uses.',
        "link": 'https://en.wikipedia.org/wiki/Isopropyl_alcohol',
            },
    {
        "name": '(TNT) Trinitrotoluene',
        "makeup": 'C6H2(NO2)3CH3',
        "description": 'Trinitrotoluene (/ˌtraɪˌnaɪtroʊˈtɒljuːˌiːn, -ljəˌwiːn/; TNT), or more specifically 2,4,6-trinitrotoluene, is a chemical compound with the formula ' + formatMoleculeMakeup('C6H2(NO2)3CH3') + '. This yellow-colored solid is sometimes used as a reagent in chemical synthesis, but it is best known as an explosive material with convenient handling properties. The explosive yield of TNT is considered to be the standard measure of bombs and other explosives. In chemistry, TNT is used to generate charge transfer salts. While the two words are sometimes used interchangeably in common conversation, TNT is not the same as dynamite, a special formatting of nitroglycerin for use as an industrial explosive.',
        "link": 'https://en.wikipedia.org/wiki/Trinitrotoluene'
            }
        ]
var MOLECULE_ARRAY = [
        MOLECULES.WATER,
        MOLECULES.ETHANOL,
        MOLECULES.CAFFEINE,
        MOLECULES.ISOPROPYL_ALCOHOL,
        MOLECULES.TRINITROTOLUENE
        ];
var mol = MOLECULES.TRINITROTOLUENE;
var selectedMolecule = 4;
//ON START
$(function () {
    //var updateLoop = setInterval(update,1);
    //all the Three.js stuff

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    //          controls = new THREE.TrackballControls( camera );
    // controls.rotateSpeed = 6.0;
    // controls.zoomSpeed = 1.2;
    // controls.panSpeed = 0.8;
    // controls.noZoom = false;
    // controls.noPan = false;
    // controls.staticMoving = false;
    // controls.dynamicDampingFactor = 0.3;
    // controls.enabled = true;

    scene = new THREE.Scene();

    //camera.rotateOnAxis(new THREE.Vector3(1,0,0),(45*(Math.PI/180)));
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x111111);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(0, 0, -1).normalize();
    scene.add(light2);

    var light3 = new THREE.DirectionalLight(0xffffff);
    light3.position.set(1, 0, 0).normalize();
    scene.add(light3);

    var light4 = new THREE.DirectionalLight(0xffffff);
    light4.position.set(-1, 0, 0).normalize();
    scene.add(light4);

    var light5 = new THREE.DirectionalLight(0xffffff);
    light5.position.set(0, 1, 0).normalize();
    scene.add(light5);

    var light6 = new THREE.DirectionalLight(0xffffff);
    light6.position.set(0, -1, 0).normalize();
    scene.add(light6);

    //var axes = new THREE.AxisHelper(5);
    //scene.add(axes);

    var position = new THREE.Vector3(0, 0, 0);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    AddMolecule(mol);
    AddMoleculeInfo(MOLECULE_INFO[selectedMolecule]);

    var center = new THREE.AxisHelper(5);
    center.position.set(molecule.position.x, molecule.position.y, molecule.position.z);
    //console.log(center.position);
    if (debug) scene.add(center);

    //camera

    camera.lookAt(center.position);
    //camera.lookAt(scene.position);
    output.append(renderer.domElement);
    renderer.render(scene, camera);

    //fill the dropdownbox with all the molecules from MOLECULE_ARRAY
    var selectbox = $("#moleculeSelect");
    selectbox.html("");
    $.each(MOLECULE_ARRAY, function (i, o) {
        var str;
        if (o != mol)
            str = "<option value='" + i + "'>" + o.name + "</option>";
        else str = "<option value='" + i + "' selected>" + o.name + "</option>";
        selectbox.append(str);
    });
    $("#autoRotate").change(function () {
        autoRotate = !autoRotate;
    });
    /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////    Molecule selection method    ////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    //DROPDOWN
    $("#moleculeSelect").change(function (e) {
        selectedMolecule = e.originalEvent.target.value;
        AddMolecule(MOLECULE_ARRAY[selectedMolecule]);
        AddMoleculeInfo(MOLECULE_INFO[selectedMolecule]);
        resetAngles();
    });

    //            $(window).on('keydown', function (e) {
    //                var key = e.which;
    //                if (debugKeys) console.log(key);
    //                if ($.inArray(key, keys) == -1) {
    //
    //                    if (key == KEY_CODES.CTRL) {
    //                        keys.push(KEY_CODES.CTRL);
    //                    }
    ////                    if (key == KEY_CODES.ALT) {
    ////                        keys.push(KEY_CODES.ALT);
    ////                    }
    ////                    if (key == KEY_CODES.ARROW_LEFT) { //console.log("left");
    ////                        keys.push(KEY_CODES.ARROW_LEFT);
    ////                        scene.position.x--;
    ////                    }
    ////                    if (key == KEY_CODES.ARROW_UP) { //console.log("up");
    ////                        keys.push(KEY_CODES.ARROW_UP);
    ////                        scene.position.y++;
    ////                    }
    ////                    if (key == KEY_CODES.ARROW_RIGHT) { //console.log("right");
    ////                        scene.position.x++;
    ////                    }
    ////                    if (key == KEY_CODES.ARROW_DOWN) { //console.log("down");
    ////                        scene.position.y--;
    ////                    }
    ////                    if (key == KEY_CODES.KEY_A) {
    ////                        addSphere();
    ////                    }
    ////                    if (key == KEY_CODES.KEY_R) {
    ////                        setAngles(0, 0, 0);
    ////                    }
    //                }
    //                //render();
    //            });
    //
    //            $(window).on('keyup', function (e) {
    //                var key = e.which;
    //                keys = jQuery.grep(keys, function (value) {
    //                    return value != key;
    //                });
    //
    //            });

    var held;
    var startPos;
    var lastPos;
    $(output).mousedown(function (e) {
        held = true;
        output.addClass('grab');
        lastPos = Array(e.offsetX, e.offsetY);
    }).bind('mouseup mouseleave', function () {
        held = false;
        output.removeClass('grab');
    });
    var selectedAtom;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    //MOUSE CONTROLS
    $(output).on('mousemove', function (e) {
        e.preventDefault();
        output.removeClass('info');
        if (selectedAtom !== undefined)
            selectedAtom.emissive = new THREE.Color(0, 0, 0);
        if (held) {
            //rotates camera
            $("#autoRotate").prop('checked', '');
            autoRotate = false;
            startPos = Array(e.offsetX, e.offsetY);
            var xPos = (lastPos[0] - startPos[0]) / 50;
            var yPos = (lastPos[1] - startPos[1]) / 50;
            //camera.translateX(xPos);
            //camera.translateY(-yPos);

            var xDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.x) * 100) / 100);
            var yDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.y) * 100) / 100);
            var zDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.z) * 100) / 100);

            var zPos = yPos * Math.sin(scene.rotation.y);
            yPos = yPos * Math.cos(scene.rotation.y);

            if ((scene.rotation.y < Math.PI / 2) && (Math.abs(scene.rotation.x) > Math.PI / 2))
                totalRotation.x += (yPos);
            else
                totalRotation.x -= (yPos);

            totalRotation.y -= (xPos);
            totalRotation.z -= (zPos);

            if ((scene.rotation.y < Math.PI / 2) && (Math.abs(scene.rotation.x) > Math.PI / 2))
                scene.rotateX(yPos / 4);
            else
                scene.rotateX(-yPos / 4);
            scene.rotateY(-xPos / 4);
            scene.rotateZ(-zPos / 4);
            console.clear();
            console.log(scene.rotation);

            lastPos = startPos;


            //render();
        } else {
            //output.removeClass('moving');
            //output.removeClass('grab');
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(molecule.ATOMS);
            if (intersects.length > 0) {
                selectedAtom = intersects[0].object.material;
                selectedAtom.emissive = new THREE.Color(0.2, 0.2, 0.2);
                output.addClass('info');
            }
        }
    });
    //TOUCH CONTROLS
    $(output).on('touchstart', function (e) {
        held = true;
        lastPos = Array(e.originalEvent.touches[0].screenX, e.originalEvent.touches[0].screenY);
        if (e.originalEvent.touches.length === 2) {
            lastDist = getDistance(new THREE.Vector2(e.originalEvent.touches[0].screenX, e.originalEvent.touches[0].screenY), new THREE.Vector2(e.originalEvent.touches[1].screenX, e.originalEvent.touches[1].screenY));
        }
    }).bind('touchend touchcancel', function () {
        held = false;
    });
    var startPos1, startPos2, lastPos, lastDist;
    $(output).on('touchmove', function (e) {
        e.preventDefault();
        if (held) {
            //rotating the molecule with touch
            if (e.originalEvent.touches.length === 1) {
                //orbit
                $("#autoRotate").prop('checked', '');
                autoRotate = false;
                startPos1 = Array(e.originalEvent.touches[0].screenX, e.originalEvent.touches[0].screenY);
                var xPos = (lastPos[0] - startPos1[0]) / 50;
                var yPos = (lastPos[1] - startPos1[1]) / 50;
                //camera.translateX(xPos);
                //camera.translateY(-yPos);

                var xDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.x) * 100) / 100);
                var yDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.y) * 100) / 100);
                var zDisp = Math.abs(Math.round(Rads2Degs(scene.rotation.z) * 100) / 100);

                var zPos = yPos * Math.sin(scene.rotation.y);
                yPos = yPos * Math.cos(scene.rotation.y);

                if ((scene.rotation.y < Math.PI / 2) && (Math.abs(scene.rotation.x) > Math.PI / 2))
                    totalRotation.x += (xPos / 4);
                else
                    totalRotation.x -= (xPos / 4);

                totalRotation.y -= (yPos / 4);
                totalRotation.z -= (zPos / 4);

                if ((scene.rotation.y < Math.PI / 2) && (Math.abs(scene.rotation.x) > Math.PI / 2))
                    scene.rotateX(yPos / 4);
                else
                    scene.rotateX(-yPos / 4);
                scene.rotateY(-xPos / 4);
                scene.rotateZ(-zPos / 4);

                lastPos = startPos1;
                //pinching to zoom
            } else if (e.originalEvent.touches.length === 2) {
                var touch1 = Array(e.originalEvent.touches[0].screenX, e.originalEvent.touches[0].screenY);
                var touch2 = Array(e.originalEvent.touches[1].screenX, e.originalEvent.touches[1].screenY);
                var v1 = new THREE.Vector2(touch1[0], touch1[1]);
                var v2 = new THREE.Vector2(touch2[0], touch2[1]);
                var distance = getDistance(v1, v2);
                var amt = (distance - lastDist) / 5;
                //$("#debugOutput").val(amt);
                //console.log(amt);
                //var scrollAmt = (e.originalEvent.wheelDelta/120);
                if (camera.position.z - amt < 150 && camera.position.z - amt > 10)
                    camera.translateZ(-amt);
                lastDist = distance;
            }
        }
    });
    //MOUSE WHEEL ZOOM IN/OUT
    var cursorTimeout;
    $(output).on('mousewheel', function (e) {
        var scrollAmt = (e.originalEvent.wheelDelta / 120);

        if (scrollAmt > 0) {
            output.addClass('zoomin');
            output.removeClass('zoomout');
        } else {
            output.addClass('zoomout');
            output.removeClass('zoomin');
        }
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(function () {
            output.removeClass('zoomin');
            output.removeClass('zoomout');
        }, 500);
        if (camera.position.z - scrollAmt < 150 && camera.position.z - scrollAmt > 10)
            camera.translateZ(-scrollAmt);
        //			if(camera.zoom < 0) camera.zoom = 0;
        //				camera.updateProjectionMatrix();
        //render();
    });
    $(output).on('mousedown', function (e) {
        event.preventDefault();
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(molecule.ATOMS);
        var selectedAtom = Object;
        var info = undefined;
        //console.log(intersects);
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name == "atom") {
                selectedAtom = intersects[i].object.userData.number;
                $.each(ATOM_INFO, function (i, o) {
                    if (o.number == selectedAtom)
                        info = o;
                    return;
                });
                break;
            }
        }
        if (info !== undefined) {
            console.log(info);
            $("#atomDescription").html(info.description);
            $("#atomReadMoreLink").prop('href', info.link);
            $("#detailDropdown").trigger('click.bs.dropdown');
        }
    });
    $("#debugKeys").change(function (e) {
        debugKeys = e.originalEvent.srcElement.checked;
    });

    //detect resizing
    window.addEventListener('resize', onWindowResize, false);
    render();
});
//HELPER FUNCTIONS
function CreatePlane(width, height, widthSegs, heightSegs, color, image) {
    var planeGeometry = new THREE.PlaneGeometry(width, height, widthSegs, heightSegs);
    var planeMaterial;
    //if(image != null){
    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
        // resource URL
        image,
        // Function when resource is loaded
        function (texture) {
            // do something with the texture
            planeMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
        },
        // Function called when download progresses
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function (xhr) {
            console.log('An error loading texture occured.');
        }
    );
    //}
    //else
    //    planeMaterial = new THREE.MeshBasicMaterial({color: color});
    return new THREE.Mesh(planeGeometry, planeMaterial);
}

function CreateAtom(atomEnum) {
    var dynamicTexture = new THREEx.DynamicTexture(512, 512);
    //dynamicTexture.context.font	= "90px Verdana";
    dynamicTexture.context.font = "bold 90px Verdana";
    dynamicTexture.texture.anisotropy = renderer.getMaxAnisotropy();
    dynamicTexture.clear(atomEnum.color);
    dynamicTexture.drawText(atomEnum.shortName + "      " + atomEnum.shortName, 96, 256, atomEnum.textColor);

    //var sphereGeometry = new THREE.SphereGeometry(atomEnum.radius,20,20);
    var sphereGeometry = new THREE.SphereGeometry(atomEnum.radius, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({
        map: dynamicTexture.texture
    });
    var atom = new THREE.Mesh(sphereGeometry, sphereMaterial);
    atom.name = "atom";
    atom.userData = atomEnum;
    return atom;
}

function BondAtoms(atom1, atom2, numberOfBonds) {
    //to default the number of bonds to 1 if unspecified
    numberOfBonds = numberOfBonds || 1;
    var lines = [];

    for (var i = 0; i < numberOfBonds; i++) {
        //            var geometry = new THREE.Geometry();
        //            geometry.vertices.push(atom1.position );
        //            geometry.vertices.push(atom2.position);
        //            var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color:'#ffffff',linewidth:100}));
        //            line.name = "line";
        //            lines.push(line);
        //            scene.add(line);

        var point1 = atom1.position;
        var point2 = atom2.position;
        var direction = new THREE.Vector3().subVectors(point1, point2);
        var orientation = new THREE.Matrix4();
        orientation.lookAt(point2, point1, new THREE.Object3D().up);
        orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));
        var line = CreateBondLine(0.4, 0.4, direction.length(), 20);
        line.name = "line";
        line.applyMatrix(orientation);
        // position based on midpoints - there may be a better solution than this
        line.position.x = (point1.x + point2.x) / 2;
        line.position.y = (point1.y + point2.y) / 2;
        line.position.z = (point1.z + point2.z) / 2;
        molecule.BONDS.push(line);
        lines.push(line);
        scene.add(line);
    }
    if (lines.length >= 2) {
        lines[0].position.x -= 0.6;
        lines[0].position.y -= 0.6;
        lines[0].position.z -= 0.6;
        lines[lines.length - 1].position.x += 0.6;
        lines[lines.length - 1].position.y += 0.6;
        lines[lines.length - 1].position.z += 0.6;
    }
    //render();
}

function CreateBondLine(radiusTop, radiusBottom, height, radiusSegs) {
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegs, 1);
    var material = new THREE.MeshLambertMaterial({
        color: "#000000",
        emissive: "#CCCCCC"
    });
    var cylinder = new THREE.Mesh(geometry, material);
    return cylinder;
}

function AddMolecule(moleculeEnum) {
    molecule.reset();
    ClearScene();
    var mol = moleculeEnum;

    $.each(mol.geometry, function (i, o) {
        var atom = CreateAtom(o.atom);
        atom.position.set(o.position.x, o.position.y, o.position.z);
        molecule.addAtom(atom);
        for (var i = 0; i < o.bonds.length; i++)
            BondAtoms(atom, molecule.ATOMS[o.bonds[i][0]], o.bonds[i][1]);
        scene.add(atom);
    });
    molecule.setPosition(0, 0, 0);
    var center = new THREE.AxisHelper(5);
    center.position.set(molecule.position.x, molecule.position.y, molecule.position.z);
    camera.lookAt(center.position);
    setZoomLevel(moleculeEnum.zoomLevel);
}

function AddMoleculeInfo(molecule) {
    $("#moleculeMakeup").html(formatMoleculeMakeup(molecule.makeup));
    $("#atomDescription").html(molecule.description);
    $("#atomReadMoreLink").prop('href', molecule.link);
}

function ClearScene() {
    var remove = [];
    $.each(scene.children, function (i, o) {
        //console.log(o);
        if (o.name == "line" || o.name == "atom")
            remove.push(o);
    });
    $.each(remove, function (i, o) {
        scene.remove(o);
    });
}

function setZoomLevel(desiredZoom) {
    var zoomDiff = desiredZoom - camera.position.z;
    camera.translateZ(zoomDiff);
}

function formatMoleculeMakeup(str) {
    var makeup = str;
    var formatted = "";
    for (var i = 0; i < makeup.length; i++) {
        var str;
        if (!isNaN(makeup[i])) {
            str = "<sub>" + makeup[i] + "</sub>";
        } else {
            if (makeup[i] == "^") {
                str = "<sup>" + makeup[i + 1] + "</sup>";
                i++;
            } else str = makeup[i];
        }
        formatted += str;
    }
    return formatted;
}

function Rads2Degs(radians) {
    return (180 * radians) / Math.PI;
}

function Degs2Rads(degrees) {
    return (degrees * Math.PI) / 180;
}

function getDistance(point1, point2) {
    var x = point2.x - point1.x;
    var y = point2.y - point1.y;
    var distance = Math.sqrt(x * x + y * y);
    return distance;
}

function resetAngles() {
    totalRotation.reset();
    scene.rotation.set(0, 0, 0);
}

function setAngles(x, y, z) {

    scene.rotation.x = 0;
    scene.rotation.y = 0;
    scene.rotation.z = 0;
    totalRotation.reset();
    //render();
}
//use this as our update function
function render() {
    // controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (autoRotate) {
        spinObj(scene, 'y', 0.005);
    }
}

function spinObj(obj, axis, amt) {
    if (axis.toUpperCase() == 'X') {
        totalRotation.x += amt;
        obj.rotateX(amt);
    } else if (axis.toUpperCase() == 'Y') {
        totalRotation.y += amt;
        obj.rotateY(amt);
    } else if (axis.toUpperCase() == 'Z') {
        totalRotation.z += amt;
        obj.rotateZ(amt);
    }
    //render();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
