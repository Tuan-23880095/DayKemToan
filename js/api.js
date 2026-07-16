// js/api.js

// URL Web App lấy từ phần triển khai trên Google Apps Script
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7sGemj9iG49aqpCI97IcK9AJodyrtJ2L0dfVgB-jPwte18hXSjhvxYH5ohxU5e_AD/exec"; 

const AcademicAPI = {
    /**
     * Lấy toàn bộ cấu hình lớp, môn học và danh sách buổi học từ Google Sheet
     * @returns {Promise<Object>} Dữ liệu cấu hình hệ thống
     */
    async fetchDashboardData() {
        try {
            const response = await fetch(APPS_SCRIPT_URL);
            if (!response.ok) throw new Error("Không thể kết nối với máy chủ dữ liệu.");
            return await response.json();
        } catch (error) {
            console.error("Lỗi API fetchDashboardData:", error);
            throw error;
        }
    },

    /**
     * Gửi kết quả làm bài của học sinh về Google Sheet
     * @param {Object} formData Dữ liệu bài làm của học sinh
     * @returns {Promise<Object>} Trạng thái gửi thành công/thất bại
     */
    async submitStudentResult(formData) {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error("Gửi dữ liệu thất bại.");
            return await response.json();
        } catch (error) {
            console.error("Lỗi API submitStudentResult:", error);
            throw error;
        }
    }
};
