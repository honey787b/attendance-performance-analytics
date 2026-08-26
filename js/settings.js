// ==========================================
// PRESENTTRACK - SETTINGS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------
    // LOAD LOGGED-IN USER PROFILE
    // ------------------------------------------

    const userName =
    localStorage.getItem("userName") ||
    sessionStorage.getItem("userName") ||
    "User";

const userRole =
    localStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole") ||
    "Student";

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

        const storage =
            localStorage.getItem("token")
                ? localStorage
                : sessionStorage;

        const currentName =
            storage.getItem("userName") || "";

        const currentEmail =
            storage.getItem("userEmail") || "";

        const currentPhone =
            storage.getItem("userPhone") || "";

        const profileSection =
            document.querySelector(".profile-section");

        if (!profileSection) return;

        profileSection.innerHTML = `
            <div class="edit-profile-form">

                <div class="form-group">
                    <label for="editName">Name</label>
                    <input
                        type="text"
                        id="editName"
                        value="${currentName}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="editEmail">Email</label>
                    <input
                        type="email"
                        id="editEmail"
                        value="${currentEmail}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="editPhone">Phone</label>
                    <input
                        type="tel"
                        id="editPhone"
                        value="${currentPhone}"
                    >
                </div>

                <div class="edit-profile-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        id="cancelProfileEdit"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="btn-primary"
                        id="saveProfileEdit"
                    >
                        Save Profile
                    </button>

                </div>

            </div>
        `;

        // ------------------------------------------
        // CANCEL PROFILE EDIT
        // ------------------------------------------

        const cancelButton =
            document.getElementById("cancelProfileEdit");

        cancelButton.addEventListener("click", function () {
            location.reload();
        });


        // ------------------------------------------
        // SAVE PROFILE
        // ------------------------------------------

        const saveProfileButton =
            document.getElementById("saveProfileEdit");

        saveProfileButton.addEventListener(
            "click",
            async function () {

                const name =
                    document.getElementById("editName").value.trim();

                const email =
                    document.getElementById("editEmail").value.trim();

                const phone =
                    document.getElementById("editPhone").value.trim();

                if (!name || !email) {
                    alert("Name and email are required.");
                    return;
                }

                const token = storage.getItem("token");

                if (!token) {
                    alert("Your session has expired. Please log in again.");
                    return;
                }

                try {

                    saveProfileButton.disabled = true;
                    saveProfileButton.textContent = "Saving...";

                    const response = await fetch(
                        "/api/auth/profile",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                phone
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Failed to update profile."
                        );
                    }

                    // ------------------------------------------
                    // UPDATE SESSION STORAGE
                    // ------------------------------------------

                    storage.setItem(
                        "userName",
                        data.user.name
                    );

                    storage.setItem(
                        "userEmail",
                        data.user.email
                    );

                    storage.setItem(
                        "userPhone",
                        data.user.phone || ""
                    );

                    storage.setItem(
                        "userRole",
                        data.user.role
                    );

                    storage.setItem(
                        "userId",
                        data.user.id
                    );

                    alert("Profile updated successfully!");

                    location.reload();

                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    alert(error.message);

                    saveProfileButton.disabled = false;
                    saveProfileButton.textContent = "Save Profile";
                }

            }
        );

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

        const securityRow = this.closest(".security-row");

        if (!securityRow) return;

        // Prevent opening multiple forms
        if (document.getElementById("changePasswordForm")) {
            return;
        }

        const form = document.createElement("div");

        form.id = "changePasswordForm";

        form.innerHTML = `
            <div style="margin-top: 20px;">

                <div class="form-group">
                    <label for="currentPassword">
                        Current Password
                    </label>

                    <input
                        type="password"
                        id="currentPassword"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="newPassword">
                        New Password
                    </label>

                    <input
                        type="password"
                        id="newPassword"
                        minlength="6"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="confirmPassword">
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        id="confirmPassword"
                        minlength="6"
                        required
                    >
                </div>

                <div style="margin-top: 15px;">

                    <button
                        type="button"
                        class="btn-secondary"
                        id="cancelPasswordChange"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="btn-primary"
                        id="savePasswordChange"
                    >
                        Change Password
                    </button>

                </div>

                <p
                    id="passwordMessage"
                    style="margin-top: 10px;"
                ></p>

            </div>
        `;

        securityRow.appendChild(form);


        // ------------------------------------------
        // CANCEL PASSWORD CHANGE
        // ------------------------------------------

        document
            .getElementById("cancelPasswordChange")
            .addEventListener("click", function () {

                form.remove();

            });


        // ------------------------------------------
        // SAVE NEW PASSWORD
        // ------------------------------------------

        document
            .getElementById("savePasswordChange")
            .addEventListener("click", async function () {

                const currentPassword =
                    document.getElementById("currentPassword").value;

                const newPassword =
                    document.getElementById("newPassword").value;

                const confirmPassword =
                    document.getElementById("confirmPassword").value;

                const message =
                    document.getElementById("passwordMessage");


                // Check required fields

                if (
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                ) {

                    message.textContent =
                        "Please fill in all password fields.";

                    return;
                }


                // Check password match

                if (newPassword !== confirmPassword) {

                    message.textContent =
                        "New passwords do not match.";

                    return;
                }


                // Check password length

                if (newPassword.length < 6) {

                    message.textContent =
                        "New password must be at least 6 characters long.";

                    return;
                }


                // Get JWT using the same storage system
                // already used by Edit Profile

                const storage =
                    localStorage.getItem("token")
                        ? localStorage
                        : sessionStorage;

                const token =
                    storage.getItem("token");

                if (!token) {

                    message.textContent =
                        "Your session has expired. Please log in again.";

                    return;
                }


                try {

                    const saveButton =
                        document.getElementById(
                            "savePasswordChange"
                        );

                    saveButton.disabled = true;
                    saveButton.textContent = "Changing...";


                    const response = await fetch(
                        "/api/auth/change-password",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                currentPassword,
                                newPassword
                            })
                        }
                    );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Failed to change password."
                        );

                    }


                    alert(
                        data.message ||
                        "Password changed successfully!"
                    );

                    form.remove();


                } catch (error) {

                    console.error(
                        "Change password error:",
                        error
                    );

                    message.textContent =
                        error.message;


                    const saveButton =
                        document.getElementById(
                            "savePasswordChange"
                        );

                    if (saveButton) {

                        saveButton.disabled = false;
                        saveButton.textContent =
                            "Change Password";

                    }

                }

            });

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