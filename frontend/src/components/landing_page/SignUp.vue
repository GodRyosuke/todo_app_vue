<script setup lang="ts">
    import { ref } from 'vue'

    const passWordInputType = ref("password");
</script>

<template>
    <main class="login container-fluid mt-0 pt-5 d-flex min-vh-100">
        <div class="d-flex flex-column justify-content-between flex-grow-1">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <img src="@/assets/img/page_icon.png" alt="icon" class="d-block rounded-circle icon-lg mb-4 p-2">
    
                <div class="bg-white rounded shadow-lg p-3 m-3">
                    <h3 class="text-center fs-6 fw-bold mb-3">Create Todo App Account</h3>
                    <form action="" class="mb-3">
                        <label for="username">Email</label>
                        <input type="text" placeholder="Email" class="form-control mb-3" id="username">
                        <label for="username">Username</label>
                        <input type="text" placeholder="Username" class="form-control mb-3" id="username">
                        <div class="d-flex align-items-center justify-content-between">
                            <label for="password">Password</label>
                            <div class="text-gray cursor-pointer" @click="passWordInputType = passWordInputType === 'password' ? 'text' : 'password'">
                                {{ passWordInputType === 'password' ? 'Show' : 'Hide' }}
                            </div>
                        </div>
                        <input :type="passWordInputType" placeholder="Password" class="form-control mb-3" id="password">

                        <div>
                            <input type="checkbox" id="receive-mail" class="me-1">
                            <label for="receive-mail">Receive promotional emails</label>
                        </div>
                        <div class="mb-3">
                            <input type="checkbox" id="remember" class="me-1">
                            <label for="remember">Stay signed in</label>
                        </div>

                        <div class="text-gray mb-3">
                            By creating an account, you agree to our <a href="" class="text-primary">terms</a> and <a href="" class="text-primary">privacy policy</a>.
                        </div>

                        <button type="submit" class="green-btn rounded fw-medium px-3 py-1 w-100">Create Free Account</button>
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