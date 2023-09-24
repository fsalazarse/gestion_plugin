<script setup>
  import {RouterView, RouterLink} from 'vue-router'
  import { initializeApp } from "firebase/app";
  import { firebaseApp } from './config/key_firebase'
  import { getMessaging, getToken, onMessage } from "firebase/messaging";


  
  const app = initializeApp(firebaseApp);



  // Get registration token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // ...  
  });


  getToken(messaging, { vapidKey: 'BOBdrEhbHhhlSWB7swei_2T9okoU9oUPkZZK3fOWCU7FJWfJE5Z6IORIwIiUGYzM5rOdp7g8q-kTq_lLqOdg_IU' }).then((currentToken) => {
    if (currentToken) {
      // Send the token to your server and update the UI if necessary
      // ...
      console.log("Token is: ", currentToken);
    } else {
      // Show permission request UI
      console.log('No registration token available. Request permission to generate one.');
      // ...
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    // ...
  });


</script>


<template>
  <ul>
    <li>
      <RouterLink 
        :to="{name:'admin'}"
      
      >
        Administrador de plugin
      </RouterLink>
    </li>
    <li>
      <RouterLink 
        :to="{name:'usuario_final'}"
      
      >
        usuario Final
      </RouterLink>
    </li>
    <li>
      <RouterLink 
        :to="{name:'home'}"
      
      >
        home
      </RouterLink>
    </li>

  </ul>


<br>
<br>
<div>  
    <RouterView />
</div>
</template>

<style scoped>

</style>
