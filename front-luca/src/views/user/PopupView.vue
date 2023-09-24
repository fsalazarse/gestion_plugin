<script setup>
    import { defineProps, defineEmits, onMounted, ref as vueRef } from 'vue';
    import {initializeApp} from 'firebase/app';
    import { firebaseApp } from '../../config/key_firebase';
    import {getFirestore, getDoc, doc} from 'firebase/firestore';
    import {getStorage, ref, getDownloadURL} from 'firebase/storage';
    import axios from 'axios'
    
    //props
    const props = defineProps({
        idPlugin: {
            type: String,
            required: true
        }
    })
    defineEmits(['cerrar-popup'])

    const template = vueRef()
    


    const getForm =  async() => {
        console.log("gola");
        const app = initializeApp(firebaseApp);
        const db = getFirestore(app);
        const pluginRef = doc(db, "plugins", props.idPlugin);
        const docSnap = await getDoc(pluginRef);
        const pluginData = docSnap.data();
        const templateUrl = pluginData.template;
        console.log(typeof templateUrl);
        const storage = getStorage(app);
        
        const archivoRef = ref(storage, templateUrl);
        const downloadURL = await getDownloadURL(archivoRef);
        const res = await axios.get(downloadURL) //axios sirve para realizar peticiones HTTP
        const data = res.data;
        template.value = data
        console.log(template.value);
        
        
    }


    onMounted(() => {
        getForm()
     
    });

</script>

<template>
    <div class="popup">
        <div class="popup-inner">
            <button class="popup-close" @click="$emit('cerrar-popup')">Cerrar Modal</button>
            <p>{{idPlugin}}</p>
            <div class="content" v-html="template">
                
            </div>
        </div>
    </div>
</template>

<style scoped>
    .popup{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        background-color: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .popup-inner{
        background: #fff;
        border-radius: 15px;
        padding: 32px;
    }
    form {
        display: flex;
        flex-direction: column;
        
    }

    label, input {
        display: block;
        margin-bottom: 10px;
    }

</style>