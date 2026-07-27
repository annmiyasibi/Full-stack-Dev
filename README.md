# 🎓 Digital Mission Tracker - Combined Lab Exercise

A unified web application combining:
1. **Lab 1: HTML5 APIs** (Canvas, Video, Geolocation, Notification, Fullscreen, Web Storage, Fetch, Drag & Drop, File API)
2. **Lab 2: DOM Event Handling** (Click, Change, Input, Submit, Keydown, Scroll, Resize, Mouseenter/Mouseleave, Focus/Blur, Dragover/Drop)
3. **Lab 3: Express.js Backend & Authentication** (Admin, Student, Department Roles with `@christuniversity.in` Domain Validation)

---

## 👥 System Roles

1. **Admin** (`admin@christuniversity.in`): Central Coordinator who views requested department class timetables alongside registered student trainers' available time slots, and performs **Auto-Matching & Trainer Assignments**.
2. **Student** (`student@christuniversity.in`): Student Trainer who registers available free time slots and uploads timetable files (PDF/Image via Drag & Drop or manual entry).
3. **Department** (`department@christuniversity.in`): Department Coordinator / Faculty member who requests digital skills workshops for class batches and submits requested class timetables.

---

## ⚡ Timetable Matching Workflow

1. **Student Timetable Upload**: Student clicks **"📅 Student Timetable"** -> selects free slot (e.g. `Monday 10:00 AM - 12:00 PM`) -> uploads PDF timetable file via HTML5 Drag & Drop or manual entry.
2. **Department Requested Class**: Department clicks **"🏫 Dept Class Timetable"** -> specifies class batch (e.g. `1st Year B.Com Regular`) & requested time slot.
3. **Admin Auto-Matching Engine**: Admin clicks **"⚡ Auto-Match & Assign Trainers"** on the Admin Control Panel. The matching engine compares class time slots with student trainer free slots and automatically assigns trainers to matching classes!

---

## 🛠️ How to Run Manually in VS Code

### Prerequisites
- Install [Node.js](https://nodejs.org/).
- Visual Studio Code installed.

### Step-by-Step Instructions

1. **Open Project Folder in VS Code**:
   - Open VS Code -> `File` > `Open Folder...` -> Select `c:\Users\Reema\Desktop\annmiya_2647210\fsd\digitalmission_html`.

2. **Open Terminal**:
   - Press `Ctrl + ~` in VS Code.

3. **Install Dependencies**:
   - Run:
     ```cmd
     cmd /c npm install
     ```

4. **Start the Express.js Server**:
   - Run:
     ```bash
     node server.js
     ```

5. **Open Application in Browser**:
   - Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔍 Live Inspector Console & Event Mapping

Click the **"🔍 Live API & Event Inspector Active"** badge at the top or bottom of the screen.
The universal event delegator monitors and logs **all DOM Events** (Click, Change, Input, Focus, Blur, Keydown, Drag & Drop, Submit, Scroll, Resize) in real time with line numbers and API tags!
