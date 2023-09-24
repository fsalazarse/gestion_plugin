<script setup>
import { ref, onMounted } from 'vue'



const plugins = ref([])

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
        
})

const cambiarEstado = (id) => {
    fetch("http://127.0.0.1:5001/fabianlab-e67a4/us-central1/administrarplugin-changePluginStatus?idPlugin=" +id)
        .then((response) => {
            console.log(response);
            return response.json()
        })
        .catch((error) => {
            console.log("Error al consumir la cloud fuctions: ", error);
        })
        
};


//cloud messagging test





</script>


<template>
    <div>
      <h1>Lista de plugins</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre del plugin</th>
            <th>Estado</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plugin in plugins" :key="plugin.id">
            <td>{{ plugin.nombre }}</td>
            <td>{{ plugin.estado }}</td>
            <td><button @click="cambiarEstado(plugin.id)">Cambiar estado</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  

  <style>
  /* Estilos CSS aquí */
  </style>