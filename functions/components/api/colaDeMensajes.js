/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//http://127.0.0.1:5001/fabianlab-e67a4/us-central1/getCollection url
const {onRequest} = require("firebase-functions/v2/https");
const {getFirestore, collection, getDocs, addDoc, doc, updateDoc , query, where, orderBy , connectFirestoreEmulator, limit } = require('firebase/firestore/lite');
const {initializeApp} = require('firebase/app');
const firebaseConfig = require('../../config/key_firebase');
const cors = require('cors');
const { log } = require("firebase-functions/logger");
//const firebaseConfig = require('./config/key_firebase.json')

exports.helloWorld = onRequest((request, response) => {
  try{ 
    
    response.send("hola mundo")

  }catch(error){
  console.error('Error al obtener  documentos de firestore: ', error)
    response.status(500).send('Error al obtener documentos de firestore')
  }
})


exports.getCollection = onRequest(async(request, response) => {
  try {

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);


    const data = collection(db, "cola_de_mensajes");
    const docSnapshot = await getDocs(data);
    const docList = docSnapshot.docs.map(doc => doc.data());

    response.status(200).json(docList);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    response.status(500).send('Error al obtener documentos');
  }

});

//  ---------------------API---------------------
//Agregar un nuevo registro a la cola de mensajes, la cual sera un repositorio de firestore
exports.insertData = onRequest(async(request, response) => {
  try{
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const fecha = new Date();
    const timestamp = fecha.toLocaleString();
   

    const docRef = await addDoc(collection(db, "cola_de_mensajes"), {
      email: "fsalazar@hyl.cl",
      estado: "iniciado",
      receptor: "serbimas",
      remitente: "core",
      timestamp: timestamp,
      ruta_input: "1nTssMfZZxECnzeuHTZAhYB_PyeoTQHXVGwVc7dKT2vA",
      ruta_output: "null"
    });
    response.status(200).send("registro agregado con exito");

  } catch (error) {
    console.error('Error al realizar el registro: ', error);
    response.status(500).send('Error al realizar el registro');
  }
})


//  ---------------------PLUGIN SERBIMAS---------------------
//El plugin tomara primero los registros mas antiguos con estado "iniciado"
//al tomar el registro cambiara el estado de este a "procesando" y al terminar de tomar de procesar el registro
//pasara a estado "terminado" y el remitente pasara a ser el plugin
exports.consultarCola = onRequest(async (request, response) => {
  try{
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const documento = "cola_de_mensajes"
    //obtener parametro del plugin
    const param_plugin = request.query.plugin;
    const docRef = collection(db, documento);
    
    //crear query 
    const q = query(docRef, where("estado",  "==", "iniciado"), where("receptor", "==", param_plugin), orderBy("timestamp", "asc"), limit(1));
    //Ejecutar consulta
    const querySnapshot = await getDocs(q);

    //Si la consulta no retorna nada termina la function
    if (querySnapshot.empty) {
      response.status(404).json({ message: "No se ha encontrado nada" });
      return;
    }

    //Obtener ID
    const docId = querySnapshot.docs[0].id;
    const colecction = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));

    //actualizar estado
    const docRefUpdate = doc(db, documento, docId);
    // Set the "capital" field of the city 'DC'
    await updateDoc(docRefUpdate, {
      estado: "procesando"
    });
    response.status(200).json(colecction);
   
  } catch(error) {
    console.error("Error al consultar cola", error)
    response.status(500).send("Error al consultar cola")

  }
})
