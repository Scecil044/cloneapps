export default {
    new: function (created_by, assigned_to, notification_text, notification_type, url) {
        let appInstance = undefined
        if(app[0] != undefined)  appInstance = app[0]
        else appInstance = app
        const token = appInstance.__vue__.$root.$store.getters.getToken
        const AuthStr = 'Bearer '.concat(token)

        let notification = {
            notification_type: notification_type,
            notification_text: notification_text,
            user_id: assigned_to,
            created_by: created_by,
            url: url,
            read_by: []
        }

        appInstance.__vue__.$root.$axios.$post('/notifications/new', notification, { headers: { Authorization: AuthStr } }).then(res => { }).catch()
    }
}