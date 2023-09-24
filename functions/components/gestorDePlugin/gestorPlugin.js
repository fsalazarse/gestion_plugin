const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require('firebase/app');
const {getFirestore, collection, getDoc ,getDocs, query, where, orderBy, limit, updateDoc, doc} = require('firebase/firestore/lite');
const { getStorage, ref, getMetadata, getDownloadURL } = require("firebase/storage")
const {getMessaging, getToken} = require("firebase/messaging")
const firebaseConfig = require('../../config/key_firebase');
const tokenMessaging = require('../../config/cloud_messaging_token');
const axios = require('axios')

//................comportamiento esperado
//El broker va a buscar los registros que existan para esta function
//y activa el receptor de la cloud fuction


//...........comportamiento de esta simulacion
//manualmente activare esta cloud fuction
//y entregare los paremtros que necesita en hardcode.

//tomara la referencia 
exports.cambiarEstado = onRequest( async(request, response) => {
    try{

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const coleccionDB = "maquina_de_estados";
        const receptor = "gestor de plugin"

        //.........consulta para obtener el primer registro de la maquina de estado corresponidente al gestor de plugin
        const docRef = collection(db, coleccionDB);
        const q = query(docRef, where("estado",  "==", "iniciado"), where("receptor", "==", receptor), orderBy("timestamp", "asc"), limit(1));
        const querySnapshot = await getDocs(q);
         
        if (querySnapshot.empty) { //Si la consulta no retorna nada termina la function
            response.status(404).json({ message: "No se han encontrado registros en la maquina de estados" });
            return;
        }
        const colecction = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        const idMaquina = colecction[0].id

        //cambiar estado en maquina de estado
        const maquinaRef = doc(db, "maquina_de_estados", idMaquina);
        await updateDoc(maquinaRef, {
            estado: "terminado"
        });
 
        //..............................................................................................................................
        
        //................Obtener json de instrucciones.................................................................
        const referenciaJsonInstruccion = colecction[0].referencia;
        const storage = getStorage(app);
        const archivoRef = ref(storage, referenciaJsonInstruccion);

        const downloadURL = await getDownloadURL(archivoRef);
    
        const res = await axios.get(downloadURL) //axios sirve para realizar peticiones HTTP
        const jsonData = res.data;
        //......................................................................................................

        ///.......................... activar plugin............................................................
        const idPlugin = jsonData.instruction[0].category[0].gestionPlugin[0].idPlugin;
        const newData = {
            estado:"Desactivado"
        }

        //traer un documento 
        const pluginRef = doc(db, "plugins", idPlugin);
        const docSnap = await getDoc(pluginRef);
        
        if(docSnap.empty){
            response.status(404).json("No existe el documento");
        }
        const pluginData = docSnap.data();
        const estadoActual = pluginData.estado
        
        if(estadoActual == "Activado") {
            await updateDoc(pluginRef, {
                estado:"Desactivado"
             })
        }else if(estadoActual == "Desactivado"){
            await updateDoc(pluginRef, {    
                estado:"Activado"
             })
        }
        
        //.......................................................................................................
        response.status(200).json("Estado actualizado con exito!!!!");
        
    } catch(error) {
        response.status(500).send("error en el cambio de estado")
        console.log(error)
    }  
});

//test notifiacion
exports.testNotificacion = onRequest( async(request, response) => {
    try{
        //const app = initializeApp(firebaseConfig);
        //const admin = require("firebase-admin");
        initializeApp(firebaseConfig);

        // This registration token comes from the client FCM SDKs.
        const registrationToken = ''; //ingresar token del navegador
        const message = {
            notification:{
                title:"i am admin",
                body: "Hi client"
            },
            webpush: {
                fcmOptions: {
                  link: 'breakingnews.html'
                }
            },
            token: registrationToken
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        getMessaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });


        response.status(200).json("test notificacion");
        
    } catch(error) {
        response.status(500).send("error en notificacion")
        console.log("error al enviar notificacion!!!!!1", error)
    }  
});

// exports.enviarNotificacion = onRequest( async(request, response) => {
//     const { token, mensaje } = data;
  
//     try {
//       const message = {
//         data: {
//           message: mensaje,
//         },
//         token: token,
//       };
  
//       const response = await admin.messaging().send(message);
  
//       return { success: true, response };
//     } catch (error) {
//       console.error('Error al enviar la notificación:', error);
//       return { success: false, error: error.message };
//     }
//   });