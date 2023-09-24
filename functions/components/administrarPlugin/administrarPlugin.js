const {onRequest} = require("firebase-functions/v2/https");
const { getStorage, uploadString, ref } = require("firebase/storage")
const {initializeApp} = require('firebase/app');
const firebaseConfig = require('../../config/key_firebase');
const {getFirestore, collection, addDoc, getDocs} = require('firebase/firestore/lite');
const cors = require("cors")({ origin: true });

// ------------------ Requerimiento -----------------------------------------
//  Crear un archivo json en storage con instrucciones para comunicar Clod
//  function y guardar persistencia de maquina de estado en firebase con la 
//  estructura de datos estandar definida


//El primer ejemplo se realizara con el cambio de estado de un plugin disponible 
// para los usuarios

//---------------Pasos para activar a un plugin----------------------
//paso 1: El administrador de plugin activara el plugin de serbimas
//Paso 2: la maquina de estados tomara esa solicitud la registrara en la base de datos de maquina de estados, definiendo las instrucciones en un json guarado en storage
//paso 3: el broker identificara que se a realizado un registro en la base de datos y llamara a la cloud function de Gestor de plugin especificada en el receptor
//paso 4: el gestor de plugin tomara las instrucciones especificadas en json y cambiara el estado del plugin 



//Guardo un registro en la maquina de estado donde especifico que deseo cambiar el estado de un plugin
exports.changePluginStatus = onRequest(async(request, response) => {
    try {
        //params
        const idPluginParams = request.query.idPlugin;
        
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        const db = getFirestore(app);
        const urlJSON = 'instrucciones/adminPluginConGestionPlugin.json'

       
        const storageRef = ref(storage, urlJSON);
        const fecha = new Date();
        const timestamp = fecha.toLocaleString();

        // Crear .json con intrucciones  para comunicar los plugin.
        // ..... elementos del json
        const instrucciones = {
          "instruction":[{
            "category":[{
              "gestionPlugin":[{
                "idPlugin": idPluginParams,
                "idRol": "adsdasd",
                "idInterfaz": "ajajaj",
                "accion": "cambiar estado"
              }],
              "gestoDeCompunicacion":[],
              "administracionDeSeguridad":[]
            }],
            "inputFile": ["none"],
            "outFile": ["none"],
            "inputUser":"none" 
          }]
        }
        const instruccionesJson = JSON.stringify(instrucciones);
        uploadString(storageRef, instruccionesJson)
        
        // ......................................................................

        // guardar  registro en firestore de  maquina de estados.
        const docRef = await addDoc(collection(db, "maquina_de_estados"), {
          emisor: "administrador de plugin",
          estado: "iniciado",
          receptor: "gestor de plugin",
          referencia: urlJSON,
          timestamp: timestamp
        });

        response.status(200).json("registro agregado con exito");

    } catch (error) {
      console.error('Error al obtener documentos:', error);
      response.status(500).send('Error al obtener documentos', error);
    }
});

//................ acciones que debe hacer el administrador de plugin................
//cambiar estado de un plugin: idPlugin, nuevo estado
//agregar o quitar  un plugin a un rol: idRol, idPlugin, accion(quitar o agregar)
//definir una interfaz para un rol; idRol, idInterfaz, accion(seleccionar un interfaz) 


//Listar plugin 
exports.getPlugins = onRequest(async(request, response) => {
  cors(request, response, async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const data = collection(db, "plugins");
      const docSnapshot = await getDocs(data);
      const docList = docSnapshot.docs.map(doc => ({
        ...doc.data(),
        id : doc.id
      }));

      response.status(200).json(docList);

    } catch (error) {
      console.error('Error al obtener plugins!!!!!!:', error);
      response.status(500).send('Error al obtener plugins!!!!!!');
    }
  });
  
});

