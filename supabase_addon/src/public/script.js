document.addEventListener("DOMContentLoaded", async () => {
  // Detect system theme
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDarkScheme) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  // Determine API endpoint based on environment
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const apiEndpoint = isLocal ? "http://localhost:8099/config_settings" : `/api/hassio_ingress/${location.pathname.split('/')[2]}/config_settings`;

  try {
    // Fetch Supabase configuration from the backend
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();

    const SUPABASE_URL = config.SUPABASE_URL;
    const SUPABASE_KEY = config.SUPABASE_KEY;

    // Initialize Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Modal elements
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const closeModal = document.getElementById("close-modal");

    // Show modal with state history
    const showModal = (history) => {
      modalContent.innerHTML = history
        .map(
          (entry) => `<div>Date: ${new Date(entry.timestamp).toLocaleString()} | State: ${entry.state}</div>`
        )
        .join("");
      modal.classList.add("show");
    };

    // Close modal
    closeModal.addEventListener("click", () => {
      modal.classList.remove("show");
      location.reload(); // Refresh the page when the modal is closed
    });

    const loadData = async () => {
      try {
        // Fetch states from Supabase
        const { data, error } = await supabase.from("states").select("*");
        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        console.log("Fetched data:", data); // Log the fetched data

        // Sort data by the most recent timestamp in state_history
        data.sort((a, b) => {
          const aLastTimestamp = a.state_history.length
            ? Math.max(
              ...a.state_history.map((entry) =>
                new Date(entry.timestamp).getTime()
              )
            )
            : 0;
          const bLastTimestamp = b.state_history.length
            ? Math.max(
              ...b.state_history.map((entry) =>
                new Date(entry.timestamp).getTime()
              )
            )
            : 0;
          return bLastTimestamp - aLastTimestamp;
        });

        const tableBody = document.getElementById("data-table");
        tableBody.innerHTML = ""; // Clear existing table data

        data.forEach((row) => {
          const tr = document.createElement("tr");
          tr.classList.add("border-b", "border-gray-200", "dark:border-gray-600");

          const stateHistoryButton =
            row.state_history.length > 1
              ? `<button class="collapsible" data-history='${JSON.stringify(
                row.state_history
              )}'>Show History</button>`
              : row.state_history
                .map(
                  (entry) => `${entry.state} at ${new Date(entry.timestamp).toLocaleString()}`
                )
                .join("<br>");

          // Get the most recent timestamp from state_history for the last changed column
          const lastChanged = row.state_history.length
            ? new Date(
              Math.max(
                ...row.state_history.map((entry) =>
                  new Date(entry.timestamp).getTime()
                )
              )
            ).toLocaleString()
            : "No data";

          tr.innerHTML = `
            <td class="py-2 px-4">${row.entity_id}</td>
            <td class="py-2 px-4">${stateHistoryButton}</td>
            <td class="py-2 px-4">${lastChanged}</td>
          `;
          tableBody.appendChild(tr);
        });

        // Add event listeners for collapsible buttons
        document.querySelectorAll(".collapsible").forEach((button) => {
          button.addEventListener("click", async () => {
            const entityId = button.closest("tr").querySelector("td").innerText;

            // Fetch the latest state history for the clicked entity
            const { data: latestData, error } = await supabase
              .from("states")
              .select("*")
              .eq("entity_id", entityId);

            if (error) {
              console.error("Error fetching latest data:", error);
              return;
            }

            if (latestData.length > 0) {
              const history = latestData[0].state_history;
              showModal(history);
            }
          });
        });
      } catch (error) {
        console.error("Error fetching configuration:", error);
      }
    };

    // Load data initially
    loadData();
  } catch (error) {
    console.error("Error fetching configuration:", error);
  }
});
