const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database for Roles: Admin, Student, Department
const users = [
    {
        id: 1,
        email: "admin@christuniversity.in",
        password: "password123",
        name: "Dr. Admin User",
        role: "Admin",
        dept: "Central Administration"
    },
    {
        id: 2,
        email: "student@christuniversity.in",
        password: "password123",
        name: "Amit Sharma",
        role: "Student",
        dept: "Computer Science"
    },
    {
        id: 3,
        email: "department@christuniversity.in",
        password: "password123",
        name: "Prof. Rajesh Kumar",
        role: "Department",
        dept: "School of Commerce"
    }
];

// Student Registered Trainer Timetables
const studentTimetables = [
    {
        id: 1,
        studentEmail: "student@christuniversity.in",
        studentName: "Amit Sharma",
        availableSlot: "Monday 10:00 AM - 12:00 PM",
        timetableFile: "amit_timetable_mon_10am.pdf",
        status: "Registered Trainer"
    },
    {
        id: 2,
        studentEmail: "trainer2@christuniversity.in",
        studentName: "Ananya S.",
        availableSlot: "Wednesday 02:00 PM - 04:00 PM",
        timetableFile: "ananya_timetable_wed_2pm.pdf",
        status: "Registered Trainer"
    }
];

// Department Requested Classes with Timetables
const departmentClasses = [
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

const completedSessions = [
    { id: 1, name: "Amit Sharma", attendees: 45, location: "Lat: 12.9344, Lon: 77.6060", topic: "Google Workspace Basics", date: "2026-03-01" },
    { id: 2, name: "Ananya S.", attendees: 32, location: "Lat: 12.9350, Lon: 77.6072", topic: "Python Scripting Level 1", date: "2026-03-05" }
];

// ==========================================
// AUTHENTICATION & LOGIN ROUTES
// Roles: Admin, Student, Department
// ==========================================

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    if (!email.toLowerCase().endsWith("@christuniversity.in")) {
        return res.status(400).json({
            success: false,
            message: "Invalid domain! Login email must end with @christuniversity.in"
        });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        return res.json({
            success: true,
            message: "Login successful!",
            token: `token-${user.id}-${Date.now()}`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dept: user.dept
            }
        });
    } else {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
});

app.post('/api/register', (req, res) => {
    const { name, email, password, role, dept } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (!email.toLowerCase().endsWith("@christuniversity.in")) {
        return res.status(400).json({
            success: false,
            message: "Registration restricted! Email must end with @christuniversity.in"
        });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return res.status(409).json({ success: false, message: "User with this email already exists." });
    }

    // Role mapping: Admin, Student, Department
    const validRoles = ["Admin", "Student", "Department"];
    const assignedRole = validRoles.includes(role) ? role : "Student";

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: assignedRole,
        dept: dept || "General"
    };

    users.push(newUser);

    return res.status(201).json({
        success: true,
        message: "Registration successful!",
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
});

app.get('/api/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "No token provided." });
    }
    return res.json({ success: true, message: "Authenticated session active." });
});

app.post('/api/logout', (req, res) => {
    return res.json({ success: true, message: "Logged out successfully." });
});

// ==========================================
// STUDENT TIMETABLE ENDPOINTS
// Upload or manually submit availability
// ==========================================

app.get('/api/timetable/student', (req, res) => {
    res.json({ success: true, data: studentTimetables });
});

app.post('/api/timetable/student', (req, res) => {
    const { studentName, studentEmail, availableSlot, timetableFile } = req.body;
    if (!studentName || !availableSlot) {
        return res.status(400).json({ success: false, message: "Student Name and Available Slot are required." });
    }

    const existingIndex = studentTimetables.findIndex(s => s.studentEmail === studentEmail);
    const record = {
        id: existingIndex >= 0 ? studentTimetables[existingIndex].id : studentTimetables.length + 1,
        studentEmail: studentEmail || "student@christuniversity.in",
        studentName,
        availableSlot,
        timetableFile: timetableFile || "Manual Entry",
        status: "Registered Trainer"
    };

    if (existingIndex >= 0) {
        studentTimetables[existingIndex] = record;
    } else {
        studentTimetables.push(record);
    }

    res.status(201).json({ success: true, message: "Student Timetable uploaded successfully!", data: record });
});

// ==========================================
// DEPARTMENT CLASS TIMETABLE ENDPOINTS
// Add class requested timetable slot
// ==========================================

app.get('/api/timetable/class', (req, res) => {
    res.json({ success: true, data: departmentClasses });
});

app.post('/api/timetable/class', (req, res) => {
    const { deptName, className, topic, timeSlot } = req.body;
    if (!deptName || !className || !topic || !timeSlot) {
        return res.status(400).json({ success: false, message: "Department, Class, Topic, and Time Slot are required." });
    }

    const newClass = {
        id: departmentClasses.length + 1,
        deptName,
        className,
        topic,
        timeSlot,
        assignedTrainer: "Unassigned",
        status: "Pending Assignment"
    };

    departmentClasses.push(newClass);
    res.status(201).json({ success: true, message: "Department Class Timetable requested!", data: newClass });
});

// ==========================================
// ADMIN MATCHING & ASSIGNMENT ENDPOINT
// Match Student Trainer Timetable to Class
// ==========================================

app.post('/api/timetable/assign', (req, res) => {
    const { classId, trainerName } = req.body;
    const classObj = departmentClasses.find(c => c.id === parseInt(classId, 10));

    if (!classObj) {
        return res.status(404).json({ success: false, message: "Requested class not found." });
    }

    classObj.assignedTrainer = trainerName;
    classObj.status = "Assigned";

    res.json({
        success: true,
        message: `Assigned Trainer '${trainerName}' to Class '${classObj.className}' (${classObj.timeSlot})`,
        data: classObj
    });
});

// ==========================================
// COMPLETED SESSIONS & STATS
// ==========================================

app.get('/api/completed', (req, res) => {
    res.json({ success: true, data: completedSessions });
});

app.post('/api/completed', (req, res) => {
    const { name, attendees, location } = req.body;
    if (!name || !attendees) {
        return res.status(400).json({ success: false, message: "Name and attendees count are required." });
    }
    const newCompleted = {
        id: completedSessions.length + 1,
        name,
        attendees: parseInt(attendees, 10),
        location: location || "Not captured",
        date: new Date().toISOString().split('T')[0]
    };
    completedSessions.push(newCompleted);
    res.status(201).json({ success: true, message: "Completed session recorded!", data: newCompleted });
});

app.get('/api/stats', (req, res) => {
    const totalAttendees = completedSessions.reduce((acc, curr) => acc + (curr.attendees || 0), 0);
    res.json({
        success: true,
        stats: {
            totalRequests: departmentClasses.length,
            completedCount: completedSessions.length,
            totalAttendees: totalAttendees,
            activeCohorts: departmentClasses.length
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Digital Mission Tracker Express Server Running!`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
