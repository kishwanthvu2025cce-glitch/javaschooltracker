package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Attendance;
import com.example.javaschooltracker.model.Notification;
import com.example.javaschooltracker.model.Student;
import com.example.javaschooltracker.repository.AttendanceRepository;
import com.example.javaschooltracker.repository.NotificationRepository;
import com.example.javaschooltracker.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            NotificationRepository notificationRepository) {

        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
    }

    // Mark attendance
    public Attendance markAttendance(Attendance attendance) {

        Attendance savedAttendance =
                attendanceRepository.save(attendance);

        // If student is absent, automatically notify parent
        if ("ABSENT".equalsIgnoreCase(attendance.getStatus())) {

            Student student = studentRepository
                    .findById(attendance.getStudentId())
                    .orElseThrow(() ->
                            new RuntimeException("Student not found"));

            Notification notification = new Notification();

            notification.setStudentId(student.getId());
            notification.setParentPhone(student.getParentPhone());

            notification.setMessage(
                    "Dear Parent, your child "
                            + student.getName()
                            + " was absent today."
            );

            notification.setStatus("SENT");
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.save(notification);
        }

        return savedAttendance;
    }

    // Get all attendance records
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // Get attendance by student ID
    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    // Delete attendance record
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }

    // Calculate attendance percentage
    public double getAttendancePercentage(Long studentId) {

        List<Attendance> attendanceList =
                attendanceRepository.findByStudentId(studentId);

        if (attendanceList.isEmpty()) {
            return 0.0;
        }

        long presentCount = attendanceList.stream()
                .filter(attendance ->
                        "PRESENT".equalsIgnoreCase(
                                attendance.getStatus()))
                .count();

        return (presentCount * 100.0) / attendanceList.size();
    }
}