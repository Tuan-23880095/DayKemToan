// js/app.js

const AcademicApp = {
    // Lưu trữ trạng thái ứng dụng nội bộ
    state: {
        grades: [],
        subjects: [],
        lessons: [],
        currentGrade: "",
        currentSubject: ""
    },

    // Khởi động ứng dụng
    async init() {
        try {
            // Gọi hàm từ file api.js để tải cấu hình từ Google Sheet
            const data = await AcademicAPI.fetchDashboardData();
            
            if (data.status === "success") {
                this.state.grades = data.grades;
                this.state.subjects = data.subjects;
                this.state.lessons = data.lessons;

                // Chọn lớp và môn đầu tiên làm mặc định hiển thị
                if (this.state.grades.length > 0) this.state.currentGrade = this.state.grades[0].id;
                if (this.state.subjects.length > 0) this.state.currentSubject = this.state.subjects[0].id;

                // Gỡ màn hình Loading và hiển thị Main
                document.getElementById("loading-screen").classList.add("hidden");
                document.getElementById("main-content").classList.remove("hidden");

                // Render giao diện cấu trúc dữ liệu
                this.renderGrades();
                this.renderSubjects();
                this.renderLessons();
            } else {
                this.showToast("Không thể khởi tạo cấu trúc dữ liệu từ máy chủ.", "error");
            }
        } catch (error) {
            document.getElementById("loading-screen").innerHTML = 
                `<div class="text-center p-6 text-red-600"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><br><b>Lỗi kết nối hệ thống!</b><br>Vui lòng kiểm tra lại cấu hình URL trong api.js</div>`;
        }
    },

    // Vẽ thanh Menu Tab Lớp học
    renderGrades() {
        const container = document.getElementById("grade-tabs-container");
        container.innerHTML = "";

        this.state.grades.forEach(grade => {
            const isActive = grade.id === this.state.currentGrade;
            const tab = document.createElement("a");
            
            tab.className = `whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm cursor-pointer transition-all ${
                isActive ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            }`;
            tab.textContent = grade.name;
            tab.onclick = () => {
                this.state.currentGrade = grade.id;
                this.renderGrades();
                this.renderLessons();
            };
            container.appendChild(tab);
        });
    },

    // Vẽ thanh Menu Button Môn học
    renderSubjects() {
        const container = document.getElementById("subject-tabs-container");
        container.innerHTML = "";

        this.state.subjects.forEach(sub => {
            const isActive = sub.id === this.state.currentSubject;
            const btn = document.createElement("button");
            
            btn.className = `px-5 py-2 rounded-full border text-xs font-bold transition duration-150 flex items-center space-x-2 shadow-sm ${
                isActive ? "bg-blue-700 text-white border-blue-700 shadow" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`;
            btn.innerHTML = `<i class="fas ${sub.icon}"></i> <span>${sub.name}</span>`;
            btn.onclick = () => {
                this.state.currentSubject = sub.id;
                this.renderSubjects();
                this.renderLessons();
            };
            container.appendChild(btn);
        });
    },

    // Lọc và vẽ các thẻ buổi học lên khung Body
    renderLessons() {
        const grid = document.getElementById("lessons-grid");
        const title = document.getElementById("current-view-title");
        grid.innerHTML = "";

        const currentGradeName = this.state.grades.find(g => g.id === this.state.currentGrade)?.name || "";
        const currentSubName = this.state.subjects.find(s => s.id === this.state.currentSubject)?.name || "";
        title.textContent = `${currentSubName} — ${currentGradeName}`;

        // Lọc bài học thuộc tab đang chọn
        const matchedLessons = this.state.lessons.filter(
            l => l.grade === this.state.currentGrade && l.subject === this.state.currentSubject
        );

        if (matchedLessons.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl"><i class="fas fa-folder-open text-3xl mb-2 text-gray-300"></i><br>Chưa có dữ liệu bài học nào cho danh mục này.</div>`;
            return;
        }

        matchedLessons.forEach(lesson => {
            const isOpen = lesson.status.toLowerCase().trim() === "open";
            const card = document.createElement("div");
            
            card.className = `bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition-all duration-200 ${
                isOpen ? "hover:shadow-md border-gray-200" : "opacity-60 grayscale-[40%] border-gray-200 pointer-events-none select-none"
            }`;

            card.innerHTML = `
                <div class="p-5 flex-grow">
                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                            isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }">
                            <i class="fas ${isOpen ? "fa-unlock" : "fa-lock"} mr-1"></i>${isOpen ? "Đang Mở" : "Đã Khóa"}
                        </span>
                        <span class="text-[10px] text-gray-400 font-mono tracking-wider">${lesson.id}</span>
                    </div>
                    <h3 class="text-base font-bold text-gray-900 mb-1.5">${lesson.title}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">${lesson.desc}</p>
                </div>
                
                <div class="p-4 bg-gray-50/70 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button onclick="AcademicApp.openModal('${lesson.id}', 'lythuyet')" 
                        class="flex items-center justify-center space-x-1.5 p-2 rounded-md border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 text-xs font-semibold transition">
                        <i class="fas fa-file-invoice"></i> <span>Lý thuyết</span>
                    </button>
                    <button onclick="AcademicApp.openModal('${lesson.id}', 'baitap')" 
                        class="flex items-center justify-center space-x-1.5 p-2 rounded-md border border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100 text-xs font-semibold transition">
                        <i class="fas fa-pencil-alt"></i> <span>Bài tập lớp</span>
                    </button>
                    
                    <a href="https://tracnghiem.hcmus.edu.vn" target="_blank" 
                        class="col-span-2 mt-1 flex items-center justify-center space-x-2 p-2 rounded-md border border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100 text-xs font-semibold transition">
                        <i class="fas fa-stopwatch text-sm"></i>
                        <span>Trắc nghiệm Trực tuyến (Tính thời gian)</span>
                        <i class="fas fa-external-link-alt text-[9px] opacity-70"></i>
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // Kích hoạt mở Modal và gọi file HTML nhỏ tương ứng nhúng vào iframe
    openModal(lessonId, type) {
        const lesson = this.state.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Điền thông tin meta ẩn phục vụ cho việc nộp bài
        document.getElementById("submit-lesson-id").value = lesson.id;
        document.getElementById("submit-lesson-name").value = lesson.title;
        document.getElementById("submit-content-type").value = type;
        document.getElementById("submission-form").reset();

        const typeLabel = type === "lythuyet" ? "LÝ THUYẾT" : "BÀI TẬP TRÊN LỚP";
        document.getElementById("modal-header-title").innerHTML = `<i class="fas fa-graduation-cap text-yellow-400 mr-2"></i> ${lesson.title.toUpperCase()} &bull; <span class="text-blue-200">${typeLabel}</span>`;

        // Tính toán đường dẫn file vật lý trong thư mục /data/
        const targetFileUrl = `data/${lessonId}-${type}.html`;

        // Nhúng nội dung động vào Modal bằng thẻ Iframe độc lập
        const container = document.getElementById("iframe-content-wrapper");
        container.innerHTML = `
            <div class="bg-gray-100 border-b border-gray-200 px-3 py-1.5 text-[11px] text-gray-500 flex justify-between items-center font-mono">
                <span>Nguồn tệp tin: ${targetFileUrl}</span>
                <a href="${targetFileUrl}" target="_blank" class="text-blue-600 font-sans font-semibold hover:underline"><i class="fas fa-external-link-alt"></i> Mở rộng màn hình</a>
            </div>
            <iframe src="${targetFileUrl}" class="w-full h-80 border-none bg-white" title="Nội dung bài học"></iframe>
        `;

        document.getElementById("learning-modal").classList.remove("hidden");
    },

    closeModal() {
        document.getElementById("learning-modal").classList.add("hidden");
        document.getElementById("iframe-content-wrapper").innerHTML = ""; // Xoá iframe giải phóng RAM
    },

    // Xử lý nộp bài và đẩy API về file api.js
    async handleFormSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById("btn-submit-data");
        
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-1.5"></i> Đang truyền dữ liệu...`;

        const payload = {
            studentName: document.getElementById("student-name").value.trim(),
            score: document.getElementById("student-score").value,
            wrongAnswers: document.getElementById("wrong-answers").value.trim(),
            lessonId: document.getElementById("submit-lesson-id").value,
            lessonName: document.getElementById("submit-lesson-name").value,
            contentType: document.getElementById("submit-content-type").value
        };

        try {
            const res = await AcademicAPI.submitStudentResult(payload);
            if (res.status === "success") {
                this.showToast("Báo cáo kết quả bài làm thành công!", "success");
                this.closeModal();
            } else {
                this.showToast("Máy chủ ghi nhận thất bại.", "error");
            }
        } catch (err) {
            this.showToast("Lỗi mạng! Dữ liệu chưa thể gửi đi.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-cloud-upload-alt mr-1.5"></i> Gửi Báo Cáo về Bảng Điểm`;
        }
    },

    // Quản lý hiển thị Toast tùy biến thay thế alert mặc định
    showToast(msg, type = "success") {
        const toast = document.getElementById("toast-message");
        const iconBox = document.getElementById("toast-icon-box");
        document.getElementById("toast-text").textContent = msg;

        if (type === "success") {
            iconBox.className = "w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white text-xs";
            iconBox.innerHTML = `<i class="fas fa-check"></i>`;
        } else {
            iconBox.className = "w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs";
            iconBox.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
        }

        toast.classList.remove("translate-y-20", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");

        setTimeout(() => {
            toast.classList.remove("translate-y-0", "opacity-100");
            toast.classList.add("translate-y-20", "opacity-0");
        }, 3500);
    }
};

// Tự động kích hoạt khi trình duyệt dựng xong DOM
document.addEventListener("DOMContentLoaded", () => AcademicApp.init());
