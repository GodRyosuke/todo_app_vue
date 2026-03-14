<script setup lang="ts">
    import { ref } from 'vue'
    import axios from 'axios'

    const passWordInputType = ref("password");
    
    const alertDangerStrings = ref<string[]>([]);
    const alertSuccessStrings = ref<string[]>([]);
    
    class LoginForm {
        email: string = "";
        password: string = "";
        staySignedIn: boolean = false;
    };

    const isButtonDisabled = ref(false);
    const form = ref(new LoginForm());
    
    async function login() {
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
            const res = await axios.post('/api/login', {
                email: form.value.email,
                password: form.value.password,
                staySignedIn: form.value.staySignedIn,
            })
            alertSuccessStrings.value.push("Successfully logged in! Redirecting to dashboard...");
            console.log("login res: ", res);
            const token = res.data.token;
            localStorage.setItem('authToken', token);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } catch(err: any) {
            if (err.response?.data?.code) {
                const errorCode = err.response.data.code;
                if (errorCode === 'EMAIL_NOT_FOUND') {
                    alertDangerStrings.value.push('User with this email does not exist. Please check your email and try again.');
                } else if (errorCode === 'INVALID_PASSWORD') {
                    alertDangerStrings.value.push('Invalid password. Please check your password and try again.');
                } else if (errorCode === 'USER_NOT_VERIFIED') {
                    alertDangerStrings.value.push('Email not verified. Please check your email for verification link.');
                } else {
                    alertDangerStrings.value.push('Failed to login. Please check your input and try again.');
                }
            } else {
                alertDangerStrings.value.push(`Failed to login. Please check your network connection and try again.`);
            }
            console.error(`Failed to login: ${err.response?.data?.error ?? err.message}`);
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
                    <h3 class="text-center fw-medium mb-3 fs-4">Logout</h3>
                    <div class="text-center text-secondary mb-3">Thank you for using our service!</div>
                </div>
                <div class="text-center text-white text-decoration-underline w-100 mb-3">
                    <router-link to="/login">Login again</router-link>
                </div>
            </div>
            
            <div class="text-center text-white fs-sm fw-light w-100 py-3">
                &copy; 2026 Simple TODO App. All rights reserved.
            </div>
        </div>
    </main>
</template>