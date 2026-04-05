<template>
  <v-app>
    <Nuxt />
    <v-snackbar v-model="notificationError" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="notificationError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default {
  name: 'DefaultLayout',

  data() {
    return {
      publicVapidKey: process.env.NUXT_ENV_VAPID_PUBLIC_KEY,
      notificationError: false,
      errorMessage: '',
      notifications: {},
      isSubscribing: false
    }
  },

  created() {
   this.subscribeFn()
  },

  mounted(){
    // this.subscribeFn()

  },

  methods: {
    async checkAuthentication() {
      try {
        // Check if token exists in store
        const token = this.$store.getters.getToken
        const user = this.$store.getters.getThisUser

        // If no token or no user data, redirect to login
        if (!token || !user || !user.email) {
          console.log('No valid token or user data found, redirecting to login')
          this.$store.dispatch('logout')
          this.$router.push('/')
          return
        }

        // Validate token by making a test API call
        const AuthStr = 'Bearer '.concat(token)
        await this.$axios.$get('/users/getLogin', {
          headers: { Authorization: AuthStr },
        })

        console.log('Authentication check passed')
      } catch (error) {
        console.log('Authentication check failed:', error.message)
        // Token is invalid or expired, redirect to login
        this.$store.dispatch('logout')
        this.$router.push('/')
      }
    },
    async subscribeFn() {
      console.log("hello")
      // if ('serviceWorker' in navigator) {
      //   const permissions = await Notification.requestPermission();
      //   if (permissions === 'granted') {
      //     console.log("Have the permissions been granted");
      //     const register = await navigator.serviceWorker.register('/sw.js');
      //
      //     const channel = new BroadcastChannel('inbetween');
      //     channel.addEventListener('message', e => this.addSingleNotification(e.data));
      //
      //     if (register) {
      //       await register.update();
      //       window.subscription = await register.pushManager.subscribe({
      //         userVisibleOnly: true,
      //         applicationServerKey: urlBase64ToUint8Array(this.publicVapidKey), // Use the reactive property
      //       });
      //
      //       await this.$axios.$post("/webpusher/subscribe", {
      //         userId: this.$store.state.user._id,
      //         subscription: window.subscription
      //       });
      //     }
      //   }
      // }
    },

    addSingleNotification(data) {
      this.fetchNotifications(this.$store.state.user._id);
    },

    async fetchNotifications(id) {
      try {
        const response = await this.$axios.$get(`/notification-data/recipient/${id}`);
        if (response && response.data) {
          this.notifications = response.data; // Change to this.notifications
        } else {
          this.notifications = []; // Change to this.notifications
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        this.notifications = []; // Change to this.notifications
      }
    }
  },

  beforeDestroy() {
    if (process.client) {
      delete this.$root.subscribeToPushNotifications;
    }
  }
}
</script>
