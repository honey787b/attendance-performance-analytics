document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (!logoutBtn) {
            return;
        }


        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "user"
                );


                window.location.href =
                    "../index.html";
            }
        );

    }
);