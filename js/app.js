/* =========================================================
   PRESENTTRACK
   LOGIN PAGE
   app.js

   ALL LOGIN JAVASCRIPT IS HERE.
========================================================= */

"use strict";


/* =========================================================
   WAIT FOR HTML TO LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           GET HTML ELEMENTS
        ===================================================== */

        const loginForm =
            document.getElementById("loginForm");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const togglePassword =
            document.getElementById("togglePassword");

        const loginButton =
            document.getElementById("loginButton");

        const loginButtonText =
            document.getElementById("loginButtonText");

        const loginArrow =
            document.getElementById("loginArrow");

        const loginSpinner =
            document.getElementById("loginSpinner");

        const messageBox =
            document.getElementById("message");

        const forgotPassword =
            document.getElementById("forgotPassword");

        const rememberMe =
            document.getElementById("rememberMe");

        const roleInputs =
            document.querySelectorAll(
                'input[name="role"]'
            );


        /* =====================================================
           SAFETY CHECK
        ===================================================== */

        if (
            !loginForm ||
            !emailInput ||
            !passwordInput ||
            !togglePassword ||
            !loginButton ||
            !loginButtonText ||
            !loginArrow ||
            !loginSpinner ||
            !messageBox
        ) {
            return;
        }


        /* =====================================================
           GET SELECTED ROLE
        ===================================================== */

        function getSelectedRole() {

            const selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );


            if (selectedRole) {
                return selectedRole.value;
            }


            return "student";
        }


        /* =====================================================
           SHOW MESSAGE
        ===================================================== */

        function showMessage(
            message,
            type
        ) {

            messageBox.textContent =
                message;

            messageBox.className =
                "message " + type;
        }


        /* =====================================================
           CLEAR MESSAGE
        ===================================================== */

        function clearMessage() {

            messageBox.textContent =
                "";

            messageBox.className =
                "message";
        }


        /* =====================================================
           PASSWORD SHOW / HIDE
        ===================================================== */

        togglePassword.addEventListener(
            "click",
            function () {

                const isPassword =
                    passwordInput.type === "password";


                if (isPassword) {

                    passwordInput.type =
                        "text";

                    togglePassword.textContent =
                        "🙈";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                    togglePassword.setAttribute(
                        "title",
                        "Hide password"
                    );

                } else {

                    passwordInput.type =
                        "password";

                    togglePassword.textContent =
                        "👁";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                    togglePassword.setAttribute(
                        "title",
                        "Show password"
                    );
                }
            }
        );


        /* =====================================================
           STUDENT / FACULTY SELECTION
        ===================================================== */

        roleInputs.forEach(
            function (roleInput) {

                roleInput.addEventListener(
                    "change",
                    function () {

                        clearMessage();


                        const selectedRole =
                            getSelectedRole();


                        if (
                            selectedRole ===
                            "student"
                        ) {

                            emailInput.placeholder =
                                "Enter student email";

                        } else {

                            emailInput.placeholder =
                                "Enter faculty email";
                        }
                    }
                );
            }
        );


        /* =====================================================
           FORM VALIDATION
        ===================================================== */

        function validateForm() {

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* ---------------------------------------------
               EMAIL EMPTY
            --------------------------------------------- */

            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                emailInput.focus();

                return false;
            }


            /* ---------------------------------------------
               EMAIL FORMAT
            --------------------------------------------- */

            if (
                !emailInput.checkValidity()
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return false;
            }


            /* ---------------------------------------------
               PASSWORD EMPTY
            --------------------------------------------- */

            if (!password) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );

                passwordInput.focus();

                return false;
            }


            /* ---------------------------------------------
               PASSWORD LENGTH
            --------------------------------------------- */

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );

                passwordInput.focus();

                return false;
            }


            return true;
        }


        /* =====================================================
           LOGIN BUTTON LOADING
        ===================================================== */

        function setLoading(
            isLoading
        ) {

            loginButton.disabled =
                isLoading;


            if (isLoading) {

                loginButtonText.textContent =
                    "Signing in...";

                loginArrow.hidden =
                    true;

                loginSpinner.hidden =
                    false;

            } else {

                loginButtonText.textContent =
                    "Sign In";

                loginArrow.hidden =
                    false;

                loginSpinner.hidden =
                    true;
            }
        }


        /* =====================================================
           SAVE LOGIN INFORMATION
        ===================================================== */

        function saveLoginData(
            token,
            role,
            shouldRemember
        ) {

            const storage =
                shouldRemember
                    ? window.localStorage
                    : window.sessionStorage;


            if (token) {

                storage.setItem(
                    "token",
                    token
                );
            }


            storage.setItem(
                "userRole",
                role
            );
        }


        /* =====================================================
           REDIRECT USER
        ===================================================== */

        function redirectUser(
            role
        ) {

            if (
                role === "student"
            ) {

                window.location.assign(
                    "pages/dashboard.html"
                );

            } else {

                window.location.assign(
                    "pages/faculty-dashboard.html"
                );
            }
        }


        /* =====================================================
           LOGIN FORM SUBMIT
        ===================================================== */

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* Clear previous message */

                clearMessage();


                /* Validate */

                if (
                    !validateForm()
                ) {
                    return;
                }


                /* Get values */

                const email =
                    emailInput.value.trim();

                const password =
                    passwordInput.value;

                const role =
                    getSelectedRole();

                const shouldRemember =
                    rememberMe
                        ? rememberMe.checked
                        : false;


                /* Start loading */

                setLoading(
                    true
                );


                try {

                    /* =========================================
                       SEND LOGIN REQUEST TO BACKEND
                    ========================================= */

                    const response =
                        await fetch(
                            "/api/auth/login",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    Accept:
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        {
                                            email:
                                                email,

                                            password:
                                                password,

                                            role:
                                                role
                                        }
                                    )
                            }
                        );


                    /* =========================================
                       READ SERVER RESPONSE
                    ========================================= */

                    let data = {};


                    try {

                        data =
                            await response.json();

                    } catch {

                        data = {};
                    }


                    /* =========================================
                       CHECK RESPONSE
                    ========================================= */

                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            data.message ||
                            "Invalid email or password."
                        );
                    }


                    /* =========================================
                       SAVE TOKEN
                    ========================================= */

                    saveLoginData(
                        data.token || "",
                        role,
                        shouldRemember
                    );


                    /* =========================================
                       SUCCESS MESSAGE
                    ========================================= */

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    /* =========================================
                       REDIRECT
                    ========================================= */

                    window.setTimeout(
                        function () {

                            redirectUser(
                                role
                            );

                        },
                        700
                    );


                } catch (error) {

                    /* =========================================
                       HANDLE CONNECTION / LOGIN ERRORS
                    ========================================= */

                    let errorMessage;


                    if (
                        error instanceof
                        TypeError
                    ) {

                        errorMessage =
                            "Unable to connect to the server. Please try again.";

                    } else {

                        errorMessage =
                            error.message ||
                            "Login failed. Please try again.";
                    }


                    showMessage(
                        errorMessage,
                        "error"
                    );


                } finally {

                    /* Stop loading */

                    setLoading(
                        false
                    );
                }
            }
        );


        /* =====================================================
           FORGOT PASSWORD
        ===================================================== */

        if (
            forgotPassword
        ) {

            forgotPassword.addEventListener(
                "click",
                function () {

                    showMessage(
                        "Please contact your administrator to reset your password.",
                        "success"
                    );
                }
            );
        }


        /* =====================================================
           CLEAR MESSAGE WHEN USER TYPES
        ===================================================== */

        emailInput.addEventListener(
            "input",
            clearMessage
        );


        passwordInput.addEventListener(
            "input",
            clearMessage
        );

    }
);