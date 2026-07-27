/* ==========================================================================
   DIGITAL MISSION TRACKER - COMBINED LAB APPLICATION
   Roles: Admin, Student, Department
   Capabilities:
   1. HTML5 APIs (Canvas, Video, Geolocation, Notification, Fullscreen, Storage, Drag & Drop, File API)
   2. Comprehensive DOM Event Listeners & Universal Event Inspector Delegator
   3. Student Timetable Upload & Department Requested Class Slot
   4. Admin Timetable Auto-Matching & Trainer Assignment Engine
   ========================================================================== */

// Global Application State
let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;

let studentTimetables = JSON.parse(localStorage.getItem("studentTimetables")) || [
    {
        id: 1,
        studentEmail: "student@christuniversity.in",
        studentName: "Amit Sharma",
        availableSlot: "Monday 10:00 AM - 12:00 PM",
        timetableFile: "amit_timetable_mon.pdf",
        status: "Registered Trainer"
    },
    {
        id: 2,
        studentEmail: "trainer2@christuniversity.in",
        studentName: "Ananya S.",
        availableSlot: "Wednesday 02:00 PM - 04:00 PM",
        timetableFile: "ananya_timetable_wed.pdf",
        status: "Registered Trainer"
    }
];

let departmentClasses = JSON.parse(localStorage.getItem("departmentClasses")) || [
    {
        id: 1,
        deptName: "School of Commerce",
        className: "1st Year B.Com Regular",
        topic: "Google Sheets & Dashboard Analytics",
        timeSlot: "Monday 10:00 AM - 12:00 PM",
        assignedTrainer: "Unassigned",
        status: "Pending Assignment"
    },
    {
        id: 2,
        deptName: "School of Life Sciences",
        className: "2nd Year B.Sc BioTech",
        topic: "Python Scripting Level 1",
        timeSlot: "Wednesday 02:00 PM - 04:00 PM",
        assignedTrainer: "Unassigned",
        status: "Pending Assignment"
    }
];

let completedSessions = JSON.parse(localStorage.getItem("completed")) || [
    { name: "Amit Sharma", attendees: 45, location: "Lat: 12.9344, Lon: 77.6060", date: "2026-03-01" },
    { name: "Ananya S.", attendees: 32, location: "Lat: 12.9350, Lon: 77.6072", date: "2026-03-05" }
];

// ==========================================================================
// LIVE INSPECTOR LOGGING UTILITY
// ==========================================================================
function logInspector(category, message) {
    const logsContainer = document.getElementById("inspector-logs");
    if (!logsContainer) return;

    const time = new Date().toLocaleTimeString();
    const logItem = document.createElement("div");
    logItem.className = "hover:bg-slate-800 p-0.5 rounded transition-colors";

    let colorClass = "text-blue-400";
    if (category.includes("API")) colorClass = "text-purple-400";
    if (category.includes("EVENT")) colorClass = "text-amber-400";
    if (category.includes("EXPRESS")) colorClass = "text-emerald-400";
    if (category.includes("MATCH")) colorClass = "text-pink-400";

    logItem.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="${colorClass} font-bold">[${category}]</span> ${message}`;
    logsContainer.prepend(logItem);
}

function toggleInspector() {
    const drawer = document.getElementById("inspector-drawer");
    if (drawer) drawer.classList.toggle("translate-y-full");
}

function clearInspectorLogs() {
    const logsContainer = document.getElementById("inspector-logs");
    if (logsContainer) logsContainer.innerHTML = '<div class="text-slate-500 italic">Logs cleared...</div>';
}

// ==========================================================================
// UNIVERSAL DOM EVENT LISTENER DELEGATOR
// Guarantees all user interactions trigger live Inspector logs!
// ==========================================================================
function setupUniversalEventInspector() {
    // 1. CLICK EVENT DELEGATION
    document.addEventListener("click", (e) => {
        const target = e.target.closest("button, a, select, input, canvas, div[onclick]");
        if (target) {
            const label = target.innerText || target.id || target.name || target.tagName;
            logInspector("EVENT: Click", `Clicked element: <${target.tagName.toLowerCase()}> "${label.trim().substring(0, 30)}"`);
        }
    });

    // 2. CHANGE EVENT DELEGATION
    document.addEventListener("change", (e) => {
        const target = e.target;
        logInspector("EVENT: Change", `Changed value of #${target.id || target.name}: "${target.value}"`);
    });

    // 3. INPUT EVENT DELEGATION
    document.addEventListener("input", (e) => {
        const target = e.target;
        logInspector("EVENT: Input", `User typing in #${target.id || target.name}: "${target.value}"`);
    });

    // 4. FOCUS & BLUR EVENTS
    document.addEventListener("focusin", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
            logInspector("EVENT: Focus", `Focused field #${e.target.id}`);
        }
    });
    document.addEventListener("focusout", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
            logInspector("EVENT: Blur", `Unfocused field #${e.target.id}`);
        }
    });
}

// ==========================================================================
// [DOM EVENT]: DOMContentLoaded
// Initializing state, drawing canvas, rendering Admin tables
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    logInspector("EVENT: DOMContentLoaded", "DOM fully loaded. Initializing application.");
    
    setupUniversalEventInspector();
    setupDragAndDrop();
    updateAuthUI();
    drawHeroCanvas();
    drawChart();
    renderAdminTables();
    fetchExpressStats();
});

window.addEventListener("scroll", () => {
    const header = document.getElementById("main-header");
    if (header) {
        if (window.scrollY > 20) {
            header.classList.add("shadow-md", "bg-white/95");
        } else {
            header.classList.remove("shadow-md", "bg-white/95");
        }
    }
});

window.addEventListener("resize", () => {
    logInspector("EVENT: Resize", "Window resized. Redrawing Canvas elements.");
    drawHeroCanvas();
    drawChart();
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        logInspector("EVENT: Keydown (Esc)", "Escape key pressed. Closing all modals.");
        closeModalAll();
    }
});

// ==========================================================================
// MODAL CONTROLLERS
// ==========================================================================
function closeModalAll() {
    closeStudentTimetableModal();
    closeDeptClassModal();
    closeLoginModal();
}

function openStudentTimetableModal() {
    logInspector("EVENT: Click", "Opened Student Timetable Upload Modal.");
    document.getElementById("studentTimetableModal")?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeStudentTimetableModal() {
    document.getElementById("studentTimetableModal")?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function openDeptClassModal() {
    logInspector("EVENT: Click", "Opened Department Class Timetable Modal.");
    document.getElementById("deptClassModal")?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeDeptClassModal() {
    document.getElementById("deptClassModal")?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function openLoginModal() {
    logInspector("EVENT: Click", "Opened Sign In Modal.");
    document.getElementById("loginModal")?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeLoginModal() {
    document.getElementById("loginModal")?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

document.querySelectorAll('#studentTimetableModal, #deptClassModal, #loginModal').forEach(modalEl => {
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModalAll();
    });
});

// ==========================================================================
// [HTML5 API]: DRAG & DROP API + FILE API
// For Student Timetable Upload
// ==========================================================================
function setupDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("tt-file-input");
    const dropZoneText = document.getElementById("drop-zone-text");

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener("click", () => {
        logInspector("EVENT: Click", "Triggering timetable file browser dialog.");
        fileInput.click();
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        logInspector("HTML5 API: Drag & Drop", "File dragged over drop zone.");
        dropZone.classList.add("border-christ-blue", "bg-blue-50");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("border-christ-blue", "bg-blue-50");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-christ-blue", "bg-blue-50");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    fileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
            handleFileSelection(this.files[0]);
        }
    });

    function handleFileSelection(file) {
        logInspector("HTML5 API: File API", `Selected timetable file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
        if (dropZoneText) {
            dropZoneText.innerText = `Selected File: ${file.name}`;
            dropZoneText.classList.add("text-christ-blue", "font-bold");
        }
    }
}

// ==========================================================================
// [ROLE: STUDENT]: STUDENT TIMETABLE SUBMISSION HANDLER
// ==========================================================================
function handleStudentTimetableSubmit(event) {
    event.preventDefault();
    logInspector("ROLE: Student", "Submitting student trainer available timetable...");

    const name = document.getElementById("tt-student-name").value.trim();
    const email = document.getElementById("tt-student-email").value.trim();
    const slot = document.getElementById("tt-available-slot").value;
    const fileInput = document.getElementById("tt-file-input");

    if (!email.toLowerCase().endsWith("@christuniversity.in")) {
        alert("Email must end with @christuniversity.in");
        return;
    }

    const fileName = (fileInput && fileInput.files.length > 0) ? fileInput.files[0].name : "Manual Slot Entry";

    const record = {
        id: studentTimetables.length + 1,
        studentEmail: email,
        studentName: name,
        availableSlot: slot,
        timetableFile: fileName,
        status: "Registered Trainer"
    };

    studentTimetables.push(record);
    localStorage.setItem("studentTimetables", JSON.stringify(studentTimetables));
    logInspector("HTML5 API: Web Storage", "Saved student timetable into LocalStorage.");

    // Express POST API call
    fetch('/api/timetable/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: name, studentEmail: email, availableSlot: slot, timetableFile: fileName })
    }).then(res => res.json()).then(data => {
        logInspector("EXPRESS API: POST /api/timetable/student", data.message);
    }).catch(err => {});

    renderAdminTables();
    closeStudentTimetableModal();
    notifyUser("Student Timetable Saved!", `Available slot: ${slot}`);
}

// ==========================================================================
// [ROLE: DEPARTMENT]: DEPARTMENT CLASS TIMETABLE SUBMISSION HANDLER
// ==========================================================================
function handleDeptClassSubmit(event) {
    event.preventDefault();
    logInspector("ROLE: Department", "Submitting department class requested timetable slot...");

    const deptName = document.getElementById("cls-dept-name").value.trim();
    const className = document.getElementById("cls-class-name").value.trim();
    const topic = document.getElementById("cls-topic").value.trim();
    const timeSlot = document.getElementById("cls-time-slot").value;

    const record = {
        id: departmentClasses.length + 1,
        deptName,
        className,
        topic,
        timeSlot,
        assignedTrainer: "Unassigned",
        status: "Pending Assignment"
    };

    departmentClasses.push(record);
    localStorage.setItem("departmentClasses", JSON.stringify(departmentClasses));
    logInspector("HTML5 API: Web Storage", "Saved department requested class into LocalStorage.");

    // Express POST API call
    fetch('/api/timetable/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deptName, className, topic, timeSlot })
    }).then(res => res.json()).then(data => {
        logInspector("EXPRESS API: POST /api/timetable/class", data.message);
    }).catch(err => {});

    renderAdminTables();
    closeDeptClassModal();
    notifyUser("Department Class Requested!", `Class slot: ${timeSlot}`);
}

// ==========================================================================
// [ROLE: ADMIN]: TIMETABLE AUTO-MATCHING & TRAINER ASSIGNMENT ENGINE
// ==========================================================================
function autoMatchTimetables() {
    logInspector("ROLE: Admin (MATCH)", "Executing Admin Timetable Auto-Matching Engine...");

    let matchCount = 0;

    departmentClasses.forEach(cls => {
        if (cls.assignedTrainer === "Unassigned") {
            // Find a student trainer with matching timeSlot
            const matchingTrainer = studentTimetables.find(st => st.availableSlot === cls.timeSlot);
            if (matchingTrainer) {
                cls.assignedTrainer = matchingTrainer.studentName;
                cls.status = "Assigned";
                matchCount++;
                logInspector("ROLE: Admin (MATCH SUCCESS)", `Matched Trainer '${matchingTrainer.studentName}' -> Class '${cls.className}' (${cls.timeSlot})`);

                // Send assignment to Express API
                fetch('/api/timetable/assign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId: cls.id, trainerName: matchingTrainer.studentName })
                }).catch(err => {});
            }
        }
    });

    localStorage.setItem("departmentClasses", JSON.stringify(departmentClasses));
    renderAdminTables();

    if (matchCount > 0) {
        notifyUser("Admin Timetable Match Complete!", `Successfully assigned ${matchCount} student trainers to class slots.`);
    } else {
        notifyUser("Admin Matching Check", "No new matching timetable slots found.");
    }
}

// ==========================================================================
// ADMIN DASHBOARD PANELS RENDERER
// Dynamically populates requested classes and student trainer timetables
// ==========================================================================
function renderAdminTables() {
    const classListContainer = document.getElementById("admin-class-list");
    const studentListContainer = document.getElementById("admin-student-list");
    const deptClassBadge = document.getElementById("dept-class-count-badge");
    const studentTrainerBadge = document.getElementById("student-trainer-count-badge");
    const dashClassCount = document.getElementById("dash-class-count");
    const dashTrainerCount = document.getElementById("dash-trainer-count");
    const dashPendingCount = document.getElementById("dash-pending-count");

    if (deptClassBadge) deptClassBadge.innerText = `${departmentClasses.length} Requested`;
    if (studentTrainerBadge) studentTrainerBadge.innerText = `${studentTimetables.length} Available`;
    if (dashClassCount) dashClassCount.innerText = `${departmentClasses.length} Classes`;
    if (dashTrainerCount) dashTrainerCount.innerText = `${studentTimetables.length} Registered`;

    const pending = departmentClasses.filter(c => c.assignedTrainer === "Unassigned").length;
    if (dashPendingCount) dashPendingCount.innerText = `${pending} Pending`;

    // Render Department Requested Classes
    if (classListContainer) {
        classListContainer.innerHTML = departmentClasses.map(cls => `
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[10px] font-bold text-christ-blue uppercase block">${cls.deptName}</span>
                        <h5 class="font-bold text-xs text-christ-dark">${cls.className}</h5>
                        <p class="text-[11px] text-slate-500">Topic: ${cls.topic}</p>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded ${cls.assignedTrainer === 'Unassigned' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                        ${cls.status}
                    </span>
                </div>
                <div class="pt-2 border-t flex justify-between items-center text-[11px]">
                    <span class="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">🕒 ${cls.timeSlot}</span>
                    <span class="font-bold text-christ-dark">Trainer: <span class="text-blue-700">${cls.assignedTrainer}</span></span>
                </div>
            </div>
        `).join('');
    }

    // Render Registered Student Trainer Timetables
    if (studentListContainer) {
        studentListContainer.innerHTML = studentTimetables.map(st => `
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[10px] font-bold text-emerald-600 uppercase block">Registered Student Trainer</span>
                        <h5 class="font-bold text-xs text-christ-dark">${st.studentName}</h5>
                        <p class="text-[11px] text-slate-500">${st.studentEmail}</p>
                    </div>
                    <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        📄 ${st.timetableFile}
                    </span>
                </div>
                <div class="pt-2 border-t flex justify-between items-center text-[11px]">
                    <span class="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Free Slot: ${st.availableSlot}</span>
                    <button onclick="manualAssignTrainer(${st.id})" class="text-[10px] bg-christ-blue hover:bg-christ-hoverBlue text-white px-2 py-1 rounded font-bold">
                        Assign Slot
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function manualAssignTrainer(studentId) {
    const student = studentTimetables.find(s => s.id === studentId);
    if (!student) return;

    const unassignedClass = departmentClasses.find(c => c.timeSlot === student.availableSlot);
    if (unassignedClass) {
        unassignedClass.assignedTrainer = student.studentName;
        unassignedClass.status = "Assigned";
        localStorage.setItem("departmentClasses", JSON.stringify(departmentClasses));
        renderAdminTables();
        notifyUser("Manual Assignment Success!", `Assigned ${student.studentName} to ${unassignedClass.className}`);
    } else {
        alert(`No unassigned department class found matching slot: ${student.availableSlot}`);
    }
}

// ==========================================================================
// [HTML5 API #1]: CANVAS API (Charts & Graphics)
// ==========================================================================
function drawChart() {
    const canvas = document.getElementById("analyticsCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 30; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    const data = completedSessions;
    const barWidth = 45;
    const gap = 35;
    const startX = 50;

    data.forEach((item, i) => {
        const val = item.attendees || 10;
        const height = Math.min(val * 1.8, 120);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - height - 30;

        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30);
        gradient.addColorStop(0, '#2957A4');
        gradient.addColorStop(1, '#1E4072');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        ctx.fillStyle = "#201E1E";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(val, x + barWidth / 2, y - 6);

        ctx.fillStyle = "#64748b";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(`Session ${i + 1}`, x + barWidth / 2, canvas.height - 12);
    });

    ctx.fillStyle = "#2957A4";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Session Attendance (HTML5 Canvas)", 15, 20);
}

function drawHeroCanvas() {
    const canvas = document.getElementById("hero-canvas-fallback");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement.clientWidth || 400;
    canvas.height = 250;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(41, 87, 164, 0.4)";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CHRIST Peer Mentoring Labs", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = "#D2AE6D";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Admin, Student & Department Timetables", canvas.width / 2, canvas.height / 2 + 15);
}

// ==========================================================================
// [HTML5 API #2]: VIDEO API
// ==========================================================================
function playVideo() {
    logInspector("HTML5 API: Video", "Calling trainingVideo.play()");
    const video = document.getElementById("trainingVideo");
    const status = document.getElementById("video-status");
    if (video) {
        video.play().then(() => {
            if (status) status.innerText = "Status: Playing ▶";
        }).catch(err => {
            if (status) status.innerText = "Status: Simulated Play (Demo Video)";
        });
    }
}

function pauseVideo() {
    logInspector("HTML5 API: Video", "Calling trainingVideo.pause()");
    const video = document.getElementById("trainingVideo");
    const status = document.getElementById("video-status");
    if (video) {
        video.pause();
        if (status) status.innerText = "Status: Paused ⏸";
    }
}

function restartVideo() {
    logInspector("HTML5 API: Video", "Setting trainingVideo.currentTime = 0");
    const video = document.getElementById("trainingVideo");
    const status = document.getElementById("video-status");
    if (video) {
        video.currentTime = 0;
        video.play();
        if (status) status.innerText = "Status: Restarted ↺";
    }
}

// ==========================================================================
// [HTML5 API #4]: NOTIFICATIONS & TOASTS
// ==========================================================================
function notifyUser(title = "Action Successful!", body = "System state updated.") {
    logInspector("HTML5 API: Notification", `Triggering Notification: "${title}"`);
    showToastNotification(title, body);

    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            try { new Notification(title, { body: body }); } catch (e) {}
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    try { new Notification(title, { body: body }); } catch (e) {}
                }
            });
        }
    }
}

function showToastNotification(title, body) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border-l-4 border-christ-gold flex items-start gap-3 animate-fade-in text-xs";
    toast.innerHTML = `
        <div class="text-christ-gold text-base">🔔</div>
        <div class="flex-1">
            <h5 class="font-bold text-white">${title}</h5>
            <p class="text-[11px] text-slate-300 mt-0.5">${body}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white font-bold text-xs">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("opacity-0", "transition-opacity");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

function openFullscreen() {
    logInspector("HTML5 API: Fullscreen", "Toggling Fullscreen Mode...");
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

// ==========================================================================
// LOGIN SUBMIT HANDLER (Roles: Admin, Student, Department)
// ==========================================================================
function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorMsg = document.getElementById("login-error-msg");

    if (errorMsg) errorMsg.classList.add("hidden");

    if (!email.toLowerCase().endsWith("@christuniversity.in")) {
        const domainErr = "Domain restriction! Email must end with @christuniversity.in";
        logInspector("AUTH VALIDATION FAILED", domainErr);
        if (errorMsg) {
            errorMsg.innerText = domainErr;
            errorMsg.classList.remove("hidden");
        }
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
            updateAuthUI();
            closeLoginModal();
            notifyUser(`Welcome, ${currentUser.name}!`, `Logged in as ${currentUser.role}`);
        } else {
            if (errorMsg) {
                errorMsg.innerText = data.message;
                errorMsg.classList.remove("hidden");
            }
        }
    })
    .catch(err => {
        // Fallback login matching Admin, Student, Department
        if (email.toLowerCase().endsWith("@christuniversity.in") && password === "password123") {
            let role = "Student";
            if (email.startsWith("admin")) role = "Admin";
            if (email.startsWith("department")) role = "Department";

            currentUser = { name: email.split('@')[0], email, role: role };
            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
            updateAuthUI();
            closeLoginModal();
            notifyUser(`Welcome, ${currentUser.name}!`, `Logged in as ${role}`);
        } else {
            if (errorMsg) {
                errorMsg.innerText = "Invalid credentials. Try demo accounts:\nadmin@christuniversity.in / student@christuniversity.in / department@christuniversity.in";
                errorMsg.classList.remove("hidden");
            }
        }
    });
}

function updateAuthUI() {
    const authHeader = document.getElementById("auth-header-container");
    const mobileAuth = document.getElementById("mobile-auth-container");

    if (currentUser) {
        const badgeColor = currentUser.role === "Admin" ? "bg-purple-100 text-purple-800 border-purple-200" :
                           currentUser.role === "Department" ? "bg-amber-100 text-amber-800 border-amber-200" :
                           "bg-blue-100 text-christ-blue border-blue-200";

        const userBadgeHTML = `
            <div class="flex items-center gap-2">
                <div class="${badgeColor} px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>${currentUser.name} (${currentUser.role})</span>
                </div>
                <button onclick="handleLogout()" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-all">
                    Logout
                </button>
            </div>
        `;
        if (authHeader) authHeader.innerHTML = userBadgeHTML;
        if (mobileAuth) mobileAuth.innerHTML = `
            <button onclick="handleLogout()" class="w-full bg-red-600 text-white py-2 rounded-lg font-bold text-xs">
                Logout (${currentUser.name})
            </button>
        `;
    } else {
        const loginBtnHTML = `
            <button id="auth-login-btn" onclick="openLoginModal()" class="bg-christ-blue hover:bg-christ-hoverBlue text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>Sign In</span>
            </button>
        `;
        if (authHeader) authHeader.innerHTML = loginBtnHTML;
        if (mobileAuth) mobileAuth.innerHTML = `
            <button onclick="openLoginModal(); toggleMobileMenu();" class="w-full bg-christ-blue text-white py-2 rounded-lg font-bold text-xs shadow">
                Sign In
            </button>
        `;
    }
}

function handleLogout() {
    logInspector("AUTH", "User signed out.");
    currentUser = null;
    sessionStorage.removeItem("currentUser");
    updateAuthUI();
    notifyUser("Logged Out", "Signed out successfully.");
}

function fetchExpressStats() {
    fetch('/api/stats').then(res => res.json()).then(data => {
        if (data.success) {
            logInspector("EXPRESS API: GET /api/stats", `Stats fetched: ${JSON.stringify(data.stats)}`);
        }
    }).catch(err => {});
}
