const API = "/api";

/* =========================================================
   COMMON HELPERS
========================================================= */

async function apiRequest(url, options = {}) {

    try {

        const response = await fetch(url, options);

        let data = null;

        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {

            let message = "Something went wrong";

            if (data) {

                if (data.message) {
                    message = data.message;
                }

                else if (data.error) {
                    message = data.error;
                }
            }

            throw new Error(message);
        }

        return data;

    } catch (error) {

        console.error(error);

        throw error;
    }
}


function formatCurrency(value) {

    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showSection(sectionId, button = null) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active-section");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active-section");
    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome to Smart School Tracker"
        ],

        students: [
            "Student Management",
            "Add, view and manage students"
        ],

        attendance: [
            "Attendance Management",
            "Monitor student attendance"
        ],

        notifications: [
            "Parent Notifications",
            "Absence notification history"
        ],

        fees: [
            "Fees & Payments",
            "Manage tuition invoices and payments"
        ],

        vendors: [
            "Vendor Management",
            "Manage school suppliers"
        ],

        purchases: [
            "Purchases",
            "Track school expenses"
        ],

        budget: [
            "Budget Management",
            "Monitor school budget"
        ],

        reports: [
            "Reports & Analytics",
            "School performance overview"
        ]
    };

    if (titles[sectionId]) {

        document.getElementById("pageTitle").innerText =
            titles[sectionId][0];

        document.getElementById("pageSubtitle").innerText =
            titles[sectionId][1];
    }

    loadSectionData(sectionId);
}


function loadSectionData(section) {

    if (section === "dashboard") {
        loadDashboard();
    }

    if (section === "students") {
        loadStudents();
    }

    if (section === "attendance") {
        loadAttendance();
    }

    if (section === "notifications") {
        loadNotifications();
    }

    if (section === "fees") {
        loadInvoices();
        loadPayments();
        loadFeeReport();
    }

    if (section === "vendors") {
        loadVendors();
    }

    if (section === "purchases") {
        loadPurchases();
    }

    if (section === "budget") {
        loadBudgets();
    }

    if (section === "reports") {
        loadReports();
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const students = await apiRequest(`${API}/students`);

        const studentCount =
            document.getElementById("studentCount");

        if (studentCount) {
            studentCount.innerText = students.length;
        }

        const recent =
            students.slice(-5).reverse();

        const table =
            document.getElementById("recentStudents");

        if (table) {

            if (recent.length === 0) {

                table.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty">
                            No students found
                        </td>
                    </tr>
                `;

            } else {

                table.innerHTML = recent.map(student => `
                    <tr>
                        <td>${escapeHtml(student.id)}</td>
                        <td>
                            <strong>${escapeHtml(student.name)}</strong>
                        </td>
                        <td>${escapeHtml(student.grade)}</td>
                        <td>${escapeHtml(student.parentName)}</td>
                    </tr>
                `).join("");
            }
        }

        await loadAttendanceDashboard();

        await loadFeeReport();

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   STUDENTS
========================================================= */

async function loadStudents() {

    try {

        const students =
            await apiRequest(`${API}/students`);

        const table =
            document.getElementById("studentTable");

        const count =
            document.getElementById("studentTableCount");

        if (count) {
            count.innerText =
                `${students.length} students registered`;
        }

        if (!table) return;

        if (students.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No students found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = students.map(student => `

            <tr>

                <td>${escapeHtml(student.id)}</td>

                <td>
                    <strong>
                        ${escapeHtml(student.name)}
                    </strong>
                </td>

                <td>${escapeHtml(student.email)}</td>

                <td>${escapeHtml(student.grade)}</td>

                <td>${escapeHtml(student.parentName)}</td>

                <td>${escapeHtml(student.parentPhone)}</td>

                <td>

                    <button
                        class="action-btn"
                        onclick="editStudent(${student.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn danger"
                        onclick="deleteStudent(${student.id})">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    } catch (error) {

        showToast("Unable to load students");
        console.error(error);
    }
}


function openStudentForm() {

    const form =
        document.getElementById("studentForm");

    if (form) {
        form.classList.remove("hidden");
    }
}


function closeStudentForm() {

    const form =
        document.getElementById("studentForm");

    if (form) {
        form.classList.add("hidden");
    }
}


async function addStudent(event) {

    event.preventDefault();

    const student = {

        name:
            document.getElementById("studentName").value.trim(),

        email:
            document.getElementById("studentEmail").value.trim(),

        phone:
            document.getElementById("studentPhone").value.trim(),

        grade:
            document.getElementById("studentGrade").value.trim(),

        parentName:
            document.getElementById("parentName").value.trim(),

        parentPhone:
            document.getElementById("parentPhone").value.trim()
    };

    try {

        await apiRequest(
            `${API}/students`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(student)
            }
        );

        showToast("✅ Student added successfully");

        event.target.reset();

        closeStudentForm();

        await loadStudents();

        await loadDashboard();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function editStudent(id) {

    try {

        const student =
            await apiRequest(`${API}/students/${id}`);

        const name =
            prompt("Student Name:", student.name);

        if (name === null) return;

        const email =
            prompt("Email:", student.email);

        if (email === null) return;

        const phone =
            prompt("Phone:", student.phone);

        if (phone === null) return;

        const grade =
            prompt("Grade:", student.grade);

        if (grade === null) return;

        const parentName =
            prompt("Parent Name:", student.parentName);

        if (parentName === null) return;

        const parentPhone =
            prompt("Parent Phone:", student.parentPhone);

        if (parentPhone === null) return;

        const updatedStudent = {

            name,
            email,
            phone,
            grade,
            parentName,
            parentPhone
        };

        await apiRequest(
            `${API}/students/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedStudent)
            }
        );

        showToast("✅ Student updated");

        await loadStudents();

        await loadDashboard();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/students/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Student deleted");

        await loadStudents();

        await loadDashboard();

    } catch (error) {

        showToast("❌ Unable to delete student");
    }
}


/* =========================================================
   ATTENDANCE
========================================================= */

async function loadAttendance() {

    try {

        const attendance =
            await apiRequest(`${API}/attendance`);

        const table =
            document.getElementById("attendanceTable");

        const present =
            attendance.filter(
                a =>
                    String(a.status).toUpperCase() === "PRESENT"
            ).length;

        const absent =
            attendance.filter(
                a =>
                    String(a.status).toUpperCase() === "ABSENT"
            ).length;

        const total =
            attendance.length;

        const percentage =
            total === 0
                ? 0
                : ((present * 100) / total).toFixed(1);

        if (document.getElementById("attendanceTotal")) {
            document.getElementById("attendanceTotal").innerText =
                total;
        }

        if (document.getElementById("attendancePresent")) {
            document.getElementById("attendancePresent").innerText =
                present;
        }

        if (document.getElementById("attendanceAbsent")) {
            document.getElementById("attendanceAbsent").innerText =
                absent;
        }

        if (document.getElementById("attendancePercentage")) {
            document.getElementById("attendancePercentage").innerText =
                `${percentage}%`;
        }

        if (!table) return;

        if (attendance.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        No attendance records
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = attendance.map(a => `

            <tr>

                <td>${escapeHtml(a.id)}</td>

                <td>${escapeHtml(a.studentId)}</td>

                <td>${escapeHtml(a.date)}</td>

                <td>
                    <strong>${escapeHtml(a.status)}</strong>
                </td>

                <td>

                    <button
                        class="action-btn danger"
                        onclick="deleteAttendance(${a.id})">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    } catch (error) {

        showToast("Unable to load attendance");

        console.error(error);
    }
}


function openAttendanceForm() {

    const form =
        document.getElementById("attendanceForm");

    if (form) {
        form.classList.remove("hidden");
    }
}


function closeAttendanceForm() {

    const form =
        document.getElementById("attendanceForm");

    if (form) {
        form.classList.add("hidden");
    }
}


async function markAttendance(event) {

    event.preventDefault();

    const attendance = {

        studentId:
            Number(
                document.getElementById(
                    "attendanceStudentId"
                ).value
            ),

        date:
        document.getElementById(
            "attendanceDate"
        ).value,

        status:
        document.getElementById(
            "attendanceStatus"
        ).value
    };

    try {

        await apiRequest(
            `${API}/attendance`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(attendance)
            }
        );

        showToast(
            "✅ Attendance saved successfully"
        );

        event.target.reset();

        closeAttendanceForm();

        await loadAttendance();

        await loadAttendanceDashboard();

        await loadNotifications();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deleteAttendance(id) {

    if (!confirm("Delete this attendance record?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/attendance/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Attendance deleted");

        await loadAttendance();

    } catch (error) {

        showToast("❌ Unable to delete attendance");
    }
}


async function loadAttendanceDashboard() {

    try {

        const attendance =
            await apiRequest(`${API}/attendance`);

        const present =
            attendance.filter(
                a =>
                    String(a.status).toUpperCase() ===
                    "PRESENT"
            ).length;

        const absent =
            attendance.filter(
                a =>
                    String(a.status).toUpperCase() ===
                    "ABSENT"
            ).length;

        const presentCount =
            document.getElementById("presentCount");

        const absentCount =
            document.getElementById("absentCount");

        if (presentCount) {
            presentCount.innerText = present;
        }

        if (absentCount) {
            absentCount.innerText = absent;
        }

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    try {

        const notifications =
            await apiRequest(`${API}/notifications`);

        const table =
            document.getElementById("notificationTable");

        if (!table) return;

        if (notifications.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        No notifications found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = notifications.map(n => `

            <tr>

                <td>${escapeHtml(n.id)}</td>

                <td>${escapeHtml(n.studentId)}</td>

                <td>${escapeHtml(n.parentPhone)}</td>

                <td>${escapeHtml(n.message)}</td>

                <td>${escapeHtml(n.status)}</td>

                <td>${escapeHtml(n.sentAt || "-")}</td>

            </tr>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   INVOICES
========================================================= */

async function loadInvoices() {

    try {

        const invoices =
            await apiRequest(`${API}/invoices`);

        const count =
            document.getElementById("invoiceCount");

        if (count) {
            count.innerText = invoices.length;
        }

        const table =
            document.getElementById("invoiceTable");

        if (!table) return;

        if (invoices.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No invoices found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = invoices.map(i => `

            <tr>

                <td>${escapeHtml(i.id)}</td>

                <td>${escapeHtml(i.invoiceNumber)}</td>

                <td>${escapeHtml(i.studentId)}</td>

                <td>${formatCurrency(i.amount)}</td>

                <td>${escapeHtml(i.dueDate)}</td>

                <td>
                    <strong>${escapeHtml(i.status)}</strong>
                </td>

                <td>

                    <button
                        class="action-btn"
                        onclick="editInvoice(${i.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn danger"
                        onclick="deleteInvoice(${i.id})">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}


async function createInvoice() {

    try {

        const studentId =
            prompt("Student ID:");

        if (!studentId) return;

        const invoiceNumber =
            prompt("Invoice Number:");

        if (!invoiceNumber) return;

        const amount =
            prompt("Invoice Amount:");

        if (!amount) return;

        const dueDate =
            prompt(
                "Due Date (YYYY-MM-DD):",
                new Date().toISOString().split("T")[0]
            );

        if (!dueDate) return;

        await apiRequest(
            `${API}/invoices`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    studentId: Number(studentId),

                    invoiceNumber,

                    amount: Number(amount),

                    dueDate
                })
            }
        );

        showToast("✅ Invoice created");

        await loadInvoices();

        await loadFeeReport();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function editInvoice(id) {

    try {

        const invoice =
            await apiRequest(`${API}/invoices/${id}`);

        const invoiceNumber =
            prompt(
                "Invoice Number:",
                invoice.invoiceNumber
            );

        if (invoiceNumber === null) return;

        const amount =
            prompt(
                "Amount:",
                invoice.amount
            );

        if (amount === null) return;

        const dueDate =
            prompt(
                "Due Date:",
                invoice.dueDate
            );

        if (dueDate === null) return;

        await apiRequest(
            `${API}/invoices/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    studentId: invoice.studentId,

                    invoiceNumber,

                    amount: Number(amount),

                    dueDate,

                    status: invoice.status
                })
            }
        );

        showToast("✅ Invoice updated");

        await loadInvoices();

        await loadFeeReport();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deleteInvoice(id) {

    if (!confirm("Delete this invoice?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/invoices/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Invoice deleted");

        await loadInvoices();

        await loadFeeReport();

    } catch (error) {

        showToast("❌ Unable to delete invoice");
    }
}


/* =========================================================
   PAYMENTS
========================================================= */

async function loadPayments() {

    try {

        const payments =
            await apiRequest(`${API}/payments`);

        const table =
            document.getElementById("paymentTable");

        if (!table) return;

        if (payments.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No payments found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = payments.map(p => `

            <tr>

                <td>${escapeHtml(p.id)}</td>

                <td>${escapeHtml(p.invoiceId)}</td>

                <td>${escapeHtml(p.studentId)}</td>

                <td>${formatCurrency(p.amountPaid)}</td>

                <td>${escapeHtml(p.paymentDate)}</td>

                <td>${escapeHtml(p.paymentMethod || "-")}</td>

                <td>${escapeHtml(p.status)}</td>

            </tr>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}


async function createPayment() {

    try {

        const invoiceId =
            prompt("Invoice ID:");

        if (!invoiceId) return;

        const studentId =
            prompt("Student ID:");

        if (!studentId) return;

        const amount =
            prompt("Payment Amount:");

        if (!amount) return;

        const method =
            prompt(
                "Payment Method:",
                "BANK"
            );

        if (!method) return;

        await apiRequest(
            `${API}/payments`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    invoiceId: Number(invoiceId),

                    studentId: Number(studentId),

                    amountPaid: Number(amount),

                    paymentMethod: method
                })
            }
        );

        showToast("✅ Payment recorded");

        await loadPayments();

        await loadInvoices();

        await loadFeeReport();

        await loadReports();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


/* =========================================================
   FEE REPORT
========================================================= */

async function loadFeeReport() {

    try {

        const report =
            await apiRequest(`${API}/reports/fees`);

        const collected =
            report.totalCollectedAmount || 0;

        const feeCollected =
            document.getElementById("feeCollected");

        const totalCollected =
            document.getElementById("totalCollected");

        const pendingFees =
            document.getElementById("pendingFees");

        if (feeCollected) {
            feeCollected.innerText =
                formatCurrency(collected);
        }

        if (totalCollected) {
            totalCollected.innerText =
                formatCurrency(collected);
        }

        if (pendingFees) {
            pendingFees.innerText =
                formatCurrency(report.pendingAmount);
        }

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   VENDORS
========================================================= */

async function loadVendors() {

    try {

        const vendors =
            await apiRequest(`${API}/vendors`);

        const table =
            document.getElementById("vendorTable");

        if (!table) return;

        if (vendors.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No vendors found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = vendors.map(v => `

            <tr>

                <td>${escapeHtml(v.id)}</td>

                <td>${escapeHtml(v.vendorName)}</td>

                <td>${escapeHtml(v.contactPerson)}</td>

                <td>${escapeHtml(v.phone)}</td>

                <td>${escapeHtml(v.email)}</td>

                <td>${escapeHtml(v.address || "-")}</td>

                <td>

                    <button
                        class="action-btn"
                        onclick="editVendor(${v.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn danger"
                        onclick="deleteVendor(${v.id})">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}


async function createVendor() {

    try {

        const vendorName =
            prompt("Vendor Name:");

        if (!vendorName) return;

        const contactPerson =
            prompt("Contact Person:");

        if (!contactPerson) return;

        const phone =
            prompt("Phone:");

        if (!phone) return;

        const email =
            prompt("Email:");

        if (!email) return;

        const address =
            prompt("Address:");

        if (!address) return;

        await apiRequest(
            `${API}/vendors`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    vendorName,

                    contactPerson,

                    phone,

                    email,

                    address
                })
            }
        );

        showToast("✅ Vendor added");

        await loadVendors();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function editVendor(id) {

    try {

        const vendor =
            await apiRequest(`${API}/vendors/${id}`);

        const vendorName =
            prompt(
                "Vendor Name:",
                vendor.vendorName
            );

        if (vendorName === null) return;

        const contactPerson =
            prompt(
                "Contact Person:",
                vendor.contactPerson
            );

        if (contactPerson === null) return;

        const phone =
            prompt(
                "Phone:",
                vendor.phone
            );

        if (phone === null) return;

        const email =
            prompt(
                "Email:",
                vendor.email
            );

        if (email === null) return;

        const address =
            prompt(
                "Address:",
                vendor.address
            );

        if (address === null) return;

        await apiRequest(
            `${API}/vendors/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    vendorName,

                    contactPerson,

                    phone,

                    email,

                    address
                })
            }
        );

        showToast("✅ Vendor updated");

        await loadVendors();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deleteVendor(id) {

    if (!confirm("Delete this vendor?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/vendors/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Vendor deleted");

        await loadVendors();

    } catch (error) {

        showToast("❌ Unable to delete vendor");
    }
}


/* =========================================================
   PURCHASES
========================================================= */

async function loadPurchases() {

    try {

        const purchases =
            await apiRequest(`${API}/purchases`);

        const table =
            document.getElementById("purchaseTable");

        if (!table) return;

        if (purchases.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No purchases found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = purchases.map(p => `

            <tr>

                <td>${escapeHtml(p.id)}</td>

                <td>${escapeHtml(p.vendorId)}</td>

                <td>${escapeHtml(p.purchaseDescription)}</td>

                <td>${formatCurrency(p.amount)}</td>

                <td>${escapeHtml(p.purchaseDate)}</td>

                <td>${escapeHtml(p.paymentStatus)}</td>

                <td>

                    <button
                        class="action-btn"
                        onclick="editPurchase(${p.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn danger"
                        onclick="deletePurchase(${p.id})">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}


async function createPurchase() {

    try {

        const vendorId =
            prompt("Vendor ID:");

        if (!vendorId) return;

        const description =
            prompt("Purchase Description:");

        if (!description) return;

        const amount =
            prompt("Purchase Amount:");

        if (!amount) return;

        const date =
            prompt(
                "Purchase Date (YYYY-MM-DD):",
                new Date().toISOString().split("T")[0]
            );

        if (!date) return;

        await apiRequest(
            `${API}/purchases`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    vendorId: Number(vendorId),

                    purchaseDescription:
                    description,

                    amount:
                        Number(amount),

                    purchaseDate:
                    date
                })
            }
        );

        showToast("✅ Purchase added");

        await loadPurchases();

        await loadBudgets();

        await loadReports();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function editPurchase(id) {

    try {

        const purchase =
            await apiRequest(`${API}/purchases/${id}`);

        const vendorId =
            prompt(
                "Vendor ID:",
                purchase.vendorId
            );

        if (vendorId === null) return;

        const description =
            prompt(
                "Description:",
                purchase.purchaseDescription
            );

        if (description === null) return;

        const amount =
            prompt(
                "Amount:",
                purchase.amount
            );

        if (amount === null) return;

        const date =
            prompt(
                "Purchase Date:",
                purchase.purchaseDate
            );

        if (date === null) return;

        await apiRequest(
            `${API}/purchases/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    vendorId:
                        Number(vendorId),

                    purchaseDescription:
                    description,

                    amount:
                        Number(amount),

                    purchaseDate:
                    date,

                    paymentStatus:
                    purchase.paymentStatus
                })
            }
        );

        showToast("✅ Purchase updated");

        await loadPurchases();

        await loadBudgets();

        await loadReports();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deletePurchase(id) {

    if (!confirm("Delete this purchase?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/purchases/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Purchase deleted");

        await loadPurchases();

        await loadBudgets();

        await loadReports();

    } catch (error) {

        showToast("❌ Unable to delete purchase");
    }
}


/* =========================================================
   BUDGET
========================================================= */

async function loadBudgets() {

    try {

        const budgets =
            await apiRequest(`${API}/budgets`);

        const table =
            document.getElementById("budgetTable");

        if (!table) return;

        if (budgets.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No budgets found
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = budgets.map(b => {

            const utilization =
                b.budgetAmount === 0
                    ? 0
                    : (
                        b.actualExpense /
                        b.budgetAmount *
                        100
                    ).toFixed(1);

            return `

                <tr>

                    <td>${escapeHtml(b.id)}</td>

                    <td>${escapeHtml(b.department)}</td>

                    <td>${formatCurrency(b.budgetAmount)}</td>

                    <td>${formatCurrency(b.actualExpense)}</td>

                    <td>${escapeHtml(b.year)}</td>

                    <td>${utilization}%</td>

                    <td>

                        <button
                            class="action-btn"
                            onclick="editBudget(${b.id})">
                            ✏️
                        </button>

                        <button
                            class="action-btn danger"
                            onclick="deleteBudget(${b.id})">
                            🗑️
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

    } catch (error) {

        console.error(error);
    }
}


async function createBudget() {

    try {

        const department =
            prompt("Department:");

        if (!department) return;

        const amount =
            prompt("Budget Amount:");

        if (!amount) return;

        const year =
            prompt(
                "Year:",
                new Date().getFullYear()
            );

        if (!year) return;

        await apiRequest(
            `${API}/budgets`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    department,

                    budgetAmount:
                        Number(amount),

                    actualExpense:
                        0,

                    year:
                        Number(year)
                })
            }
        );

        showToast("✅ Budget created");

        await loadBudgets();

        await loadReports();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function editBudget(id) {

    try {

        const budget =
            await apiRequest(`${API}/budgets/${id}`);

        const department =
            prompt(
                "Department:",
                budget.department
            );

        if (department === null) return;

        const amount =
            prompt(
                "Budget Amount:",
                budget.budgetAmount
            );

        if (amount === null) return;

        const year =
            prompt(
                "Year:",
                budget.year
            );

        if (year === null) return;

        await apiRequest(
            `${API}/budgets/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    department,

                    budgetAmount:
                        Number(amount),

                    actualExpense:
                    budget.actualExpense,

                    year:
                        Number(year)
                })
            }
        );

        showToast("✅ Budget updated");

        await loadBudgets();

    } catch (error) {

        showToast("❌ " + error.message);
    }
}


async function deleteBudget(id) {

    if (!confirm("Delete this budget?")) {
        return;
    }

    try {

        await apiRequest(
            `${API}/budgets/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast("🗑️ Budget deleted");

        await loadBudgets();

    } catch (error) {

        showToast("❌ Unable to delete budget");
    }
}


/* =========================================================
   REPORTS
========================================================= */

async function loadReports() {

    try {

        const attendance =
            await apiRequest(
                `${API}/reports/attendance`
            );

        const fees =
            await apiRequest(
                `${API}/reports/fees`
            );

        const expenses =
            await apiRequest(
                `${API}/reports/expenses`
            );

        const profit =
            await apiRequest(
                `${API}/reports/profit-loss`
            );


        const reportAttendance =
            document.getElementById(
                "reportAttendance"
            );

        const reportFees =
            document.getElementById(
                "reportFees"
            );

        const reportExpenses =
            document.getElementById(
                "reportExpenses"
            );

        const reportProfit =
            document.getElementById(
                "reportProfit"
            );

        if (reportAttendance) {

            reportAttendance.innerText =
                `${Number(
                    attendance.attendancePercentage || 0
                ).toFixed(1)}%`;
        }

        if (reportFees) {

            reportFees.innerText =
                formatCurrency(
                    fees.totalCollectedAmount
                );
        }

        if (reportExpenses) {

            reportExpenses.innerText =
                formatCurrency(
                    expenses.totalExpense
                );
        }

        if (reportProfit) {

            reportProfit.innerText =
                formatCurrency(
                    profit.profitOrLoss
                );
        }

        if (document.getElementById("reportIncome")) {

            document.getElementById(
                "reportIncome"
            ).innerText =
                formatCurrency(
                    profit.totalIncome
                );
        }

        if (document.getElementById("reportExpense")) {

            document.getElementById(
                "reportExpense"
            ).innerText =
                formatCurrency(
                    profit.totalExpense
                );
        }

        if (document.getElementById("reportProfit2")) {

            document.getElementById(
                "reportProfit2"
            ).innerText =
                formatCurrency(
                    profit.profitOrLoss
                );
        }

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   QUICK ACTION BUTTONS
========================================================= */

/*
   These functions can be connected to buttons
   in index.html.

   Example:

   onclick="createInvoice()"
   onclick="createPayment()"
   onclick="createVendor()"
   onclick="createPurchase()"
   onclick="createBudget()"
*/

window.createInvoice = createInvoice;
window.createPayment = createPayment;
window.createVendor = createVendor;
window.createPurchase = createPurchase;
window.createBudget = createBudget;

window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

window.deleteAttendance = deleteAttendance;

window.editInvoice = editInvoice;
window.deleteInvoice = deleteInvoice;

window.editVendor = editVendor;
window.deleteVendor = deleteVendor;

window.editPurchase = editPurchase;
window.deletePurchase = deletePurchase;

window.editBudget = editBudget;
window.deleteBudget = deleteBudget;


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {

        alert(message);

        return;
    }

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadDashboard();

        /*
           Preload important data so
           navigation feels faster.
        */

        await loadStudents();

        await loadAttendance();

    }
);