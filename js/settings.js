// ==========================================
// PRESENTTRACK - SETTINGS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------
    // LOAD LOGGED-IN USER PROFILE
    // ------------------------------------------

    const userName = localStorage.getItem("userName") || "User";
    const userRole = localStorage.getItem("userRole") || "Student";

    const profileAvatar = document.querySelector(".profile-avatar");
    const profileName = document.querySelector(".profile-info h3");
    const profileRole = document.querySelector(".profile-info p");

    if (profileName) {
        profileName.textContent = userName;
    }

    if (profileRole) {
        profileRole.textContent = userRole;
    }

    if (profileAvatar) {
        const initials = userName
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

        profileAvatar.textContent = initials || "U";
    }


    // ------------------------------------------
    // ALL SELECT ELEMENTS
    // ------------------------------------------

    const selects = document.querySelectorAll(".setting-item select");

    selects.forEach(select => {
        select.addEventListener("change", function () {
            console.log("Setting changed:", this.value);
        });
    });


    // ------------------------------------------
    // ATTENDANCE PERCENTAGE
    // ------------------------------------------

    const percentageInput = document.querySelector(
        '.percentage-input input[type="number"]'
    );

    if (percentageInput) {

        percentageInput.addEventListener("change", function () {

            let value = Number(this.value);

            if (value < 0) {
                this.value = 0;
            }

            if (value > 100) {
                this.value = 100;
            }

        });
    }


    // ------------------------------------------
    // TOGGLE SETTINGS
    // ------------------------------------------

    const toggles = document.querySelectorAll(
        '.toggle input[type="checkbox"]'
    );

    toggles.forEach(toggle => {

        toggle.addEventListener("change", function () {

            console.log(
                "Toggle changed:",
                this.checked
            );

        });

    });


    // ------------------------------------------
    // EDIT PROFILE
    // ------------------------------------------

    const editProfileButton = document.querySelector(
        ".profile-section .btn-secondary"
    );

    if (editProfileButton) {

        editProfileButton.addEventListener("click", function () {

            alert("Profile editing will be available soon.");

        });

    }


    // ------------------------------------------
    // CHANGE PASSWORD
    // ------------------------------------------

    const securityButtons = document.querySelectorAll(
        ".security-row .btn-secondary"
    );

    if (securityButtons.length > 0) {

        securityButtons[0].addEventListener("click", function () {

            alert("Password change option will be available soon.");

        });

    }


    // ------------------------------------------
    // TWO-FACTOR AUTHENTICATION
    // ------------------------------------------

    if (securityButtons.length > 1) {

        securityButtons[1].addEventListener("click", function () {

            if (this.textContent.trim() === "Enable") {

                this.textContent = "Enabled";

                alert("Two-Factor Authentication enabled.");

            } else {

                this.textContent = "Enable";

            }

        });

    }


    // ------------------------------------------
    // SAVE CHANGES
    // ------------------------------------------

    const saveButton = document.querySelector(
        ".settings-actions .btn-primary"
    );

    if (saveButton) {

        saveButton.addEventListener("click", function () {

            alert("Settings saved successfully!");

        });

    }


    // ------------------------------------------
    // CANCEL
    // ------------------------------------------

    const cancelButton = document.querySelector(
        ".settings-actions .btn-secondary"
    );

    if (cancelButton) {

        cancelButton.addEventListener("click", function () {

            location.reload();

        });

    }

});