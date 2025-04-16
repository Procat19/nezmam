const firebaseConfig = {
    apiKey: "AIzaSyC_0A-PozEvFqynyMcW5cvFqzbWnD5Hb7s",
    authDomain: "icemccc.firebaseapp.com",
    databaseURL: "https://icemccc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "icemccc",
    storageBucket: "icemccc.firebasestorage.app",
    messagingSenderId: "844650217806",
    appId: "1:844650217806:web:3d780792e13c49c313de1f",
    measurementId: "G-E2C6W0LWMT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function executeCommand() {
    const command = document.getElementById("commandInput").value;
    if (!command) return;
    db.ref("commands").push({ type: "execute_command", command });
    alert("Command Executed");
}

function uploadFile() {
    const file = document.getElementById("uploadFile").files[0];
    const fileName = document.getElementById("uploadFileName").value;
    const filePath = document.getElementById("uploadPath")?.value || "";
    if (!file || !fileName) return alert("Provide file + filename");

    const reader = new FileReader();
    reader.onload = function () {
        const base64 = reader.result.split(",")[1];
        db.ref("commands").push({
            type: "upload_file",
            fileName,
            filePath,
            fileContent: base64,
        });
        alert("File Uploaded");
    };
    reader.readAsDataURL(file);
}

function downloadGithubFile() {
    const url = document.getElementById("githubURL").value;
    const fileName = document.getElementById("githubFileName").value;
    if (!url || !fileName) return;
    db.ref("commands").push({ type: "download_github_file", url, fileName });
    alert("File downloaded");
}

function renamePlugin(originalKey, oldPath) {
    const newName = prompt("Enter new file name:", oldPath);
    if (!newName || newName === oldPath) return;
    db.ref("commands").push({ type: "rename_file", oldPath, newPath: newName });
    alert("Plugin renamed");
}

function deletePlugin(pluginPath) {
    if (confirm("Are you sure you want to delete this plugin?")) {
        db.ref("commands").push({ type: "delete_file", filePath: pluginPath });
    }
}

function loadPlugin(fileName) {
    db.ref("commands").push({ type: "load_plugin", fileName });
    alert("Plugin loaded");
}

function refreshPluginList() {
    const container = document.getElementById("pluginList");
    container.innerHTML = "Loading...";
    db.ref("plugins").once("value", snap => {
        container.innerHTML = "";
        snap.forEach(child => {
            const data = child.val();
            const actualName = child.key.replace(/,/g, ".");
            const div = document.createElement("div");
            div.className = "plugin";
            div.innerHTML = `
                <span><strong>${actualName}</strong> (${data.status})</span>
                <div class="plugin-actions">
                    <button onclick="loadPlugin('${actualName}')">Load</button>
                    <button onclick="renamePlugin('${child.key}', '${actualName}')">Rename</button>
                    <button onclick="deletePlugin('${actualName}')">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });
    });
}

// Initial manual call
refreshPluginList();