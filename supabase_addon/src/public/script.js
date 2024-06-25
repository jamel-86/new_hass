document.addEventListener("DOMContentLoaded", async () => {
  // Detect system theme
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (prefersDarkScheme) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  try {
    // Fetch Supabase configuration from the backend
    const response = await fetch("http://localhost:8099/config");
    const config = await response.json();

    const SUPABASE_URL = config.SUPABASE_URL;
    const SUPABASE_KEY = config.SUPABASE_KEY;

    // Initialize Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch states from Supabase
    const { data, error } = await supabase.from("states").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("Fetched data:", data); // Log the fetched data

    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = ""; // Clear existing table data

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("border-b", "border-gray-200", "dark:border-gray-600");

      const stateHistory = row.state_history
        .map(
          (entry) =>
            `${entry.state} at ${new Date(entry.timestamp).toLocaleString()}`
        )
        .join("<br>");

      tr.innerHTML = `
        <td class="py-2 px-4">${row.entity_id}</td>
        <td class="py-2 px-4">${stateHistory}</td>
        <td class="py-2 px-4">${new Date(
          row.last_changed
        ).toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error fetching configuration:", error);
  }
});
