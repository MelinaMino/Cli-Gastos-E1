import { readFile, writeFile } from 'fs/promises';

export const DATABASE_GASTOS = 'gastos.json';

export const writeGastosFile = async (data: any) => {
  await writeFile(DATABASE_GASTOS, JSON.stringify(data));
  return null;
};

export const readGastosFile = async () => {
  try {
    const expenses = (await readFile(DATABASE_GASTOS)).toString();

    return expenses;
  } catch (error) {
    await writeGastosFile([]);
    return '[]';
  }
};