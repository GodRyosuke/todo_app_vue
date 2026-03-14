<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRoute } from "vue-router"
    import axios from 'axios'

    const route = useRoute();

    
    class VerifyResult {
        title: string = "";
        message: string = "";
    };
    const verifyResult = ref<VerifyResult>(new VerifyResult());
    const isVerifySuccess = ref(false);

    onMounted(async () => {
        verifyResult.value.title = 'Verifying your account...';
        verifyResult.value.message = 'Please wait a moment while we verify your account.';
        
        try {
            const accountVerificationRes = await axios.get('/api/verify', {
                params: {
                    token: route.query.token
                }
            });
            console.log("account verification res: ", accountVerificationRes);
            verifyResult.value.title = 'Account verified successfully';
            verifyResult.value.message = 'You can now login and start using the app!';
            isVerifySuccess.value = true;
        } catch(err: any) {
            if (err.response?.data?.code === 'INVALID_OR_EXPIRED_TOKEN') {
                verifyResult.value.title = 'We are sorry';
                verifyResult.value.message = 'The verification link is invalid or has expired.<br>Please sign up again to receive a new verification email.';
                return;
            }
            
            verifyResult.value.title = 'We are sorry';
            verifyResult.value.message = 'An error occurred. Please check your network connection and sign up again.';
        }
    });
</script>

<template>
    <main class="login container-fluid mt-0 pt-5 d-flex min-vh-100">
        <div class="d-flex flex-column justify-content-between flex-grow-1">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <img src="@/assets/img/page_icon.png" alt="icon" class="d-block rounded-circle icon-lg mb-4 p-2">
    
                <div class="bg-white rounded shadow-lg p-3 m-3">
                    <h3 class="text-center fw-medium mb-3 fs-5">{{ verifyResult.title }}</h3>
                    <p class="text-center text-secondary mb-3" v-html="verifyResult.message"></p>
                    <div v-if="isVerifySuccess">Please login from <router-link to="/login" class="text-primary text-decoration-underline">here</router-link></div>
                </div>
            </div>
            
            <div class="text-center text-white fs-sm fw-light w-100 py-3">
                &copy; 2026 Simple TODO App. All rights reserved.
            </div>
        </div>
    </main>
</template>