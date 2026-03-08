<template>
    <main class="login container-fluid mt-0 pt-5 d-flex min-vh-100">
        <div class="d-flex flex-column justify-content-between flex-grow-1">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <img src="@/assets/img/page_icon.png" alt="icon" class="d-block rounded-circle icon-lg mb-4 p-2">
    
                <div class="bg-white rounded shadow-lg p-3 m-3">
                    <h3 class="text-center fw-medium mb-3 fs-4">Reset your password</h3>
                    <div class="text-gray text-center mb-3">
                        Enter your email address to recover your password.
                    </div>
                    <form action="" class="mb-3">
                        <label for="email">Email</label>
                        <input type="text" placeholder="Email" class="form-control mb-3" id="email">
                        <button type="submit" class="green-btn rounded fw-medium px-3 py-1 w-100">Submit</button>
                    </form>
                </div>
                <div class="text-center text-white w-100 mb-3">
                    Return to <router-link to="/login" class="text-decoration-underline">Sign in</router-link>
                </div>
            </div>
            
            <div class="text-center text-white fs-sm fw-light w-100 py-3">
                &copy; 2026 Simple TODO App. All rights reserved.
            </div>
        </div>
    </main>
</template>