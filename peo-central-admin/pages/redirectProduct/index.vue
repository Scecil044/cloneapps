<template>
	<div>
		<v-container style="background-color:#f4f7f7" fluid
			class="h-100 d-flex flex-column align-center justify-center">
			<div class="lds-ellipsis">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</v-container>
	</div>
</template>

<script>
export default {
	layout: 'noheader',
	mounted() {
		this.login()
	},
	methods: {
		async login() {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);

			let email = urlParams.get('email')
			let otp = urlParams.get('otp')

			// console.log(email, otp,"-----------------------redirect")

			await this.$auth.loginWith("local", {
				data: {
					email: email,
					password: "",
					type: "REDIRECT",
					otp: otp
				},
			})
				.then(async (response) => {
					// console.log(response, "---------response")
					if (response.data.success !== true) {
						const { data } = response.data
						const { refresh } = data.tokens
						this.$auth.setUser({ ...data.user })
						this.$auth.strategy.refreshToken.set(refresh.token)
						this.$store.dispatch("saveUserSessionInfo", data)
						// window.location.replace("http://localhost:5407/")
						this.$router.push("/dashboard")
						return
					}
				})
				.catch(e => {
					// console.log(e)
					this.$router.push("/")
					// window.location.replace("http://localhost:5407/")
				})
		}
	}

}
</script>

<style>
.h-100 {
	height: 100vh;
}

.lds-ellipsis {
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
}

.lds-ellipsis div {
	position: absolute;
	top: 33px;
	width: 13px;
	height: 13px;
	border-radius: 50%;
	background: #001ad5;
	animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.lds-ellipsis div:nth-child(1) {
	left: 8px;
	animation: lds-ellipsis1 0.6s infinite;
}

.lds-ellipsis div:nth-child(2) {
	left: 8px;
	animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(3) {
	left: 32px;
	animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(4) {
	left: 56px;
	animation: lds-ellipsis3 0.6s infinite;
}

@keyframes lds-ellipsis1 {
	0% {
		transform: scale(0);
	}

	100% {
		transform: scale(1);
	}
}

@keyframes lds-ellipsis3 {
	0% {
		transform: scale(1);
	}

	100% {
		transform: scale(0);
	}
}

@keyframes lds-ellipsis2 {
	0% {
		transform: translate(0, 0);
	}

	100% {
		transform: translate(24px, 0);
	}
}
</style>