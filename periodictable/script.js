// Periodic Table - JavaScript
(function() {
    'use strict';

    // Element Data (118 elements)
    const ELEMENTS = [
        { number: 1, symbol: 'H', name: '氢', nameEn: 'Hydrogen', mass: 1.008, electron: '1s¹', year: 1766, state: 'gas', category: 'nonmetal', row: 1, col: 1 },
        { number: 2, symbol: 'He', name: '氦', nameEn: 'Helium', mass: 4.003, electron: '1s²', year: 1868, state: 'gas', category: 'noble', row: 1, col: 18 },
        { number: 3, symbol: 'Li', name: '锂', nameEn: 'Lithium', mass: 6.941, electron: '[He]2s¹', year: 1817, state: 'solid', category: 'alkali', row: 2, col: 1 },
        { number: 4, symbol: 'Be', name: '铍', nameEn: 'Beryllium', mass: 9.012, electron: '[He]2s²', year: 1798, state: 'solid', category: 'alkaline', row: 2, col: 2 },
        { number: 5, symbol: 'B', name: '硼', nameEn: 'Boron', mass: 10.81, electron: '[He]2s²2p¹', year: 1808, state: 'solid', category: 'metalloid', row: 2, col: 13 },
        { number: 6, symbol: 'C', name: '碳', nameEn: 'Carbon', mass: 12.01, electron: '[He]2s²2p²', year: 0, state: 'solid', category: 'nonmetal', row: 2, col: 14 },
        { number: 7, symbol: 'N', name: '氮', nameEn: 'Nitrogen', mass: 14.01, electron: '[He]2s²2p³', year: 1772, state: 'gas', category: 'nonmetal', row: 2, col: 15 },
        { number: 8, symbol: 'O', name: '氧', nameEn: 'Oxygen', mass: 16.00, electron: '[He]2s²2p⁴', year: 1774, state: 'gas', category: 'nonmetal', row: 2, col: 16 },
        { number: 9, symbol: 'F', name: '氟', nameEn: 'Fluorine', mass: 19.00, electron: '[He]2s²2p⁵', year: 1886, state: 'gas', category: 'halogen', row: 2, col: 17 },
        { number: 10, symbol: 'Ne', name: '氖', nameEn: 'Neon', mass: 20.18, electron: '[He]2s²2p⁶', year: 1898, state: 'gas', category: 'noble', row: 2, col: 18 },
        { number: 11, symbol: 'Na', name: '钠', nameEn: 'Sodium', mass: 22.99, electron: '[Ne]3s¹', year: 1807, state: 'solid', category: 'alkali', row: 3, col: 1 },
        { number: 12, symbol: 'Mg', name: '镁', nameEn: 'Magnesium', mass: 24.31, electron: '[Ne]3s²', year: 1755, state: 'solid', category: 'alkaline', row: 3, col: 2 },
        { number: 13, symbol: 'Al', name: '铝', nameEn: 'Aluminium', mass: 26.98, electron: '[Ne]3s²3p¹', year: 1825, state: 'solid', category: 'post-transition', row: 3, col: 13 },
        { number: 14, symbol: 'Si', name: '硅', nameEn: 'Silicon', mass: 28.09, electron: '[Ne]3s²3p²', year: 1824, state: 'solid', category: 'metalloid', row: 3, col: 14 },
        { number: 15, symbol: 'P', name: '磷', nameEn: 'Phosphorus', mass: 30.97, electron: '[Ne]3s²3p³', year: 1669, state: 'solid', category: 'nonmetal', row: 3, col: 15 },
        { number: 16, symbol: 'S', name: '硫', nameEn: 'Sulfur', mass: 32.07, electron: '[Ne]3s²3p⁴', year: 0, state: 'solid', category: 'nonmetal', row: 3, col: 16 },
        { number: 17, symbol: 'Cl', name: '氯', nameEn: 'Chlorine', mass: 35.45, electron: '[Ne]3s²3p⁵', year: 1774, state: 'gas', category: 'halogen', row: 3, col: 17 },
        { number: 18, symbol: 'Ar', name: '氩', nameEn: 'Argon', mass: 39.95, electron: '[Ne]3s²3p⁶', year: 1894, state: 'gas', category: 'noble', row: 3, col: 18 },
        { number: 19, symbol: 'K', name: '钾', nameEn: 'Potassium', mass: 39.10, electron: '[Ar]4s¹', year: 1807, state: 'solid', category: 'alkali', row: 4, col: 1 },
        { number: 20, symbol: 'Ca', name: '钙', nameEn: 'Calcium', mass: 40.08, electron: '[Ar]4s²', year: 1808, state: 'solid', category: 'alkaline', row: 4, col: 2 },
        { number: 21, symbol: 'Sc', name: '钪', nameEn: 'Scandium', mass: 44.96, electron: '[Ar]3d¹4s²', year: 1879, state: 'solid', category: 'transition', row: 4, col: 3 },
        { number: 22, symbol: 'Ti', name: '钛', nameEn: 'Titanium', mass: 47.87, electron: '[Ar]3d²4s²', year: 1791, state: 'solid', category: 'transition', row: 4, col: 4 },
        { number: 23, symbol: 'V', name: '钒', nameEn: 'Vanadium', mass: 50.94, electron: '[Ar]3d³4s²', year: 1801, state: 'solid', category: 'transition', row: 4, col: 5 },
        { number: 24, symbol: 'Cr', name: '铬', nameEn: 'Chromium', mass: 52.00, electron: '[Ar]3d⁵4s¹', year: 1797, state: 'solid', category: 'transition', row: 4, col: 6 },
        { number: 25, symbol: 'Mn', name: '锰', nameEn: 'Manganese', mass: 54.94, electron: '[Ar]3d⁵4s²', year: 1774, state: 'solid', category: 'transition', row: 4, col: 7 },
        { number: 26, symbol: 'Fe', name: '铁', nameEn: 'Iron', mass: 55.85, electron: '[Ar]3d⁶4s²', year: 0, state: 'solid', category: 'transition', row: 4, col: 8 },
        { number: 27, symbol: 'Co', name: '钴', nameEn: 'Cobalt', mass: 58.93, electron: '[Ar]3d⁷4s²', year: 1735, state: 'solid', category: 'transition', row: 4, col: 9 },
        { number: 28, symbol: 'Ni', name: '镍', nameEn: 'Nickel', mass: 58.69, electron: '[Ar]3d⁸4s²', year: 1751, state: 'solid', category: 'transition', row: 4, col: 10 },
        { number: 29, symbol: 'Cu', name: '铜', nameEn: 'Copper', mass: 63.55, electron: '[Ar]3d¹⁰4s¹', year: 0, state: 'solid', category: 'transition', row: 4, col: 11 },
        { number: 30, symbol: 'Zn', name: '锌', nameEn: 'Zinc', mass: 65.38, electron: '[Ar]3d¹⁰4s²', year: 1746, state: 'solid', category: 'transition', row: 4, col: 12 },
        { number: 31, symbol: 'Ga', name: '镓', nameEn: 'Gallium', mass: 69.72, electron: '[Ar]3d¹⁰4s²4p¹', year: 1875, state: 'solid', category: 'post-transition', row: 4, col: 13 },
        { number: 32, symbol: 'Ge', name: '锗', nameEn: 'Germanium', mass: 72.63, electron: '[Ar]3d¹⁰4s²4p²', year: 1886, state: 'solid', category: 'metalloid', row: 4, col: 14 },
        { number: 33, symbol: 'As', name: '砷', nameEn: 'Arsenic', mass: 74.92, electron: '[Ar]3d¹⁰4s²4p³', year: 0, state: 'solid', category: 'metalloid', row: 4, col: 15 },
        { number: 34, symbol: 'Se', name: '硒', nameEn: 'Selenium', mass: 78.97, electron: '[Ar]3d¹⁰4s²4p⁴', year: 1817, state: 'solid', category: 'nonmetal', row: 4, col: 16 },
        { number: 35, symbol: 'Br', name: '溴', nameEn: 'Bromine', mass: 79.90, electron: '[Ar]3d¹⁰4s²4p⁵', year: 1826, state: 'liquid', category: 'halogen', row: 4, col: 17 },
        { number: 36, symbol: 'Kr', name: '氪', nameEn: 'Krypton', mass: 83.80, electron: '[Ar]3d¹⁰4s²4p⁶', year: 1898, state: 'gas', category: 'noble', row: 4, col: 18 },
        { number: 37, symbol: 'Rb', name: '铷', nameEn: 'Rubidium', mass: 85.47, electron: '[Kr]5s¹', year: 1861, state: 'solid', category: 'alkali', row: 5, col: 1 },
        { number: 38, symbol: 'Sr', name: '锶', nameEn: 'Strontium', mass: 87.62, electron: '[Kr]5s²', year: 1790, state: 'solid', category: 'alkaline', row: 5, col: 2 },
        { number: 39, symbol: 'Y', name: '钇', nameEn: 'Yttrium', mass: 88.91, electron: '[Kr]4d¹5s²', year: 1794, state: 'solid', category: 'transition', row: 5, col: 3 },
        { number: 40, symbol: 'Zr', name: '锆', nameEn: 'Zirconium', mass: 91.22, electron: '[Kr]4d²5s²', year: 1789, state: 'solid', category: 'transition', row: 5, col: 4 },
        { number: 41, symbol: 'Nb', name: '铌', nameEn: 'Niobium', mass: 92.91, electron: '[Kr]4d⁴5s¹', year: 1801, state: 'solid', category: 'transition', row: 5, col: 5 },
        { number: 42, symbol: 'Mo', name: '钼', nameEn: 'Molybdenum', mass: 95.95, electron: '[Kr]4d⁵5s¹', year: 1781, state: 'solid', category: 'transition', row: 5, col: 6 },
        { number: 43, symbol: 'Tc', name: '锝', nameEn: 'Technetium', mass: 98, electron: '[Kr]4d⁵5s²', year: 1937, state: 'solid', category: 'transition', row: 5, col: 7 },
        { number: 44, symbol: 'Ru', name: '钌', nameEn: 'Ruthenium', mass: 101.1, electron: '[Kr]4d⁷5s¹', year: 1844, state: 'solid', category: 'transition', row: 5, col: 8 },
        { number: 45, symbol: 'Rh', name: '铑', nameEn: 'Rhodium', mass: 102.9, electron: '[Kr]4d⁸5s¹', year: 1803, state: 'solid', category: 'transition', row: 5, col: 9 },
        { number: 46, symbol: 'Pd', name: '钯', nameEn: 'Palladium', mass: 106.4, electron: '[Kr]4d¹⁰', year: 1803, state: 'solid', category: 'transition', row: 5, col: 10 },
        { number: 47, symbol: 'Ag', name: '银', nameEn: 'Silver', mass: 107.9, electron: '[Kr]4d¹⁰5s¹', year: 0, state: 'solid', category: 'transition', row: 5, col: 11 },
        { number: 48, symbol: 'Cd', name: '镉', nameEn: 'Cadmium', mass: 112.4, electron: '[Kr]4d¹⁰5s²', year: 1817, state: 'solid', category: 'transition', row: 5, col: 12 },
        { number: 49, symbol: 'In', name: '铟', nameEn: 'Indium', mass: 114.8, electron: '[Kr]4d¹⁰5s²5p¹', year: 1863, state: 'solid', category: 'post-transition', row: 5, col: 13 },
        { number: 50, symbol: 'Sn', name: '锡', nameEn: 'Tin', mass: 118.7, electron: '[Kr]4d¹⁰5s²5p²', year: 0, state: 'solid', category: 'post-transition', row: 5, col: 14 },
        { number: 51, symbol: 'Sb', name: '锑', nameEn: 'Antimony', mass: 121.8, electron: '[Kr]4d¹⁰5s²5p³', year: 0, state: 'solid', category: 'metalloid', row: 5, col: 15 },
        { number: 52, symbol: 'Te', name: '碲', nameEn: 'Tellurium', mass: 127.6, electron: '[Kr]4d¹⁰5s²5p⁴', year: 1783, state: 'solid', category: 'metalloid', row: 5, col: 16 },
        { number: 53, symbol: 'I', name: '碘', nameEn: 'Iodine', mass: 126.9, electron: '[Kr]4d¹⁰5s²5p⁵', year: 1811, state: 'solid', category: 'halogen', row: 5, col: 17 },
        { number: 54, symbol: 'Xe', name: '氙', nameEn: 'Xenon', mass: 131.3, electron: '[Kr]4d¹⁰5s²5p⁶', year: 1898, state: 'gas', category: 'noble', row: 5, col: 18 },
        { number: 55, symbol: 'Cs', name: '铯', nameEn: 'Caesium', mass: 132.9, electron: '[Xe]6s¹', year: 1860, state: 'solid', category: 'alkali', row: 6, col: 1 },
        { number: 56, symbol: 'Ba', name: '钡', nameEn: 'Barium', mass: 137.3, electron: '[Xe]6s²', year: 1808, state: 'solid', category: 'alkaline', row: 6, col: 2 },
        { number: 57, symbol: 'La', name: '镧', nameEn: 'Lanthanum', mass: 138.9, electron: '[Xe]5d¹6s²', year: 1839, state: 'solid', category: 'lanthanide', row: 9, col: 3 },
        { number: 58, symbol: 'Ce', name: '铈', nameEn: 'Cerium', mass: 140.1, electron: '[Xe]4f¹5d¹6s²', year: 1803, state: 'solid', category: 'lanthanide', row: 9, col: 4 },
        { number: 59, symbol: 'Pr', name: '镨', nameEn: 'Praseodymium', mass: 140.9, electron: '[Xe]4f³6s²', year: 1885, state: 'solid', category: 'lanthanide', row: 9, col: 5 },
        { number: 60, symbol: 'Nd', name: '钕', nameEn: 'Neodymium', mass: 144.2, electron: '[Xe]4f⁴6s²', year: 1885, state: 'solid', category: 'lanthanide', row: 9, col: 6 },
        { number: 61, symbol: 'Pm', name: '钷', nameEn: 'Promethium', mass: 145, electron: '[Xe]4f⁵6s²', year: 1945, state: 'solid', category: 'lanthanide', row: 9, col: 7 },
        { number: 62, symbol: 'Sm', name: '钐', nameEn: 'Samarium', mass: 150.4, electron: '[Xe]4f⁶6s²', year: 1879, state: 'solid', category: 'lanthanide', row: 9, col: 8 },
        { number: 63, symbol: 'Eu', name: '铕', nameEn: 'Europium', mass: 152.0, electron: '[Xe]4f⁷6s²', year: 1901, state: 'solid', category: 'lanthanide', row: 9, col: 9 },
        { number: 64, symbol: 'Gd', name: '钆', nameEn: 'Gadolinium', mass: 157.3, electron: '[Xe]4f⁷5d¹6s²', year: 1880, state: 'solid', category: 'lanthanide', row: 9, col: 10 },
        { number: 65, symbol: 'Tb', name: '铽', nameEn: 'Terbium', mass: 158.9, electron: '[Xe]4f⁹6s²', year: 1843, state: 'solid', category: 'lanthanide', row: 9, col: 11 },
        { number: 66, symbol: 'Dy', name: '镝', nameEn: 'Dysprosium', mass: 162.5, electron: '[Xe]4f¹⁰6s²', year: 1886, state: 'solid', category: 'lanthanide', row: 9, col: 12 },
        { number: 67, symbol: 'Ho', name: '钬', nameEn: 'Holmium', mass: 164.9, electron: '[Xe]4f¹¹6s²', year: 1878, state: 'solid', category: 'lanthanide', row: 9, col: 13 },
        { number: 68, symbol: 'Er', name: '铒', nameEn: 'Erbium', mass: 167.3, electron: '[Xe]4f¹²6s²', year: 1843, state: 'solid', category: 'lanthanide', row: 9, col: 14 },
        { number: 69, symbol: 'Tm', name: '铥', nameEn: 'Thulium', mass: 168.9, electron: '[Xe]4f¹³6s²', year: 1879, state: 'solid', category: 'lanthanide', row: 9, col: 15 },
        { number: 70, symbol: 'Yb', name: '镱', nameEn: 'Ytterbium', mass: 173.0, electron: '[Xe]4f¹⁴6s²', year: 1878, state: 'solid', category: 'lanthanide', row: 9, col: 16 },
        { number: 71, symbol: 'Lu', name: '镥', nameEn: 'Lutetium', mass: 175.0, electron: '[Xe]4f¹⁴5d¹6s²', year: 1907, state: 'solid', category: 'lanthanide', row: 9, col: 17 },
        { number: 72, symbol: 'Hf', name: '铪', nameEn: 'Hafnium', mass: 178.5, electron: '[Xe]4f¹⁴5d²6s²', year: 1923, state: 'solid', category: 'transition', row: 6, col: 4 },
        { number: 73, symbol: 'Ta', name: '钽', nameEn: 'Tantalum', mass: 180.9, electron: '[Xe]4f¹⁴5d³6s²', year: 1802, state: 'solid', category: 'transition', row: 6, col: 5 },
        { number: 74, symbol: 'W', name: '钨', nameEn: 'Tungsten', mass: 183.8, electron: '[Xe]4f¹⁴5d⁴6s²', year: 1783, state: 'solid', category: 'transition', row: 6, col: 6 },
        { number: 75, symbol: 'Re', name: '铼', nameEn: 'Rhenium', mass: 186.2, electron: '[Xe]4f¹⁴5d⁵6s²', year: 1925, state: 'solid', category: 'transition', row: 6, col: 7 },
        { number: 76, symbol: 'Os', name: '锇', nameEn: 'Osmium', mass: 190.2, electron: '[Xe]4f¹⁴5d⁶6s²', year: 1803, state: 'solid', category: 'transition', row: 6, col: 8 },
        { number: 77, symbol: 'Ir', name: '铱', nameEn: 'Iridium', mass: 192.2, electron: '[Xe]4f¹⁴5d⁷6s²', year: 1803, state: 'solid', category: 'transition', row: 6, col: 9 },
        { number: 78, symbol: 'Pt', name: '铂', nameEn: 'Platinum', mass: 195.1, electron: '[Xe]4f¹⁴5d⁹6s¹', year: 1735, state: 'solid', category: 'transition', row: 6, col: 10 },
        { number: 79, symbol: 'Au', name: '金', nameEn: 'Gold', mass: 197.0, electron: '[Xe]4f¹⁴5d¹⁰6s¹', year: 0, state: 'solid', category: 'transition', row: 6, col: 11 },
        { number: 80, symbol: 'Hg', name: '汞', nameEn: 'Mercury', mass: 200.6, electron: '[Xe]4f¹⁴5d¹⁰6s²', year: 0, state: 'liquid', category: 'transition', row: 6, col: 12 },
        { number: 81, symbol: 'Tl', name: '铊', nameEn: 'Thallium', mass: 204.4, electron: '[Xe]4f¹⁴5d¹⁰6s²6p¹', year: 1861, state: 'solid', category: 'post-transition', row: 6, col: 13 },
        { number: 82, symbol: 'Pb', name: '铅', nameEn: 'Lead', mass: 207.2, electron: '[Xe]4f¹⁴5d¹⁰6s²6p²', year: 0, state: 'solid', category: 'post-transition', row: 6, col: 14 },
        { number: 83, symbol: 'Bi', name: '铋', nameEn: 'Bismuth', mass: 209.0, electron: '[Xe]4f¹⁴5d¹⁰6s²6p³', year: 1753, state: 'solid', category: 'post-transition', row: 6, col: 15 },
        { number: 84, symbol: 'Po', name: '钋', nameEn: 'Polonium', mass: 209, electron: '[Xe]4f¹⁴5d¹⁰6s²6p⁴', year: 1898, state: 'solid', category: 'metalloid', row: 6, col: 16 },
        { number: 85, symbol: 'At', name: '砹', nameEn: 'Astatine', mass: 210, electron: '[Xe]4f¹⁴5d¹⁰6s²6p⁵', year: 1940, state: 'solid', category: 'halogen', row: 6, col: 17 },
        { number: 86, symbol: 'Rn', name: '氡', nameEn: 'Radon', mass: 222, electron: '[Xe]4f¹⁴5d¹⁰6s²6p⁶', year: 1900, state: 'gas', category: 'noble', row: 6, col: 18 },
        { number: 87, symbol: 'Fr', name: '钫', nameEn: 'Francium', mass: 223, electron: '[Rn]7s¹', year: 1939, state: 'solid', category: 'alkali', row: 7, col: 1 },
        { number: 88, symbol: 'Ra', name: '镭', nameEn: 'Radium', mass: 226, electron: '[Rn]7s²', year: 1898, state: 'solid', category: 'alkaline', row: 7, col: 2 },
        { number: 89, symbol: 'Ac', name: '锕', nameEn: 'Actinium', mass: 227, electron: '[Rn]6d¹7s²', year: 1899, state: 'solid', category: 'actinide', row: 10, col: 3 },
        { number: 90, symbol: 'Th', name: '钍', nameEn: 'Thorium', mass: 232.0, electron: '[Rn]6d²7s²', year: 1829, state: 'solid', category: 'actinide', row: 10, col: 4 },
        { number: 91, symbol: 'Pa', name: '镤', nameEn: 'Protactinium', mass: 231.0, electron: '[Rn]5f²6d¹7s²', year: 1913, state: 'solid', category: 'actinide', row: 10, col: 5 },
        { number: 92, symbol: 'U', name: '铀', nameEn: 'Uranium', mass: 238.0, electron: '[Rn]5f³6d¹7s²', year: 1789, state: 'solid', category: 'actinide', row: 10, col: 6 },
        { number: 93, symbol: 'Np', name: '镎', nameEn: 'Neptunium', mass: 237, electron: '[Rn]5f⁴6d¹7s²', year: 1940, state: 'solid', category: 'actinide', row: 10, col: 7 },
        { number: 94, symbol: 'Pu', name: '钚', nameEn: 'Plutonium', mass: 244, electron: '[Rn]5f⁶7s²', year: 1940, state: 'solid', category: 'actinide', row: 10, col: 8 },
        { number: 95, symbol: 'Am', name: '镅', nameEn: 'Americium', mass: 243, electron: '[Rn]5f⁷7s²', year: 1944, state: 'solid', category: 'actinide', row: 10, col: 9 },
        { number: 96, symbol: 'Cm', name: '锔', nameEn: 'Curium', mass: 247, electron: '[Rn]5f⁷6d¹7s²', year: 1944, state: 'solid', category: 'actinide', row: 10, col: 10 },
        { number: 97, symbol: 'Bk', name: '锫', nameEn: 'Berkelium', mass: 247, electron: '[Rn]5f⁹7s²', year: 1949, state: 'solid', category: 'actinide', row: 10, col: 11 },
        { number: 98, symbol: 'Cf', name: '锎', nameEn: 'Californium', mass: 251, electron: '[Rn]5f¹⁰7s²', year: 1950, state: 'solid', category: 'actinide', row: 10, col: 12 },
        { number: 99, symbol: 'Es', name: '锿', nameEn: 'Einsteinium', mass: 252, electron: '[Rn]5f¹¹7s²', year: 1952, state: 'solid', category: 'actinide', row: 10, col: 13 },
        { number: 100, symbol: 'Fm', name: '镄', nameEn: 'Fermium', mass: 257, electron: '[Rn]5f¹²7s²', year: 1952, state: 'solid', category: 'actinide', row: 10, col: 14 },
        { number: 101, symbol: 'Md', name: '钔', nameEn: 'Mendelevium', mass: 258, electron: '[Rn]5f¹³7s²', year: 1955, state: 'solid', category: 'actinide', row: 10, col: 15 },
        { number: 102, symbol: 'No', name: '锘', nameEn: 'Nobelium', mass: 259, electron: '[Rn]5f¹⁴7s²', year: 1958, state: 'solid', category: 'actinide', row: 10, col: 16 },
        { number: 103, symbol: 'Lr', name: '铹', nameEn: 'Lawrencium', mass: 266, electron: '[Rn]5f¹⁴7s²7p¹', year: 1961, state: 'solid', category: 'actinide', row: 10, col: 17 },
        { number: 104, symbol: 'Rf', name: '钅卢', nameEn: 'Rutherfordium', mass: 267, electron: '[Rn]5f¹⁴6d²7s²', year: 1964, state: 'solid', category: 'transition', row: 7, col: 4 },
        { number: 105, symbol: 'Db', name: '钅杜', nameEn: 'Dubnium', mass: 268, electron: '[Rn]5f¹⁴6d³7s²', year: 1967, state: 'solid', category: 'transition', row: 7, col: 5 },
        { number: 106, symbol: 'Sg', name: '钅喜', nameEn: 'Seaborgium', mass: 271, electron: '[Rn]5f¹⁴6d⁴7s²', year: 1974, state: 'solid', category: 'transition', row: 7, col: 6 },
        { number: 107, symbol: 'Bh', name: '钅波', nameEn: 'Bohrium', mass: 270, electron: '[Rn]5f¹⁴6d⁵7s²', year: 1976, state: 'solid', category: 'transition', row: 7, col: 7 },
        { number: 108, symbol: 'Hs', name: '钅黑', nameEn: 'Hassium', mass: 277, electron: '[Rn]5f¹⁴6d⁶7s²', year: 1984, state: 'solid', category: 'transition', row: 7, col: 8 },
        { number: 109, symbol: 'Mt', name: '钅麦', nameEn: 'Meitnerium', mass: 276, electron: '[Rn]5f¹⁴6d⁷7s²', year: 1982, state: 'solid', category: 'transition', row: 7, col: 9 },
        { number: 110, symbol: 'Ds', name: '钅达', nameEn: 'Darmstadtium', mass: 281, electron: '[Rn]5f¹⁴6d⁸7s²', year: 1994, state: 'solid', category: 'transition', row: 7, col: 10 },
        { number: 111, symbol: 'Rg', name: '钅仑', nameEn: 'Roentgenium', mass: 280, electron: '[Rn]5f¹⁴6d⁹7s²', year: 1994, state: 'solid', category: 'transition', row: 7, col: 11 },
        { number: 112, symbol: 'Cn', name: '钅哥', nameEn: 'Copernicium', mass: 285, electron: '[Rn]5f¹⁴6d¹⁰7s²', year: 1996, state: 'solid', category: 'transition', row: 7, col: 12 },
        { number: 113, symbol: 'Nh', name: '钅尔', nameEn: 'Nihonium', mass: 284, electron: '[Rn]5f¹⁴6d¹⁰7s²7p¹', year: 2003, state: 'solid', category: 'post-transition', row: 7, col: 13 },
        { number: 114, symbol: 'Fl', name: '钅夫', nameEn: 'Flerovium', mass: 289, electron: '[Rn]5f¹⁴6d¹⁰7s²7p²', year: 1998, state: 'solid', category: 'post-transition', row: 7, col: 14 },
        { number: 115, symbol: 'Mc', name: '钅莫', nameEn: 'Moscovium', mass: 288, electron: '[Rn]5f¹⁴6d¹⁰7s²7p³', year: 2003, state: 'solid', category: 'post-transition', row: 7, col: 15 },
        { number: 116, symbol: 'Lv', name: '钅利', nameEn: 'Livermorium', mass: 293, electron: '[Rn]5f¹⁴6d¹⁰7s²7p⁴', year: 2000, state: 'solid', category: 'post-transition', row: 7, col: 16 },
        { number: 117, symbol: 'Ts', name: '钅田', nameEn: 'Tennessine', mass: 294, electron: '[Rn]5f¹⁴6d¹⁰7s²7p⁵', year: 2010, state: 'solid', category: 'halogen', row: 7, col: 17 },
        { number: 118, symbol: 'Og', name: '钅奥', nameEn: 'Oganesson', mass: 294, electron: '[Rn]5f¹⁴6d¹⁰7s²7p⁶', year: 2002, state: 'solid', category: 'noble', row: 7, col: 18 }
    ];

    // Category Info
    const CATEGORIES = {
        alkali: { name: '碱金属', color: 'category-alkali' },
        alkaline: { name: '碱土金属', color: 'category-alkaline' },
        transition: { name: '过渡金属', color: 'category-transition' },
        'post-transition': { name: '后过渡金属', color: 'category-post-transition' },
        metalloid: { name: '准金属', color: 'category-metalloid' },
        nonmetal: { name: '非金属', color: 'category-nonmetal' },
        halogen: { name: '卤素', color: 'category-halogen' },
        noble: { name: '惰性气体', color: 'category-noble' },
        lanthanide: { name: '镧系元素', color: 'category-lanthanide' },
        actinide: { name: '锕系元素', color: 'category-actinide' }
    };

    // State translations
    const STATE_NAMES = {
        solid: '固体',
        liquid: '液体',
        gas: '气体'
    };

    // DOM Elements
    const periodicTable = document.getElementById('periodicTable');
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.getElementById('filterTabs');
    const legendGrid = document.getElementById('legendGrid');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');

    // State
    let currentFilter = 'all';
    let searchQuery = '';

    // Initialize
    function init() {
        renderTable();
        renderLegend();
        setupEventListeners();
    }

    // Render Periodic Table
    function renderTable() {
        periodicTable.innerHTML = '';

        // Create grid (10 rows x 18 cols)
        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 18; col++) {
                const element = ELEMENTS.find(e => e.row === row && e.col === col);

                // Special placeholders for lanthanide/actinide indicators
                if (row === 6 && col === 3) {
                    // Lanthanide series indicator
                    const indicator = document.createElement('div');
                    indicator.className = 'element category-lanthanide';
                    indicator.innerHTML = `<span class="number">57-71</span><span class="symbol">La-Lu</span><span class="name">镧系</span>`;
                    periodicTable.appendChild(indicator);
                    continue;
                }
                if (row === 7 && col === 3) {
                    // Actinide series indicator
                    const indicator = document.createElement('div');
                    indicator.className = 'element category-actinide';
                    indicator.innerHTML = `<span class="number">89-103</span><span class="symbol">Ac-Lr</span><span class="name">锕系</span>`;
                    periodicTable.appendChild(indicator);
                    continue;
                }

                if (element) {
                    const isVisible = isElementVisible(element);
                    const category = CATEGORIES[element.category] || {};

                    const el = document.createElement('div');
                    el.className = `element ${category.color || ''} ${isVisible ? '' : 'hidden'}`;
                    el.innerHTML = `
                        <span class="number">${element.number}</span>
                        <span class="symbol">${element.symbol}</span>
                        <span class="name">${element.name}</span>
                    `;
                    el.addEventListener('click', () => showElementDetail(element));
                    periodicTable.appendChild(el);
                } else {
                    // Placeholder for empty cells
                    const placeholder = document.createElement('div');
                    placeholder.className = 'element-placeholder';
                    periodicTable.appendChild(placeholder);
                }
            }
        }
    }

    // Check if element is visible
    function isElementVisible(element) {
        // Check state filter
        if (currentFilter !== 'all') {
            if (currentFilter === 'synthetic') {
                // Synthetic elements (year >= 1937 and not ancient)
                if (element.year < 1937 && element.year !== 0) return false;
            } else {
                if (element.state !== currentFilter) return false;
            }
        }

        // Check search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchName = element.name.toLowerCase().includes(query);
            const matchSymbol = element.symbol.toLowerCase().includes(query);
            const matchNameEn = element.nameEn.toLowerCase().includes(query);
            if (!matchName && !matchSymbol && !matchNameEn) return false;
        }

        return true;
    }

    // Render Legend
    function renderLegend() {
        legendGrid.innerHTML = Object.entries(CATEGORIES).map(([key, value]) => `
            <div class="legend-item" data-category="${key}">
                <div class="legend-color ${value.color}"></div>
                <span class="legend-text">${value.name}</span>
            </div>
        `).join('');

        // Click to filter by category
        legendGrid.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                // Highlight elements of this category
                periodicTable.querySelectorAll('.element').forEach(el => {
                    const element = ELEMENTS.find(e => el.querySelector('.symbol')?.textContent === e.symbol);
                    if (element) {
                        el.classList.toggle('hidden', element.category !== category);
                    }
                });
            });
        });
    }

    // Show Element Detail
    function showElementDetail(element) {
        const category = CATEGORIES[element.category] || {};

        document.getElementById('modalSymbol').textContent = element.symbol;
        document.getElementById('modalSymbol').className = `modal-symbol ${category.color || ''}`;
        document.getElementById('modalName').textContent = element.name;
        document.getElementById('modalNameEn').textContent = element.nameEn;
        document.getElementById('modalNumber').textContent = element.number;
        document.getElementById('modalMass').textContent = element.mass;
        document.getElementById('modalElectron').textContent = element.electron;
        document.getElementById('modalYear').textContent = element.year || '古代';
        document.getElementById('modalState').textContent = STATE_NAMES[element.state] || element.state;
        document.getElementById('modalCategory').textContent = category.name || element.category;

        modal.classList.add('show');
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTable();
        });

        // Filter tabs
        filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                renderTable();
            });
        });

        // Modal close
        modalClose.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('show');
            }
        });
    }

    // Initialize
    init();
})();
