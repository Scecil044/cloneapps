export default function (context) {
    if (context.query.hasOwnProperty("idToken")) {
        return
    } 
    else if (!context.$auth.loggedIn) {
        context.redirect("/")
    } 
}