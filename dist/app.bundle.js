define("models/rendering-styles.model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("models/atom.model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Atom {
        constructor(name, abbr, atomicNumber, radius, renderingStyles) {
            this.name = name;
            this.abbr = abbr;
            this.atomicNumber = atomicNumber;
            this.radius = radius;
            this.$hashKey = Object.keys(this).map(key => this[key]).reduce((prev, next) => prev + next) + Math.round(Math.random() * 1e10);
            this.renderingStyles = renderingStyles;
        }
        get hashKey() {
            return this.$hashKey;
        }
        setRenderingStyles(styles) {
            this.renderingStyles = styles;
        }
        getRenderingStyles() {
            return this.renderingStyles;
        }
        clone() {
            const clone = new Atom(null, null, null, null);
            let hash = clone.$hashKey;
            Object.assign(clone, this);
            clone.$hashKey = hash;
            return clone;
        }
    }
    exports.Atom = Atom;
});
define("enums/bond-type.enum", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BondType;
    (function (BondType) {
        BondType[BondType["SINGLE"] = 0] = "SINGLE";
        BondType[BondType["DOUBLE"] = 1] = "DOUBLE";
    })(BondType = exports.BondType || (exports.BondType = {}));
});
define("models/bond.model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Bond {
        constructor(atom1, atom2, bondType) {
            this.atom1 = atom1;
            this.atom2 = atom2;
            this.bondType = bondType;
        }
    }
    exports.Bond = Bond;
});
define("models/molecule.model", ["require", "exports", "models/bond.model", "enums/bond-type.enum"], function (require, exports, bond_model_1, bond_type_enum_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Molecule {
        constructor(name, abbr) {
            this.name = name;
            this.abbr = abbr;
            this.atoms = [];
            this.bonds = [];
        }
        addAtom(atom) {
            this.atoms.push(atom);
        }
        addBond(atom1, atom2, bondType = bond_type_enum_1.BondType.SINGLE) {
            this.bonds.push(new bond_model_1.Bond(atom1, atom2, bondType));
        }
    }
    exports.Molecule = Molecule;
});
define("app", ["require", "exports", "models/molecule.model", "models/atom.model"], function (require, exports, molecule_model_1, atom_model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ATOMS = {
        HYDROGEN: new atom_model_1.Atom('Hydrogen', 'H', 1, 1.0000000000000, { bgColor: '#e5e5e5', textColor: '#333333' }).clone(),
        OXYGEN: new atom_model_1.Atom('Oxygen', 'O', 8, 2.1290322580645, { bgColor: '#cc3333', textColor: '#e5e5e5' }).clone()
    };
    let mol = new molecule_model_1.Molecule('Water', 'H2O');
    const hydrogen1 = ATOMS.HYDROGEN;
    const hydrogen2 = ATOMS.HYDROGEN;
    const oxygen = ATOMS.OXYGEN;
    mol.addAtom(hydrogen1);
    mol.addAtom(hydrogen2);
    mol.addAtom(oxygen);
    mol.addBond(hydrogen1, oxygen);
    mol.addBond(hydrogen2, oxygen);
    console.log(mol);
});
