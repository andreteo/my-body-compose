const useFetch = () => {
    const fetchData = async (endpoint, method, body, token) => {
        if (localStorage.getItem('accessToken')) {
            getRefreshToken();
        }

        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_SERVER + endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                return { ok: true, data };
            } else {
                if (data?.errors && Array.isArray(data.errors)) {
                    const messages = data.errors.map((item) => item.msg);
                    return { ok: false, data: messages };
                } else if (data?.status === "error") {
                    return { ok: false, data: data.message || data.msg };
                } else {
                    console.log(data);
                    return { ok: false, data: "An error has occurred" };
                }
            }
        } catch (error) {
            console.error("Error:", error);
            return { ok: false, data: error.msg };
        }
    };

    return fetchData;
};

const getRefreshToken = async () => {
    try {
        const res = await fetch(import.meta.env.VITE_BACKEND_SERVER + '/auth/refresh', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem('accessToken'),
            },
        });

        const data = await res.json();

        if (data.ok) {
            storeAccessTokenInLocalStorage(data.token);
        }

        return data; // Return the response data
    } catch (error) {
        console.error("Error refreshing token:", error);
        return { ok: false, data: "An error occurred while refreshing token" };
    }
}


export default useFetch;
