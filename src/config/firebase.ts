import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  databaseURL: "https://socialdv-5defa-default-rtdb.firebaseio.com/",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancia de Realtime Database
export const db = getDatabase(app);
