<template>
    <main class="login container-fluid mt-0 pt-5 d-flex min-vh-100">
        <div class="d-flex flex-column justify-content-between flex-grow-1">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <img src="@/assets/img/page_icon.png" alt="icon" class="d-block rounded-circle icon-lg mb-4 p-2">
    
                <div class="bg-white rounded shadow-lg p-3 m-3">
                    <h3 class="text-center fw-medium mb-3">Login</h3>
                    <form action="" class="mb-3">
                        <label for="username">Email or username</label>
                        <input type="text" placeholder="Email or username" class="form-control mb-3" id="username">
                        <label for="password">Password</label>
                        <input type="password" placeholder="Password" class="form-control mb-3" id="password">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <input type="checkbox" id="remember" class="me-1">
                                <label for="remember" class="text-gray">Remember me</label>
                            </div>
                            <router-link to="/login/recovery" class="text-primary fs-sm">forgot your password?</router-link>
                        </div>
                        <button type="submit" class="green-btn rounded fw-medium px-3 py-1 w-100">Login</button>
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
                <div class="text-center text-white text-decoration-underline w-100 mb-3">
                    <router-link to="/sign-up">Create free account</router-link>
                </div>
            </div>
            
            <div class="text-center text-white fs-sm fw-light w-100 py-3">
                &copy; 2026 Simple TODO App. All rights reserved.
            </div>
        </div>
    </main>
</template>