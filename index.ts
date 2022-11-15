import chalk from 'chalk';
import {Command} from 'commander';
import { readFileSync } from 'fs';
import { argv } from 'process';
import {prompt} from 'prompts';
import { DATABASE_GASTOS, readGastosFile, writeGastosFile } from './fs';

const gastosProgram = new Command();

interface IGastos {
    nombre: string;
    valor: number;
    desc: string;
}

class Gastos {
    id: number;
    nombre: string;
    desc: string;
    valor: number;

  constructor({ nombre, desc, valor }: IGastos) {
    this.id = JSON.parse(readFileSync(DATABASE_GASTOS).toString()).length + 1
    this.nombre = nombre;
    this.desc = desc;
    this.valor= valor;
}}


const getGastos = async (): Promise<Gastos[]> => {
  try {
    const result = (await readGastosFile());
    if (!result) {
      await writeGastosFile(result);
      return [];
    }
    return JSON.parse(result);
  } catch (error) {
    await writeGastosFile(error);
    return [];
  }
};


const getGasto = async (ID: number) => {
  const gastos = await getGastos();
  return gastos.find((gas: Gastos) => gas.id === ID);
};


const addGasto = async (gasto: Gastos) => {
    const gastos = await getGastos();
    gastos.push(gasto);
  
    await writeGastosFile(gastos);
    return gastos;
  };

  const deleteGasto = async (ID: number) => {
    const gastos = await getGastos();
    if (!gastos) console.log(chalk.red('No se encontro el ID del gasto'));
    const newGastos = gastos.filter((gas: Gastos) => gas.id !== ID);
    await writeGastosFile(newGastos);
  };

  const updateGastos = async (ID: number, valor: number) => {
    const gastos = await getGastos();
    const gasto = gastos.find((gas:Gastos)=> gas.id === ID)
    if (!gasto) throw new Error("No se encontro el ID del gasto");

    const index = gastos.indexOf(gasto);
    gastos[index] = { ...gasto, valor };
  
    await writeGastosFile(gastos);
  };

gastosProgram.name('CLI APP').description('App de Gastos').version('1.0.0');

gastosProgram.command('informacion').description('Aqui veras toda la info de tus gastos').action((a, b)=>{
    console.log(chalk.red('Bienvenido a tu App de Gastos by Mel'));
});

gastosProgram.command('gastos').description('Administra los gastos de tu base de datos').action(async () => {
    const { action } = await prompt({
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
          const { nombre_gasto } = await prompt({
            type: 'text',
            name: 'nombre_gasto',
            message: 'Ingresa el nombre',
          });
          const { desc_gasto } = await prompt({
            type: 'text',
            name: 'desc_gasto',
            message: 'Ingresa la descripcion',
          });
          const { valor_gasto} = await prompt({
            type: 'number',
            name: 'valor_gasto',
            message: 'Ingresa el valor',
          });

          try {
            await addGasto(
              new Gastos({
                nombre: nombre_gasto,
                desc: desc_gasto,
                valor: valor_gasto,
              })
            )
            return console.log(chalk.green('Gasto ingresado correctamente'));

          } catch (error) {
            return console.log(chalk.red('Error al ingresar el gasto'));
          }

        case 'R':
            const data = await getGastos();
            return console.table(data);

        case 'U':
            const {ID} = await prompt({
            type: 'number',
            name: 'ID',
            message: 'Ingresa el ID del gasto que deseas modificar',
            });
            try{
                const exist = await getGasto(ID);
                if (!exist) console.log(chalk.red("No se encontro el ID del gasto"));
                 

            const {NewValor} = await prompt({
                type: 'number',
                name: 'NewValor',
                message: 'Ingresa el nuevo valor',
            });

            await updateGastos(ID, NewValor);
                return console.log(chalk.green('Gasto modificado con exito, felicitaciones'));
            } catch (error) {
                return console.log(chalk.red(error));
            }  
            
        case 'D':
          const {id} = await prompt({
            type: 'number',
            name: 'id',
            message: 'Ingresa el id del gasto a eliminar',
          });
  
          try {
            await deleteGasto(id);
  
            return console.log(chalk.green('El gasto se elimino con exito'));
          } catch (error) {
            return console.log(chalk.red(error));
          }
      }
    });
  
  gastosProgram.parse(argv);