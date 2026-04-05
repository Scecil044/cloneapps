// export default async function (context) {
//   if (
//     context &&
//     context.req &&
//     context.req.headers &&
//     context.route.fullPath != '/'
//   ) {
//     let theCookie = context.req.headers.cookie
//     if (theCookie) {
//       if (theCookie.split('=')[1]) {
//         context.store.dispatch('initAuth', context.req)

//         // /* Get selected companies */
//         // let selected_companies
//         // const companies = theCookie
//         //   .split(';')
//         //   .find((c) => c.trim().startsWith('selected-company='))

//         // if (companies) {
//         //   selected_companies = decodeURIComponent(companies.split('=')[1])
//         // }

//         // selected_companies = selected_companies.split(',')
//         // console.log('here before store 1')
//         // const AuthStr = 'Bearer '.concat(context.store.state.token)
//         // await context.$axios
//         //   .$post(`/company/all`, {}, { headers: { Authorization: AuthStr } })
//         //   .then(async (res) => {
//         //     function flat(array) {
//         //       var result = []
//         //       array.forEach(function (a) {
//         //         result.push(a)
//         //         if (Array.isArray(a.children)) {
//         //           result = result.concat(flat(a.children))
//         //         }
//         //       })
//         //       return result
//         //     }

//         //     if (res.data.length > 0) {
//         //       let flat_companies = flat(res.data)
//         //       let req_companies = flat_companies.filter((ele) =>
//         //         selected_companies.includes(ele._id)
//         //       )
//         //       // go to dashboard,  select the parent company
//         //       let array_nodes = []
//         //       for (let index = 0; index < req_companies.length; index++) {
//         //         const element = req_companies[index]
//         //         array_nodes.push({
//         //           id: element.id,
//         //           name: element.name,
//         //           city: element.city,
//         //           email: element.email,
//         //           country: element.location,
//         //           phone: element.phone,
//         //           website: element.website,
//         //         })
//         //       }
//         //       // console.log('here before store')
//         //       context.store.dispatch('setCompanySelection', array_nodes)
//         //       let payload = {
//         //         company: [req_companies[0].id],
//         //       }
//         //       await context.$axios
//         //         .$post('customer/list', payload, {
//         //           headers: { Authorization: AuthStr },
//         //         })
//         //         .then((res2) => {
//         //           context.store.dispatch('setCustomers', res2.data.customers)
//         //         })
//         //         .catch((err) => {})
//         //     }
//         //   })s
//       }
//     }
//   }
// }

// export default async function (context) {
//   context.store.dispatch('initAuth', context.req)

//   let email = context.route.query.email
//   if (!email) {
//     if (context.route.path.startsWith('/forgot-password')) {
//       context.redirect(context.route.fullPath)
//     } else if (context.route.path.startsWith('/payslips/preview')) {
//       context.redirect(context.route.fullPath)
//     } else if (context.route.path.startsWith('/update-missing-details')) {
//       context.redirect(context.route.fullPath)
//     } else if (context.route.path.startsWith('/update-v2')) {
//       context.redirect(context.route.fullPath)
//     } else if (context.route.path !== '/') {
//       if (!context.$auth.loggedIn) {
//         // console.log('Logout auth')
//         context.store.dispatch('logout')
//         context.redirect('/')
//       } else {
//         const token = context.store.getters.getToken
//         const AuthStr = 'Bearer '.concat(token)
//         let getLogin = await context.$axios.$get('/users/getLogin', {
//           headers: { Authorization: AuthStr },
//         })

//         let getConf = await context.$axios.$get('/get/getConf', {
//           headers: { Authorization: AuthStr },
//         })
//         context.store.dispatch('setConf', {
//           conf: getConf,
//         })

//         let AllCompany = await context.$axios.$get('/get/getCompanies', {
//           headers: { Authorization: AuthStr },
//         })
//         context.store.dispatch('setAllCompanies', {
//           companies: AllCompany,
//         })

//         let getUsers = await context.$axios.$get('/get/getUsers', {
//           headers: { Authorization: AuthStr },
//         })

//         context.store.dispatch('setupUsers', {
//           users: getUsers,
//         })
//         // await context.$axios.$post("/users/setup")

//         context.store.dispatch('saveUserSessionInfo', getLogin)
//         if (
//           context.store.getters.getUser &&
//           context.store.getters.getUser.firstLogin !== true
//         ) {
//           if (context.route.path !== '/password-reset') {
//             context.redirect('/password-reset')
//           }
//         }
//       }
//     }
//   }

//   context.store.app.router.beforeEach((to, from, next) => {
//     next()
//   })
// }


export default async function (context) {
  const { store, route, $auth, req, $axios } = context
  let redirected = false

  const redirect = (path) => {
    if (!redirected) {
      redirected = true
      return context.redirect(path)
    }
  }

  await store.dispatch('initAuth', req)

  const isPublicRoute = (path) => {
    const publicRoutes = ['/', '/forgot-password', '/payslips/preview', '/update-missing-details', '/update-v2', '/Onboarding/new-employee', '/enrollment-form', '/kyc-enrollment', '/kyc-enrollment/success']
    return publicRoutes.some((route) => path.startsWith(route))
  }

  if ($auth.loggedIn && route.path === '/') {
    // Check if there's a last visited route in localStorage
    const lastRoute = process.client ? localStorage.getItem('lastRoute') : null
    if (lastRoute && lastRoute !== '/') {
      return redirect(lastRoute)
    }
    return redirect('/dashboard')
  }

  if (!isPublicRoute(route.path) && !$auth.loggedIn) {
    await store.dispatch('logout')
    return redirect('/')
  }

  if ($auth.loggedIn) {
    const currentTime = Date.now()
    const dataAge = currentTime - store.state.lastFetchTime
    const dataExpiration = 15 * 60 * 1000

    if (!store.state.initialLoadDone || dataAge > dataExpiration) {
      const token = store.getters.getToken
      const AuthStr = 'Bearer ' + token

      try {
        const [getLogin, getConf, AllCompany, getUsers] = await Promise.all([
          $axios.$get('/users/getLogin', { headers: { Authorization: AuthStr } }),
          $axios.$get('/get/getConf', { headers: { Authorization: AuthStr } }),
          $axios.$get('/get/getCompanies', { headers: { Authorization: AuthStr } }),
          $axios.$get('/get/getUsers', { headers: { Authorization: AuthStr } })
        ])

        await Promise.all([
          store.dispatch('setConf', { conf: getConf }),
          store.dispatch('setAllCompanies', { companies: AllCompany }),
          store.dispatch('setupUsers', { users: getUsers }),
          store.dispatch('saveUserSessionInfo', getLogin)
        ])

        store.commit('setInitialLoadDone', true)
        store.commit('setLastFetchTime', currentTime)

        if (store.getters.getUser && store.getters.getUser.firstLogin === true && route.path !== '/password-reset') {
          return redirect('/password-reset')
        }
      } catch (error) {
        console.error('Encountered an error when fetching store data', error)
        await store.dispatch('logout')
        return redirect('/')
      }
    }
  }


  // if (email) {
  // }
  context.app.router.beforeEach((to, from, next) => {
      next()
  })

}
