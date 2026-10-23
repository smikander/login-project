import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:3000/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unable to fetch user");
                }

                return response.json();
            })
            .then((result) => {
                setUser(result.user);
            })
            .catch((error) => {
                console.error(error);
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
            });
    }, []);

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>Welcome, {user.username}!</h2>
            <p>You are logged in as {user.email}</p>
            <button className="logout-button"
                onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
