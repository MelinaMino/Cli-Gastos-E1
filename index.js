"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const fs_1 = require("fs");
const process_1 = require("process");
const prompts_1 = require("prompts");
const fs_2 = require("./fs");
const gastosProgram = new commander_1.Command();
class Gastos {
    constructor({ nombre, desc, valor }) {
        this.id = JSON.parse((0, fs_1.readFileSync)(fs_2.DATABASE_GASTOS).toString()).length + 1;
        this.nombre = nombre;
        this.desc = desc;
        this.valor = valor;
    }
}
const getGastos = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = (yield (0, fs_2.readGastosFile)());
        if (!result) {
            yield (0, fs_2.writeGastosFile)(result);
            return [];
        }
        return JSON.parse(result);
    }
    catch (error) {
        yield (0, fs_2.writeGastosFile)(error);
        return [];
    }
});
const getGasto = (ID) => __awaiter(void 0, void 0, void 0, function* () {
    const gastos = yield getGastos();
    return gastos.find((gas) => gas.id === ID);
});
const addGasto = (gasto) => __awaiter(void 0, void 0, void 0, function* () {
    const gastos = yield getGastos();
    gastos.push(gasto);
    yield (0, fs_2.writeGastosFile)(gastos);
    return gastos;
});
const deleteGasto = (ID) => __awaiter(void 0, void 0, void 0, function* () {
    const gastos = yield getGastos();
    if (!gastos)
        console.log(chalk_1.default.red('No se encontro el ID del gasto'));
    const newGastos = gastos.filter((gas) => gas.id !== ID);
    yield (0, fs_2.writeGastosFile)(newGastos);
});
const updateGastos = (ID, valor) => __awaiter(void 0, void 0, void 0, function* () {
    const gastos = yield getGastos();
    const gasto = gastos.find((gas) => gas.id === ID);
    if (!gasto)
        throw new Error("No se encontro el ID del gasto");
    const index = gastos.indexOf(gasto);
    gastos[index] = Object.assign(Object.assign({}, gasto), { valor });
    yield (0, fs_2.writeGastosFile)(gastos);
});
gastosProgram.name('CLI APP').description('App de Gastos').version('1.0.0');
gastosProgram.command('informacion').description('Aqui veras toda la info de tus gastos').action((a, b) => {
    console.log(chalk_1.default.red('Bienvenido a tu App de Gastos by Mel'));
});
gastosProgram.command('gastos').description('Administra los gastos de tu base de datos').action(() => __awaiter(void 0, void 0, void 0, function* () {
    const { action } = yield (0, prompts_1.prompt)({
        type: 'select',
        name: 'action',
        message: '¿Qué queres hacer con los gastos?',
        choices: [
            {
                title: 'Agregar',
                value: 'C',
            },
            {
                title: 'Ver listado',
                value: 'R',
            },
            {
                title: 'Actualizar gasto',
                value: 'U',
            },
            {
                title: 'Eliminar un gasto',
                value: 'D',
            },
        ],
    });
    switch (action) {
        case 'C':
            const { nombre_gasto } = yield (0, prompts_1.prompt)({
                type: 'text',
                name: 'nombre_gasto',
                message: 'Ingresa el nombre',
            });
            const { desc_gasto } = yield (0, prompts_1.prompt)({
                type: 'text',
                name: 'desc_gasto',
                message: 'Ingresa la descripcion',
            });
            const { valor_gasto } = yield (0, prompts_1.prompt)({
                type: 'number',
                name: 'valor_gasto',
                message: 'Ingresa el valor',
            });
            try {
                yield addGasto(new Gastos({
                    nombre: nombre_gasto,
                    desc: desc_gasto,
                    valor: valor_gasto,
                }));
                return console.log(chalk_1.default.green('Gasto ingresado correctamente'));
            }
            catch (error) {
                return console.log(chalk_1.default.red('Error al ingresar el gasto'));
            }
        case 'R':
            const data = yield getGastos();
            return console.table(data);
        case 'U':
            const { ID } = yield (0, prompts_1.prompt)({
                type: 'number',
                name: 'ID',
                message: 'Ingresa el ID del gasto que deseas modificar',
            });
            try {
                const exist = yield getGasto(ID);
                if (!exist)
                    console.log(chalk_1.default.red("No se encontro el ID del gasto"));
                const { NewValor } = yield (0, prompts_1.prompt)({
                    type: 'number',
                    name: 'NewValor',
                    message: 'Ingresa el nuevo valor',
                });
                yield updateGastos(ID, NewValor);
                return console.log(chalk_1.default.green('Gasto modificado con exito, felicitaciones'));
            }
            catch (error) {
                return console.log(chalk_1.default.red(error));
            }
        case 'D':
            const { id } = yield (0, prompts_1.prompt)({
                type: 'number',
                name: 'id',
                message: 'Ingresa el id del gasto a eliminar',
            });
            try {
                yield deleteGasto(id);
                return console.log(chalk_1.default.green('El gasto se elimino con exito'));
            }
            catch (error) {
                return console.log(chalk_1.default.red(error));
            }
    }
}));
gastosProgram.parse(process_1.argv);
