<script setup lang="ts">
    import { ref, } from 'vue'
    import axios from 'axios'

    const passWordInputType = ref("password");

    const alertDangerStrings = ref<string[]>([]);
    const alertSuccessStrings = ref<string[]>([]);
    
    class SignUpForm {
        email: string = "";
        username: string = "";
        password: string = "";
        receivePromotionalEmails: boolean = false;
        staySignedIn: boolean = false;
    };

    const isButtonDisabled = ref(false);
    const form = ref(new SignUpForm());
    
    async function subscribe() {
        try {
            alertDangerStrings.value = [];
            const validateEmail = (value: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                if (!value) {
                    return "Email is required"
                }

                if (!emailRegex.test(value)) {
                    return "Invalid email format"
                }

                return ""
            }
            const validatePassword = (value: string) => {
                if (!value) {
                    return "Password is required"
                }

                if (value.length < 8) {
                    return "Password must be at least 8 characters long"
                }

                return ""
            }
            
            const emailValidationResult = validateEmail(form.value.email);
            const passwordValidationResult = validatePassword(form.value.password);
            if (emailValidationResult.length) {
                alertDangerStrings.value.push(emailValidationResult);
            }
            if (passwordValidationResult.length) {
                alertDangerStrings.value.push(passwordValidationResult);
            }
            if (emailValidationResult.length || passwordValidationResult.length) {
                return;
            }
            
            isButtonDisabled.value = true;
            const res = await axios.post('/api/sign-up', {
                email: form.value.email,
                username: form.value.username,
                password: form.value.password,
                receivePromotionalEmails: form.value.receivePromotionalEmails,
                staySignedIn: form.value.staySignedIn,
            })
            alertSuccessStrings.value.push("Successfully signed up! Please check your email for verification.");
            console.log("sign up res: ", res);
        } catch(err: any) {
            if (err.response?.data?.code) {
                const errorCode = err.response.data.code;
                if (errorCode === 'EMAIL_ALREADY_EXISTS') {
                    alertDangerStrings.value.push('User with this email already exists. Please use a different email.');
                } else if (errorCode === 'INVALID_INPUT') {
                    alertDangerStrings.value.push('Invalid input. You might submit incorrect data. Please check your email and password and try again.');
                } else {
                    alertDangerStrings.value.push('Failed to sign up. Please check your input and try again.');
                }
            } else {
                alertDangerStrings.value.push(`Failed to sign up. Please check your network connection and try again.`);
            }
            console.error(`Failed to sign up: ${err.response?.data?.error ?? err.message}`);
            return;
        } finally {
            isButtonDisabled.value = false;
        }
    }

</script>

<template>
    <main class="login container-fluid mt-0 pt-5 d-flex min-vh-100">
        <div class="d-flex flex-column justify-content-between flex-grow-1">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <img src="@/assets/img/page_icon.png" alt="icon" class="d-block rounded-circle icon-lg mb-4 p-2">
    
                <div class="bg-white rounded shadow-lg p-3 m-3">
                    <h3 class="text-center fs-6 fw-bold mb-3">Create Todo App Account</h3>
                    <div class="alert alert-danger alert-dismissible w-100" v-for="(alertString, index) in alertDangerStrings" :key="index">
                        {{ alertString }}
                        <button type="button" class="btn-close" @click="alertDangerStrings.splice(index, 1)"></button>
                    </div>
                    <div class="alert alert-success alert-dismissible w-100" v-for="(alertString, index) in alertSuccessStrings" :key="index">
                        {{ alertString }}
                        <button type="button" class="btn-close" @click="alertSuccessStrings.splice(index, 1)"></button>
                    </div>
                    <form @submit.prevent="subscribe" class="mb-3">
                        <label for="email">Email</label>
                        <input type="text" placeholder="Email" class="form-control mb-3" id="email" v-model="form.email">
                        <label for="username">Username</label>
                        <input type="text" placeholder="Username" class="form-control mb-3" id="username" v-model="form.username">
                        <div class="d-flex align-items-center justify-content-between">
                            <label for="password">Password</label>
                            <div class="text-gray cursor-pointer" @click="passWordInputType = passWordInputType === 'password' ? 'text' : 'password'">
                                {{ passWordInputType === 'password' ? 'Show' : 'Hide' }}
                            </div>
                        </div>
                        <input :type="passWordInputType" placeholder="Password" class="form-control mb-3" id="password" v-model="form.password">

                        <div>
                            <input type="checkbox" id="receive-mail" class="me-1" v-model="form.receivePromotionalEmails">
                            <label for="receive-mail">Receive promotional emails</label>
                        </div>
                        <div class="mb-3">
                            <input type="checkbox" id="remember" class="me-1" v-model="form.staySignedIn">
                            <label for="remember">Stay signed in</label>
                        </div>

                        <div class="text-gray mb-3">
                            By creating an account, you agree to our <a href="" class="text-primary">terms</a> and <a href="" class="text-primary">privacy policy</a>.
                        </div>

                        <button type="submit" :disabled="isButtonDisabled" class="green-btn rounded fw-medium px-3 py-1 w-100">Create Free Account</button>
                    </form>
                    <div class="text-center text-gray w-100 mb-3">or</div>
                    
                    <a href="" class="sns-signin rounded border d-block position-relative w-100 p-2 mb-3">
                        <i class="bi bi-google"></i>
                        <div class="text position-absolute text-center w-100">
                            Sign in with Google
                        </div>
                    </a>
                    <a href="" class="sns-signin rounded border d-block position-relative w-100 p-2">
                        <i class="bi bi-github"></i>
                        <div class="text position-absolute text-center w-100">
                            Sign in with Github
                        </div>
                    </a>
                </div>
                <div class="text-center text-white w-100 mb-3">
                    Already have account? <router-link to="/login" class="text-decoration-underline">Sign in</router-link>
                </div>
            </div>
            
            <div class="text-center text-white fs-sm fw-light w-100 py-3">
                &copy; 2026 Simple TODO App. All rights reserved.
            </div>
        </div>
    </main>
</template>