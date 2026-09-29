package com.example.javaschooltracker.controller;

import com.example.javaschooltracker.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ATTENDANCE REPORT
    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> getAttendanceReport() {

        return ResponseEntity.ok(
                reportService.getAttendanceReport()
        );
    }

    // FEE COLLECTION REPORT
    @GetMapping("/fees")
    public ResponseEntity<Map<String, Object>> getFeeCollectionReport() {

        return ResponseEntity.ok(
                reportService.getFeeCollectionReport()
        );
    }

    // EXPENSE REPORT
    @GetMapping("/expenses")
    public ResponseEntity<Map<String, Object>> getExpenseReport() {

        return ResponseEntity.ok(
                reportService.getExpenseReport()
        );
    }

    // PROFIT AND LOSS REPORT
    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, Object>> getProfitAndLossReport() {

        return ResponseEntity.ok(
                reportService.getProfitAndLossReport()
        );
    }
}