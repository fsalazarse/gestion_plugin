<script setup>
import { ref, onMounted } from 'vue'
import PopupView from './PopupView.vue';


const plugins = ref({})
const mostrarModal = ref(false)
const idPlugin = ref()
const prueba = ref('<h2>Prueba</h2>')


onMounted(() => {
fetch("http://127.0.0.1:5001/fabianlab-e67a4/us-central1/administrarplugin-getPlugins")
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        plugins.value = data
    })
    .catch((error) => {
        console.log("Error al consumir la cloud fuctions: ", error);
    })
});


const lanzarTarjeta = (id)  => {
  mostrarModal.value = true
  idPlugin.value = id 
}

const cerrarPopup = () => {
  mostrarModal.value = false;
}
      
</script>

<template>
    <div>
      <h1>Lista de plugins</h1>
      {{ prueba }}
      <table>
        <thead>
          <tr>
            <th>Nombre del plugin</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plugin in plugins" :key="plugin.id">
            <td>{{ plugin.nombre }}</td>
            <td><button @click="lanzarTarjeta(plugin.id)">Lanzar Tarjeta</button></td>
          </tr>
        </tbody>
      </table>

      <PopupView
        v-if="mostrarModal"
        :idPlugin="idPlugin"
        @cerrar-popup="cerrarPopup"
      >
        
      </PopupView>
    </div>

</template>
  
<style>
  
</style>