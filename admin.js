document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ Admin panel loaded!");

    const CONFIG = {
        SUPABASE: {
            URL: "https://smodsdsnswwtnbnmzhse.supabase.co/rest/v1",
            API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RzZHNuc3d3dG5ibm16aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjUyOTAsImV4cCI6MjA1NzIwMTI5MH0.zMdjymIaGU66_y6X-fS8nKnrWgJjXgw7NgXPBIzVCiI"
        },
        ADMIN_PASSWORD: "987412365"
    };

    const BLACKLIST_ID = 1;
    let fetchedData = [];
    let blacklist = [];
    let isOnline = "offline";

    // 🔹 Add blur to the body on page load
    document.body.classList.add("blurred-content");

    // 🔹 Handle authentication
    function checkPassword() {
        const userPassword = document.getElementById("admin-password").value;

        if (userPassword === CONFIG.ADMIN_PASSWORD) {
            document.body.classList.remove("blurred-content"); // Remove blur
            document.getElementById("auth-overlay").style.display = "none"; // Hide overlay
            loadData(); // Fetch data after authentication
        } else {
            alert("❌ Incorrect password! Try again.");
        }
    }

    // 🔹 Load all data after authentication
    async function loadData() {
        try {
            await Promise.all([fetchSupabaseData(), fetchBlacklist(), fetchStatus()]);
            console.log("✅ Data loaded successfully!");
        } catch (error) {
            console.error("❌ Error loading data:", error);
            alert("⚠️ Failed to load data.");
        }
    }

    // 🔹 Fetch data from Supabase
    async function fetchSupabaseData() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/IC`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch data");

            fetchedData = await response.json();
            populateTable(fetchedData);
            return fetchedData;

        } catch (error) {
            console.error("❌ Error fetching Supabase data:", error);
            throw error;
        }
    }

    // 🔹 Fetch blacklist from Supabase
    async function fetchBlacklist() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?id=eq.${BLACKLIST_ID}&select=blacklist`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch blacklist data");

            const data = await response.json();
            blacklist = data.length > 0 ? data[0].blacklist || [] : [];
            console.log("📜 Current Blacklist:", blacklist);
            return blacklist;
        } catch (error) {
            console.error("❌ Error fetching blacklist:", error);
            throw error;
        }
    }

    // 🔹 Toggle status (Online/Offline)
    async function toggleStatus() {
        isOnline = isOnline === "online" ? "offline" : "online";
        updateStatusDisplay();

        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Status?id=eq.${BLACKLIST_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ status: isOnline })
            });

            if (!response.ok) throw new Error("⚠️ Failed to update status");
            console.log(`🔄 Status changed to: ${isOnline}`);
        } catch (error) {
            console.error("❌ Error updating status:", error);
        }
    }

    // 🔹 Update status display
    function updateStatusDisplay() {
        const statusDisplay = document.getElementById("statusDisplay");
        if (statusDisplay) {
            statusDisplay.textContent = isOnline === "online" ? "✅ Anketos atidarytos ✅" : "❌ Anketos uždarytos ❌";
            statusDisplay.classList.toggle("status-online", isOnline === "online");
            statusDisplay.classList.toggle("status-offline", isOnline === "offline");
        }
    }

    // 🔹 Populate table
    function populateTable(data) {
        const dataTableBody = document.querySelector("#data-table tbody");
        if (!dataTableBody) return console.error("❌ Could not find table body element");

        dataTableBody.innerHTML = "";
        data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}.</td>
                <td><span class="copy-text" data-copy="${item.DISCORD_ID || ''}">${item.DISCORD_ID || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.USERIS || ''}">${item.USERIS || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.VARDAS || ''}">${item.VARDAS || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.PAVARDĖ || ''}">${item.PAVARDĖ || ''}</span></td>
                <td><span class="copy-text" data-copy="${item["STEAM NICKAS"] || ''}">${item["STEAM NICKAS"] || ''}</span></td>
                <td>
                  <a href="${item["STEAM LINKAS"] || '#'}" target="_blank">🔗 Steam Profilis</a>
                  <span class="copy-text" data-copy="${item["STEAM LINKAS"] || ''}">📋</span>
                </td>
            `;
            dataTableBody.appendChild(row);
        });

        // Copy functionality
        document.querySelectorAll('.copy-text').forEach(element => {
            element.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                if (!textToCopy) return;
                
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        this.textContent = '✓';
                        setTimeout(() => { this.textContent = '📋'; }, 1000);
                    })
                    .catch(err => console.error('Failed to copy: ', err));
            });
        });
    }

    // 🔹 Setup event listeners
    function setupEventListeners() {
        document.getElementById("statusButton")?.addEventListener("click", toggleStatus);
    }

    // 🔹 Initialize the application
    function init() {
        setupEventListeners();
    }

    // Start app
    init();
});
