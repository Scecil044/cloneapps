self.addEventListener('push', function (event) {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: `${self.origin}/favicon.ico`,
    image: `${self.origin}/favicon.ico`,
  }

  const channel = new BroadcastChannel('inbetween')
  channel.postMessage(data)

  event.waitUntil(self.registration.showNotification(data.title, options))
})
