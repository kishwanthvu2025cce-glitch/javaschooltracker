package com.example.javaschooltracker.controller;

import com.example.javaschooltracker.model.Attendance;
import com.example.javaschooltracker.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // MARK ATTENDANCE
    @PostMapping
    public Attendance markAttendance(@Valid @RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    // GET ALL ATTENDANCE
    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    // GET ATTENDANCE BY STUDENT
    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudentId(
            @PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudentId(studentId);
    }

    // GET ATTENDANCE PERCENTAGE
    @GetMapping("/student/{studentId}/percentage")
    public double getAttendancePercentage(
            @PathVariable Long studentId) {
        return attendanceService.getAttendancePercentage(studentId);
    }

    // DELETE ATTENDANCE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(
            @PathVariable Long id) {

        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}